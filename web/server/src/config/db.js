import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://findixqr_db_user:wU3yD4RFvMdgL5G3@cluster0.j2s0io9.mongodb.net/findix_db?retryWrites=true&w=majority&appName=Cluster0';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Findix Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Findix Database Warning] MongoDB connection failed: ${error.message}`);
    console.warn(`[Findix Database Note] Make sure local MongoDB is active or specify a valid MONGO_URI in .env`);
  }
};

