const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { body, param, query } = require('express-validator');

// M-Pesa Payment Routes
router.post('/mpesa/initiate', [
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be a positive number'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('billId').optional().isString().withMessage('Bill ID must be a string')
], paymentController.initiateMpesaPayment);

router.get('/mpesa/status/:checkoutRequestID', [
  param('checkoutRequestID').notEmpty().withMessage('Checkout request ID is required')
], paymentController.queryPaymentStatus);

router.post('/mpesa/callback', paymentController.handleMpesaCallback);

// General Payment Routes
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'completed', 'failed', 'cancelled']).withMessage('Invalid status'),
  query('customerId').optional().isString().withMessage('Customer ID must be a string')
], paymentController.getAllPayments);

router.get('/stats', paymentController.getPaymentStats);

router.get('/:id', [
  param('id').notEmpty().withMessage('Payment ID is required')
], paymentController.getPaymentById);

module.exports = router; 