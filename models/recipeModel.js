import mongoose from 'mongoose';

const ingredientsSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
});

const recipeSchema = new mongoose.Schema(
  {
    brand: {
      type: mongoose.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'In-house-made-foods',
    },
    subSection: {
      type: String,
      required: true,
    },
    ingredients: [ingredientsSchema],
    defaultDailyQuantity: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
