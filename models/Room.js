import mongoose from 'mongoose';

// Définition du schéma de la room
const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: function () {
      return this.isPrivate; // Requis uniquement si `isPrivate` est `true`
    },
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// **Ajout d'index** pour améliorer les performances des requêtes
roomSchema.index({ name: 1 }); // Recherche rapide par nom
roomSchema.index({ creator: 1 }); // Recherche rapide par créateur
roomSchema.index({ isPrivate: 1 }); // Filtres sur les rooms privées

// Exportation du modèle de room
const Room = mongoose.model('Room', roomSchema);
export default Room;
