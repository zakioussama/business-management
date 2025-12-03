import Cashbox from '../models/cashboxModel.js';
import Log from '../models/logModel.js';

// @desc    Add money to the cashbox
// @route   POST /api/cashbox/add
// @access  Private (Admin, Supervisor)
export const addToCashbox = async (req, res) => {
    const { amount, description } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'A valid positive amount is required.' });
    }

    try {
        await Cashbox.logMovement({
            amount,
            movementType: 'ADD',
            description,
            createdBy: req.user.id
        });
        
        await Log.logAction(req.user.id, 'CASHBOX_ADD', `Amount: ${amount}, Description: ${description}`);
        
        res.status(200).json({ message: 'Amount added to cashbox successfully.' });
    } catch (error) {
        console.error('Error adding to cashbox:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
};

// @desc    Remove money from the cashbox
// @route   POST /api/cashbox/remove
// @access  Private (Admin, Supervisor)
export const removeFromCashbox = async (req, res) => {
    const { amount, description } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'A valid positive amount is required.' });
    }
    if (!description) {
        return res.status(400).json({ message: 'Description is mandatory when removing money.' });
    }

    try {
         const currentBalance = await Cashbox.getBalance();
         if (currentBalance < amount) {
             return res.status(400).json({ message: 'Cannot remove more than the current balance.', currentBalance });
         }

        await Cashbox.logMovement({
            amount,
            movementType: 'REMOVE',
            description,
            createdBy: req.user.id
        });

        await Log.logAction(req.user.id, 'CASHBOX_REMOVE', `Amount: ${amount}, Description: ${description}`);

        res.status(200).json({ message: 'Amount removed from cashbox successfully.' });
    } catch (error) {
        console.error('Error removing from cashbox:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
};

// @desc    Get the history of all cashbox movements
// @route   GET /api/cashbox/history
// @access  Private (Admin, Supervisor)
export const getCashboxHistory = async (req, res) => {
    try {
        const history = await Cashbox.getHistory();
        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching cashbox history:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
};

// @desc    Get the current cashbox balance
// @route   GET /api/cashbox/balance
// @access  Private (Admin, Supervisor)
export const getCurrentBalance = async (req, res) => {
    try {
        const balance = await Cashbox.getBalance();
        res.status(200).json({ current_balance: balance });
    } catch (error) {
        console.error('Error fetching cashbox balance:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
};
