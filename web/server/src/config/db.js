import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://findixqr_db_user:wU3yD4RFvMdgL5G3@cluster0.j2s0io9.mongodb.net/findix_db?retryWrites=true&w=majority&appName=Cluster0';

let cachedPromise = null;

export const connectDB = async () => {
  // 1. If already fully connected (readyState === 1), reuse connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. If not connecting yet, initiate connection promise
  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
        bufferCommands: false,
      })
      .then((conn) => {
        console.log(`[Findix Database] MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((err) => {
        cachedPromise = null; // Reset cache so subsequent invocations can retry
        console.error(`[Findix Database Error] MongoDB connection failed: ${err.message}`);
        throw err;
      });
  }

  // 3. Await the in-flight connection promise so operations NEVER run while connecting
  await cachedPromise;
  return mongoose.connection;
};
