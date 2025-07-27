const express = require('express');
const router = express.Router();

// Placeholder plan routes
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Plan management not implemented yet'
  });
});

router.post('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Plan creation not implemented yet'
  });
});

router.get('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Plan retrieval not implemented yet'
  });
});

router.put('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Plan update not implemented yet'
  });
});

router.delete('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Plan deletion not implemented yet'
  });
});

module.exports = router; 