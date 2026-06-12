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

// CINETPAY INTEGRATION

const getCinetPayToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${process.env.CINETPAY_BASE_URL}/v1/oauth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: process.env.CINETPAY_API_KEY,
        api_password: process.env.CINETPAY_API_PASSWORD
      })
    });
    
    const data = await response.json();
    if (data.code === 200 && data.access_token) {
      return data.access_token;
    }
    console.error('CinetPay Auth Error:', data);
    return null;
  } catch (err) {
    console.error('CinetPay Auth fetch error:', err);
    return null;
  }
};

export const initCinetPayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currency = 'XOF', registrationData } = req.body;
    
    // Trouver l'étudiant et récupérer son prix de formation
    let amount = 500; // default
    let firstName = registrationData?.firstName || 'Etudiant';
    let lastName = registrationData?.lastName || 'CEGA';
    let email = registrationData?.email || '';

    if (registrationData && registrationData.department) {
      const formation = await Formation.findOne({ where: { code_formation: registrationData.department } });
      if (formation && formation.frais_inscription) {
        amount = formation.frais_inscription;
      }
    }

    // Si pas de prix de formation trouvé, fallback setting
    if (amount === 500) {
      const setting = await SystemSetting.findOne({ where: { key: 'formationPrice' } });
      amount = setting && setting.value ? parseInt(setting.value, 10) : 500;
    }

    const token = await getCinetPayToken();
    if (!token) {
      res.status(500).json({ message: 'Erreur d\'authentification avec le service de paiement (CinetPay).' });
      return;
    }

    const transactionId = crypto.randomBytes(16).toString('hex');
    const merchant_transaction_id = `CEGA_${Date.now()}`;

    // Créer la transaction locale (pending)
    // On doit avoir l'étudiant. S'il n'est pas trouvé, on bloque ou on utilise un ID factice.
    // L'idéal est que req.user soit défini via le middleware protect, mais la route pourrait être publique.
    // Utilisons l'ID de l'étudiant s'il existe.
    await Transaction.create({
      etudiantId: null,
      amount: amount,
      currency: currency,
      status: 'pending',
      paymentMethod: 'cinetpay',
      cinetpayTransactionId: merchant_transaction_id,
      description: 'Frais de scolarité CEGA E-Learning',
      registrationData
    });

    const notifyUrl = `${process.env.API_URL || 'http://localhost:5000'}/api/payments/cinetpay/webhook`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Appel à l'API de paiement
    const paymentRes = await fetch(`${process.env.CINETPAY_BASE_URL}/v1/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Assuming standard Bearer token
      },
      body: JSON.stringify({
        currency,
        payment_method: 'OM', // Ou laisser vide pour afficher toutes les méthodes du pays
        merchant_transaction_id,
        amount,
        lang: 'fr',
        designation: 'Frais de scolarité CEGA',
        client_email: email,
        client_first_name: firstName,
        client_last_name: lastName,
        client_phone_number: '',
        success_url: `${frontendUrl}/payment/callback?status=success&tx=${merchant_transaction_id}`,
        failed_url: `${frontendUrl}/payment/callback?status=failed&tx=${merchant_transaction_id}`,
        notify_url: notifyUrl,
        direct_pay: false // Redirect flow
      })
    });

    const data = await paymentRes.json();
    if (data.code === 200 && data.payment_url) {
      res.status(200).json({ payment_url: data.payment_url });
    } else {
      console.error('CinetPay Payment Error:', data);
      res.status(500).json({ message: 'Erreur lors de l\'initialisation du paiement.', details: data });
    }
  } catch (error: any) {
    console.error('Erreur initCinetPayPayment:', error);
    res.status(500).json({ message: error.message });
  }
};

export const cinetpayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // CinetPay sends notification via POST with form-data or application/json.
    // Usually it sends cpm_trans_id (merchant_transaction_id), cpm_site_id, etc.
    // We should call GET /v1/payment/{merchant_transaction_id} to verify the actual status.
    const merchant_transaction_id = req.body.cpm_trans_id || req.body.merchant_transaction_id;

    if (!merchant_transaction_id) {
      res.status(400).send('No transaction id provided');
      return;
    }

    const token = await getCinetPayToken();
    if (!token) {
      res.status(500).send('CinetPay auth failed');
      return;
    }

    const statusRes = await fetch(`${process.env.CINETPAY_BASE_URL}/v1/payment/${merchant_transaction_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const statusData = await statusRes.json();
    
    if (statusData && statusData.code === 2005) { // Assuming 2005 or what the doc says
      // The doc says: code 100 for SUCCESS. Wait, doc says: 100 SUCCESS transaction traitée avec succès
      console.log('CinetPay statusData:', statusData);
    }
    
    // Update our DB based on statusData.status (e.g. 'SUCCESS' or 'FAILED')
    const finalStatus = statusData.status === 'SUCCESS' ? 'succeeded' : (statusData.status === 'FAILED' ? 'failed' : null);

    if (finalStatus) {
      const transaction = await Transaction.findOne({ where: { cinetpayTransactionId: merchant_transaction_id } });
      if (transaction) {
        transaction.status = finalStatus;
        await transaction.save();

        if (finalStatus === 'succeeded') {
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
              transaction.currency?.toUpperCase() || 'XOF',
              merchant_transaction_id,
              `${frontendUrl}/dashboard`
            );
            await sendEmail(etudiant.email, confirmEmail.subject, confirmEmail.text, confirmEmail.html);

            console.log(`CinetPay Paiement réussi pour l'étudiant: ${etudiant.email}`);
          }
        }
      }
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Erreur cinetpayWebhook:', error);
    res.status(500).send('Webhook error');
  }
};

