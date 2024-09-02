import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import { sendNotification } from './notificationController.js';

// desc - Auth user & get token
// route - POST /api/users/auth
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // If the user is found and the password matches, return JSON object with user's info and token generating using the user's ID
    generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    // If there is no user to found, then throw an error with status code 401
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// desc -  Register new user
// route -  POST /api/users
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, isAdmin, category } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    isAdmin,
    category,
  });

  if (user) {
    generateToken(res, user._id);

    // Send notification
    await sendNotification(user, 'userRegister');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      category: user.category,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// desc - Logout user
// route - POST /api/users/logout
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'User logged out' });
});

// desc - Get user profile
// route - GET /api/users/profile
const getUserProfiile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// desc - Update user profile
// route - PUT /api/users/profile
const updateUserProfiile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updateUser = await user.save();

    res.status(200).json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      isAdmin: updateUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// desc - Get all users
// route - GET /api/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// desc - update user
// route - PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin =
      req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

    const updateUser = await user.save();

    res.status(200).json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      isAdmin: updateUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// desc - Delete user
// route - DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.status(200).json({ message: 'User deleted' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// desc - Get user by ID
// route - GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400);
    throw new Error('User not found');
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfiile,
  updateUserProfiile,
  getUsers,
  updateUser,
  deleteUser,
  getUserById,
};
