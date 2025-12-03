import InventoryProfile from '../models/inventoryProfileModel.js';
import InventoryAccount from '../models/inventoryAccountModel.js'; // To check parent account existence

// @desc    Create a new inventory profile
// @route   POST /api/inventory/profiles
// @access  Private (Admin, Supervisor)
export const createProfile = async (req, res) => {
  const { accountId, profileName, status } = req.body;

  if (!accountId || !profileName) {
    return res.status(400).json({ message: 'Account ID and profile name are required.' });
  }

  try {
    // Check if the parent account exists
    const accountExists = await InventoryAccount.findById(accountId);
    if (!accountExists) {
        return res.status(404).json({ message: 'Inventory account not found. Cannot create profile.' });
    }

    const profile = await InventoryProfile.create({ accountId, profileName, status });
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating profile:', error.message);
    res.status(500).json({ message: 'Server error while creating profile.' });
  }
};

// @desc    Get all inventory profiles
// @route   GET /api/inventory/profiles
// @access  Private (Admin, Supervisor, Agent)
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await InventoryProfile.findAll();
    res.status(200).json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error.message);
    res.status(500).json({ message: 'Server error while fetching profiles.' });
  }
};

// @desc    Get a single inventory profile by ID
// @route   GET /api/inventory/profiles/:id
// @access  Private (Admin, Supervisor, Agent)
export const getProfileById = async (req, res) => {
  try {
    const profile = await InventoryProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Inventory profile not found.' });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

// @desc    Update an inventory profile
// @route   PUT /api/inventory/profiles/:id
// @access  Private (Admin, Supervisor)
export const updateProfile = async (req, res) => {
  const { profileName, status } = req.body;

  if (!profileName || !status) {
    return res.status(400).json({ message: 'Profile name and status are required.' });
  }

  try {
    const profileExists = await InventoryProfile.findById(req.params.id);
    if (!profileExists) {
      return res.status(404).json({ message: 'Inventory profile not found.' });
    }
    
    // Prevent updating status to 'assigned' if it's linked to a sale (logic to be added in Sales module)
    // For now, we just check for valid status values.
    if (status === 'assigned' && profileExists.status !== 'assigned') {
        // In a real scenario, you'd check:
        // const isLinkedToSale = await Sale.isProfileLinked(req.params.id);
        // if(isLinkedToSale) return res.status(409).json({ message: 'Cannot change status; profile is part of an active sale.'});
    }

    const updated = await InventoryProfile.update(req.params.id, { profileName, status });
    if (updated) {
      const updatedProfile = await InventoryProfile.findById(req.params.id);
      res.status(200).json(updatedProfile);
    } else {
      res.status(400).json({ message: 'Could not update profile.' });
    }
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ message: 'Server error while updating profile.', error: error.message });
  }
};

// @desc    Delete an inventory profile
// @route   DELETE /api/inventory/profiles/:id
// @access  Private (Admin)
export const deleteProfile = async (req, res) => {
  try {
    const profile = await InventoryProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Inventory profile not found.' });
    }
    
    // Prevent deletion if profile is assigned
    if (profile.status === 'assigned') {
        return res.status(409).json({ message: 'Cannot delete a profile that is currently assigned.' });
    }

    const deleted = await InventoryProfile.delete(req.params.id);
    if (deleted) {
      res.status(200).json({ message: 'Inventory profile deleted successfully.' });
    } else {
      res.status(400).json({ message: 'Could not delete profile.' });
    }
  } catch (error) {
    console.error('Error deleting profile:', error.message);
     if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Cannot delete this profile. It is referenced by other records (e.g., sales).' });
    }
    res.status(500).json({ message: 'Server error while deleting profile.' });
  }
};
