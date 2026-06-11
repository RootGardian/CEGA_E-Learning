"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cinetpayWebhook = exports.initCinetPayPayment = exports.getTransactions = exports.stripeWebhook = exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const Etudiant_1 = __importDefault(require("../models/Etudiant"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const SystemSetting_1 = __importDefault(require("../models/SystemSetting"));
const email_1 = require("../utils/email");
const emailTemplates_1 = require("../utils/emailTemplates");
dotenv_1.default.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
const createPaymentIntent = async (req, res) => {
    try {
        const { currency = 'gnf', description, email } = req.body;
        // Fetch the dynamic price from settings instead of trusting the client
        const setting = await SystemSetting_1.default.findOne({ where: { key: 'formationPrice' } });
        const formationPrice = setting && setting.value ? parseInt(setting.value, 10) : 500; // Default 500
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
            receipt_email: email, // Optional
            metadata: {
                etudiantEmail: email, // Pour retrouver l'étudiant dans le webhook
            },
            // automatic_payment_methods: { enabled: true },
        });
        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });
    }
    catch (error) {
        console.error('Erreur lors de la création du PaymentIntent:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.createPaymentIntent = createPaymentIntent;
const stripeWebhook = async (req, res) => {
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
    }
    catch (err) {
        console.error('Webhook signature verification failed.', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Gérer l'événement
    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!');
            const email = paymentIntent.metadata.etudiantEmail;
            if (email) {
                const etudiant = await Etudiant_1.default.findOne({ where: { email } });
                if (etudiant) {
                    // Update Subscription Status (add 1 year)
                    etudiant.subscriptionStatus = 'active';
                    const newExpDate = etudiant.accessExpirationDate && etudiant.accessExpirationDate > new Date()
                        ? new Date(etudiant.accessExpirationDate.getTime())
                        : new Date();
                    newExpDate.setMonth(newExpDate.getMonth() + 6);
                    etudiant.accessExpirationDate = newExpDate;
                    await etudiant.save();
                    // Create Transaction
                    await Transaction_1.default.create({
                        etudiantId: etudiant.id,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                        status: 'succeeded',
                        stripePaymentIntentId: paymentIntent.id,
                        description: paymentIntent.description,
                    });
                    // Send professional payment confirmation email
                    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                    const confirmEmail = (0, emailTemplates_1.paymentConfirmationEmail)(etudiant.firstName, paymentIntent.amount, paymentIntent.currency?.toUpperCase() || 'GNF', paymentIntent.id, `${frontendUrl}/dashboard`);
                    await (0, email_1.sendEmail)(email, confirmEmail.subject, confirmEmail.text, confirmEmail.html);
                    console.log(`Paiement réussi pour l'étudiant avec l'email: ${email}`);
                }
            }
            break;
        }
        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;
            console.log('Payment failed!');
            const email = paymentIntent.metadata.etudiantEmail;
            if (email) {
                const etudiant = await Etudiant_1.default.findOne({ where: { email } });
                if (etudiant) {
                    await Transaction_1.default.create({
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
exports.stripeWebhook = stripeWebhook;
const getTransactions = async (req, res) => {
    try {
        const role = req.user?.role;
        if (role !== 'etudiant') {
            res.status(200).json([]);
            return;
        }
        const userId = Number(req.user?.id);
        if (!Number.isFinite(userId) || userId <= 0) {
            res.status(200).json([]);
            return;
        }
        const transactions = await Transaction_1.default.findAll({
            where: { etudiantId: userId },
            order: [['created_at', 'DESC']],
        });
        res.status(200).json(transactions);
    }
    catch (error) {
        console.error('Get Transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getTransactions = getTransactions;
// CINETPAY INTEGRATION
const getCinetPayToken = async () => {
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
    }
    catch (err) {
        console.error('CinetPay Auth fetch error:', err);
        return null;
    }
};
const initCinetPayPayment = async (req, res) => {
    try {
        const { currency = 'XOF', email, firstName = 'Etudiant', lastName = 'CEGA', phone = '' } = req.body;
        // Fetch price
        const setting = await SystemSetting_1.default.findOne({ where: { key: 'formationPrice' } });
        const amount = setting && setting.value ? parseInt(setting.value, 10) : 500;
        const token = await getCinetPayToken();
        if (!token) {
            res.status(500).json({ message: 'Erreur d\'authentification avec le service de paiement (CinetPay).' });
            return;
        }
        const transactionId = crypto_1.default.randomBytes(16).toString('hex');
        const merchant_transaction_id = `CEGA_${Date.now()}`;
        // Trouver l'étudiant
        let etudiantId = null;
        if (email) {
            const etudiant = await Etudiant_1.default.findOne({ where: { email } });
            if (etudiant) {
                etudiantId = etudiant.id;
            }
        }
        // Créer la transaction locale (pending)
        // On doit avoir l'étudiant. S'il n'est pas trouvé, on bloque ou on utilise un ID factice.
        // L'idéal est que req.user soit défini via le middleware protect, mais la route pourrait être publique.
        // Utilisons l'ID de l'étudiant s'il existe.
        if (!etudiantId) {
            res.status(400).json({ message: 'Étudiant introuvable pour cet email.' });
            return;
        }
        await Transaction_1.default.create({
            etudiantId: etudiantId,
            amount: amount,
            currency: currency,
            status: 'pending',
            paymentMethod: 'cinetpay',
            cinetpayTransactionId: merchant_transaction_id,
            description: 'Frais de scolarité CEGA E-Learning',
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
                client_phone_number: phone,
                success_url: `${frontendUrl}/payment/callback?status=success&tx=${merchant_transaction_id}`,
                failed_url: `${frontendUrl}/payment/callback?status=failed&tx=${merchant_transaction_id}`,
                notify_url: notifyUrl,
                direct_pay: false // Redirect flow
            })
        });
        const data = await paymentRes.json();
        if (data.code === 200 && data.payment_url) {
            res.status(200).json({ payment_url: data.payment_url });
        }
        else {
            console.error('CinetPay Payment Error:', data);
            res.status(500).json({ message: 'Erreur lors de l\'initialisation du paiement.', details: data });
        }
    }
    catch (error) {
        console.error('Erreur initCinetPayPayment:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.initCinetPayPayment = initCinetPayPayment;
const cinetpayWebhook = async (req, res) => {
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
            const transaction = await Transaction_1.default.findOne({ where: { cinetpayTransactionId: merchant_transaction_id } });
            if (transaction) {
                transaction.status = finalStatus;
                await transaction.save();
                if (finalStatus === 'succeeded') {
                    const etudiant = await Etudiant_1.default.findByPk(transaction.etudiantId);
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
                        const confirmEmail = (0, emailTemplates_1.paymentConfirmationEmail)(etudiant.firstName, transaction.amount, transaction.currency?.toUpperCase() || 'XOF', merchant_transaction_id, `${frontendUrl}/dashboard`);
                        await (0, email_1.sendEmail)(etudiant.email, confirmEmail.subject, confirmEmail.text, confirmEmail.html);
                        console.log(`CinetPay Paiement réussi pour l'étudiant ID: ${etudiant.id}`);
                    }
                }
            }
        }
        res.status(200).send('OK');
    }
    catch (error) {
        console.error('Erreur cinetpayWebhook:', error);
        res.status(500).send('Webhook error');
    }
};
exports.cinetpayWebhook = cinetpayWebhook;
