import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import Etudiant from '../models/Etudiant';
import Transaction from '../models/Transaction';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'gnf', description, email } = req.body;

    if (!amount) {
      res.status(400).json({ message: 'Le montant est requis.' });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Pour GNF (sans décimale), c'est l'entier.
      currency,
      description: description || 'Frais de scolarité CEGA',
      receipt_email: email, // Optional
      metadata: {
        etudiantEmail: email, // Pour retrouver l'étudiant dans le webhook
      },
      // automatic_payment_methods: { enabled: true },
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
      
      const email = paymentIntent.metadata.etudiantEmail;
      
      if (email) {
        const etudiant = await Etudiant.findOne({ where: { email } });
        if (etudiant) {
          // Update Subscription Status (add 1 year)
          etudiant.subscriptionStatus = 'active';
          const newExpDate = etudiant.accessExpirationDate && etudiant.accessExpirationDate > new Date() 
            ? new Date(etudiant.accessExpirationDate.getTime()) 
            : new Date();
          newExpDate.setFullYear(newExpDate.getFullYear() + 1);
          etudiant.accessExpirationDate = newExpDate;
          await etudiant.save();

          // Create Transaction
          await Transaction.create({
            etudiantId: etudiant.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: 'succeeded',
            stripePaymentIntentId: paymentIntent.id,
            description: paymentIntent.description,
          });

          console.log(`Paiement réussi pour l'étudiant avec l'email: ${email}`);
        }
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as any;
      console.log('Payment failed!');
      const email = paymentIntent.metadata.etudiantEmail;
      if (email) {
        const etudiant = await Etudiant.findOne({ where: { email } });
        if (etudiant) {
          await Transaction.create({
            etudiantId: etudiant.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: 'failed',
            stripePaymentIntentId: paymentIntent.id,
            description: paymentIntent.description,
          });
        }
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
    const userId = (req as any).user.id;
    const transactions = await Transaction.findAll({
      where: { etudiantId: userId },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Get Transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
