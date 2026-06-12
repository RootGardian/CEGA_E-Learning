"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// Endpoint public/authentifié pour récupérer les paramètres du site (ex: Support)
router.get('/', adminController_1.getSystemSettings);
exports.default = router;
