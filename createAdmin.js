import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import User from './models/User.js'; // Assurez-vous que le chemin du modèle User est correct
import connectDB from './config/db.js'; // Assurez-vous que le chemin pour la connexion à la base de données est correct

// Connexion à la base de données
connectDB();

const createAdmin = async () => {
    try {
        // Vérifiez si un administrateur avec ce nom existe déjà
        const existingAdmin = await User.findOne({ username: 'Admin' });
        if (existingAdmin) {
            console.log("Un administrateur avec le nom d'utilisateur 'Admin' existe déjà.");
            mongoose.connection.close();
            return;
        }

        // Hashage du mot de passe
        const hashedPassword = await bcrypt.hash('123Soleil', 10);

        // Création de l'utilisateur administrateur
        const adminUser = new User({
            username: 'Admin',
            password: hashedPassword,
            role: 'admin'
        });

        // Sauvegarde dans la base de données
        await adminUser.save();
        console.log("Administrateur créé avec succès : 'Admin' avec le rôle 'admin'");
    } catch (error) {
        console.error("Erreur lors de la création de l'administrateur:", error);
    } finally {
        mongoose.connection.close(); // Ferme la connexion après l'opération
    }
};

createAdmin();
