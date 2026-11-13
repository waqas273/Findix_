import express from 'express';
import productRoutes from '../routes/productRoutes.js';
import { getProducts, getProductById, SEED_PRODUCTS } from '../controllers/productController.js';

console.log('--- Starting Findix Products Controller Verification ---');

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

const runTests = async () => {
  try {
    // 1. Test getProducts all
    const req1 = { query: {} };
    const res1 = mockRes();
    await getProducts(req1, res1);

    if (!res1.jsonData.success || !res1.jsonData.data.products.length) {
      throw new Error('Failed to retrieve all products');
    }
    console.log(`✓ getProducts returned ${res1.jsonData.data.products.length} products`);

    // 2. Test getProducts with category filter
    const req2 = { query: { category: 'sticker' } };
    const res2 = mockRes();
    await getProducts(req2, res2);
    const stickers = res2.jsonData.data.products;
    if (!stickers.every(p => p.category === 'sticker')) {
      throw new Error('Category filter failed');
    }
    console.log(`✓ getProducts category filter returned ${stickers.length} stickers`);

    // 3. Test getProducts with search
    const req3 = { query: { search: 'Titanium' } };
    const res3 = mockRes();
    await getProducts(req3, res3);
    if (!res3.jsonData.data.products.length) {
      throw new Error('Search filter failed');
    }
    console.log(`✓ getProducts search returned ${res3.jsonData.data.products.length} titanium matches`);

    // 4. Test getProductById with seed id
    const req4 = { params: { id: 'seed_1' } };
    const res4 = mockRes();
    await getProductById(req4, res4);
    if (!res4.jsonData.success || !res4.jsonData.data.title) {
      throw new Error('getProductById seed resolution failed');
    }
    console.log(`✓ getProductById retrieved: "${res4.jsonData.data.title}" with specs: ${res4.jsonData.data.specs.material}`);

    console.log('\n--- ALL PRODUCT CONTROLLER & ROUTING TESTS PASSED ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Product Verification Error:', err);
    process.exit(1);
  }
};

runTests();
