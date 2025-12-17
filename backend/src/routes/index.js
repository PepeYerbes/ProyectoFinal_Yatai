import express from 'express';
import authRoutes from './authRoutes.js';
import cartRoutes from './cartRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import orderRoutes from './orderRoutes.js';
import paymentMethodRoutes from './paymentMethodRoutes.js';
import productRoutes from './productRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);
router.use('/categories', categoryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/orders', orderRoutes);
router.use('/payment-methods', paymentMethodRoutes);
router.use('/users', userRoutes);

import shippingAddressRoutes from './shippingAddressRoutes.js';
router.use('/shipping-addresses', shippingAddressRoutes);
router.use('/products', productRoutes);


export default router;
