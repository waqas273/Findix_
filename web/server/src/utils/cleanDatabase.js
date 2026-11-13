import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { QRItem } from '../models/QRItem.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://findixqr_db_user:wU3yD4RFvMdgL5G3@cluster0.j2s0io9.mongodb.net/findix_db?retryWrites=true&w=majority&appName=Cluster0';

async function wipeFakeData() {
  console.log('Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas Cloud');

    // 1. Clean QR Items (remove all sample fake items)
    const qrDel = await QRItem.deleteMany({});
    console.log(`🧹 Deleted ${qrDel.deletedCount} sample QR tags`);

    // 2. Clean Orders (remove all sample fake orders)
    const ordDel = await Order.deleteMany({});
    console.log(`🧹 Deleted ${ordDel.deletedCount} sample orders`);

    // 3. Clean Products (remove all sample fake products so admin can add real ones)
    const prodDel = await Product.deleteMany({});
    console.log(`🧹 Deleted ${prodDel.deletedCount} sample products`);

    // 4. Clean Conversations & Messages
    const convDel = await Conversation.deleteMany({});
    const msgDel = await Message.deleteMany({});
    console.log(`🧹 Deleted ${convDel.deletedCount} conversations & ${msgDel.deletedCount} messages`);

    // 5. Clean Community Posts if any
    if (mongoose.connection.models.CommunityPost || mongoose.connection.collections.communityposts) {
      await mongoose.connection.collection('communityposts').deleteMany({});
      console.log('🧹 Deleted sample community posts');
    }

    // 6. Clean users except the real Admin admin@findix.pk
    const userDel = await User.deleteMany({ email: { $ne: 'admin@findix.pk' } });
    console.log(`🧹 Deleted ${userDel.deletedCount} non-admin test users`);

    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log(`🛡️ Preserved ${adminCount} Admin account(s) (admin@findix.pk)`);

    console.log('\n✨ MongoDB Atlas Database is now 100% CLEAN and ready for real data!');
  } catch (err) {
    console.error('❌ Error during cleanup:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

wipeFakeData();
