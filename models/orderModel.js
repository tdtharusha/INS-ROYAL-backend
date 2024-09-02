import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        image: { type: String, required: true },
      },
    ],
    shippingMethod: {
      type: String,
      required: true,
      enum: ['delivery', 'pickup'],
    },
    pickupDateTime: {
      type: Date,
    },
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      country: { type: String },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    subTotal: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      default: 'New',
      enum: ['New', 'Processing', 'Delivering', 'Complete'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
      },
    },
    distance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index on the location field
orderSchema.index({ location: '2dsphere' });

const Order = mongoose.model('Order', orderSchema);

export default Order;
