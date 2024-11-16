import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  reactions: {
    type: Map,
    of: Number, // Chaque clé (emoji) a un compteur
    default: {}, // Exemple : {"👍": 2, "👏": 1}
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// **Ajout d'index** pour améliorer les performances des requêtes
messageSchema.index({ room: 1 }); // Recherche rapide des messages par room
messageSchema.index({ sender: 1 }); // Recherche rapide des messages par utilisateur
messageSchema.index({ timestamp: -1 }); // Trie rapide par date décroissante (messages récents)

// Exportation du modèle
const Message = mongoose.model('Message', messageSchema);
export default Message;
