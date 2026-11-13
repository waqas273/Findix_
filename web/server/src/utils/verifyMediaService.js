import { upload, handleUpload } from '../middlewares/uploadMiddleware.js';
import { CLOUDINARY_FOLDERS, uploadToCloudinary, deleteFromCloudinary } from './mediaService.js';

const verifyMediaServiceSuite = async () => {
  console.log('--- Starting Findix Media Service & Multer Verification Suite ---');

  try {
    // 1. Verify Folder Taxonomy
    console.log('✓ Test 1: Cloudinary Folder Taxonomy:');
    console.log(`  - Users folder: ${CLOUDINARY_FOLDERS.USERS}`);
    console.log(`  - Items folder: ${CLOUDINARY_FOLDERS.ITEMS}`);
    console.log(`  - Products folder: ${CLOUDINARY_FOLDERS.PRODUCTS}`);
    console.log(`  - Community folder: ${CLOUDINARY_FOLDERS.COMMUNITY}`);

    if (
      CLOUDINARY_FOLDERS.USERS !== 'findix/users' ||
      CLOUDINARY_FOLDERS.ITEMS !== 'findix/items' ||
      CLOUDINARY_FOLDERS.PRODUCTS !== 'findix/products' ||
      CLOUDINARY_FOLDERS.COMMUNITY !== 'findix/community'
    ) {
      throw new Error('Folder taxonomy does not match specification');
    }

    // 2. Test Multer File Filter logic
    console.log('\n✓ Test 2: Multer MIME-type Whitelisting:');
    const validMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const invalidMimes = ['text/plain', 'application/pdf', 'application/javascript', 'image/svg+xml'];

    for (const mime of validMimes) {
      let allowed = false;
      upload.fileFilter(null, { mimetype: mime }, (err, result) => {
        if (!err && result === true) allowed = true;
      });
      console.log(`  - Allowed MIME '${mime}': ${allowed}`);
      if (!allowed) throw new Error(`Valid MIME '${mime}' was rejected`);
    }

    for (const mime of invalidMimes) {
      let rejected = false;
      upload.fileFilter(null, { mimetype: mime }, (err, result) => {
        if (err && err.code === 'INVALID_FILE_TYPE' && result === false) rejected = true;
      });
      console.log(`  - Rejected MIME '${mime}': ${rejected}`);
      if (!rejected) throw new Error(`Invalid MIME '${mime}' was unexpectedly accepted`);
    }

    // 3. Test File Size Limits (5MB Limit)
    console.log('\n✓ Test 3: Multer 5MB File Size Limit:');
    const maxBytes = upload.limits.fileSize;
    console.log(`  - Configured Max File Size: ${maxBytes} bytes (${maxBytes / (1024 * 1024)} MB)`);
    if (maxBytes !== 5 * 1024 * 1024) {
      throw new Error(`File size limit is ${maxBytes}, expected 5242880 bytes (5MB)`);
    }

    // 4. Test uploadToCloudinary buffer check
    console.log('\n✓ Test 4: Buffer Validation:');
    let bufferErrorCaught = false;
    try {
      await uploadToCloudinary(null, 'items');
    } catch (e) {
      bufferErrorCaught = true;
      console.log(`  - Null buffer rejected gracefully: ${e.message}`);
    }
    if (!bufferErrorCaught) throw new Error('Null buffer was not rejected');

    // 5. Test deleteFromCloudinary safety check
    console.log('\n✓ Test 5: Deletion Utility Safety:');
    const noopResult = await deleteFromCloudinary('');
    console.log(`  - Empty public_id handled safely: result='${noopResult.result}'`);

    console.log('\n--- ALL CLOUDINARY & MULTER TESTS PASSED (100%) ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Media Service Test Failed:', err);
    process.exit(1);
  }
};

verifyMediaServiceSuite();
