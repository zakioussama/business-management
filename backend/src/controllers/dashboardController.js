import Dashboard from '../models/dashboardModel.js';

// @desc    Get data for the Admin Dashboard
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminDashboard = async (req, res) => {
    try {
        const stats = await Dashboard.getAdminStats();
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error.message);
        res.status(500).json({ message: 'Server error while fetching admin dashboard data.' });
    }
};

// @desc    Get data for the Supervisor Dashboard
// @route   GET /api/dashboard/supervisor
// @access  Private (Supervisor, Admin)
export const getSupervisorDashboard = async (req, res) => {
    try {
        const stats = await Dashboard.getSupervisorStats();
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching supervisor dashboard data:', error.message);
        res.status(500).json({ message: 'Server error while fetching supervisor dashboard data.' });
    }
};

// @desc    Get data for the Agent Dashboard
// @route   GET /api/dashboard/agent
// @access  Private (Agent, Supervisor, Admin)
export const getAgentDashboard = async (req, res) => {
    try {
        // An admin or supervisor might request to see a specific agent's dashboard
        const agentId = req.query.agentId && (req.user.role === 'admin' || req.user.role === 'supervisor') 
            ? req.query.agentId 
            : req.user.id;

        const stats = await Dashboard.getAgentStats(agentId);
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching agent dashboard data:', error.message);
        res.status(500).json({ message: 'Server error while fetching agent dashboard data.' });
    }
};
