import Client from '../models/clientModel.js';
import Sale from '../models/salesModel.js';
import Ticket from '../models/ticketModel.js';
import Log from '../models/logModel.js';
import Notification from '../models/notificationModel.js';
import { sendWebhook } from '../utils/webhook.js';

/**
 * A helper function to get the client profile from a user ID.
 * Reduces code repetition in each controller function.
 */
const getClientFromUser = async (userId) => {
    const client = await Client.findByUserId(userId);
    if (!client) {
        throw new Error('Client profile not found for the authenticated user.');
    }
    return client;
};

// @desc    Get the logged-in client's own profile
// @route   GET /api/portal/me
// @access  Private (Client)
export const getMyProfile = async (req, res) => {
    try {
        const client = await getClientFromUser(req.user.id);
        res.status(200).json(client);
    } catch (error) {
        console.error(error.message);
        res.status(404).json({ message: error.message });
    }
};

// @desc    Get all sales for the logged-in client
// @route   GET /api/portal/sales
// @access  Private (Client)
export const getMySales = async (req, res) => {
    try {
        const client = await getClientFromUser(req.user.id);
        const sales = await Sale.findByClientId(client.id);
        res.status(200).json(sales);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error while fetching sales.' });
    }
};

// @desc    Get all tickets for the logged-in client
// @route   GET /api/portal/tickets
// @access  Private (Client)
export const getMyTickets = async (req, res) => {
    try {
        const client = await getClientFromUser(req.user.id);
        const tickets = await Ticket.findByClientId(client.id);
        res.status(200).json(tickets);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error while fetching tickets.' });
    }
};

// @desc    Allow a client to create a support ticket for themselves
// @route   POST /api/portal/tickets
// @access  Private (Client)
export const createTicket = async (req, res) => {
    const { type = 'issue', priority, description } = req.body;
    if (!description) {
        return res.status(400).json({ message: 'A description for the ticket is required.' });
    }

    try {
        const client = await getClientFromUser(req.user.id);
        
        const { id: ticketId } = await Ticket.create({
            userId: req.user.id, // The user who is logged in and creating the ticket
            clientId: client.id, // The client profile this ticket is about
            type,
            priority,
            description
        });

        // --- Post-creation Actions (Consistent with ticketController) ---
        await Log.logAction({
            userId: req.user.id,
            action: 'CREATE_TICKET_BY_CLIENT',
            entity: 'tickets',
            entityId: ticketId,
            afterState: { clientId: client.id, type, priority, description }
        });
        await Notification.createForRole({
            role: 'supervisor',
            title: `New Client Ticket (#${ticketId})`,
            message: `Client ${client.full_name} created a new ticket.`,
            type: 'TICKET'
        });
        sendWebhook('ticket_created', { ticketId, createdBy: req.user.id, clientId: client.id, type, status: 'open' });

        res.status(201).json({ message: 'Support ticket created successfully.', ticketId });

    } catch (error) {
        console.error('Error creating ticket from portal:', error.message);
        res.status(500).json({ message: 'Server error while creating ticket.' });
    }
};


// @desc    Allow a client to request renewal for a service
// @route   POST /api/portal/sales/:id/renewal-request
// @access  Private (Client)
export const requestRenewal = async (req, res) => {
    const { id: saleId } = req.params;

    try {
        const client = await getClientFromUser(req.user.id);
        
        // Verify the sale belongs to this client
        const sale = await Sale.findById(saleId);
        if (!sale || sale.client_id !== client.id) {
            return res.status(404).json({ message: 'Sale not found or does not belong to you.' });
        }

        const description = `Client ${client.full_name} (Client ID: ${client.id}) is requesting to renew their service associated with Sale ID: ${saleId}.`;

        const { id: ticketId } = await Ticket.create({
            userId: req.user.id,
            clientId: client.id,
            type: 'renewal_request', // A new, specific type
            priority: 'medium',
            description
        });
        
        // --- Post-creation Actions ---
        await Log.logAction({
            userId: req.user.id,
            action: 'RENEWAL_REQUESTED_BY_CLIENT',
            entity: 'sales',
            entityId: saleId,
            afterState: { clientId: client.id, saleId, type: 'renewal_request' }
        });
        await Notification.createForRole({
            role: 'supervisor',
            title: `Service Renewal Request`,
            message: `Client ${client.full_name} requested a renewal.`,
            type: 'SALE'
        });
        sendWebhook('renewal_requested', { ticketId, saleId, clientId: client.id });

        res.status(201).json({ message: 'Renewal request submitted successfully. A ticket has been created.', ticketId });

    } catch (error) {
        console.error('Error requesting renewal:', error.message);
        res.status(500).json({ message: 'Server error while requesting renewal.' });
    }
};
