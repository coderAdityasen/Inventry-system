/**
 * Placeholder controller - implement business logic here
 * Follow the controller pattern: receive request, call service, return response
 */

const exampleService = require('../services/exampleService');

// Get all items (placeholder)
exports.getAllItems = async (req, res, next) => {
  try {
    // Replace with actual implementation
    // const items = await exampleService.getAllItems();
    // res.status(200).json({ success: true, data: items });
    
    res.status(200).json({
      success: true,
      message: 'Implement getAllItems controller',
      data: []
    });
  } catch (error) {
    next(error);
  }
};

// Get single item (placeholder)
exports.getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Replace with actual implementation
    // const item = await exampleService.getItemById(id);
    
    res.status(200).json({
      success: true,
      message: `Implement getItemById for ID: ${id}`,
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Create item (placeholder)
exports.createItem = async (req, res, next) => {
  try {
    const itemData = req.body;
    // Replace with actual implementation
    // const newItem = await exampleService.createItem(itemData);
    
    res.status(201).json({
      success: true,
      message: 'Implement createItem controller',
      data: itemData
    });
  } catch (error) {
    next(error);
  }
};

// Update item (placeholder)
exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const itemData = req.body;
    // Replace with actual implementation
    // const updatedItem = await exampleService.updateItem(id, itemData);
    
    res.status(200).json({
      success: true,
      message: `Implement updateItem for ID: ${id}`,
      data: itemData
    });
  } catch (error) {
    next(error);
  }
};

// Delete item (placeholder)
exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Replace with actual implementation
    // await exampleService.deleteItem(id);
    
    res.status(200).json({
      success: true,
      message: `Implement deleteItem for ID: ${id}`
    });
  } catch (error) {
    next(error);
  }
};
