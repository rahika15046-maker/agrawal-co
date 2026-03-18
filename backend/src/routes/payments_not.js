/*const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/payments/razorpay/create-order
router.post('/razorpay/create-order', protect, async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;
  const options = {
    amount: Math.round(amount * 100), // in paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
  };
  const order = await razorpay.orders.create(options);
  res.json({ success: true, order });
});

// @route   POST /api/payments/razorpay/verify
router.post('/razorpay/verify', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  // Update order payment
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      'payment.status': 'paid',
      'payment.transactionId': razorpay_payment_id,
      'payment.razorpayOrderId': razorpay_order_id,
      'payment.razorpayPaymentId': razorpay_payment_id,
      'payment.paidAt': new Date(),
      orderStatus: 'confirmed',
      $push: { statusHistory: { status: 'confirmed', note: 'Payment confirmed via Razorpay' } },
    },
    { new: true }
  );

  res.json({ success: true, order });
});

// @route   GET /api/payments/razorpay/key
router.get('/razorpay/key', protect, (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;*/
