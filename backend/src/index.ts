import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import sequelize from './utils/db';
import authRoutes from './routes/authRoutes';
import paymentRoutes from './routes/paymentRoutes';
import courseRoutes from './routes/courseRoutes';
import notificationRoutes from './routes/notificationRoutes';
import teacherRoutes from './routes/teacherRoutes';
import adminRoutes from './routes/adminRoutes';
import evaluationRoutes from './routes/evaluationRoutes';
import examRoutes from './routes/examRoutes';
import { stripeWebhook } from './controllers/paymentController';

// Models import to ensure they are registered with Sequelize
import './models/Etudiant';
import './models/Course';
import './models/Module';
import './models/Lesson';
import './models/Transaction';
import './models/Notification';
import './models/Intervenant';
import './models/CourseAccess';
import './models/User';
import './models/SystemSetting';
import './models/StudentProgress';
import './models/Evaluation';
import './models/Grade';
import { initSocket } from './utils/socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(httpServer);

app.use(cors({
  origin: true, // Allow any origin to connect (useful for local network access)
  credentials: true, // Necessary to allow cookies to be sent
}));

// Stripe Webhook MUST be placed BEFORE express.json() because it needs the raw body
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/evaluations', examRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CEGA E-Learning API is running' });
});

// Use alter: true to not drop existing tables, but apply new columns if necessary.
// Use alter: false to prevent Sequelize from trying to modify existing tables (like users)
// which have dependent views. It will still create new tables (like system_settings).
sequelize.sync({ alter: false })
  .then(() => {
    console.log('Database synced successfully.');
    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });
