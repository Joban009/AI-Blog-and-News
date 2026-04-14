import { Router } from 'express';
import {
  listComments, createComment, deleteComment,
  approveComment, rejectComment,
} from '../controllers/commentController.js';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/',                         optionalAuth, listComments);
router.post('/',                        authenticate, createComment);
router.delete('/:id',                   authenticate, deleteComment);
router.patch('/:id/approve', authenticate, requireRole('admin'), approveComment);
router.patch('/:id/reject',  authenticate, requireRole('admin'), rejectComment);

export default router;
