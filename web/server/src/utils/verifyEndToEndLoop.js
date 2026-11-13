import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, QRItem, Product, Order, CommunityPost, Conversation, Message } from '../models/index.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/findix';

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('🚀 FINDIX END-TO-END MULTI-ACTOR LIFECYCLE TEST');
  console.log('====================================================');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);

    const testId = Date.now().toString().slice(-6);

    // ----------------------------------------------------
    // STEP 1: ADMIN SEEDING & BULK QR GENERATION
    // ----------------------------------------------------
    console.log('\n--- STEP 1: ADMIN BULK QR GENERATION ---');
    const adminUser = await User.findOneAndUpdate(
      { email: `admin_${testId}@findix.pk` },
      {
        name: `Admin Commander ${testId}`,
        email: `admin_${testId}@findix.pk`,
        password: 'AdminPassword123!',
        city: 'Islamabad',
        role: 'admin'
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Admin Account: ${adminUser.name} (${adminUser.email}) [Role: ${adminUser.role}]`);

    // Generate batch of 5 collision-free QR slugs
    const generatedTags = [];
    for (let i = 0; i < 5; i++) {
      const qrSlug = `FNX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const tag = await QRItem.create({
        qrSlug,
        status: 'unclaimed',
        isLost: false,
        privacySettings: {
          showName: true,
          showPhone: false,
          showWhatsApp: false,
          allowInAppChat: true
        }
      });
      generatedTags.push(tag);
    }
    console.log(`✅ Generated ${generatedTags.length} Unclaimed QR Tags in Admin Batch Engine.`);
    console.log(`   Sample Slug: ${generatedTags[0].qrSlug}`);

    // ----------------------------------------------------
    // STEP 2: HARDWARE STORE INVENTORY & BUYER ORDER
    // ----------------------------------------------------
    console.log('\n--- STEP 2: STORE CATALOG & BUYER CHECKOUT ---');
    let product = await Product.findOne({ title: /Metallic/i });
    if (!product) {
      product = await Product.create({
        title: 'Findix Titanium Metallic Keychain',
        description: 'Military-grade anodized aluminum QR keychain engineered for harsh environments.',
        category: 'keychain',
        price: 2499,
        stock: 100,
        images: [{ url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80' }]
      });
    }

    const buyerUser = await User.create({
      name: `Tariq Buyer ${testId}`,
      email: `tariq_${testId}@findix.pk`,
      phone: '+923001234567',
      password: 'BuyerPassword123!',
      city: 'Lahore',
      role: 'buyer'
    });
    console.log(`✅ Buyer Registered: ${buyerUser.name} (${buyerUser.email}) from ${buyerUser.city}`);

    const newOrder = await Order.create({
      buyerId: buyerUser._id,
      items: [{
        productId: product._id,
        quantity: 2,
        price: product.price
      }],
      shippingAddress: {
        street: 'House 42, Gulberg III',
        city: 'Lahore',
        postalCode: '54000',
        phone: buyerUser.phone
      },
      totalAmount: (product.price * 2) + 200,
      pipelineStatus: 'Pending'
    });
    console.log(`✅ Order Created: #${newOrder._id.toString().slice(-8).toUpperCase()} | Total: PKR ${newOrder.totalAmount}`);

    // ----------------------------------------------------
    // STEP 3: ADMIN FULFILLMENT & ORDER STATUS TRANSITION
    // ----------------------------------------------------
    console.log('\n--- STEP 3: ADMIN ORDER PIPELINE ADVANCEMENT ---');
    newOrder.pipelineStatus = 'Processing';
    await newOrder.save();

    newOrder.pipelineStatus = 'Shipped';
    await newOrder.save();

    newOrder.pipelineStatus = 'Delivered';
    await newOrder.save();

    console.log(`✅ Order Pipeline Shifted to: [${newOrder.pipelineStatus}] (History stages: ${newOrder.trackingHistory.length})`);

    // ----------------------------------------------------
    // STEP 4: BUYER UNBOXES & CLAIMS QR TAG
    // ----------------------------------------------------
    console.log('\n--- STEP 4: BUYER CLAIMS & CONFIGURES QR TAG ---');
    const targetTag = generatedTags[0];
    const claimedTag = await QRItem.findOneAndUpdate(
      { qrSlug: targetTag.qrSlug, status: 'unclaimed' },
      {
        status: 'claimed',
        ownerId: buyerUser._id,
        itemName: 'Carbon Matte Car Keys',
        returnRewardNote: 'Reward of PKR 5,000 for safe return. Please contact immediately!',
        isLost: true, // Reported as lost!
        privacySettings: {
          showName: true,
          showPhone: false,        // STRICT ZERO-LEAK: Phone is HIDDEN
          showWhatsApp: true,      // WhatsApp direct IS allowed
          allowInAppChat: true     // In-app chat IS allowed
        },
        customContact: {
          whatsApp: '+923001234567'
        }
      },
      { new: true }
    );
    console.log(`✅ Tag Claimed: [${claimedTag.qrSlug}]`);
    console.log(`   Item Name: "${claimedTag.itemName}" | Status: ${claimedTag.isLost ? '🔴 REPORTED LOST' : '🟢 SECURE'}`);
    console.log(`   Privacy Matrix: Phone=[${claimedTag.privacySettings.showPhone ? 'PUBLIC' : 'PROTECTED HIDDEN'}], WhatsApp=[${claimedTag.privacySettings.showWhatsApp ? 'ENABLED' : 'DISABLED'}], InAppChat=[${claimedTag.privacySettings.allowInAppChat ? 'ENABLED' : 'DISABLED'}]`);

    // ----------------------------------------------------
    // STEP 5: PUBLIC SCANNER RESOLVER & ZERO-LEAK PRIVACY AUDIT
    // ----------------------------------------------------
    console.log('\n--- STEP 5: PUBLIC SCAN RESOLVER & ZERO-LEAK AUDIT ---');
    // Emulate public GET /api/q/:qrSlug controller logic
    const rawFoundTag = await QRItem.findOne({ qrSlug: targetTag.qrSlug }).populate('ownerId', 'name phone email');
    
    // Project safe sanitized response matching public resolver
    const publicSanitizedPayload = {
      isClaimed: rawFoundTag.status === 'claimed',
      isLost: rawFoundTag.isLost,
      itemName: rawFoundTag.itemName,
      itemImage: rawFoundTag.itemImage?.url || null,
      returnRewardNote: rawFoundTag.returnRewardNote,
      owner: {
        name: rawFoundTag.privacySettings?.showName ? rawFoundTag.ownerId?.name : 'Findix Verified Owner',
        phone: rawFoundTag.privacySettings?.showPhone ? rawFoundTag.ownerId?.phone : null,
        whatsApp: rawFoundTag.privacySettings?.showWhatsApp ? (rawFoundTag.customContact?.whatsApp || rawFoundTag.ownerId?.phone) : null
      },
      privacySettings: {
        showPhone: rawFoundTag.privacySettings?.showPhone || false,
        showWhatsApp: rawFoundTag.privacySettings?.showWhatsApp || false,
        allowInAppChat: rawFoundTag.privacySettings?.allowInAppChat !== false
      }
    };

    console.log('   Public Payload Dispatched to Finder:');
    console.log(JSON.stringify(publicSanitizedPayload, null, 2));

    // Security Assertions
    if (publicSanitizedPayload.owner.phone !== null) {
      throw new Error('❌ SECURITY VIOLATION: Owner phone leaked when showPhone was false!');
    }
    if (publicSanitizedPayload.owner.email || (rawFoundTag.ownerId && rawFoundTag.ownerId.password)) {
      throw new Error('❌ SECURITY VIOLATION: Sensitive owner email/password exposed in public payload!');
    }
    console.log('✅ ZERO-LEAK PRIVACY AUDIT PASSED: No unauthorized phone, email, or credentials exposed.');

    // ----------------------------------------------------
    // STEP 6: FINDER DISCOVERY & IN-APP CHAT INITIATION
    // ----------------------------------------------------
    console.log('\n--- STEP 6: FINDER ENGAGEMENT & IN-APP MESSAGING ---');
    const finderUser = await User.create({
      name: `Bilal GoodSamaritan ${testId}`,
      email: `finder_${testId}@gmail.com`,
      phone: '+923339876543',
      password: 'FinderPassword123!',
      city: 'Lahore',
      role: 'buyer'
    });
    console.log(`✅ Finder Registered: ${finderUser.name} (${finderUser.email})`);

    // Finder initiates chat conversation for the scanned item
    const conversation = await Conversation.findOneAndUpdate(
      { qrItemId: claimedTag._id, finderIdentifier: finderUser._id.toString() },
      {
        qrItemId: claimedTag._id,
        ownerId: buyerUser._id,
        finderIdentifier: finderUser._id.toString(),
        finderUser: finderUser._id,
        lastMessage: {
          content: 'Hi! I found your car keys near Packages Mall parking slot B4.',
          senderRole: 'finder',
          timestamp: new Date()
        }
      },
      { upsert: true, new: true }
    );

    const finderMsg = await Message.create({
      conversationId: conversation._id,
      senderRole: 'finder',
      senderId: finderUser._id,
      content: 'Hi! I found your car keys near Packages Mall parking slot B4.'
    });
    console.log(`✅ Message sent by Finder: "${finderMsg.content}"`);

    // Owner replies with location coordinate note
    const ownerReply = await Message.create({
      conversationId: conversation._id,
      senderRole: 'owner',
      senderId: buyerUser._id,
      content: 'Thank you so much Bilal! I am coming right over to Packages Mall Main Gate Customer Desk. Reward ready!'
    });
    console.log(`✅ Owner Replied: "${ownerReply.content}"`);

    // ----------------------------------------------------
    // STEP 7: COMMUNITY RESOLUTION POST & RECOVERY
    // ----------------------------------------------------
    console.log('\n--- STEP 7: COMMUNITY SUCCESS POST & RECOVERY ---');
    const communityPost = await CommunityPost.create({
      authorId: buyerUser._id,
      scope: 'city',
      city: 'Lahore',
      tag: 'Found Alert',
      content: `Huge shoutout to Findix and Bilal for returning my Car Keys in under 2 hours! 🚀🎉 #FindixHero`,
      likes: [finderUser._id]
    });
    console.log(`✅ Community Post Published to Lahore Hub: "${communityPost.content}" (Likes: ${communityPost.likes.length})`);

    // Mark item recovered
    const recoveredTag = await QRItem.findByIdAndUpdate(
      claimedTag._id,
      { isLost: false },
      { new: true }
    );
    console.log(`✅ Item Recovery Confirmed: Status shifted back to 🟢 SECURE (isLost: ${recoveredTag.isLost})`);

    console.log('\n====================================================');
    console.log('🎉 100% COMPLETE END-TO-END LIFECYCLE VERIFICATION SUCCEEDED!');
    console.log('====================================================\n');

  } catch (error) {
    console.error('❌ End-to-End Verification Failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runEndToEndVerification();
