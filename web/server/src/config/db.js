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
  // If already connected, reuse existing connection (crucial for Serverless / Vercel)
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 6000,
      bufferCommands: false,
    });
    console.log(`[Findix Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Findix Database Error] MongoDB connection failed: ${error.message}`);
    throw new Error(`Database connection error: ${error.message}`);
  }
};

