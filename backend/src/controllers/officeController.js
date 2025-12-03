import Finance from '../models/financeModel.js';
import Attendance from '../models/attendanceModel.js';

export const getFinanceToday = async (req, res) => {
    try {
        const data = await Finance.getIncomeVsExpenses({
            startDate: new Date().toISOString().slice(0, 10),
            endDate: new Date().toISOString().slice(0, 10)
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

export const getProfitabilityReport = async (req, res) => {
    try {
        const data = await Finance.getProductProfitability();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

export const addAttendanceRecord = async (req, res) => {
    const { agent_id, date, status, comments } = req.body;
    if (!agent_id || !date || !status) {
        return res.status(400).json({ message: 'agent_id, date, and status are required.' });
    }
    try {
        const record = await Attendance.create({ agent_id, date, status, comments });
        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

export const getAttendanceRecords = async (req, res) => {
    try {
        const records = await Attendance.findAll();
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
