import { Request, Response } from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Etudiant from '../models/Etudiant';
import Transaction from '../models/Transaction';
import SystemSetting from '../models/SystemSetting';
import Formation from '../models/Formation';
import { sendEmail } from '../utils/email';
import { paymentConfirmationEmail, welcomeEmail } from '../utils/emailTemplates';
import { hashPassword } from '../utils/auth';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

const processRegistrationData = async (transaction: any): Promise<any> => {
  if (transaction.registrationData && !transaction.etudiantId) {
    const regData = transaction.registrationData;
    const lowerEmail = regData.email.toLowerCase().trim();
    
    let etudiant = await Etudiant.findOne({ where: { email: lowerEmail } });
    
    if (!etudiant) {
      const hashedPassword = await hashPassword(regData.password);
      etudiant = await Etudiant.create({
        firstName: regData.firstName,
        lastName: regData.lastName,
        department: regData.department,
        email: lowerEmail,
        password: hashedPassword,
        subscriptionStatus: 'active',
        formationType: regData.formationType || 'e-learning'
      });
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const welcome = welcomeEmail(regData.firstName, `${frontendUrl}/login`);
      await sendEmail(lowerEmail, welcome.subject, welcome.text, welcome.html);
    }

    transaction.etudiantId = etudiant.id;
    await transaction.save();
    return etudiant;
  }
  
  if (transaction.etudiantId) {
    return await Etudiant.findByPk(transaction.etudiantId);
  }
  
  return null;
};

export const getPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    let amount = 500;
    const userId = (req as any).user?.id;

    if (userId) {
      const etudiant = await Etudiant.findByPk(userId);
      if (etudiant && etudiant.department) {
        const formation = await Formation.findOne({ where: { code_formation: etudiant.department } });
        if (formation && formation.frais_inscription) {
          amount = formation.frais_inscription;
        }
      }
    }

    if (amount === 500) {
      const setting = await SystemSetting.findOne({ where: { key: 'formationPrice' } });
      amount = setting && setting.value ? parseInt(setting.value, 10) : 500;
    }

    res.status(200).json({ price: amount });
  } catch (error) {
    console.error('Erreur getPrice:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currency = 'gnf', description, registrationData } = req.body;

    let formationPrice = 500; // default
    let etudiantEmail = registrationData?.email || '';

    if (registrationData && registrationData.department) {
      const formation = await Formation.findOne({ where: { code_formation: registrationData.department } });
      if (formation && formation.frais_inscription) {
        formationPrice = formation.frais_inscription;
      }
    }

    if (formationPrice === 500) {
      // Fallback au system setting au cas où
      const setting = await SystemSetting.findOne({ where: { key: 'formationPrice' } });
      formationPrice = setting && setting.value ? parseInt(setting.value, 10) : 500;
    }
    
    // Si c'est GNF, Stripe s'attend à des entiers sans centimes (0 décimales)
    // Si c'est EUR/USD, Stripe s'attend à des centimes, il faudrait multiplier par 100.
    // Pour simplifier, on suppose que formationPrice est dans la plus petite unité, ou on gère selon la devise.
    // Actuellement le code arrondit l'entier.
    const amount = formationPrice;

    if (!amount) {
      res.status(400).json({ message: 'Le montant est invalide.' });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Pour GNF (sans décimale), c'est l'entier.
      currency,
      description: description || 'Frais de scolarité CEGA',
      receipt_email: etudiantEmail, // Optional
      metadata: {
        etudiantEmail: etudiantEmail, // Pour retrouver l'étudiant dans le webhook
      },
      // automatic_payment_methods: { enabled: true },
    });

    // Create a pending transaction
    await Transaction.create({
      etudiantId: null,
      amount,
      currency,
      status: 'pending',
      paymentMethod: 'stripe',
      stripePaymentIntentId: paymentIntent.id,
      description: description || 'Frais de scolarité CEGA',
      registrationData: registrationData
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création du PaymentIntent:', error);
    res.status(500).json({ message: error.message });
  }
};

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    res.status(400).send(`Webhook Error: Missing signature or secret`);
    return;
  }

  let event;

  try {
    // Le req.body DOIT être le rawBody (Buffer) pour que la vérification de la signature fonctionne
    // Nous allons utiliser express.raw() dans la route pour le webhook
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Gérer l'événement
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as any;
      console.log('PaymentIntent was successful!');

      // Find the pending transaction
      const transaction = await Transaction.findOne({ where: { stripePaymentIntentId: paymentIntent.id } });
      
      if (transaction) {
        transaction.status = 'succeeded';
        
        let etudiant = await processRegistrationData(transaction);
        if (!etudiant && transaction.etudiantId) {
          etudiant = await Etudiant.findByPk(transaction.etudiantId);
        }

        if (etudiant) {
          etudiant.subscriptionStatus = 'active';
          const newExpDate = etudiant.accessExpirationDate && etudiant.accessExpirationDate > new Date() 
            ? new Date(etudiant.accessExpirationDate.getTime()) 
            : new Date();
          newExpDate.setMonth(newExpDate.getMonth() + 6);
          etudiant.accessExpirationDate = newExpDate;
          await etudiant.save();

          // Send professional payment confirmation email
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          const confirmEmail = paymentConfirmationEmail(
            etudiant.firstName,
            transaction.amount,
            transaction.currency?.toUpperCase() || 'GNF',
            paymentIntent.id,
            `${frontendUrl}/dashboard`
          );
          await sendEmail(etudiant.email, confirmEmail.subject, confirmEmail.text, confirmEmail.html);

          console.log(`Paiement réussi pour l'étudiant: ${etudiant.email}`);
        } else {
          // Si l'étudiant n'est pas trouvé (paiement sans inscription ni email metadata valide)
          await transaction.save();
        }
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as any;
      console.log('Payment failed!');
      const transaction = await Transaction.findOne({ where: { stripePaymentIntentId: paymentIntent.id } });
      if (transaction) {
        transaction.status = 'failed';
        await transaction.save();
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = (req as any).user?.role;
    if (role !== 'etudiant') {
      res.status(200).json([]);
      return;
    }

    const userId = Number((req as any).user?.id);
    if (!Number.isFinite(userId) || userId <= 0) {
      res.status(200).json([]);
      return;
    }

    const transactions = await Transaction.findAll({
      where: { etudiantId: userId },
      order: [['created_at', 'DESC']],
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Get Transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



