const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema({
  name: String, // e.g. "Color", "Size"
  options: [
    {
      value: String,
      price: Number,
      stock: Number,
      sku: String,
    },
  ],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 200 },
    slug: { type: String, unique: true },
    description: { type: String, required: [true, 'Description is required'] },
    shortDescription: { type: String, maxlength: 500 },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    comparePrice: { type: Number, min: 0 }, // MRP / original price
    costPrice: { type: Number, min: 0 },   // for margin tracking
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        alt: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, trim: true },
    tags: [String],
    variants: [variantSchema],
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    weight: Number, // in grams
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    metaTitle: String,
    metaDescription: String,
    soldCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

// Virtual: discount percentage
productSchema.virtual('discountPercent').get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
