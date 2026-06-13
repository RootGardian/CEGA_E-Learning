import { Request, Response } from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {
  ApiError,
  AuthenticationError,
  CinetPayClient,
  CinetPayError,
  NetworkError,
  TimeoutError,
  ValidationError,
  isFinalStatus,
  parseNotification,
  verifyNotification,
  type CountryCode,
  type Currency,
  type PaymentMethod,
  type PaymentStatus,
} from 'cinetpay-js';
import Etudiant from '../models/Etudiant';
import Transaction from '../models/Transaction';
import SystemSetting from '../models/SystemSetting';
import Formation from '../models/Formation';
import { sendEmail } from '../utils/email';
import { paymentConfirmationEmail } from '../utils/emailTemplates';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

type LocalPaymentStatus = 'succeeded' | 'failed' | 'pending';

type CinetPayStoredMetadata = {
  country: CountryCode;
  merchantTransactionId: string;
  notifyToken?: string;
  paymentToken?: string;
  providerTransactionId?: string;
};

const CINETPAY_SETTING_PREFIX = 'cinetpayPayment:';
const DEFAULT_FORMATION_PRICE = 150000;
const DEFAULT_CINETPAY_COUNTRY: CountryCode = 'GN';
const DEFAULT_CINETPAY_CURRENCY: Currency = 'GNF';
const DEFAULT_CINETPAY_METHOD: PaymentMethod = 'OM_GN';
const SUPPORTED_CINETPAY_COUNTRIES: CountryCode[] = ['CI', 'BF', 'ML', 'SN', 'TG', 'GN', 'CM', 'BJ', 'CD', 'NE'];
const SUPPORTED_CINETPAY_CURRENCIES: Currency[] = ['XOF', 'XAF', 'GNF', 'CDF', 'USD'];

const getFirstString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return getFirstString(value[0]);
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
};

const getFormationAmount = async (userId?: number): Promise<number> => {
  if (userId) {
    const etudiant = await Etudiant.findByPk(userId);
    if (etudiant && etudiant.department) {
      const formation = await Formation.findOne({ where: { code_formation: etudiant.department } });
      if (formation && formation.frais_inscription) {
        return Number(formation.frais_inscription);
      }
    }
  }

  const setting = await SystemSetting.findOne({ where: { key: 'formationPrice' } });
  const amount = setting && setting.value ? parseInt(setting.value, 10) : DEFAULT_FORMATION_PRICE;
  return Number.isFinite(amount) && amount > 0 ? amount : DEFAULT_FORMATION_PRICE;
};

const addSubscriptionMonths = async (etudiant: Etudiant, months = 6): Promise<void> => {
  etudiant.subscriptionStatus = 'active';
  const newExpDate = etudiant.accessExpirationDate && etudiant.accessExpirationDate > new Date()
    ? new Date(etudiant.accessExpirationDate.getTime())
    : new Date();
  newExpDate.setMonth(newExpDate.getMonth() + months);
  etudiant.accessExpirationDate = newExpDate;
  await etudiant.save();
};

const sendConfirmation = async (
  etudiant: Etudiant,
  amount: number,
  currency: string,
  transactionId: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const confirmEmail = paymentConfirmationEmail(
    etudiant.firstName,
    Number(amount),
    currency.toUpperCase(),
    transactionId,
    `${frontendUrl}/dashboard`
  );
  await sendEmail(etudiant.email, confirmEmail.subject, confirmEmail.text, confirmEmail.html);
};

