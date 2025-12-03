import Sale from '../models/salesModel.js';
import Notification from '../models/notificationModel.js';
import { sendWebhook } from '../utils/webhook.js';

// @desc    Finds sales that are expiring soon and sends a webhook and notification for each.
// @route   POST /api/automations/trigger-expiry-warnings
// @access  Public (should be secured by other means)
export const triggerExpiryWarnings = async (req, res) => {
    const daysOut = req.body.days || 3; // Default to 3 days if not specified

    try {
        const expiringSales = await Sale.findExpiringSoon(daysOut);

        if (expiringSales.length === 0) {
            return res.status(200).json({ message: 'No sales are expiring in the configured window.' });
        }

        let notificationsSent = 0;
        for (const sale of expiringSales) {
            // Send webhook for external automation
            sendWebhook('sale_expiring_soon', {
                saleId: sale.id,
                clientId: sale.client_id,
                clientName: sale.client_name,
                clientEmail: sale.email,
                productName: sale.product_name,
                endDate: sale.end_date
            });

            // Create internal notification for the agent
            if (sale.agent_id) {
                await Notification.create({
                    userId: sale.agent_id,
                    title: `Sale Expiring Soon: ${sale.client_name}`,
                    message: `The sale for "${sale.product_name}" for client ${sale.client_name} is expiring in ${daysOut} days on ${sale.end_date}.`,
                    type: 'SALE'
                });
                notificationsSent++;
            }
        }

        res.status(200).json({ 
            message: `Successfully processed ${expiringSales.length} expiring sales.`,
            details: {
                webhooks_sent: expiringSales.length,
                internal_notifications_sent: notificationsSent
            }
        });

    } catch (error) {
        console.error('Error triggering expiry warnings:', error.message);
        res.status(500).json({ message: 'Server error while triggering expiry warnings.' });
    }
};
