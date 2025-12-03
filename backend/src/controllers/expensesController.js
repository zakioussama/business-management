import Expense from '../models/expensesModel.js';
import Log from '../models/logModel.js';

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private (Admin, Supervisor)
export const createExpense = async (req, res) => {
    const { category, amount, description } = req.body;
    const createdBy = req.user.id;

    if (!category || !amount) {
        return res.status(400).json({ message: 'Category and amount are required.' });
    }
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number.' });
    }

    try {
        const expense = await Expense.create({ category, amount, description, createdBy });
        
        await Log.logAction(createdBy, 'EXPENSE_CREATED', `Expense ID: ${expense.id}, Amount: ${amount}`);

        res.status(201).json({ message: 'Expense created and logged in financial movements.', expense });
    } catch (error) {
        console.error('Error creating expense:', error.message);
        res.status(500).json({ message: 'Server error while creating expense.' });
    }
};

// @desc    List all expenses
// @route   GET /api/expenses
// @access  Private (Admin, Supervisor)
export const listExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll();
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error listing expenses:', error.message);
        res.status(500).json({ message: 'Server error while listing expenses.' });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private (Admin)
export const deleteExpense = async (req, res) => {
    const expenseId = req.params.id;
    try {
        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found.' });
        }
        
        await Expense.delete(expenseId);
        
        await Log.logAction(req.user.id, 'EXPENSE_DELETED', `Expense ID: ${expenseId}`);
        
        // Note: This does not automatically reverse the 'EXPENSE' record in finance_movements.
        // A more robust system might require a reversing transaction.
        res.status(200).json({ message: 'Expense deleted successfully.' });
    } catch (error) {
        console.error('Error deleting expense:', error.message);
        res.status(500).json({ message: 'Server error while deleting expense.' });
    }
};
