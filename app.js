import 'dotenv/config';
import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { Server } from 'socket.io';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import connectFlash from 'connect-flash';
import connectDB from './config/db.js';
import configurePassport from './config/passportConfig.js';
import passport from 'passport';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import Room from './models/Room.js';
import Message from './models/Message.js';
import methodOverride from 'method-override';
import { ensureAuthenticated } from './middleware/auth.js';

// Connexion à la base de données et configuration de Passport
connectDB();
configurePassport(passport);

const app = express();
app.set('trust proxy', 1); // Activation de la confiance pour les proxys

// Configuration pour utiliser `__dirname` dans un module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Charger les certificats auto-signés pour HTTPS en développement
let server;
if (process.env.NODE_ENV === 'production') {
  server = http.createServer(app); // Vercel gère HTTPS
} else if (fs.existsSync('ssl/localhost-key.pem')) {
  const options = {
    key: fs.readFileSync('ssl/localhost-key.pem'),
    cert: fs.readFileSync('ssl/localhost-cert.pem'),
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}



const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? 'https://www.lo2cha.com'
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['polling'], // Désactiver WebSocket, utiliser polling uniquement
});


// Sécurité HTTP avec Helmet et configuration CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://api.mapbox.com", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://api.mapbox.com"],
        imgSrc: ["'self'", "data:", "https://api.mapbox.com"],
        connectSrc: ["'self'", "https://api.mapbox.com", "https://events.mapbox.com"],
        fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
        workerSrc: ["'self'", "blob:"], // Ajout pour autoriser les Web Workers
      },
    },
  })
);



app.use(methodOverride('_method'));
app.use(connectFlash()); // Gestion des messages temporaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Fichiers statiques

// Configuration de session avec MongoStore pour stockage des sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Cookies sécurisés en production
      httpOnly: true,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
  })
);

// Initialisation de Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configuration du moteur de template EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Limitation des requêtes pour la sécurité
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes
});
app.use(limiter);

// Middleware pour ajouter les messages flash aux réponses
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Importation des routes
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/room.js';

app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);

// Page d'accueil
app.get('/', (req, res) => {
  res.render('index', { messages: req.flash('info') });
});

// Route pour le tableau de bord
app.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const rooms = await Room.find();
    res.render('dashboard', { user: req.user, rooms });
  } catch (error) {
    console.error('Erreur lors du chargement du tableau de bord:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Configuration de Socket.IO pour la messagerie en temps réel
io.on('connection', (socket) => {
  console.log('Utilisateur connecté');

  // Rejoindre une room et charger les messages existants
  socket.on('joinRoom', async (roomId) => {
    try {
      socket.join(roomId);
      const messages = await Message.find({ room: roomId }).populate('sender', 'username');
      socket.emit('loadMessages', messages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  });

  // Réception d'un nouveau message de chat
  socket.on('chatMessage', async (data) => {
    const { content, roomId, senderId } = data;

    if (!content || !roomId || !senderId) {
      console.error('Données de message manquantes :', data);
      return;
    }

    try {
      const message = new Message({
        content,
        room: roomId,
        sender: senderId,
        createdAt: new Date(),
      });

      await message.save();

      const populatedMessage = await Message.findById(message._id).populate('sender', 'username');
      io.to(roomId).emit('chatMessage', populatedMessage);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement ou de l'envoi du message :", error);
    }
  });

  // Déconnexion d'un utilisateur
  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté');
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
