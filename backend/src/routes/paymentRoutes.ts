import express from 'express';
import { createPaymentIntent, stripeWebhook, getTransactions, getPrice } from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Prix dynamique pour l'étudiant
router.get('/price', protect, getPrice);

// Endpoint pour créer une intention de paiement (Stripe)
router.post('/create-intent', createPaymentIntent);

// Historique des transactions
router.get('/history', protect, getTransactions);

export default router;
