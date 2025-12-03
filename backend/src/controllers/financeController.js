import Finance from '../models/financeModel.js';
import Log from '../models/logModel.js';

// @desc    Register an income movement
// @route   POST /api/finance/income
// @access  Private (Admin, Supervisor)
export const registerIncome = async (req, res) => {
    const { source, amount, reference_id, description } = req.body;
    if (!source || !amount) {
        return res.status(400).json({ message: 'Source and amount are required.' });
    }
    try {
        const movement = await Finance.createMovement({
            type: 'INCOME',
            amount,
            source,
            reference_id,
            description,
            createdBy: req.user.id
        });
        
        await Log.logAction(req.user.id, 'INCOME_REGISTERED', `Movement ID: ${movement.id}, Amount: ${amount}`);

        res.status(201).json({ message: 'Income registered successfully.', movement });
    } catch (error) {
        console.error('Error registering income:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
};

// @desc    Register an expense movement
// @route   POST /api/finance/expense
// @access  Private (Admin, Supervisor)
export const registerExpense = async (req, res) => {
    const { source, amount, reference_id, description } = req.body;
    if (!source || !amount) {
        return res.status(400).json({ message: 'Source and amount are required.' });
    }
    try {
        const movement = await Finance.createMovement({
            type: 'EXPENSE',
            amount,
            source,
            reference_id,
            description,
            createdBy: req.user.id
        });

        await Log.logAction(req.user.id, 'EXPENSE_REGISTERED', `Movement ID: ${movement.id}, Amount: ${amount}`);

        res.status(201).json({ message: 'Expense registered successfully.', movement });
    } catch (error) {
        console.error('Error registering expense:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
};

// @desc    Get financial movements within a date range
// @route   GET /api/finance/movements
// @access  Private (Admin, Supervisor)
export const getIncomeVsExpenses = async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'startDate and endDate query parameters are required.' });
    }
    try {
        const data = await Finance.getIncomeVsExpenses({ startDate, endDate });
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching financial movements:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
};

// @desc    Get all data for the main financial dashboard
// @route   GET /api/finance/dashboard
// @access  Private (Admin, Supervisor)
export const getFinancialDashboard = async (req, res) => {
    try {
        const dashboardData = await Finance.getDashboardData();
        res.status(200).json(dashboardData);
    } catch (error) {
        console.error('Error fetching financial dashboard data:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
};
