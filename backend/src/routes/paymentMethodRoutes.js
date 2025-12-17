import express from 'express';
import {
  getPaymentMethods,
  getPaymentMethodById,
  getPaymentMethodsByUser,
  createPaymentMethod,
  updatePaymentMethod,
  setDefaultPaymentMethod,
  deactivatePaymentMethod,
  deletePaymentMethod,
  getDefaultPaymentMethod,
} from '../controllers/paymentMethodController.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Obtener todos los métodos de pago activos (admin)
router.get('', authMiddleware, isAdmin, getPaymentMethods);

// Obtener método de pago predeterminado de un usuario
router.get('/default/:userId', authMiddleware, getDefaultPaymentMethod);

// Obtener métodos de pago de un usuario
router.get('/user/:userId', authMiddleware, getPaymentMethodsByUser);

// Obtener método de pago por ID
router.get('/:id', authMiddleware, getPaymentMethodById);

// Crear nuevo método de pago
router.post('', authMiddleware, createPaymentMethod);

// Establecer método de pago como predeterminado
router.patch('/:id/set-default', authMiddleware, setDefaultPaymentMethod);

// Desactivar método de pago
router.patch('/:id/deactivate', authMiddleware, deactivatePaymentMethod);

// Actualizar método de pago
router.put('/:id', authMiddleware, updatePaymentMethod);

// Eliminar método de pago permanentemente
router.delete('/:id', authMiddleware, deletePaymentMethod);

export default router;