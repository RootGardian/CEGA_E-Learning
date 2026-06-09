"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = exports.stripeWebhook = exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const Etudiant_1 = __importDefault(require("../models/Etudiant"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
dotenv_1.default.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
const createPaymentIntent = async (req, res) => {
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
                    newExpDate.setFullYear(newExpDate.getFullYear() + 1);
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
        const userId = req.user.id;
        const transactions = await Transaction_1.default.findAll({
            where: { etudiantId: userId },
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(transactions);
    }
    catch (error) {
        console.error('Get Transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getTransactions = getTransactions;
