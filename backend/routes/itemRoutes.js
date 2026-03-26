const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// Get all items
// router.get('/', itemController.getAllItems);

// Get single item by ID
// router.get('/:id', itemController.getItemById);

// Create new item
// router.post('/', itemController.createItem);

// Update item
// router.put('/:id', itemController.updateItem);

// Delete item
// router.delete('/:id', itemController.deleteItem);

// Placeholder route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Items route placeholder - implement routes here',
    data: []
  });
});

module.exports = router;
