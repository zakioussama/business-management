import Supplier from '../models/supplierModel.js';

// @desc    Create a new supplier
// @route   POST /api/suppliers
// @access  Private (Admin, Supervisor)
export const createSupplier = async (req, res) => {
  const { name, contact, notes } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Supplier name is required.' });
  }

  try {
    const supplier = await Supplier.create({ name, contact, notes });
    res.status(201).json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error.message);
    res.status(500).json({ message: 'Server error while creating supplier.' });
  }
};

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private (Admin, Supervisor, Agent)
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.status(200).json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error.message);
    res.status(500).json({ message: 'Server error while fetching suppliers.' });
  }
};

// @desc    Get a single supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private (Admin, Supervisor, Agent)
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }
    res.status(200).json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error.message);
    res.status(500).json({ message: 'Server error while fetching supplier.' });
  }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin, Supervisor)
export const updateSupplier = async (req, res) => {
  const { name, contact, notes } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Supplier name is required.' });
  }

  try {
    const supplierExists = await Supplier.findById(req.params.id);
    if (!supplierExists) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    const updated = await Supplier.update(req.params.id, { name, contact, notes });
    if (updated) {
      const updatedSupplier = await Supplier.findById(req.params.id);
      res.status(200).json(updatedSupplier);
    } else {
      res.status(400).json({ message: 'Could not update supplier.' });
    }
  } catch (error) {
    console.error('Error updating supplier:', error.message);
    res.status(500).json({ message: 'Server error while updating supplier.' });
  }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin)
export const deleteSupplier = async (req, res) => {
  try {
    const supplierExists = await Supplier.findById(req.params.id);
    if (!supplierExists) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    const deleted = await Supplier.delete(req.params.id);
    if (deleted) {
      res.status(200).json({ message: 'Supplier deleted successfully.' });
    } else {
      res.status(400).json({ message: 'Could not delete supplier.' });
    }
  } catch (error) {
    console.error('Error deleting supplier:', error.message);
    // Handle potential foreign key constraint errors
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Cannot delete supplier. It is referenced by one or more products.' });
    }
    res.status(500).json({ message: 'Server error while deleting supplier.' });
  }
};
