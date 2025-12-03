import Sale from '../models/salesModel.js';
import Client from '../models/clientModel.js';
import Product from '../models/productModel.js';
import SalesAttribute from '../models/salesAttributeModel.js';
import InventoryProfile from '../models/inventoryProfileModel.js';
import Notification from '../models/notificationModel.js';
import { addDays } from 'date-fns';
import { logAction } from '../utils/auditLogger.js';
import { sendWebhook } from '../utils/webhook.js';

const LOW_STOCK_THRESHOLD = 3;

// @desc    Create a new sale
// @route   POST /api/sales
// @access  Private (Admin, Supervisor, Agent)
export const createSale = async (req, res) => {
    const { clientId, salesAttributeId, startDate } = req.body;
    const agentId = req.user.id;

    if (!clientId || !salesAttributeId || !startDate) {
        return res.status(400).json({ message: 'Client ID, Sales Attribute ID, and Start Date are required.' });
    }

    try {
        // 1. Validate client
        const client = await Client.findById(clientId);
        if (!client) return res.status(404).json({ message: 'Client not found.' });

        // 2. Validate sales attribute and get its details
        const attribute = await SalesAttribute.findById(salesAttributeId);
        if (!attribute) return res.status(404).json({ message: 'Sales attribute not found.' });
        
        // 3. Find an available inventory profile for the product
        const profile = await InventoryProfile.findAvailableByProductId(attribute.product_id);
        if (!profile) {
            return res.status(409).json({ message: 'No inventory available for this product. It is sold out.' });
        }
        const profileId = profile.id;

        // 4. Get product cost
        const product = await Product.findById(attribute.product_id);
        if (!product) return res.status(404).json({ message: 'Associated product not found.' });

        // 5. Calculate end date
        const endDate = addDays(new Date(startDate), attribute.duration_days).toISOString().split('T')[0];

        // 6. Create sale using the transactional model method
        const sale = await Sale.create({
            clientId,
            agentId,
            profileId,
            salesAttributeId,
            startDate,
            endDate,
            cost: product.cost
        });

        // 7. Log, send webhook, and check for low stock
        const fullSale = await Sale.findById(sale.id);
        await logAction({
            userId: agentId,
            action: 'CREATE_SALE',
            entity: 'sales',
            entityId: sale.id,
            afterState: fullSale
        });

        const inventoryDetails = await Sale.getInventoryDetailsFromProfile(profileId);
        sendWebhook('sale_created', {
            saleId: sale.id,
            clientId,
            clientName: client.full_name,
            clientEmail: client.email,
            productName: product.product_name,
            inventory: inventoryDetails,
            endDate
        });

        // Check for low stock
        const availableStock = await InventoryProfile.getAvailableCountByProductId(attribute.product_id);
        if (availableStock < LOW_STOCK_THRESHOLD) {
            await Notification.createForRole({
                role: 'supervisor',
                title: 'Low Stock Warning',
                message: `Stock for product "${product.product_name}" is running low. Only ${availableStock} units left.`,
                type: 'SYSTEM'
            });
        }

        res.status(201).json({ message: 'Sale created successfully.', sale });

    } catch (error) {
        console.error('Error creating sale:', error.message);
        res.status(500).json({ message: 'Server error while creating sale.', error: error.message });
    }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private (All Roles)
export const getAllSales = async (req, res) => {
    try {
        const sales = await Sale.findAll();
        res.status(200).json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error.message);
        res.status(500).json({ message: 'Server error while fetching sales.' });
    }
};

// @desc    Get a single sale by ID
// @route   GET /api/sales/:id
// @access  Private (All Roles)
export const getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found.' });
        }
        res.status(200).json(sale);
    } catch (error) {
        console.error('Error fetching sale:', error.message);
        res.status(500).json({ message: 'Server error while fetching sale.' });
    }
};

// @desc    Update a sale (basic fields)
// @route   PUT /api/sales/:id
// @access  Private (Admin, Supervisor)
export const updateSale = async (req, res) => {
    const saleId = req.params.id;
    const { clientId, startDate, endDate, status, cost } = req.body;
    try {
        const beforeState = await Sale.findById(saleId);
        if (!beforeState) {
            return res.status(404).json({ message: 'Sale not found.' });
        }
        
        const updated = await Sale.update(saleId, { clientId, startDate, endDate, status, cost });
        if (updated) {
            const afterState = await Sale.findById(saleId);
            await logAction({
                userId: req.user.id,
                action: 'UPDATE_SALE',
                entity: 'sales',
                entityId: saleId,
                beforeState,
                afterState
            });
            res.status(200).json(afterState);
        } else {
            res.status(400).json({ message: 'Could not update sale.' });
        }
    } catch (error) {
        console.error('Error updating sale:', error.message);
        res.status(500).json({ message: 'Server error while updating sale.' });
    }
};


