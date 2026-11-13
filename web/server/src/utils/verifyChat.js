import mongoose from 'mongoose';
import { 
  getConversations, 
  initiateConversation, 
  getMessages, 
  sendMessage, 
  markAsRead 
} from '../controllers/chatController.js';

console.log('--- Starting Findix In-App Messaging & Chat Verification ---');

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

const runChatTests = async () => {
  try {
    const testOwnerId = new mongoose.Types.ObjectId();
    const testFinderId = new mongoose.Types.ObjectId();

    // 1. Test initiateConversation
    const req1 = {
      user: { _id: testFinderId, name: 'Farhan Ali (Finder)' },
      body: {
        qrSlug: 'FDX-8821-PRO',
        initialMessage: 'Hi, I found your MacBook Pro in Clifton!',
      },
    };
    const res1 = mockRes();
    await initiateConversation(req1, res1);

    if (!res1.jsonData.success || !res1.jsonData.data._id) {
      throw new Error('initiateConversation failed');
    }
    const conv = res1.jsonData.data;
    console.log(`✓ initiateConversation created/retrieved conversation [${conv._id}]`);

    // 2. Test sendMessage (from Finder)
    const req2 = {
      user: { _id: testFinderId },
      body: {
        conversationId: String(conv._id),
        content: '📍 Shared Location: Dolmen Mall Customer Helpdesk counter 3.',
      },
    };
    const res2 = mockRes();
    await sendMessage(req2, res2);

    if (!res2.jsonData.success || !res2.jsonData.data._id) {
      throw new Error('sendMessage failed');
    }
    console.log(`✓ sendMessage sent message: "${res2.jsonData.data.content}"`);

    // 3. Test getMessages
    const req3 = {
      user: { _id: testOwnerId },
      params: { id: String(conv._id) },
    };
    const res3 = mockRes();
    await getMessages(req3, res3);

    if (!res3.jsonData.success || !res3.jsonData.data.length) {
      throw new Error('getMessages failed');
    }
    console.log(`✓ getMessages retrieved ${res3.jsonData.data.length} messages`);

    // 4. Test markAsRead
    const req4 = {
      user: { _id: testOwnerId },
      params: { id: String(conv._id) },
    };
    const res4 = mockRes();
    await markAsRead(req4, res4);
    if (!res4.jsonData.success) {
      throw new Error('markAsRead failed');
    }
    console.log('✓ markAsRead updated conversation read status');

    // 5. Test getConversations
    const req5 = { user: { _id: testOwnerId } };
    const res5 = mockRes();
    await getConversations(req5, res5);
    if (!res5.jsonData.success || !res5.jsonData.data.length) {
      throw new Error('getConversations failed');
    }
    console.log(`✓ getConversations returned ${res5.jsonData.data.length} active channels`);

    console.log('\n--- ALL CHAT & IN-APP MESSAGING TESTS PASSED ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Chat Verification Error:', error);
    process.exit(1);
  }
};

runChatTests();