export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currency = 'gnf', description, email } = req.body;
    const userId = (req as any).user?.id;
    const amount = await getFormationAmount(userId);

    if (!amount) {
      res.status(400).json({ message: 'Le montant est invalide.' });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      description: description || 'Frais de scolarite CEGA',
      receipt_email: email,
      metadata: {
        etudiantEmail: email,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Erreur lors de la creation du PaymentIntent:', error);
    res.status(500).json({ message: error.message });
  }
};

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    res.status(400).send('Webhook Error: Missing signature or secret');
    return;
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as any;
      const email = paymentIntent.metadata.etudiantEmail;

      if (email) {
        const etudiant = await Etudiant.findOne({ where: { email } });
        if (etudiant) {
          await addSubscriptionMonths(etudiant);

          await Transaction.create({
            etudiantId: etudiant.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: 'succeeded',
            stripePaymentIntentId: paymentIntent.id,
            description: paymentIntent.description,
          });

          await sendConfirmation(
            etudiant,
            paymentIntent.amount,
            paymentIntent.currency?.toUpperCase() || 'GNF',
            paymentIntent.id
          );

          console.log(`Paiement reussi pour l'etudiant avec l'email: ${email}`);
        }
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as any;
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

const normalizeCinetPayCountry = (rawCountry?: string): CountryCode => {
  const country = (rawCountry || process.env.CINETPAY_COUNTRY || DEFAULT_CINETPAY_COUNTRY).toUpperCase();
  if (!SUPPORTED_CINETPAY_COUNTRIES.includes(country as CountryCode)) {
    throw new Error(`Pays CinetPay non supporte: ${country}`);
  }

  return country as CountryCode;
};

const normalizeCinetPayCurrency = (rawCurrency?: string): Currency => {
  const currency = (rawCurrency || process.env.CINETPAY_CURRENCY || DEFAULT_CINETPAY_CURRENCY).toUpperCase();
  if (!SUPPORTED_CINETPAY_CURRENCIES.includes(currency as Currency)) {
    throw new Error(`Devise CinetPay non supportee: ${currency}`);
  }

  return currency as Currency;
};

const normalizeCinetPayPaymentMethod = (rawMethod: string | undefined, country: CountryCode): PaymentMethod | undefined => {
  if (rawMethod === 'ALL') return undefined;
  const method = (rawMethod || process.env.CINETPAY_PAYMENT_METHOD || (country === 'GN' ? DEFAULT_CINETPAY_METHOD : undefined))?.toUpperCase();
  return method ? method as PaymentMethod : undefined;
};

const getCountryCredential = (name: 'CINETPAY_API_KEY' | 'CINETPAY_API_PASSWORD', country: CountryCode): string | undefined => {
  return process.env[`${name}_${country}`] || process.env[name];
};

const createCinetPayClient = (country: CountryCode): CinetPayClient => {
  const apiKey = getCountryCredential('CINETPAY_API_KEY', country);
  const apiPassword = getCountryCredential('CINETPAY_API_PASSWORD', country);

  if (!apiKey || !apiPassword) {
    throw new Error(`Configuration CinetPay manquante pour ${country}. Ajoutez CINETPAY_API_KEY_${country}/CINETPAY_API_PASSWORD_${country} ou CINETPAY_API_KEY/CINETPAY_API_PASSWORD.`);
  }

  return new CinetPayClient({
    credentials: {
      [country]: { apiKey, apiPassword },
    },
    baseUrl: process.env.CINETPAY_BASE_URL || undefined,
    debug: process.env.CINETPAY_DEBUG === 'true',
    forceIPv4: true,
  });
};

const createMerchantTransactionId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CEGA${timestamp}${suffix}`.slice(0, 30);
};

const getCinetPayMetadataKey = (merchantTransactionId: string): string => {
  return `${CINETPAY_SETTING_PREFIX}${merchantTransactionId}`;
};

const saveCinetPayMetadata = async (metadata: CinetPayStoredMetadata): Promise<void> => {
  const key = getCinetPayMetadataKey(metadata.merchantTransactionId);
  const existing = await SystemSetting.findOne({ where: { key } });
  const value = JSON.stringify(metadata);

  if (existing) {
    existing.value = value;
    existing.type = 'json';
    existing.description = 'Metadonnees de paiement CinetPay';
    await existing.save();
    return;
  }

  await SystemSetting.create({
    key,
    value,
    type: 'json',
    description: 'Metadonnees de paiement CinetPay',
  });
};

const getCinetPayMetadata = async (merchantTransactionId: string): Promise<CinetPayStoredMetadata | null> => {
  const setting = await SystemSetting.findOne({ where: { key: getCinetPayMetadataKey(merchantTransactionId) } });
  if (!setting?.value) {
    return null;
  }

  try {
    return JSON.parse(setting.value) as CinetPayStoredMetadata;
  } catch (error) {
    console.warn('Impossible de lire les metadonnees CinetPay:', error);
    return null;
  }
};

const mapCinetPayStatus = (status: string): LocalPaymentStatus => {
  if (status === 'SUCCESS') {
    return 'succeeded';
  }

  if (status === 'FAILED' || isFinalStatus(status)) {
    return 'failed';
  }

  return 'pending';
};

const activateStudentSubscription = async (transaction: Transaction, merchantTransactionId: string): Promise<void> => {
  const etudiant = await Etudiant.findByPk(transaction.etudiantId);
  if (!etudiant) {
    return;
  }

  await addSubscriptionMonths(etudiant);
  await sendConfirmation(
    etudiant,
    Number(transaction.amount),
    transaction.currency?.toUpperCase() || DEFAULT_CINETPAY_CURRENCY,
    merchantTransactionId
  );

  console.log(`CinetPay paiement reussi pour l'etudiant ID: ${etudiant.id}`);
};

