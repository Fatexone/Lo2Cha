import Room from '../models/Room.js';
import Message from '../models/Message.js';

// Affiche le formulaire de création de room
export const renderCreateRoomForm = (req, res) => {
    res.render('createRoom'); // Assurez-vous que 'createRoom' est bien configuré
};

// Crée une nouvelle room
export const createRoom = async (req, res) => {
    const { name, description, isPrivate, password } = req.body;
    try {
        const newRoom = new Room({
            name,
            description,
            isPrivate: isPrivate === 'on', // Convertir en booléen
            password: isPrivate === 'on' && password ? password : null, // Assigner un mot de passe si room privée
            creator: req.user._id,
            participants: [req.user._id]
        });
        await newRoom.save();
        res.redirect('/dashboard'); // Redirection vers le tableau de bord après création
    } catch (error) {
        console.error('Erreur lors de la création de la room:', error);
        res.status(500).send('Erreur lors de la création de la room');
    }
};

// Affiche le tableau de bord d'administration avec toutes les rooms
export const renderAdminDashboard = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Accès refusé');
    }
    try {
        const rooms = await Room.find().populate('creator');
        res.render('adminDashboard', { rooms, user: req.user });
    } catch (error) {
        console.error("Erreur lors de l'accès à l'administration:", error);
        res.status(500).send("Erreur lors de l'accès à l'administration");
    }
};

// Affiche le formulaire de mot de passe pour accéder à une room privée
export const renderRoomPasswordForm = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return res.status(404).send('Room non trouvée');
        }
        if (!room.isPrivate) {
            return res.redirect(`/rooms/${req.params.roomId}`); // Redirection si la room n'est pas privée
        }
        res.render('roomPassword', { roomId: req.params.roomId });
    } catch (error) {
        console.error('Erreur lors de l\'accès au formulaire de mot de passe:', error);
        res.status(500).send('Erreur serveur');
    }
};

// Vérifie le mot de passe de la room pour y accéder
export const verifyRoomAccess = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return res.status(404).send('Room non trouvée');
        }
        if (room.isPrivate && req.body.password !== room.password) {
            req.flash('error', 'Mot de passe incorrect');
            return res.redirect(`/rooms/${req.params.roomId}/password`);
        }
        res.redirect(`/rooms/${req.params.roomId}?access_granted=true`);
    } catch (error) {
        console.error("Erreur lors de la vérification de l'accès à la room:", error);
        res.status(500).send("Erreur serveur");
    }
};


// roomController.js
export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.roomId }).populate('sender', 'username');
        if (!Array.isArray(messages)) {
            return res.status(404).json({ error: 'Aucun message trouvé' });
        }
        res.json(messages);
    } catch (error) {
        console.error('Erreur lors de la récupération des messages :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
    }
};



// Accède à une room par ID en vérifiant si l'accès est autorisé
export const accessRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId).populate('participants').populate('creator');
        if (!room) {
            return res.status(404).send('Room non trouvée');
        }
        if (room.isPrivate && !req.query.access_granted) {
            return res.redirect(`/rooms/${req.params.roomId}/password`);
        }
        if (!room.participants.includes(req.user._id)) {
            room.participants.push(req.user._id);
            await room.save();
        }
        const messages = await Message.find({ room: req.params.roomId }).populate('sender', 'username');
        res.render('room', { room, user: req.user, messages });
    } catch (error) {
        console.error("Erreur lors de l'accès à la room:", error);
        res.status(500).send("Erreur lors de l'accès à la room");
    }
};

// Supprime une room
export const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return res.status(404).send('Room non trouvée');
        }
        if (!room.creator.equals(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).send('Vous n\'êtes pas autorisé à supprimer cette room');
        }
        await Message.deleteMany({ room: room._id });
        await Room.findByIdAndDelete(room._id);
        res.redirect(req.user.role === 'admin' ? '/rooms/admin' : '/dashboard');
    } catch (error) {
        console.error('Erreur lors de la suppression de la room:', error);
        res.status(500).send('Erreur lors de la suppression de la room');
    }
};
