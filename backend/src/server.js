require('dotenv').config();
require('express-async-errors');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const reviewRoutes = require('./routes/reviews');
const paymentRoutes = require('./routes/payments'); 
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();


// 🔐 Security middleware
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));


// 🚦 Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);


// 🌐 CORS (safe for now)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://your-admin.vercel.app",
    "https://your-frontend.vercel.app"
  ],
  credentials: true,
}));

// 🧾 Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// ✅ ROOT ROUTE (important fix)
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});


// ❤️ Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


// 📦 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
 app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);


// ❌ Error handler (always last)
app.use(errorHandler);


// 🚀 Connect DB & Start Server
const PORT = process.env.PORT || 5000;

// ✅ Start server FIRST
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Then connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });