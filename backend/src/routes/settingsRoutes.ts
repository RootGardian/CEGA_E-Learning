import { Router } from 'express';
import { getSystemSettings } from '../controllers/adminController';

const router = Router();

// Endpoint public/authentifié pour récupérer les paramètres du site (ex: Support)
router.get('/', getSystemSettings);

export default router;
