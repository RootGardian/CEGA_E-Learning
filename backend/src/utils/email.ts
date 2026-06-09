import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
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
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    console.log(`Email successfully sent to ${to} (MessageId: ${response.data.messageId})`);
    return true;
  } catch (error: any) {
    console.error('Error sending email via Brevo API:', error.response?.data || error.message);
    return false;
  }
};
