import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'category',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['In-house-made-foods', 'Pre-made-foods'],
    },
    image: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property for the number of reviwes
productSchema.virtual('numberOfReviews').get(function () {
  return this.reviews.length;
});

// Method to calculate and update the average rating
productSchema.methods.updateAverageRating = function () {
  const totalRating = this.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  this.rating = this.reviews.length > 0 ? totalRating / this.reviews.length : 0;
};

// Add pre-save middleware to update the average rating before saving
productSchema.pre('save', function (next) {
  if (this.isModified('reviews')) {
    this.updateAverageRating();
  }
  if (this.isModified('category')) {
    this.inventory =
      this.category === 'In-house-made-foods'
        ? 'InHouseMadeFoodsInventory'
        : 'PreMadeFoodsInventory';
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
