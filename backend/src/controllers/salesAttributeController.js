import SalesAttribute from '../models/salesAttributeModel.js';
import Product from '../models/productModel.js';

export const createSalesAttribute = async (req, res) => {
    const { productId, duration_days, capacity, price } = req.body;
    if (!productId || !duration_days || !capacity || !price) {
        return res.status(400).json({ message: 'productId, duration_days, capacity, and price are required.' });
    }
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const attribute = await SalesAttribute.create({ productId, duration_days, capacity, price });
        res.status(201).json(attribute);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

export const getSalesAttributesForProduct = async (req, res) => {
    const { productId } = req.params;
    try {
        const attributes = await SalesAttribute.findByProductId(productId);
        res.status(200).json(attributes);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

export const deleteSalesAttribute = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await SalesAttribute.delete(id);
        if (deleted) {
            res.status(200).json({ message: 'Sales attribute deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Sales attribute not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
