const express = require('express');
const router = express.Router();

const {
  getMyOrders,
  createOrder,
  getOrderById
} = require('../controllers/orderController');

const {protect} = require('../middleware/auth');

// Create order
router.post('/', protect, createOrder);

// Get logged-in user's orders
router.get('/my', protect, getMyOrders);

// Get single order
router.get('/:id', protect, getOrderById);

module.exports = router;