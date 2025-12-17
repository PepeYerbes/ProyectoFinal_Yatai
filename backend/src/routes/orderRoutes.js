import express from 'express';
import {
  getOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrder,
  cancelOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = express.Router();

// Obtener todas las órdenes (admin)
router.get('', authMiddleware, isAdmin, getOrders);

// Obtener órdenes por usuario
router.get('/user/:userId', authMiddleware, getOrdersByUser);

// Obtener orden por ID
router.get('/:id', authMiddleware, getOrderById);

// Crear nueva orden
router.post('', authMiddleware, createOrder);

// Cancelar orden (función especial)
router.patch('/:id/cancel', authMiddleware, isAdmin, cancelOrder);

// Actualizar solo el estado de la orden
router.patch('/:id/status', authMiddleware, isAdmin, updateOrderStatus);

// Actualizar solo el estado de pago
router.patch('/:id/payment-status', authMiddleware, isAdmin, updatePaymentStatus);

// Actualizar orden completa
router.put('/:id', authMiddleware, isAdmin, updateOrder);

// Eliminar orden (solo si está cancelada)
router.delete('/:id', authMiddleware, isAdmin, deleteOrder);

export default router;