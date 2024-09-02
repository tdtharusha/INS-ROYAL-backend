import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfiile,
  updateUserProfiile,
  getUsers,
  updateUser,
  deleteUser,
  getUserById,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/auth', authUser);
router.post('/logout', logoutUser);
router
  .route('/profile')
  .get(protect, getUserProfiile)
  .put(protect, updateUserProfiile);
router
  .route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById);

export default router;
