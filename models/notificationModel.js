import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emailType: {
      type: String,
      enum: ['userRegister', 'orderCreation', 'orderStatusChange'],
      required: true,
    },
    emailId: {
      type: String,
      required: true,
    },
    sendingStatus: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
    },
    orderDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
