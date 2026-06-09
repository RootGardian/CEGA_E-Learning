"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sendEmail = async (to, subject, text, html) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.warn('BREVO_API_KEY is not defined. Email will not be sent.');
        return false;
    }
    const senderEmail = process.env.EMAIL_FROM || 'noreply@cega-elearning.com';
    const payload = {
        sender: { name: 'CEGA E-Learning', email: senderEmail },
        to: [{ email: to }],
        subject: subject,
        textContent: text,
        htmlContent: html || text,
    };
    try {
        const response = await axios_1.default.post('https://api.brevo.com/v3/smtp/email', payload, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });
        console.log(`Email successfully sent to ${to} (MessageId: ${response.data.messageId})`);
        return true;
    }
    catch (error) {
        console.error('Error sending email via Brevo API:', error.response?.data || error.message);
        return false;
    }
};
exports.sendEmail = sendEmail;
