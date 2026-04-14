import { Router } from 'express';
import { body }   from 'express-validator';
import { register, login, me } from '../controllers/authController.js';
import { authenticate }        from '../middleware/auth.js';
import { validate }            from '../middleware/validate.js';

const router = Router();

router.post('/register',
  body('username').trim().isLength({ min: 3, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  validate,
  register
);

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
  login
);

router.get('/me', authenticate, me);

export default router;
