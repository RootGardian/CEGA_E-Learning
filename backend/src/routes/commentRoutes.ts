import express from 'express';
import { getComments, createComment, deleteComment } from '../controllers/commentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/module/:moduleId', getComments);
router.post('/module/:moduleId', createComment);
router.delete('/:id', deleteComment);

export default router;
