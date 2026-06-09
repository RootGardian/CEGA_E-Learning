"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Endpoint pour créer une intention de paiement
router.post('/create-intent', paymentController_1.createPaymentIntent);
// Historique des transactions
router.get('/history', authMiddleware_1.protect, paymentController_1.getTransactions);
exports.default = router;
