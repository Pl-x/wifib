// backend/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { body, param, query } = require('express-validator');

// Validation middleware
const validateCustomer = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('plan-id').notEmpty().withMessage('Plan is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('Invalid status'),
];

const validateCustomerUpdate = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('plan_id').optional().notEmpty().withMessage('Plan cannot be empty'),
  body('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('Invalid status'),
];

// Routes
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('Invalid status'),
  query('plan_id').optional().isString().withMessage('Plan must be a string')
], customerController.getAllCustomers);

router.post('/', validateCustomer, customerController.createCustomer);

router.get('/stats', customerController.getCustomerStats);

router.get('/:id', [
  param('id').notEmpty().withMessage('Customer ID is required')
], customerController.getCustomerById);

router.get('/:id/payments', [
  param('id').notEmpty().withMessage('Customer ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], customerController.getCustomerPayments);

router.put('/:id', [
  param('id').notEmpty().withMessage('Customer ID is required'),
  ...validateCustomerUpdate
], customerController.updateCustomer);

router.delete('/:id', [
  param('id').notEmpty().withMessage('Customer ID is required')
], customerController.deleteCustomer);

module.exports = router;