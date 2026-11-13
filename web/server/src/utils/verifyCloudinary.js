import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function verifyCloudinary() {
  console.log('--- Testing Cloudinary Connection ---');
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary API Ping Successful:', result);
    console.log(`✅ Connected to Cloud: "${process.env.CLOUDINARY_CLOUD_NAME}"`);
  } catch (error) {
    console.error('❌ Cloudinary Verification Failed:', error.message || error);
    process.exit(1);
  }
}

verifyCloudinary();
