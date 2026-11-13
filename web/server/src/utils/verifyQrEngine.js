import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { QRItem } from '../models/QRItem.js';
import { resolveQrSlug, claimQrSlug } from '../controllers/qrResolverController.js';
import { updateItemPrivacy } from '../controllers/itemManagementController.js';

dotenv.config();

// Helper to create a thenable mock query
const mockQuery = (result) => {
  const p = Promise.resolve(result);
  p.populate = () => Promise.resolve(result);
  return p;
};

const verifyQrEngineSuite = async () => {
  console.log('--- Starting Findix Dynamic QR Routing & Privacy Engine Verification ---');

  try {
    const testSlug = `FDX-TEST-8831`;
    const testOwnerId = new mongoose.Types.ObjectId();

    // Mock User
    const testUser = {
      _id: testOwnerId,
      name: 'Dr. Tariq Jamil',
      email: 'tariq.secret@findix.pk',
      phone: '+92 321 9876543',
      city: 'Karachi',
    };

    // 1. Test 404 Resolution on Non-existent Tag
    console.log('✓ Test 1: Non-existent QR Tag Resolution:');
    QRItem.findOne = () => mockQuery(null);

    let notFoundCode = null;
    let notFoundBody = null;
    const reqNotFound = { params: { qrSlug: 'FDX-DOESNOTEXIST-99' } };
    const resNotFound = {
      status: (code) => {
        notFoundCode = code;
        return {
          json: (data) => {
            notFoundBody = data;
          },
        };
      },
    };
    await resolveQrSlug(reqNotFound, resNotFound);
    console.log(`  - Status Code: ${notFoundCode} (Expected: 404)`);
    console.log(`  - isRegistered: ${notFoundBody?.isRegistered} (Expected: false)`);
    if (notFoundCode !== 404 || notFoundBody?.isRegistered !== false) {
      throw new Error('Non-existent slug resolution failed');
    }

    // 2. Test Unclaimed Tag Resolution
    console.log('\n✓ Test 2: Unclaimed QR Tag Resolution:');
    const unclaimedItem = new QRItem({
      qrSlug: testSlug,
      status: 'unclaimed',
      ownerId: null,
    });
    QRItem.findOne = () => mockQuery(unclaimedItem);

    let unclaimedCode = null;
    let unclaimedBody = null;
    const reqUnclaimed = { params: { qrSlug: testSlug } };
    const resUnclaimed = {
      status: (code) => {
        unclaimedCode = code;
        return {
          json: (data) => {
            unclaimedBody = data;
          },
        };
      },
    };
    await resolveQrSlug(reqUnclaimed, resUnclaimed);
    console.log(`  - Status Code: ${unclaimedCode} (Expected: 200)`);
    console.log(`  - isClaimed: ${unclaimedBody?.isClaimed} (Expected: false)`);
    console.log(`  - status: ${unclaimedBody?.status} (Expected: unclaimed)`);
    if (unclaimedCode !== 200 || unclaimedBody?.isClaimed !== false) {
      throw new Error('Unclaimed tag resolution failed');
    }

    // 3. Test Claiming Workflow
    console.log('\n✓ Test 3: Tag Claiming Execution:');
    unclaimedItem.save = function () {
      return Promise.resolve(this);
    };
    QRItem.findOne = () => mockQuery(unclaimedItem);

    const reqClaim = {
      params: { qrSlug: testSlug },
      user: testUser,
      body: {
        itemName: 'Dell Latitude 7420 Laptop',
        returnRewardNote: 'Finder will be rewarded PKR 10,000 via EasyPaisa',
        privacySettings: {
          showName: true,
          showPhone: false,
          showWhatsApp: true,
          allowInAppChat: true,
        },
        customContact: {
          whatsApp: '+92 300 5554433',
        },
        isLost: true,
      },
    };

    let claimCode = null;
    let claimBody = null;
    const resClaim = {
      status: (code) => {
        claimCode = code;
        return {
          json: (data) => {
            claimBody = data;
          },
        };
      },
    };

    await claimQrSlug(reqClaim, resClaim);
    console.log(`  - Claim Code: ${claimCode} (Expected: 201)`);
    console.log(`  - Claimed Item Name: ${unclaimedItem.itemName}`);
    console.log(`  - Claimed Status: ${unclaimedItem.status} (Expected: claimed)`);
    console.log(`  - Owner ID bound: ${unclaimedItem.ownerId}`);
    if (claimCode !== 201 || unclaimedItem.status !== 'claimed') {
      throw new Error(`Tag claiming failed: ${JSON.stringify(claimBody)}`);
    }

    // 4. Test Privacy Projection Filter (Zero-Leak Guarantee)
    console.log('\n✓ Test 4: Strict Privacy Projection (Zero-Leak Check):');
    unclaimedItem.ownerId = testUser; // populated owner
    QRItem.findOne = () => mockQuery(unclaimedItem);

    let resolvedCode = null;
    let resolvedBody = null;
    const reqResolved = { params: { qrSlug: testSlug } };
    const resResolved = {
      status: (code) => {
        resolvedCode = code;
        return {
          json: (data) => {
            resolvedBody = data;
          },
        };
      },
    };

    await resolveQrSlug(reqResolved, resResolved);
    const resolvedData = resolvedBody.data;

    console.log(`  - isClaimed: ${resolvedData.isClaimed}`);
    console.log(`  - isLost (Recovery Mode): ${resolvedData.isLost} (Expected: true)`);
    console.log(`  - Owner Name visible (showName: true): '${resolvedData.contactInfo.name}'`);
    console.log(`  - Phone hidden (showPhone: false): ${resolvedData.contactInfo.phone === undefined} (Expected: true)`);
    console.log(`  - WhatsApp visible (showWhatsApp: true): '${resolvedData.contactInfo.whatsApp}'`);
    console.log(`  - Email leaked: ${'email' in resolvedData || 'email' in (resolvedData.contactInfo || {})} (Expected: false)`);
    console.log(`  - Password leaked: ${'password' in resolvedData} (Expected: false)`);

    if (
      resolvedData.contactInfo.phone !== undefined ||
      resolvedData.contactInfo.whatsApp !== '+92 300 5554433' ||
      'email' in resolvedData ||
      'password' in resolvedData
    ) {
      throw new Error('Privacy filter failed or sensitive data was leaked');
    }

    // 5. Test Settings Update (Privacy Toggle)
    console.log('\n✓ Test 5: Update Item Privacy (showWhatsApp -> false, showPhone -> true):');
    QRItem.findOne = () => mockQuery(unclaimedItem);

    const reqPrivacyPatch = {
      params: { id: 'mock_id' },
      user: testUser,
      body: {
        privacySettings: {
          showPhone: true,
          showWhatsApp: false,
        },
      },
    };

    let patchCode = null;
    const resPrivacyPatch = {
      status: (code) => {
        patchCode = code;
        return {
          json: (data) => data,
        };
      },
    };

    await updateItemPrivacy(reqPrivacyPatch, resPrivacyPatch);
    console.log(`  - Privacy Patch Status: ${patchCode} (Expected: 200)`);
    console.log(`  - Updated showPhone: ${unclaimedItem.privacySettings.showPhone} (Expected: true)`);
    console.log(`  - Updated showWhatsApp: ${unclaimedItem.privacySettings.showWhatsApp} (Expected: false)`);

    if (!unclaimedItem.privacySettings.showPhone || unclaimedItem.privacySettings.showWhatsApp) {
      throw new Error('Privacy patch toggle failed');
    }

    console.log('\n--- ALL DYNAMIC QR ROUTING & PRIVACY FILTER CHECKS PASSED (100%) ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ QR Engine Verification Failed:', err);
    process.exit(1);
  }
};

verifyQrEngineSuite();
