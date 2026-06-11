"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./utils/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const teacherRoutes_1 = __importDefault(require("./routes/teacherRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const paymentController_1 = require("./controllers/paymentController");
// Models import to ensure they are registered with Sequelize
require("./models/Etudiant");
require("./models/Course");
require("./models/Module");
require("./models/Lesson");
require("./models/Transaction");
require("./models/Notification");
require("./models/Intervenant");
require("./models/CourseAccess");
require("./models/User");
require("./models/SystemSetting");
require("./models/StudentProgress");
const socket_1 = require("./utils/socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const port = process.env.PORT || 5000;
// Initialize Socket.io
(0, socket_1.initSocket)(httpServer);
app.use((0, cors_1.default)({
    origin: true, // Allow any origin to connect (useful for local network access)
    credentials: true, // Necessary to allow cookies to be sent
}));
// Stripe Webhook MUST be placed BEFORE express.json() because it needs the raw body
app.post('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }), paymentController_1.stripeWebhook);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', authRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/teacher', teacherRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CEGA E-Learning API is running' });
});
// Use alter: true to not drop existing tables, but apply new columns if necessary.
// Use alter: false to prevent Sequelize from trying to modify existing tables (like users)
// which have dependent views. It will still create new tables (like system_settings).
db_1.default.sync({ alter: false })
    .then(() => {
    console.log('Database synced successfully.');
    httpServer.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})
    .catch((err) => {
    console.error('Error syncing database:', err);
});
