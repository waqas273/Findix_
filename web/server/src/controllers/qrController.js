import QRCode from 'qrcode';
import { QrCode } from '../models/QrCode.js';
import { Item } from '../models/Item.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Generate or retrieve QR code payload
// @route   POST /api/qr/generate
// @access  Private
export const generateQrCode = async (req, res) => {
  try {
    const { code, itemId } = req.body;
    const qrIdentifier = code || `FDX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Target URL when scanned
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const scanTargetUrl = `${clientUrl}/scan/${qrIdentifier}`;

    // Generate QR Data URL
    const qrDataUrl = await QRCode.toDataURL(scanTargetUrl, {
      color: {
        dark: '#00F2FE', // Neon cyan
        light: '#0B0F17', // Obsidian
      },
      width: 400,
      margin: 2,
    });

    const newQr = await QrCode.create({
      code: qrIdentifier,
      owner: req.user.id,
      item: itemId || null,
      qrImageUrl: qrDataUrl,
    });

    return successResponse(res, 201, 'QR code generated successfully', {
      qr: newQr,
      scanUrl: scanTargetUrl,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Resolve public QR code payload (when finder scans an item)
// @route   GET /api/qr/resolve/:code
// @access  Public
export const resolveQrCode = async (req, res) => {
  try {
    const { code } = req.params;
    const qr = await QrCode.findOne({ code }).populate('item').populate('owner', 'name email phone');

    if (!qr) {
      return errorResponse(res, 404, 'Invalid or unregistered Findix QR tag');
    }

    // Increment scan analytics
    qr.scanCount += 1;
    qr.lastScannedAt = new Date();
    await qr.save();

    return successResponse(res, 200, 'QR tag resolved', {
      code: qr.code,
      item: qr.item,
      scanCount: qr.scanCount,
      lastScannedAt: qr.lastScannedAt,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
