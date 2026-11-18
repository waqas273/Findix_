import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'tiokpjqy',
  api_key: process.env.CLOUDINARY_API_KEY || '632475139334537',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'X9MWJ1DWTy5sYE34imG3bbWQNbI',
  secure: true,
});

export default cloudinary;
