import Product from '../models/productModel.js';

const isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value);
const isBoolean = (value) => typeof value === 'boolean';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin, Supervisor)
export const createProduct = async (req, res) => {
  const { supplierId, productTypeId, productName, ownership, warranty, cost, roi_target, renewable } = req.body;

  // --- Validation ---
  if (!supplierId || !productTypeId || !productName || !cost) {
    return res.status(400).json({ message: 'Supplier ID, Product Type ID, product name, and cost are required.' });
  }
  if (!isNumeric(cost)) {
    return res.status(400).json({ message: 'Cost must be a numeric value.' });
  }
   if (renewable !== undefined && !isBoolean(renewable)) {
    return res.status(400).json({ message: 'Renewable must be a boolean value (true or false).' });
  }
   if (warranty !== undefined && !isBoolean(warranty)) {
    return res.status(400).json({ message: 'Warranty must be a boolean value (true or false).' });
  }
   if (ownership && !['RENTED', 'OWNED'].includes(ownership)) {
      return res.status(400).json({ message: "Invalid ownership status. Must be 'RENTED' or 'OWNED'." });
   }
  
  try {
    // Check if dependencies exist
    const supplierExists = await Product.supplierExists(supplierId);
    if (!supplierExists) {
      return res.status(404).json({ message: 'Supplier not found. Cannot create product.' });
    }
    const productTypeExists = await Product.productTypeExists(productTypeId);
    if (!productTypeExists) {
      return res.status(404).json({ message: 'Product Type not found. Cannot create product.' });
    }

    const product = await Product.create({ 
        supplierId,
        productTypeId,
        productName,
        ownership,
        warranty: warranty || false,
        cost: parseFloat(cost),
        roi_target: roi_target ? parseFloat(roi_target) : 0,
        renewable: renewable || false
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ message: 'Server error while creating product.' });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private (Admin, Supervisor, Agent)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Server error while fetching products.' });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Private (Admin, Supervisor, Agent)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ message: 'Server error while fetching product.' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin, Supervisor)
export const updateProduct = async (req, res) => {
  const { supplierId, productTypeId, productName, ownership, warranty, cost, roi_target, renewable } = req.body;

  // --- Validation ---
   if (!supplierId || !productTypeId || !productName || !cost) {
    return res.status(400).json({ message: 'Supplier ID, Product Type ID, product name, and cost are required.' });
  }
  if (!isNumeric(cost)) {
    return res.status(400).json({ message: 'Cost must be numeric values.' });
  }
   if (renewable !== undefined && !isBoolean(renewable)) {
    return res.status(400).json({ message: 'Renewable must be a boolean value (true or false).' });
  }
   if (warranty !== undefined && !isBoolean(warranty)) {
    return res.status(400).json({ message: 'Warranty must be a boolean value (true or false).' });
  }
   if (ownership && !['RENTED', 'OWNED'].includes(ownership)) {
      return res.status(400).json({ message: "Invalid ownership status. Must be 'RENTED' or 'OWNED'." });
   }

  try {
    const productExists = await Product.findById(req.params.id);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const supplierExists = await Product.supplierExists(supplierId);
    if (!supplierExists) {
      return res.status(404).json({ message: 'Supplier not found. Cannot update product.' });
    }
    const productTypeExists = await Product.productTypeExists(productTypeId);
    if (!productTypeExists) {
      return res.status(404).json({ message: 'Product Type not found. Cannot update product.' });
    }

    const updated = await Product.update(req.params.id, {
        supplierId,
        productTypeId,
        productName,
        ownership,
        warranty: warranty || false,
        cost: parseFloat(cost),
        roi_target: roi_target ? parseFloat(roi_target) : 0,
        renewable: renewable || false
    });

    if (updated) {
      const updatedProduct = await Product.findById(req.params.id);
      res.status(200).json(updatedProduct);
    } else {
      res.status(400).json({ message: 'Could not update product.' });
    }
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ message: 'Server error while updating product.' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const productExists = await Product.findById(req.params.id);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const deleted = await Product.delete(req.params.id);
    if (deleted) {
      res.status(200).json({ message: 'Product deleted successfully.' });
    } else {
      res.status(400).json({ message: 'Could not delete product.' });
    }
  } catch (error) {
    console.error('Error deleting product:', error.message);
     if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Cannot delete product. It is referenced by other records (e.g., inventory).' });
    }
    res.status(500).json({ message: 'Server error while deleting product.' });
  }
};
