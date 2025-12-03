import Notification from '../models/notificationModel.js';

// @desc    Get all notifications for the current user
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const notifications = await Notification.findByUser(userId);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ message: 'Server error while fetching notifications.' });
    }
};

// @desc    Mark a notification as read
// @route   POST /api/notifications/mark-read/:id
// @access  Private
export const markAsRead = async (req, res) => {
    const userId = req.user.id;
    const notificationId = req.params.id;
    try {
        // Ensure the user owns the notification before marking it as read
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }
        if (notification.user_id !== userId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this notification.' });
        }
        
        await Notification.markAsRead(notificationId);
        
        res.status(200).json({ message: 'Notification marked as read.' });

    } catch (error) {
        console.error('Error marking notification as read:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
};
