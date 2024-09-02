import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import { getNotifications } from '../controllers/notificationController.js';

router.route('/').get(protect, admin, getNotifications);

export default router;
