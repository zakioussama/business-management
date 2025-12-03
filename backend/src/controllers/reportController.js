import Client from '../models/clientModel.js';

// @desc    Get a report of debtor clients (clients with expired sales)
// @route   GET /api/reports/clients/debtors
// @access  Private (Admin, Supervisor)
export const getDebtorClientsReport = async (req, res) => {
    try {
        const clients = await Client.findDebtors();
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error generating debtor clients report:', error.message);
        res.status(500).json({ message: 'Server error while generating report.' });
    }
};

// @desc    Get a report of the oldest clients
// @route   GET /api/reports/clients/oldest
// @access  Private (Admin, Supervisor)
export const getOldestClientsReport = async (req, res) => {
    const limit = req.query.limit || 10;
    try {
        const clients = await Client.findOldest(parseInt(limit, 10));
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error generating oldest clients report:', error.message);
        res.status(500).json({ message: 'Server error while generating report.' });
    }
};
