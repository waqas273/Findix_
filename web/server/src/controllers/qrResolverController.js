import { QRItem } from '../models/QRItem.js';
import { uploadToCloudinary } from '../utils/mediaService.js';
import { generateQrSlug } from '../utils/slugGenerator.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Public dynamic QR slug resolver with strict zero-leak privacy filtering
 * @route   GET /api/q/:qrSlug
 * @access  Public
 */
export const resolveQrSlug = async (req, res) => {
  try {
    const rawSlug = req.params.qrSlug;
    if (!rawSlug) {
      return errorResponse(res, 400, 'Please provide a valid Findix QR slug');
    }

    const cleanSlug = rawSlug.trim().toUpperCase();

    // Find the QR item by slug
    const qrItem = await QRItem.findOne({ qrSlug: cleanSlug }).populate(
      'ownerId',
      'name phone email city country'
    );

    // 1. Tag not found on the network
    if (!qrItem) {
      return res.status(404).json({
        success: false,
        isRegistered: false,
        message: `Findix tag '${cleanSlug}' was not found. Please verify the code or activate a new tag.`,
        qrSlug: cleanSlug,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Tag is unassigned / unclaimed
    if (qrItem.status === 'unclaimed') {
      return res.status(200).json({
        success: true,
        isClaimed: false,
        isRegistered: true,
        status: 'unclaimed',
        qrSlug: qrItem.qrSlug,
        message: 'This Findix recovery tag is authentic and unassigned. Sign in to register and protect an item with this tag.',
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Tag is inactive / revoked
    if (qrItem.status === 'inactive') {
      return res.status(403).json({
        success: false,
        isClaimed: true,
        status: 'inactive',
        qrSlug: qrItem.qrSlug,
        message: 'This Findix recovery tag has been deactivated by its owner.',
        timestamp: new Date().toISOString(),
      });
    }

    // 4. Tag is CLAIMED -> Apply Strict Zero-Leak Privacy Projection
    const owner = qrItem.ownerId || {};
    const privacy = qrItem.privacySettings || {
      showName: true,
      showPhone: false,
      showWhatsApp: true,
      allowInAppChat: true,
    };
    const custom = qrItem.customContact || {};

    // Filter contact details strictly based on privacy settings
    const contactInfo = {
      name: privacy.showName ? (owner.name || 'Findix Member') : 'Verified Item Owner',
      phone: privacy.showPhone ? (custom.phone || owner.phone || null) : null,
      whatsApp: privacy.showWhatsApp ? (custom.whatsApp || custom.phone || owner.phone || null) : null,
    };

    // Clean empty/null values
    if (!privacy.showPhone) delete contactInfo.phone;
    if (!privacy.showWhatsApp) delete contactInfo.whatsApp;

    const recoveryPayload = {
      isClaimed: true,
      status: qrItem.status,
      qrSlug: qrItem.qrSlug,
      itemName: qrItem.itemName || 'Protected Personal Valuables',
      itemImage: qrItem.itemImage?.url ? qrItem.itemImage : null,
      isLost: qrItem.isLost || false,
      returnRewardNote: qrItem.returnRewardNote || '',
      privacySettings: {
        showName: privacy.showName,
        showPhone: privacy.showPhone,
        showWhatsApp: privacy.showWhatsApp,
        allowInAppChat: privacy.allowInAppChat !== false,
      },
      contactInfo,
      // Metadata
      registeredAt: qrItem.createdAt,
    };

    return successResponse(res, 200, 'Tag resolved successfully', recoveryPayload);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Claim an unassigned QR slug and bind it to the logged-in user
 * @route   POST /api/q/claim/:qrSlug
 * @access  Private (protect)
 */
export const claimQrSlug = async (req, res) => {
  try {
    const rawSlug = req.params.qrSlug;
    const cleanSlug = (rawSlug || '').trim().toUpperCase();

    if (!cleanSlug) {
      return errorResponse(res, 400, 'QR slug is required');
    }

    // Look for existing tag or create a new unclaimed one if pre-generated
    let qrItem = await QRItem.findOne({ qrSlug: cleanSlug });

    if (qrItem && qrItem.status === 'claimed') {
      return errorResponse(res, 400, `Tag '${cleanSlug}' is already claimed by an owner.`);
    }

    if (!qrItem) {
      // Create new tag record if claiming a valid brand-new code
      qrItem = new QRItem({
        qrSlug: cleanSlug,
        status: 'unclaimed',
      });
    }

    const {
      itemName,
      returnRewardNote,
      privacySettings,
      customContact,
      isLost,
    } = req.body;

    // Handle optional image upload via Multer buffer or string payload
    let itemImage = qrItem.itemImage || { public_id: '', url: '' };
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'items');
      itemImage = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    } else if (req.body.itemImage && typeof req.body.itemImage === 'object') {
      itemImage = req.body.itemImage;
    }

    // Parse privacySettings if sent as JSON string in multipart form
    let parsedPrivacy = privacySettings;
    if (typeof privacySettings === 'string') {
      try {
        parsedPrivacy = JSON.parse(privacySettings);
      } catch (e) {
        parsedPrivacy = {};
      }
    }

    // Parse customContact if sent as JSON string
    let parsedContact = customContact;
    if (typeof customContact === 'string') {
      try {
        parsedContact = JSON.parse(customContact);
      } catch (e) {
        parsedContact = {};
      }
    }

    // Assign ownership and details
    qrItem.ownerId = req.user._id;
    qrItem.status = 'claimed';
    qrItem.itemName = itemName || 'Protected Valuables';
    qrItem.returnRewardNote = returnRewardNote || '';
    qrItem.itemImage = itemImage;
    qrItem.isLost = isLost === true || isLost === 'true';

    if (parsedPrivacy) {
      qrItem.privacySettings = {
        ...qrItem.privacySettings,
        ...parsedPrivacy,
      };
    }

    if (parsedContact) {
      qrItem.customContact = {
        ...qrItem.customContact,
        ...parsedContact,
      };
    }

    await qrItem.save();

    return successResponse(res, 201, 'Findix tag registered and claimed successfully', {
      qrItem,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Generate one or multiple new unassigned Findix QR slugs
 * @route   POST /api/q/generate
 * @access  Private (protect)
 */
export const generateQrTag = async (req, res) => {
  try {
    const { count = 1, customPrefix = 'FDX' } = req.body;
    const qty = Math.min(Math.max(Number(count) || 1, 1), 50);

    const generatedSlugs = [];
    for (let i = 0; i < qty; i++) {
      const slug = generateQrSlug(customPrefix);
      const newTag = await QRItem.create({
        qrSlug: slug,
        status: 'unclaimed',
        ownerId: null,
      });
      generatedSlugs.push(newTag);
    }

    return successResponse(res, 201, `${qty} Findix QR tag(s) generated successfully`, {
      tags: generatedSlugs,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
