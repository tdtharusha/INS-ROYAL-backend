import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'OrderInvoice',
        'Revenue',
        'Expense',
        'GRNInvoice',
        'Inventory',
        'Profit',
      ],
    },
    data: {
      type: Object,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    startDate: Date,
    endDate: Date,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
