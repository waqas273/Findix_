import mongoose from 'mongoose';
import { createOrder, getMyOrders, getOrderById, updateOrderStatus } from '../controllers/orderController.js';

console.log('--- Starting Findix Order Processing & Pipeline Verification ---');

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

const runOrderTests = async () => {
  try {
    const testUserId = new mongoose.Types.ObjectId();

    // 1. Test createOrder
    const req1 = {
      user: { _id: testUserId, email: 'buyer@findix.pk' },
      body: {
        items: [
          {
            productId: 'seed_1',
            title: 'Titanium Matte QR Keychain Tag',
            quantity: 2,
            price: 2499,
          },
          {
            productId: 'seed_2',
            title: 'Findix Holographic Metallic Decals (3-Pack)',
            quantity: 1,
            price: 1499,
          },
        ],
        shippingAddress: {
          street: 'Office 501, Executive Tower, Blue Area',
          city: 'Islamabad',
          postalCode: '44000',
          phone: '+92 312 9876543',
        },
        paymentMethod: 'cod',
        discountAmount: 649, // 10% voucher
      },
    };
    const res1 = mockRes();
    await createOrder(req1, res1);

    if (!res1.jsonData.success || !res1.jsonData.data._id) {
      throw new Error(`Order creation failed: ${JSON.stringify(res1.jsonData)}`);
    }
    const createdOrder = res1.jsonData.data;
    console.log(`✓ createOrder succeeded with ID: ${createdOrder._id}, Status: ${createdOrder.pipelineStatus}`);
    console.log(`  - Total calculated: PKR ${createdOrder.totalAmount}`);
    console.log(`  - Initial Tracking Note: ${createdOrder.trackingHistory[0]?.note}`);

    // 2. Test getMyOrders
    const req2 = { user: { _id: testUserId } };
    const res2 = mockRes();
    await getMyOrders(req2, res2);

    if (!res2.jsonData.success || !res2.jsonData.data.length) {
      throw new Error('getMyOrders returned empty response');
    }
    console.log(`✓ getMyOrders returned ${res2.jsonData.data.length} orders for test user`);

    // 3. Test getOrderById
    const req3 = { params: { id: String(createdOrder._id) } };
    const res3 = mockRes();
    await getOrderById(req3, res3);
    if (!res3.jsonData.success) {
      throw new Error('getOrderById failed');
    }
    console.log(`✓ getOrderById successfully fetched order: ${res3.jsonData.data._id}`);

    // 4. Test updateOrderStatus (Pending -> Processing -> Shipped)
    const req4 = {
      params: { id: String(createdOrder._id) },
      body: {
        status: 'Processing',
        note: 'Laser etching matrix applied; hardware ready for courier dispatch',
      },
    };
    const res4 = mockRes();
    await updateOrderStatus(req4, res4);
    if (!res4.jsonData.success || res4.jsonData.data.pipelineStatus !== 'Processing') {
      throw new Error('updateOrderStatus failed');
    }
    console.log(`✓ updateOrderStatus transitioned status to: ${res4.jsonData.data.pipelineStatus}`);

    console.log('\n--- ALL ORDER PROCESSING & TRACKING TESTS PASSED ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Order Verification Error:', error);
    process.exit(1);
  }
};

runOrderTests();
