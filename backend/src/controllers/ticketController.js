import Ticket from '../models/ticketModel.js';
import { logAction } from '../utils/auditLogger.js';
import Notification from '../models/notificationModel.js';
import { sendWebhook } from '../utils/webhook.js';

// @desc    Create a ticket
// @route   POST /api/tickets
// @access  Private (Agent, Supervisor, Admin)
export const createTicket = async (req, res) => {
    const { clientId, type, priority, description } = req.body;
    const userId = req.user.id;

    if (!type || !description) {
        return res.status(400).json({ message: 'Type and description are required.' });
    }

    try {
        const { id: ticketId } = await Ticket.create({ userId, clientId, type, priority, description });

        // --- Post-creation Actions ---
        const ticket = await Ticket.findById(ticketId);
        await logAction({
            userId,
            action: 'CREATE_TICKET',
            entity: 'tickets',
            entityId: ticketId,
            afterState: ticket
        });

        // 2. Notify supervisors
        const notifTitle = `New Ticket Created (#${ticketId})`;
        const notifMessage = `A new ticket of type '${type}' was created by user ID ${userId}.`;
        await Notification.createForRole({ role: 'supervisor', title: notifTitle, message: notifMessage, type: 'TICKET' });

        // 3. Trigger webhook
        sendWebhook('ticket_created', { ticketId, createdBy: userId, type, status: 'open' });

        res.status(201).json({ message: 'Ticket created successfully.', ticketId });
    } catch (error) {
        console.error('Error creating ticket:', error.message);
        res.status(500).json({ message: 'Server error while creating ticket.' });
    }
};

// @desc    Get tickets
// @route   GET /api/tickets
// @access  Private (Agent, Supervisor, Admin)
export const getTickets = async (req, res) => {
    try {
        let tickets;
        if (req.user.role === 'agent') {
            // Agents see only tickets they created
            tickets = await Ticket.findByCreator(req.user.id);
        } else {
            // Admins and Supervisors see all tickets
            tickets = await Ticket.findAll();
        }
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error.message);
        res.status(500).json({ message: 'Server error while fetching tickets.' });
    }
};

// @desc    Get a single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private (Agent, Supervisor, Admin)
export const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        // Agents can only see their own tickets, unless they are assigned to it.
        if (req.user.role === 'agent' && ticket.user_id !== req.user.id && ticket.assigned_to !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to view this ticket.' });
        }
        res.status(200).json(ticket);
    } catch (error) {
        console.error('Error fetching ticket:', error.message);
        res.status(500).json({ message: 'Server error while fetching ticket.' });
    }
};

// @desc    Assign a ticket to a user
// @route   PUT /api/tickets/:id/assign
// @access  Private (Supervisor, Admin)
export const assignTicket = async (req, res) => {
    const { assignedTo } = req.body; // ID of the user to assign to
    const ticketId = req.params.id;

    if (!assignedTo) {
        return res.status(400).json({ message: 'User ID to assign is required.' });
    }

    try {
        const beforeState = await Ticket.findById(ticketId);
        if (!beforeState) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        
        await Ticket.assign(ticketId, assignedTo);
        
        // --- Post-assignment Actions ---
        const afterState = await Ticket.findById(ticketId);
        await logAction({
            userId: req.user.id,
            action: 'ASSIGN_TICKET',
            entity: 'tickets',
            entityId: ticketId,
            beforeState,
            afterState
        });

        // 2. Notify assigned user
        await Notification.create({
            userId: assignedTo,
            title: `You have been assigned a new ticket (#${ticketId})`,
            message: `Ticket #${ticketId} is now assigned to you.`,
            type: 'TICKET'
        });

        // 3. Trigger webhook
        sendWebhook('ticket_assigned', { ticketId, assignedBy: req.user.id, assignedTo, status: 'assigned' });
        
        res.status(200).json({ message: `Ticket ${ticketId} assigned to user ${assignedTo}.` });
    } catch (error) {
        console.error('Error assigning ticket:', error.message);
        res.status(500).json({ message: 'Server error while assigning ticket.' });
    }
};

// @desc    Update a ticket's status
// @route   PUT /api/tickets/:id/status
// @access  Private (Supervisor, Admin)
export const updateTicketStatus = async (req, res) => {
    const { status } = req.body;
    const ticketId = req.params.id;
    const validStatuses = ['open', 'pending', 'assigned', 'closed'];

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    
    try {
        const beforeState = await Ticket.findById(ticketId);
        if (!beforeState) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        await Ticket.updateStatus(ticketId, status);

        // --- Post-status-change Actions ---
        const afterState = await Ticket.findById(ticketId);
        await logAction({
            userId: req.user.id,
            action: 'UPDATE_TICKET_STATUS',
            entity: 'tickets',
            entityId: ticketId,
            beforeState,
            afterState
        });

        // 2. Notify ticket creator
        if (beforeState.user_id !== req.user.id) { // Avoid notifying user of their own action
            await Notification.create({
                userId: beforeState.user_id,
                title: `Status of your ticket #${ticketId} has been updated`,
                message: `The status of your ticket is now: ${status.toUpperCase()}`,
                type: 'TICKET'
            });
        }
        
        // 3. Trigger Webhook
        const webhookEvent = status === 'closed' ? 'ticket_closed' : 'ticket_status_changed';
        sendWebhook(webhookEvent, { ticketId, updatedBy: req.user.id, status });

        res.status(200).json({ message: `Ticket ${ticketId} status updated to ${status}.` });
    } catch (error) {
        console.error('Error updating ticket status:', error.message);
        res.status(500).json({ message: 'Server error while updating status.' });
    }
};

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Admin)
export const deleteTicket = async (req, res) => {
    const ticketId = req.params.id;
    try {
        const beforeState = await Ticket.findById(ticketId);
        if (!beforeState) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        await Ticket.delete(ticketId);

        await logAction({
            userId: req.user.id,
            action: 'DELETE_TICKET',
            entity: 'tickets',
            entityId: ticketId,
            beforeState
        });

        res.status(200).json({ message: 'Ticket deleted successfully.' });
    } catch (error) {
        console.error('Error deleting ticket:', error.message);
        res.status(500).json({ message: 'Server error while deleting ticket.' });
    }
};
