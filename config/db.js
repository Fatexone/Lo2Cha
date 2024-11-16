import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // Suppression des options dépréciées
        console.log('Base de données connectée');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

export default connectDB;
