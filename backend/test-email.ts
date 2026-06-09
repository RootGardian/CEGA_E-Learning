import { sendEmail } from './src/utils/email';

sendEmail('test@yopmail.com', 'Test Brevo API', 'This is a test from CEGA E-Learning.')
  .then((res) => {
    console.log('Success:', res);
    process.exit();
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
