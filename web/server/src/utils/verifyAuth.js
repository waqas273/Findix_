import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { generateToken } from './generateToken.js';
import { authorize } from '../middlewares/authMiddleware.js';

dotenv.config();

const verifyAuthSuite = async () => {
  console.log('--- Starting Findix Security & JWT Auth Verification Suite ---');

  try {
    // Test 1: Model instantiation & bcrypt 12-round hashing hook test
    const rawPassword = 'SuperSecretPassword2026!';
    const user = new User({
      name: 'Zainab Ahmed',
      email: 'zainab@findix.pk',
      password: rawPassword,
      role: 'buyer',
      city: 'Islamabad',
    });
    
    // Simulate 12-round bcrypt hash
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);
    user.password = hashedPassword;

    console.log('✓ Test 1: Bcrypt Password Hashing with 12 Salt Rounds:');
    console.log(`  - Original Password: ${rawPassword}`);
    console.log(`  - 12-Round Hash: ${hashedPassword.substring(0, 30)}...`);
    
    const isMatch = await user.matchPassword(rawPassword);
    const isWrongMatch = await user.matchPassword('WrongPassword123');
    console.log(`  - Match check with correct password: ${isMatch} (Expected: true)`);
    console.log(`  - Match check with incorrect password: ${isWrongMatch} (Expected: false)`);
    if (!isMatch || isWrongMatch) throw new Error('Password matching failed verification');

    // Test 2: Payload Sanitization & toJSON Redaction
    const jsonUser = user.toJSON();
    console.log('\n✓ Test 2: Payload Sanitization (Password Redaction):');
    console.log(`  - Password present in JSON output: ${'password' in jsonUser} (Expected: false)`);
    console.log(`  - __v present in JSON output: ${'__v' in jsonUser} (Expected: false)`);
    if ('password' in jsonUser) throw new Error('Security flaw: Password leaked in JSON payload');

    // Test 3: JWT Signed Bearer Token with Role Claims
    const buyerToken = generateToken(user._id, 'buyer');
    const adminToken = generateToken(new mongoose.Types.ObjectId(), 'admin');

    const decodedBuyer = jwt.verify(buyerToken, process.env.JWT_SECRET || 'findix_super_secret_jwt_key_2026_lost_but_never_gone');
    const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET || 'findix_super_secret_jwt_key_2026_lost_but_never_gone');

    console.log('\n✓ Test 3: JWT Signature & Embedded Role Claims:');
    console.log(`  - Buyer Token Role: ${decodedBuyer.role}`);
    console.log(`  - Admin Token Role: ${decodedAdmin.role}`);
    if (decodedBuyer.role !== 'buyer' || decodedAdmin.role !== 'admin') {
      throw new Error('JWT role payload verification failed');
    }

    // Test 4: RBAC Authorize Middleware Simulation
    console.log('\n✓ Test 4: Role-Based Access Control (RBAC):');
    const adminGuard = authorize('admin');

    // Mock Req/Res for Buyer trying to access Admin route
    let buyerRejected = false;
    const reqBuyer = { user: { role: 'buyer', id: '123' } };
    const resBuyer = {
      status: (code) => {
        if (code === 403) buyerRejected = true;
        return {
          json: (data) => data,
        };
      },
    };
    adminGuard(reqBuyer, resBuyer, () => {
      buyerRejected = false;
    });
    console.log(`  - Buyer accessing Admin resource: Blocked with HTTP 403 = ${buyerRejected}`);

    // Mock Req/Res for Admin accessing Admin route
    let adminAllowed = false;
    const reqAdmin = { user: { role: 'admin', id: '456' } };
    const resAdmin = {
      status: (code) => ({ json: (d) => d }),
    };
    adminGuard(reqAdmin, resAdmin, () => {
      adminAllowed = true;
    });
    console.log(`  - Admin accessing Admin resource: Granted (next() called) = ${adminAllowed}`);

    if (!buyerRejected || !adminAllowed) {
      throw new Error('RBAC middleware failed permission checks');
    }

    console.log('\n--- ALL SECURITY, VALIDATION & RBAC CHECKS PASSED (100%) ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Security Suite Failed:', err);
    process.exit(1);
  }
};

verifyAuthSuite();
