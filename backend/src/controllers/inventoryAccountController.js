import InventoryAccount from '../models/inventoryAccountModel.js';
import InventoryProfile from '../models/inventoryProfileModel.js';

// @desc    Create a new inventory account (and its profiles)
// @route   POST /api/inventory/accounts
// @access  Private (Admin, Supervisor)
export const createAccount = async (req, res) => {
  const { productId, email, password, status } = req.body;

  // --- Validation ---
  if (!productId || !email || !password) {
    return res.status(400).json({ message: 'Product ID, email, and password are required.' });
  }

  try {
    // 1. Get product capacity to determine how many profiles to create
    const capacity = await InventoryAccount.getProductCapacity(productId);
    if (capacity === null) {
      return res.status(404).json({ message: 'Product not found. Cannot create account.' });
    }
    
    // 2. Create account and profiles in a transaction
    const account = await InventoryAccount.createWithProfiles({
      email,
      password,
      productId,
      status,
      capacity,
    });

    res.status(201).json({ 
        message: `Account created successfully with ${capacity} profiles.`,
        account 
    });
  } catch (error) {
    console.error('Error creating inventory account:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: 'Server error while creating account.' });
  }
};

// @desc    Get all inventory accounts
// @route   GET /api/inventory/accounts
// @access  Private (Admin, Supervisor, Agent)
export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await InventoryAccount.findAll();
    res.status(200).json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error.message);
    res.status(500).json({ message: 'Server error while fetching accounts.' });
  }
};

// @desc    Get a single inventory account and its profiles
// @route   GET /api/inventory/accounts/:id
// @access  Private (Admin, Supervisor, Agent)
export const getAccountById = async (req, res) => {
  try {
    const account = await InventoryAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Inventory account not found.' });
    }
    // Also fetch its associated profiles for a complete view
    const profiles = await InventoryProfile.findByAccountId(req.params.id);
    res.status(200).json({ ...account, profiles });
  } catch (error) {
    console.error('Error fetching account:', error.message);
    res.status(500).json({ message: 'Server error while fetching account.' });
  }
};

// @desc    Update an inventory account
// @route   PUT /api/inventory/accounts/:id
// @access  Private (Admin, Supervisor)
export const updateAccount = async (req, res) => {
  const { productId, email, password, status } = req.body;

   if (!productId || !email || !password || !status) {
    return res.status(400).json({ message: 'Product ID, email, password, and status are required.' });
  }
   if (!['available', 'assigned', 'maintenance'].includes(status)) {
       return res.status(400).json({ message: "Invalid status. Must be 'available', 'assigned', or 'maintenance'." });
   }

  try {
    const accountExists = await InventoryAccount.findById(req.params.id);
    if (!accountExists) {
      return res.status(404).json({ message: 'Inventory account not found.' });
    }

    const updated = await InventoryAccount.update(req.params.id, { productId, email, password, status });
    if (updated) {
      const updatedAccount = await InventoryAccount.findById(req.params.id);
      res.status(200).json(updatedAccount);
    } else {
      res.status(400).json({ message: 'Could not update account.' });
    }
  } catch (error) {
    console.error('Error updating account:', error.message);
    res.status(500).json({ message: 'Server error while updating account.' });
  }
};

// @desc    Delete an inventory account (and its profiles)
// @route   DELETE /api/inventory/accounts/:id
// @access  Private (Admin)
export const deleteAccount = async (req, res) => {
  try {
    const accountExists = await InventoryAccount.findById(req.params.id);
    if (!accountExists) {
      return res.status(404).json({ message: 'Inventory account not found.' });
    }

    const deleted = await InventoryAccount.delete(req.params.id);
    if (deleted) {
      res.status(200).json({ message: 'Inventory account and its associated profiles deleted successfully.' });
    } else {
      res.status(400).json({ message: 'Could not delete account.' });
    }
  } catch (error) {
    console.error('Error deleting account:', error.message);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Cannot delete this account. It might be linked to other records (e.g., sales).' });
    }
    res.status(500).json({ message: 'Server error while deleting account.' });
  }
};
