import express from 'express';
import { ensureAuthenticated } from '../middleware/auth.js';
import {
    renderCreateRoomForm,
    createRoom,
    renderAdminDashboard,
    renderRoomPasswordForm,
    verifyRoomAccess,
    accessRoomById,
    deleteRoom,
    getMessages // Importez le contrôleur pour récupérer les messages
} from '../controllers/roomController.js';

const router = express.Router();

// Route pour afficher le formulaire de création de room
router.get('/create', ensureAuthenticated, renderCreateRoomForm);

// Route pour créer une nouvelle room
router.post('/create', ensureAuthenticated, createRoom);

// Route pour l'interface d'administration pour voir toutes les rooms
router.get('/admin', ensureAuthenticated, renderAdminDashboard);

// Route pour afficher le formulaire de mot de passe pour accéder à une room privée
router.get('/:roomId/password', ensureAuthenticated, renderRoomPasswordForm);

// Route pour vérifier le mot de passe et accéder à la room
router.post('/:roomId/access', ensureAuthenticated, verifyRoomAccess);

// Route pour accéder à une room par ID (vérifie si l'accès est autorisé)
router.get('/:roomId', ensureAuthenticated, accessRoomById);

// Route pour supprimer une room
router.delete('/:roomId', ensureAuthenticated, deleteRoom);

// Route pour récupérer les messages d'une room
router.get('/:roomId/messages', ensureAuthenticated, getMessages);

export default router;
