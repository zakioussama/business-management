import Performance from '../models/performanceModel.js';
import Log from '../models/logModel.js';

// @desc    Log or update daily performance for an agent
// @route   POST /api/performance
// @access  Private (Admin, Supervisor)
export const logDailyPerformance = async (req, res) => {
    const { agentId, date, salesCount, revenueGenerated, attendance, notes } = req.body;

    if (!agentId || !date || !attendance) {
        return res.status(400).json({ message: 'Agent ID, date, and attendance are required.' });
    }

    try {
        await Performance.logDaily({
            agentId,
            date,
            salesCount: salesCount || 0,
            revenueGenerated: revenueGenerated || 0,
            attendance,
            notes
        });

        await Log.logAction(req.user.id, 'PERFORMANCE_LOGGED', `Performance for agent ${agentId} on ${date} was logged/updated.`);

        res.status(201).json({ message: 'Agent performance for the day has been logged.' });
    } catch (error) {
        console.error('Error logging performance:', error.message);
        res.status(500).json({ message: 'Server error while logging performance.' });
    }
};

// @desc    Get performance history for a specific agent
// @route   GET /api/performance/agent/:id
// @access  Private (Admin, Supervisor)
export const getAgentPerformance = async (req, res) => {
    const agentId = req.params.id;
    try {
        const performanceRecords = await Performance.findByAgent(agentId);
        res.status(200).json(performanceRecords);
    } catch (error) {
        console.error('Error fetching agent performance:', error.message);
        res.status(500).json({ message: 'Server error while fetching performance records.' });
    }
};

// @desc    Get the team performance leaderboard
// @route   GET /api/performance/leaderboard
// @access  Private (Admin, Supervisor)
export const getTeamLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Performance.getLeaderboard();
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        res.status(500).json({ message: 'Server error while fetching leaderboard.' });
    }
};
