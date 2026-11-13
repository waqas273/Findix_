import mongoose from 'mongoose';
import { 
  getCommunityPosts, 
  createCommunityPost, 
  toggleLikePost, 
  addComment 
} from '../controllers/communityController.js';

console.log('--- Starting Findix Community Hub & Feed Verification ---');

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

const runCommunityTests = async () => {
  try {
    const testUserId = new mongoose.Types.ObjectId();

    // 1. Test getCommunityPosts for City scope (Karachi)
    const req1 = { query: { scope: 'city', city: 'Karachi' } };
    const res1 = mockRes();
    await getCommunityPosts(req1, res1);

    if (!res1.jsonData.success || !res1.jsonData.data.posts) {
      throw new Error('Failed to get city posts');
    }
    console.log(`✓ getCommunityPosts (City: Karachi) returned ${res1.jsonData.data.posts.length} posts`);

    // 2. Test getCommunityPosts for Global scope
    const req2 = { query: { scope: 'global' } };
    const res2 = mockRes();
    await getCommunityPosts(req2, res2);

    if (!res2.jsonData.success || res2.jsonData.data.posts.length === 0) {
      throw new Error('Failed to get global posts');
    }
    console.log(`✓ getCommunityPosts (Global Feed) returned ${res2.jsonData.data.posts.length} posts`);

    // 3. Test createCommunityPost
    const req3 = {
      user: { _id: testUserId, name: 'Ali Ahmed', city: 'Gujranwala', role: 'buyer' },
      body: {
        content: 'Lost my car keys with Findix titanium fob near Gujranwala Cantt.',
        scope: 'city',
        city: 'Gujranwala',
        tag: 'Lost Alert',
      },
    };
    const res3 = mockRes();
    await createCommunityPost(req3, res3);

    if (!res3.jsonData.success || !res3.jsonData.data._id) {
      throw new Error('Failed to create community post');
    }
    const createdPost = res3.jsonData.data;
    console.log(`✓ createCommunityPost created post [${createdPost._id}] in ${createdPost.city}`);

    // 4. Test toggleLikePost
    const req4 = {
      params: { id: String(createdPost._id) },
      user: { _id: testUserId },
    };
    const res4 = mockRes();
    await toggleLikePost(req4, res4);
    if (!res4.jsonData.success) {
      throw new Error('toggleLikePost failed');
    }
    console.log(`✓ toggleLikePost succeeded: isLiked=${res4.jsonData.data.isLiked}, likesCount=${res4.jsonData.data.likesCount}`);

    // 5. Test addComment
    const req5 = {
      params: { id: String(createdPost._id) },
      user: { _id: testUserId, name: 'Ali Ahmed', city: 'Gujranwala' },
      body: { content: 'Update: Security guard spotted keys near gate 2!' },
    };
    const res5 = mockRes();
    await addComment(req5, res5);
    if (!res5.jsonData.success) {
      throw new Error('addComment failed');
    }
    console.log(`✓ addComment succeeded: "${res5.jsonData.data.content}"`);

    console.log('\n--- ALL COMMUNITY CONTROLLER & API TESTS PASSED ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Community Verification Error:', error);
    process.exit(1);
  }
};

runCommunityTests();
