import mongoose from 'mongoose';
import { 
  getGlobalMetrics, 
  bulkGenerateQRTags, 
  getAllTags, 
  getAllOrdersAdmin, 
  updateOrderPipelineAdmin, 
  createProductAdmin 
} from '../controllers/adminController.js';

console.log('--- Starting Findix Admin Command Center & Bulk Engine Verification ---');

const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

const runAdminTests = async () => {
  try {
    const adminUserId = new mongoose.Types.ObjectId();

    // 1. Test getGlobalMetrics
    const req1 = { user: { _id: adminUserId, role: 'admin' } };
    const res1 = mockRes();
    await getGlobalMetrics(req1, res1);

    if (!res1.jsonData.success || res1.jsonData.data.totalTags === undefined) {
      throw new Error('getGlobalMetrics failed');
    }
    const metrics = res1.jsonData.data;
    console.log(`✓ getGlobalMetrics: Total Tags=${metrics.totalTags}, Claimed Rate=${metrics.claimPercentage}%, Lost Items=${metrics.lostItemsCount}`);

    // 2. Test bulkGenerateQRTags (Generate batch of 50)
    const req2 = {
      user: { _id: adminUserId, role: 'admin' },
      body: { batchSize: 50, categoryTag: 'Keychains', notes: 'Titanium batch #441' },
    };
    const res2 = mockRes();
    await bulkGenerateQRTags(req2, res2);

    if (!res2.jsonData.success || res2.jsonData.data.generatedCount !== 50) {
      throw new Error('bulkGenerateQRTags failed');
    }
    const batch = res2.jsonData.data;
    console.log(`✓ bulkGenerateQRTags successfully created ${batch.generatedCount} cryptographic slugs under ${batch.batchId}`);
    console.log(`  - Sample slug: ${batch.sampleSlugs[0].qrSlug} ➔ ${batch.sampleSlugs[0].qrUrl}`);

    // 3. Test getAllTags
    const req3 = { query: { page: 1, limit: 10 } };
    const res3 = mockRes();
    await getAllTags(req3, res3);
    if (!res3.jsonData.success) {
      throw new Error('getAllTags failed');
    }
    console.log(`✓ getAllTags retrieved tag directory`);

    // 4. Test getAllOrdersAdmin
    const req4 = { user: { role: 'admin' } };
    const res4 = mockRes();
    await getAllOrdersAdmin(req4, res4);
    if (!res4.jsonData.success || !res4.jsonData.data.length) {
      throw new Error('getAllOrdersAdmin failed');
    }
    console.log(`✓ getAllOrdersAdmin retrieved ${res4.jsonData.data.length} orders for pipeline manager`);

    // 5. Test updateOrderPipelineAdmin
    const req5 = {
      params: { id: 'ord_adm_101' },
      body: { status: 'Shipped', note: 'Dispatched via TCS courier' },
    };
    const res5 = mockRes();
    await updateOrderPipelineAdmin(req5, res5);
    if (!res5.jsonData.success) {
      throw new Error('updateOrderPipelineAdmin failed');
    }
    console.log(`✓ updateOrderPipelineAdmin shifted status to: ${res5.jsonData.data.pipelineStatus}`);

    // 6. Test createProductAdmin
    const req6 = {
      body: {
        title: 'Aerospace Carbon Fiber QR Luggage Tag',
        description: 'Ultra-light high-tensile carbon fiber tag.',
        price: 3499,
        stock: 35,
        category: 'keychain',
      },
    };
    const res6 = mockRes();
    await createProductAdmin(req6, res6);
    if (!res6.jsonData.success || !res6.jsonData.data._id) {
      throw new Error('createProductAdmin failed');
    }
    console.log(`✓ createProductAdmin successfully created product: "${res6.jsonData.data.title}"`);

    console.log('\n--- ALL ADMIN COMMAND CENTER & BULK QR TESTS PASSED ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin Verification Error:', error);
    process.exit(1);
  }
};

runAdminTests();
