import express from 'express';
import {
  getNotifications,
  getNotificationById,
  getNotificationByUser,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsReadByUser,
  getUnreadNotificationsByUser,
} from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = express.Router();

// Obtener todas las notificaciones (admin)
router.get('', authMiddleware, isAdmin, getNotifications);

// Obtener notificaciones no leídas por usuario
router.get('/unread/:userId', authMiddleware, getUnreadNotificationsByUser);

// Obtener notificaciones por usuario
router.get('/user/:userId', authMiddleware, getNotificationByUser);

// Obtener notificación por ID
router.get('/:id', authMiddleware, getNotificationById);

// Crear nueva notificación
router.post('', authMiddleware, createNotification);

// Marcar una notificación como leída
router.patch('/:id/mark-read', authMiddleware, markAsRead);

// Marcar todas las notificaciones de un usuario como leídas
router.patch('/user/:userId/mark-all-read', authMiddleware, markAllAsReadByUser);

// Actualizar notificación
router.put('/:id', authMiddleware, isAdmin, updateNotification);

// Eliminar notificación
router.delete('/:id', authMiddleware, deleteNotification);

export default router;