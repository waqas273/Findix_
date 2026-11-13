import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/findix';

async function createOrPromoteAdmin() {
  const adminEmail = (process.argv[2] || 'admin@findix.pk').toLowerCase().trim();
  const adminPassword = process.argv[3] || 'AdminPass123!';
  const adminName = process.argv[4] || 'Findix Commander';

  console.log('====================================================');
  console.log('🛡️ FINDIX ADMIN ACCOUNT GENERATOR / PROMOTER');
  console.log('====================================================');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas Cloud');

    let user = await User.findOne({ email: adminEmail });

    if (user) {
      user.role = 'admin';
      if (process.argv[3]) {
        user.password = adminPassword;
      }
      await user.save();
      console.log(`\n🎉 Existing user [${user.email}] successfully upgraded to ADMIN!`);
    } else {
      user = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        city: 'Islamabad',
        phone: '+923001234567',
      });
      console.log(`\n🎉 New ADMIN Account created successfully!`);
    }

    console.log('----------------------------------------------------');
    console.log(`📧 Email:    ${user.email}`);
    console.log(`🔑 Password: ${process.argv[3] || 'AdminPass123!'}`);
    console.log(`👑 Role:     ${user.role}`);
    console.log('----------------------------------------------------');
    console.log('🌐 Log in at: http://localhost:5173/login');
    console.log('🛡️ Then open: http://localhost:5173/admin\n');

  } catch (error) {
    console.error('❌ Failed to create/promote admin:', error.message || error);
  } finally {
    await mongoose.disconnect();
  }
}

createOrPromoteAdmin();