const updateLocalTransactionFromCinetPay = async (
  transaction: Transaction,
  statusData: PaymentStatus,
  merchantTransactionId: string
): Promise<LocalPaymentStatus> => {
  const localStatus = mapCinetPayStatus(statusData.status);
  const previousStatus = transaction.status;

  if (localStatus !== previousStatus) {
    transaction.status = localStatus;
    await transaction.save();
  }

  if (localStatus === 'succeeded' && previousStatus !== 'succeeded') {
    await activateStudentSubscription(transaction, merchantTransactionId);
  }

  return localStatus;
};

const getCinetPayStatus = async (
  client: CinetPayClient,
  country: CountryCode,
  merchantTransactionId: string,
  providerTransactionId?: string
): Promise<PaymentStatus> => {
  if (providerTransactionId) {
    try {
      return await client.payment.getStatus(providerTransactionId, country);
    } catch (error) {
      console.warn('Verification CinetPay via transactionId impossible, fallback merchantTransactionId:', error);
    }
  }

  return client.payment.getStatus(merchantTransactionId, country);
};

const sendCinetPayError = (res: Response, error: unknown, fallbackMessage: string): void => {
  console.error(fallbackMessage, error);

  if (error instanceof AuthenticationError) {
    res.status(401).json({
      message: 'Identifiants CinetPay invalides. Verifiez la API Key, le mot de passe API et le pays configure.',
    });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({
      message: 'Parametres CinetPay invalides.',
      details: error.message,
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(400).json({
      message: fallbackMessage,
      details: {
        code: error.apiCode,
        status: error.apiStatus,
        description: error.description,
      },
    });
    return;
  }

  if (error instanceof NetworkError || error instanceof TimeoutError) {
    res.status(502).json({ message: 'CinetPay est momentanement inaccessible. Reessayez dans quelques instants.' });
    return;
  }

  if (error instanceof CinetPayError || error instanceof Error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.status(500).json({ message: fallbackMessage });
};

export const initCinetPayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as any).user?.role !== 'etudiant') {
      res.status(403).json({ message: 'Seuls les apprenants peuvent initialiser un paiement.' });
      return;
    }

    const etudiant = await Etudiant.findByPk((req as any).user.id);
    if (!etudiant) {
      res.status(404).json({ message: 'Apprenant introuvable.' });
      return;
    }

    const country = normalizeCinetPayCountry(getFirstString(req.body.country));
    const currency = normalizeCinetPayCurrency(getFirstString(req.body.currency));
    const paymentMethod = normalizeCinetPayPaymentMethod(getFirstString(req.body.paymentMethod), country);
    const amount = await getFormationAmount(etudiant.id);
    const merchantTransactionId = createMerchantTransactionId();
    const description = getFirstString(req.body.description) || 'Frais de scolarite CEGA E-Learning';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
    const notifyUrl = `${apiUrl}/api/payments/cinetpay/webhook`;
    const client = createCinetPayClient(country);

    const payment = await client.payment.initialize({
      currency,
      merchantTransactionId,
      amount,
      lang: 'fr',
      designation: description,
      clientEmail: etudiant.email,
      clientFirstName: etudiant.firstName || 'Etudiant',
      clientLastName: etudiant.lastName || 'CEGA',
      clientPhoneNumber: etudiant.phone || getFirstString(req.body.phone) || undefined,
      successUrl: `${frontendUrl}/payment/callback?status=success&tx=${merchantTransactionId}`,
      failedUrl: `${frontendUrl}/payment/callback?status=failed&tx=${merchantTransactionId}`,
      notifyUrl,
      channels: 'ALL',
      channel: 'PUSH',
      paymentMethod,
      directPay: false,
    } as any, country);

    await Transaction.create({
      etudiantId: etudiant.id,
      amount,
      currency,
      status: 'pending',
      paymentMethod: 'cinetpay',
      cinetpayTransactionId: merchantTransactionId,
      description,
    });

    await saveCinetPayMetadata({
      country,
      merchantTransactionId,
      notifyToken: payment.notifyToken,
      paymentToken: payment.paymentToken,
      providerTransactionId: payment.transactionId,
    });

    res.status(200).json({
      payment_url: payment.paymentUrl,
      paymentUrl: payment.paymentUrl,
      merchantTransactionId,
      transactionId: payment.transactionId,
      status: payment.status,
    });
  } catch (error) {
    sendCinetPayError(res, error, 'Erreur lors de l initialisation du paiement CinetPay.');
  }
};

