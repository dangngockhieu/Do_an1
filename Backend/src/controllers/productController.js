'use strict';
import apiService from '../services/cartService.js';

const postProduct = async (req, res) => {
    try {
        const productData = req.body;
        const data = await apiService.postProduct(productData);
        if (data.EC === 0) return res.status(201).json(data);
        return res.status(400).json(data);
    } catch (err) {
        return res.status(500).json({ EC: -1, EM: err.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const data = await apiService.deleteProduct(productId);
        if (data.EC === 0) return res.status(200).json(data);
        return res.status(404).json(data);
    } catch (err) {
        return res.status(500).json({ EC: -1, EM: err.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const updateData = req.body;
        const data = await apiService.updateProduct(productId, updateData);
        if (data.EC === 0) return res.status(200).json(data);
        return res.status(400).json(data);
    } catch (err) {
        return res.status(500).json({ EC: -1, EM: err.message });
    }
};
export { postProduct, deleteProduct, updateProduct };
