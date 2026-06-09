import express from 'express';
import { createPaymentIntent, stripeWebhook, getTransactions } from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Endpoint pour créer une intention de paiement
router.post('/create-intent', createPaymentIntent);

// Historique des transactions
router.get('/history', protect, getTransactions);

export default router;
