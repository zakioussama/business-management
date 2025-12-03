import Client from '../models/clientModel.js';
import Sale from '../models/salesModel.js';
import { logAction } from '../utils/auditLogger.js';

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private (Admin, Supervisor, Agent)
export const createClient = async (req, res) => {
  const { fullName, phone, email, notes } = req.body;
  
  // Basic Validation
  if (!fullName || !phone) {
    return res.status(400).json({ message: 'Full name and phone are required.' });
  }

  try {
    const createdBy = req.user.id; // From 'protect' middleware
    const client = await Client.create({ fullName, phone, email, notes, createdBy });

    await logAction({
        userId: createdBy,
        action: 'CREATE_CLIENT',
        entity: 'clients',
        entityId: client.id,
        afterState: client
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error.message);
    // Specific check for duplicate email
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    res.status(500).json({ message: 'Server error while creating client.' });
  }
};

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private (Admin, Supervisor, Agent)
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error.message);
    res.status(500).json({ message: 'Server error while fetching clients.' });
  }
};

// @desc    Get a single client by ID
// @route   GET /api/clients/:id
// @access  Private (Admin, Supervisor, Agent)
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }
    res.status(200).json(client);
  } catch (error) {
    console.error('Error fetching client:', error.message);
    res.status(500).json({ message: 'Server error while fetching client.' });
  }
};

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Private (Admin, Supervisor)
export const updateClient = async (req, res) => {
  const { fullName, phone, email, notes } = req.body;

  // Basic Validation
  if (!fullName || !phone) {
    return res.status(400).json({ message: 'Full name and phone are required.' });
  }

  try {
    const beforeState = await Client.findById(req.params.id);
    if (!beforeState) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    const updated = await Client.update(req.params.id, { fullName, phone, email, notes });
    if (updated) {
      const afterState = await Client.findById(req.params.id);
      await logAction({
          userId: req.user.id,
          action: 'UPDATE_CLIENT',
          entity: 'clients',
          entityId: req.params.id,
          beforeState,
          afterState
      });
      res.status(200).json(afterState);
    } else {
      res.status(400).json({ message: 'Could not update client.' });
    }
  } catch (error) {
    console.error('Error updating client:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    res.status(500).json({ message: 'Server error while updating client.' });
  }
};

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Private (Admin)
export const deleteClient = async (req, res) => {
    const clientId = req.params.id;
  try {
    const beforeState = await Client.findById(clientId);
    if (!beforeState) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    const deleted = await Client.delete(clientId);
    if (deleted) {
        await logAction({
            userId: req.user.id,
            action: 'DELETE_CLIENT',
            entity: 'clients',
            entityId: clientId,
            beforeState
        });
      res.status(200).json({ message: 'Client deleted successfully.' });
    } else {
      res.status(400).json({ message: 'Could not delete client.' });
    }
  } catch (error) {
    console.error('Error deleting client:', error.message);
    res.status(500).json({ message: 'Server error while deleting client.' });
  }
};


// @desc    Get sales history for a specific client
// @route   GET /api/clients/:id/sales
// @access  Private (Admin, Supervisor, Agent)
export const getClientSalesHistory = async (req, res) => {
    const clientId = req.params.id;
    try {
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }
        
        const salesHistory = await Sale.findByClientId(clientId);
        res.status(200).json(salesHistory);

    } catch (error) {
        console.error('Error fetching client sales history:', error.message);
        res.status(500).json({ message: 'Server error while fetching client sales history.' });
    }
};
