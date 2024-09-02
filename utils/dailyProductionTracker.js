import mongoose from 'mongoose';

const dailyProductionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  productionDone: {
    type: Boolean,
    default: true,
  },
});

const DailyProduction = mongoose.model(
  'DailyProduction',
  dailyProductionSchema
);

const isProductionAllowedToday = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const productionRecord = await DailyProduction.findOne({ date: today });
  return !productionRecord;
};

const markProductionDone = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await DailyProduction.findOneAndUpdate(
    { date: today },
    { productionDone: true },
    { upsert: true, new: true }
  );
};

export { isProductionAllowedToday, markProductionDone };
