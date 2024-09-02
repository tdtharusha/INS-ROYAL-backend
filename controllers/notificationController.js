import asyncHandler from 'express-async-handler';
import Notification from '../models/notificationModel.js';
import nodemailer from 'nodemailer';
import User from '../models/userModel.js';

// Configure nodemailer transporter
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'login', // default
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // debug: true, // Enable debug logs
  // logger: true, // Log to console
});
// console.log('auth:', auth);
// Verify transporter configuration
// transporter.verify(function (error, success) {
//   if (error) {
//     console.log('Transporter verification error:', error);
//   } else {
//     console.log('Server is ready to take our messages');
//   }
// });

const sendNotification = asyncHandler(
  async (user, emailType, orderDetails = null) => {
    console.log('Attempting to send notification to user:', user.email);
    try {
      let subject, text;

      switch (emailType) {
        case 'userRegister':
          subject = 'Welcome to Our Restaurant!';
          text = `Dear ${user.name},\n\nWe're thrilled to welcome you to the INS ROYAL restaurnat! Thank you for choosing us for your dining experiences. We look forward to serving you!\n\n\nHappy Shopping...!!\n\n\n© INS ROYAL Restaurant`;
          break;
        case 'orderCreation':
          subject = 'Order Confirmation';
          text = `Dear ${user.name},\n\nYour order has been successfully placed. Thank you for your order at INS ROYAL! We're excited to serve you.\n\nYour order number is: ${orderDetails._id}\n\n\n© INS ROYAL Restaurant`;
          break;
        case 'orderStatusChange':
          subject = 'Order Status Update';
          text = `Dear ${user.name},\n\nYour order (ID: ${orderDetails._id}) status has been updated to: ${orderDetails.status}\n\n\n© INS ROYAL Restaurant`;

          break;
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject,
        text,
      };

      console.log('mail options', mailOptions);

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);

      const notification = new Notification({
        user: user._id,
        emailType,
        emailId: info.messageId,
        sendingStatus: 'success',
        orderDetails: orderDetails ? orderDetails._id : null,
      });

      // console.log('Saving notification:', notification);

      await notification.save();

      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      console.error({
        message: 'Error sending notification:',
        error,
      });

      const notification = new Notification({
        user: user._id,
        emailType,
        emailId: 'N/A',
        sendingStatus: 'failure',
        orderDetails: orderDetails ? orderDetails._id : null,
      });

      await notification.save();

      return { success: false, message: 'Failed to send notification' };
    }
  }
);

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find()
    .populate('user', 'name email')
    .populate('orderDetails', 'status')
    .sort('-createdAt');

  res.json(notifications);
});

export { sendNotification, getNotifications };
