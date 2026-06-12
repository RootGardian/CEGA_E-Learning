import express from 'express';
import { createPaymentIntent, stripeWebhook, getTransactions, initCinetPayPayment, cinetpayWebhook, getPrice } from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Prix dynamique pour l'étudiant
router.get('/price', protect, getPrice);

// Endpoint pour créer une intention de paiement (Stripe)
router.post('/create-intent', createPaymentIntent);

// Endpoints pour CinetPay
router.post('/cinetpay/init', initCinetPayPayment);
// Le webhook peut être appelé par CinetPay qui n'a pas de token JWT, donc pas de protect
router.post('/cinetpay/webhook', cinetpayWebhook);

// Historique des transactions
router.get('/history', protect, getTransactions);

export default router;
