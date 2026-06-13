import express from 'express';
import { 
  createPaymentIntent, 
  stripeWebhook, 
  getTransactions,
  initCinetPayPayment,
  cinetpayWebhook,
  getCinetPayPaymentStatus
} from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Endpoint pour créer une intention de paiement (Stripe)
router.post('/create-intent', protect, createPaymentIntent);

// Endpoints pour CinetPay
router.post('/cinetpay/init', protect, initCinetPayPayment);
router.post('/cinetpay/webhook', cinetpayWebhook); // Webhook sans auth
router.get('/cinetpay/status/:transactionId', getCinetPayPaymentStatus);

// Historique des transactions
router.get('/history', protect, getTransactions);

export default router;
