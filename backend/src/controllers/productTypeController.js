import ProductType from '../models/productTypeModel.js';

// @desc    Create a new product type
// @route   POST /api/product-types
// @access  Private (Admin, Supervisor)
export const createProductType = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Product type name is required.' });
  }
  try {
    const productType = await ProductType.create({ name });
    res.status(201).json(productType);
  } catch (error) {
    console.error('Error creating product type:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'A product type with this name already exists.' });
    }
    res.status(500).json({ message: 'Server error while creating product type.' });
  }
};

// @desc    Get all product types
// @route   GET /api/product-types
// @access  Private (Admin, Supervisor, Agent)
export const getAllProductTypes = async (req, res) => {
  try {
    const productTypes = await ProductType.findAll();
    res.status(200).json(productTypes);
  } catch (error) {
    console.error('Error fetching product types:', error.message);
    res.status(500).json({ message: 'Server error while fetching product types.' });
  }
};

// @desc    Get a single product type by ID
// @route   GET /api/product-types/:id
// @access  Private (Admin, Supervisor, Agent)
export const getProductTypeById = async (req, res) => {
  try {
    const productType = await ProductType.findById(req.params.id);
    if (!productType) {
      return res.status(404).json({ message: 'Product type not found.' });
    }
    res.status(200).json(productType);
  } catch (error) {
    console.error('Error fetching product type:', error.message);
    res.status(500).json({ message: 'Server error while fetching product type.' });
  }
};

// @desc    Update a product type
// @route   PUT /api/product-types/:id
// @access  Private (Admin, Supervisor)
export const updateProductType = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Product type name is required.' });
  }
  try {
    const updated = await ProductType.update(req.params.id, { name });
    if (updated) {
      res.status(200).json({ id: req.params.id, name });
    } else {
      res.status(404).json({ message: 'Product type not found.' });
    }
  } catch (error) {
    console.error('Error updating product type:', error.message);
     if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'A product type with this name already exists.' });
    }
    res.status(500).json({ message: 'Server error while updating product type.' });
  }
};

// @desc    Delete a product type
// @route   DELETE /api/product-types/:id
// @access  Private (Admin)
export const deleteProductType = async (req, res) => {
  try {
    const deleted = await ProductType.delete(req.params.id);
    if (deleted) {
      res.status(200).json({ message: 'Product type deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Product type not found.' });
    }
  } catch (error) {
    console.error('Error deleting product type:', error.message);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Cannot delete this product type. It is referenced by one or more products.' });
    }
    res.status(500).json({ message: 'Server error while deleting product type.' });
  }
};