// @desc    Renew a sale
// @route   PUT /api/sales/:id/renew
// @access  Private (Admin, Supervisor)
export const renewSale = async (req, res) => {
    const saleId = req.params.id;
    try {
        const beforeState = await Sale.findById(saleId);
        if (!beforeState) return res.status(404).json({ message: 'Sale not found.' });

        const attribute = await SalesAttribute.findById(beforeState.sales_attribute_id);
        if (!attribute) return res.status(404).json({ message: 'Could not find sales attribute to calculate renewal.' });

        const newEndDate = addDays(new Date(beforeState.end_date), attribute.duration_days).toISOString().split('T')[0];

        const renewed = await Sale.renew(saleId, newEndDate);
        if (renewed) {
            const afterState = await Sale.findById(saleId);
            await logAction({
                userId: req.user.id,
                action: 'RENEW_SALE',
                entity: 'sales',
                entityId: saleId,
                beforeState,
                afterState
            });
            sendWebhook('sale_renewed', { saleId, clientId: beforeState.client_id, newEndDate });
            res.status(200).json({ message: 'Sale renewed successfully.', newEndDate });
        } else {
            res.status(400).json({ message: 'Could not renew sale.' });
        }
    } catch (error) {
        console.error('Error renewing sale:', error.message);
        res.status(500).json({ message: 'Server error while renewing sale.' });
    }
};


// @desc    Reactivate an expired sale with a new profile
// @route   PUT /api/sales/:id/reactivate
// @access  Private (Admin, Supervisor)
export const reactivateSale = async (req, res) => {
    const saleId = req.params.id;
    const { newProfileId } = req.body;
    if(!newProfileId) return res.status(400).json({ message: 'A new Profile ID is required to reactivate.' });

    try {
        const beforeState = await Sale.findById(saleId);
        if (!beforeState) return res.status(404).json({ message: 'Sale not found.' });
        if (beforeState.status !== 'expired') return res.status(409).json({ message: 'Only expired sales can be reactivated.' });

        const reactivated = await Sale.reactivate(saleId, newProfileId);
        if(reactivated) {
            const afterState = await Sale.findById(saleId);
            await logAction({
                userId: req.user.id,
                action: 'REACTIVATE_SALE',
                entity: 'sales',
                entityId: saleId,
                beforeState,
                afterState
            });
            res.status(200).json({ message: 'Sale reactivated successfully with new profile.' });
        } else {
            res.status(400).json({ message: 'Could not reactivate sale.' });
        }
    } catch (error) {
        console.error('Error reactivating sale:', error.message);
        res.status(500).json({ message: 'Server error while reactivating sale.', error: error.message });
    }
};

// @desc    Cancel/Expel a sale
// @route   PUT /api/sales/:id/expel
// @access  Private (Admin, Supervisor)
export const expelSale = async (req, res) => {
    const saleId = req.params.id;
    try {
        const beforeState = await Sale.findById(saleId);
        if (!beforeState) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        const expelled = await Sale.expel(saleId);
        if (expelled) {
            const afterState = await Sale.findById(saleId);
            await logAction({
                userId: req.user.id,
                action: 'EXPEL_SALE',
                entity: 'sales',
                entityId: saleId,
                beforeState,
                afterState
            });
            sendWebhook('sale_cancelled', { saleId, clientId: beforeState.client_id });
            res.status(200).json({ message: 'Sale has been cancelled and the profile is now available.' });
        } else {
            res.status(400).json({ message: 'Could not cancel sale.' });
        }
    } catch (error) {
        console.error('Error cancelling sale:', error.message);
        res.status(500).json({ message: 'Server error while cancelling sale.', error: error.message });
    }
};

// @desc    Delete a sale and free the inventory profile
// @route   DELETE /api/sales/:id
// @access  Private (Admin)
export const deleteSale = async (req, res) => {
    const saleId = req.params.id;
    try {
        const beforeState = await Sale.findById(saleId);
        if (!beforeState) {
            return res.status(404).json({ message: 'Sale not found.' });
        }

        const deleted = await Sale.delete(saleId);
        if (deleted) {
            await logAction({
                userId: req.user.id,
                action: 'DELETE_SALE',
                entity: 'sales',
                entityId: saleId,
                beforeState
            });
            res.status(200).json({ message: 'Sale deleted successfully and inventory profile has been made available.' });
        } else {
            res.status(404).json({ message: 'Sale not found or could not be deleted.' });
        }
    } catch (error) {
        console.error('Error deleting sale:', error.message);
        res.status(500).json({ message: 'Server error while deleting sale.' });
    }
};
