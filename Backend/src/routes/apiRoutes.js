'use strict';
import express from 'express';
import { changePassword, deleteUser, getAllUsers, getUserById, registerUser, putUser, login } from '../controllers/userController.js';
import { postProduct, deleteProduct, updateProduct } from '../controllers/productController.js';
import { addItemCart } from '../controllers/cartController.js'
import { checkUserJWT, checkIsAdmin } from '../middleware/JWTAction.js';
const router = express.Router();

const apiRoutes = (app) => {
    // Auth routes
    router.post('/login', login);

    // User routes
    router.get('/get-all-user', getAllUsers);
    router.get('/get-user-by-id/:userID', getUserById);
    router.post('/register-user', registerUser);
    router.patch('/update-user/:userID', putUser);
    router.patch('/change-password/:userID', changePassword);
    router.delete('/delete-user/:userID', deleteUser);

    // Product routes (admin only)
    router.post('/post-products', checkUserJWT, checkIsAdmin, postProduct);
    router.patch('/update-products/:productID', checkUserJWT, checkIsAdmin, updateProduct);
    router.delete('/delete-products/:productID', checkUserJWT, checkIsAdmin, deleteProduct);

    // Cart routes (user + admin)
    router.post('/cart/add', checkUserJWT, addItemCart);



    app.use('/api', router);
};

export default apiRoutes;