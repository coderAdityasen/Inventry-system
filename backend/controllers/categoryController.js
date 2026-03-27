/**
 * Category Controller - Request handlers for categories
 * With detailed console logging for debugging
 */

const CategoryModel = require('../models/Category');

/**
 * Helper function to handle errors
 */
const handleError = (error, res, operation) => {
  console.error(`[CONTROLLER] Error in ${operation}:`, {
    message: error.message,
    stack: error.stack
  });
  
  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: error.message || 'An error occurred',
    timestamp: new Date().toISOString()
  });
};

/**
 * Get all categories
 */
exports.getAllCategories = async (req, res, next) => {
  console.log('[CONTROLLER] getAllCategories - Request');
  try {
    const categories = await CategoryModel.findAll();
    console.log('[CONTROLLER] getAllCategories - Categories count:', categories.length);
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    handleError(error, res, 'getAllCategories');
  }
};

/**
 * Get category by ID
 */
exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[CONTROLLER] getCategoryById - Category ID:', id);
    
    const category = await CategoryModel.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    console.log('[CONTROLLER] getCategoryById - Found:', category.id);
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    handleError(error, res, 'getCategoryById');
  }
};

/**
 * Create new category
 */
exports.createCategory = async (req, res, next) => {
  try {
    const categoryData = req.body;
    console.log('[CONTROLLER] createCategory - Request body:', categoryData);

    if (!categoryData.name || categoryData.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const categoryId = await CategoryModel.create(categoryData);
    console.log('[CONTROLLER] createCategory - Created ID:', categoryId);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { id: categoryId }
    });
  } catch (error) {
    handleError(error, res, 'createCategory');
  }
};

/**
 * Update category
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const categoryData = req.body;
    console.log('[CONTROLLER] updateCategory - Category ID:', id, 'Data:', categoryData);

    const existing = await CategoryModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (!categoryData.name || categoryData.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    await CategoryModel.update(id, categoryData);
    console.log('[CONTROLLER] updateCategory - Updated ID:', id);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error) {
    handleError(error, res, 'updateCategory');
  }
};

/**
 * Delete category
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[CONTROLLER] deleteCategory - Category ID:', id);

    const existing = await CategoryModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await CategoryModel.delete(id);
    console.log('[CONTROLLER] deleteCategory - Deleted ID:', id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    handleError(error, res, 'deleteCategory');
  }
};
