'use strict';
import cartService from '../services/cartService.js';

const addItemCart = async (req, res) => {
    try {
        const userID = req.user.id;
        const { productID, quantity } = req.body;
        const data = await cartService.addItemCart(userID, productID, quantity);
        if (data.EC === 0) return res.status(200).json(data);
        return res.status(400).json(data);
    } catch (err) {
        return res.status(500).json({ EC: -1, EM: err.message });
    }
};



export { addItemCart };