export const cinetpayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    let merchantTransactionId = getFirstString(body.merchant_transaction_id) || getFirstString(body.cpm_trans_id);
    let providerTransactionId = getFirstString(body.transaction_id);
    let notifyToken = getFirstString(body.notify_token);

    try {
      const notification = parseNotification(req.body);
      merchantTransactionId = notification.merchantTransactionId || merchantTransactionId;
      providerTransactionId = notification.transactionId || providerTransactionId;
      notifyToken = notification.notifyToken || notifyToken;
    } catch (error) {
      console.warn('Webhook CinetPay recu dans un format legacy ou incomplet:', error);
    }

    if (!merchantTransactionId) {
      res.status(400).send('No transaction id provided');
      return;
    }

    const transaction = await Transaction.findOne({ where: { cinetpayTransactionId: merchantTransactionId } });
    if (!transaction) {
      res.status(404).send('Transaction not found');
      return;
    }

    const metadata = await getCinetPayMetadata(merchantTransactionId);
    if (metadata?.notifyToken && notifyToken && !verifyNotification(metadata.notifyToken, notifyToken)) {
      res.status(401).send('Invalid notification token');
      return;
    }

    const country = normalizeCinetPayCountry(getFirstString(body.country) || metadata?.country);
    const client = createCinetPayClient(country);
    const statusData = await getCinetPayStatus(client, country, merchantTransactionId, providerTransactionId || metadata?.providerTransactionId);
    await updateLocalTransactionFromCinetPay(transaction, statusData, merchantTransactionId);

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erreur cinetpayWebhook:', error);
    res.status(500).send('Webhook error');
  }
};

export const getCinetPayPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const merchantTransactionId = getFirstString(req.params.transactionId);
    if (!merchantTransactionId) {
      res.status(400).json({ message: 'Transaction id manquant.' });
      return;
    }

    const transaction = await Transaction.findOne({ where: { cinetpayTransactionId: merchantTransactionId } });
    if (!transaction) {
      res.status(404).json({ message: 'Transaction introuvable.' });
      return;
    }

    const metadata = await getCinetPayMetadata(merchantTransactionId);
    const country = normalizeCinetPayCountry(getFirstString(req.query.country) || metadata?.country);
    const client = createCinetPayClient(country);
    const statusData = await getCinetPayStatus(client, country, merchantTransactionId, metadata?.providerTransactionId);
    const status = await updateLocalTransactionFromCinetPay(transaction, statusData, merchantTransactionId);

    res.status(200).json({
      status,
      cinetpayStatus: statusData.status,
      transactionId: merchantTransactionId,
      providerTransactionId: statusData.transactionId,
    });
  } catch (error) {
    sendCinetPayError(res, error, 'Erreur lors de la verification du paiement CinetPay.');
  }
};
