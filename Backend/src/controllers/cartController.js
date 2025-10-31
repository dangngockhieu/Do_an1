'use strict';
import cartService from '../services/cartService.js';

const addItemCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;
        const data = await cartService.addItemCart(userId, productId, quantity);
        if (data.EC === 0) return res.status(200).json(data);
        return res.status(400).json(data);
    } catch (err) {
        return res.status(500).json({ EC: -1, EM: err.message });
    }
};



export { addItemCart };
