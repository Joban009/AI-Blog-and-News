import { Router } from 'express';
import { generateContent, improveContent } from '../controllers/aiController.js';
import { authenticate, requireRole }       from '../middleware/auth.js';
import { rateLimit }                       from 'express-rate-limit';

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many AI requests. Please wait a moment.' },
});

const router = Router();

router.use(authenticate, requireRole('admin'));
router.post('/generate', aiLimiter, generateContent);
router.post('/improve',  aiLimiter, improveContent);

export default router;
