// backend/routes/billRoutes.js
const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { body, param, query } = require('express-validator');

// Validation middleware
const validateBill = [
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('description').optional().isString().withMessage('Description must be a string')
];

const validateBillUpdate = [
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('status').optional().isIn(['pending', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status')
];

const validateGenerateBills = [
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('description').optional().isString().withMessage('Description must be a string')
];

// Routes
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status'),
  query('customerId').optional().isString().withMessage('Customer ID must be a string')
], billController.getAllBills);

router.post('/', validateBill, billController.createBill);

router.post('/generate', validateGenerateBills, billController.generateBills);

router.get('/stats', billController.getBillStats);

router.put('/update-overdue', billController.updateOverdueBills);

router.get('/:id', [
  param('id').notEmpty().withMessage('Bill ID is required')
], billController.getBillById);

router.put('/:id', [
  param('id').notEmpty().withMessage('Bill ID is required'),
  ...validateBillUpdate
], billController.updateBill);

router.delete('/:id', [
  param('id').notEmpty().withMessage('Bill ID is required')
], billController.deleteBill);

module.exports = router;