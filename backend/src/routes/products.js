const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/products
router.get('/', async (req, res) => {
  const {
    keyword, category, brand, minPrice, maxPrice,
    rating, sort = '-createdAt', page = 1, limit = 12,
    featured,
  } = req.query;

  const query = { isActive: true };

  if (keyword) query.$text = { $search: keyword };
  if (category) query.category = category;
  if (brand) query.brand = new RegExp(brand, 'i');
  if (featured === 'true') query.isFeatured = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (rating) query['ratings.average'] = { $gte: Number(rating) };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    products,
  });
});

// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
    isActive: true,
  }).populate('category', 'name slug');

  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
});

// @route   POST /api/products  (admin)
router.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  req.body.createdBy = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @route   PUT /api/products/:id  (admin)
router.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
});

// @route   DELETE /api/products/:id  (admin)
router.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Product removed' });
});

// @route   PUT /api/products/:id/wishlist
router.put('/:id/wishlist', protect, async (req, res) => {
  const User = require('../models/User');
  const user = await User.findById(req.user.id);
  const idx = user.wishlist.indexOf(req.params.id);
  if (idx === -1) {
    user.wishlist.push(req.params.id);
  } else {
    user.wishlist.splice(idx, 1);
  }
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});

module.exports = router;
