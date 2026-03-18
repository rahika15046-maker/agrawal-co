const express = require('express');

// ─── Admin Dashboard ───────────────────────────────────────
const adminRouter = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

adminRouter.use(protect, authorize('admin', 'superadmin'));

adminRouter.get('/dashboard', async (req, res) => {
  const [
    totalOrders, totalRevenue, totalProducts, totalUsers,
    recentOrders, lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { 'payment.status': 'paid' } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user' }),
    Order.find().sort('-createdAt').limit(10).populate('user', 'name email'),
    Product.find({ stock: { $lt: 10 }, isActive: true }).select('name stock sku').limit(10),
  ]);

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  // Revenue last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const revenueByDay = await Order.aggregate([
    { $match: { 'payment.status': 'paid', createdAt: { $gte: sevenDaysAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProducts,
      totalUsers,
    },
    ordersByStatus,
    revenueByDay,
    recentOrders,
    lowStockProducts,
  });
});

adminRouter.get('/orders', async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { orderStatus: status } : {};
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(query).sort('-createdAt').skip(skip).limit(Number(limit)).populate('user', 'name email'),
    Order.countDocuments(query),
  ]);
  res.json({ success: true, total, orders });
});

adminRouter.get('/users', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find({ role: 'user' }).sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments({ role: 'user' }),
  ]);
  res.json({ success: true, total, users });
});

adminRouter.put('/users/:id/toggle', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, isActive: user.isActive });
});

// ─── Export routers ────────────────────────────────────────
const { Category, Review } = require('../models/CategoryAndReview');

const categoryRouter = express.Router();
categoryRouter.get('/', async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('sortOrder name').populate('parent', 'name');
  res.json({ success: true, categories });
});
categoryRouter.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json({ success: true, category: cat });
});
categoryRouter.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, category: cat });
});
categoryRouter.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Category removed' });
});

const reviewRouter = express.Router();
reviewRouter.get('/product/:productId', async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.json({ success: true, reviews });
});
reviewRouter.post('/', protect, async (req, res) => {
  req.body.user = req.user.id;
  const review = await Review.create(req.body);
  res.status(201).json({ success: true, review });
});
reviewRouter.delete('/:id', protect, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.user.toString() !== req.user.id && req.user.role === 'user') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  await review.remove();
  res.json({ success: true, message: 'Review removed' });
});

const userRouter = express.Router();
userRouter.get('/wishlist', protect, async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name images price slug ratings');
  res.json({ success: true, wishlist: user.wishlist });
});
userRouter.put('/address', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});
userRouter.delete('/address/:addressId', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $pull: { addresses: { _id: req.params.addressId } } });
  res.json({ success: true, message: 'Address removed' });
});

const uploadRouter = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'agrawal-co', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

uploadRouter.post('/', protect, authorize('admin', 'superadmin'), upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: req.file.path, publicId: req.file.filename });
});

uploadRouter.delete('/:publicId', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await cloudinary.uploader.destroy(req.params.publicId);
  res.json({ success: true, message: 'Image deleted' });
});

module.exports = {
  adminRouter,
  categoryRouter,
  reviewRouter,
  userRouter,
  uploadRouter,
};
