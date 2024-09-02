import asyncHandler from 'express-async-handler';
import Counter from '../models/counterModel.js';

const generateGRNNumber = asyncHandler(async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  const counter = await Counter.findByIdAndUpdate(
    { _id: 'grnNumber' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const sequenceNumber = counter.seq.toString().padStart(4, '0');
  const grnNumber = `GRN${year}${month}${sequenceNumber}`;

  return grnNumber;
});

export default generateGRNNumber;
