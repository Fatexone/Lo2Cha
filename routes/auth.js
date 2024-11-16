import express from 'express';
import passport from 'passport';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Route pour afficher le formulaire de connexion
router.get('/login', (req, res) => {
    res.render('login'); // Assurez-vous d'avoir un fichier login.ejs dans le dossier views
});

// Route pour afficher le formulaire d'inscription
router.get('/register', (req, res) => {
    res.render('register'); // Assurez-vous d'avoir un fichier register.ejs dans le dossier views
});

// Route pour l'inscription (traitement du formulaire)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Vérification des champs requis
    if (!username || !password) {
        return res.status(400).send('Veuillez remplir tous les champs requis');
    }

    try {
        // Vérification de l'existence de l'utilisateur
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Utilisateur déjà existant');
        }

        // Création d'un nouvel utilisateur
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        // Redirection vers la page de connexion après l'inscription réussie
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).send('Erreur lors de l\'inscription');
    }
});


// Route de connexion pour les administrateurs
router.get('/admin/login', (req, res) => {
    res.render('adminLogin');
});

router.post('/admin/login', passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/auth/admin/login',
    failureFlash: true
}));





// Route pour le traitement de la connexion
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

// Route pour la déconnexion
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Erreur lors de la déconnexion:', err);
            return res.status(500).send('Erreur lors de la déconnexion');
        }
        res.redirect('/');
    });
});

export default router; // Assure-toi d'exporter le router par défaut