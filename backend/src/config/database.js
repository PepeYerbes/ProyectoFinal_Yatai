import mongose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbConnection = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        const dbName = process.env.MONGODB_DB;
        
        await mongose.connect(mongoUri, {
            dbName: dbName || 'ecommerce-db',
        });
        console.log(`MongoDB is connected to database: ${dbName || 'ecommerce-db'}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
export default dbConnection;