import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Printer, 
  ShieldCheck, 
  Tag, 
  Sparkles,
  QrCode
} from 'lucide-react';
import { Button } from '../ui/Button';

export const SingleQRModal = ({ isOpen, onClose, tag }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tag) return null;

  const url = `https://findix.pk/q/${tag.qrSlug}`;
  // High-redundancy QR code (Level H) allowing up to 30% center overlay without data loss
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(url)}&ecc=H&margin=1`;

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintSingle = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR - ${tag.qrSlug}</title>
          <style>
            @page { size: 50mm 50mm; margin: 2mm; }
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0; padding: 2mm; text-align: center; }
            .qr-box { position: relative; width: 32mm; height: 32mm; margin: 0 auto; display: flex; align-items: center; justify-content: center; }
            img { width: 32mm; height: 32mm; image-rendering: pixelated; }
            .center-brand { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ffffff; padding: 0.8mm 1.8mm; border: 0.7px solid #000000; border-radius: 2px; font-family: sans-serif; font-weight: 900; font-size: 5pt; letter-spacing: 0.5px; text-transform: uppercase; }
            .brand { font-size: 8pt; font-weight: 900; letter-spacing: 1px; margin-bottom: 1mm; }
            .code { font-size: 8pt; font-family: monospace; font-weight: bold; margin-top: 1mm; }
            .sub { font-size: 5.5pt; font-family: monospace; letter-spacing: 0.5px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="brand">FINDIX</div>
          <div class="qr-box">
            <img src="${qrImageSrc}" alt="${tag.qrSlug}" />
            <div class="center-brand">FINDIX</div>
          </div>
          <div class="code">${tag.qrSlug}</div>
          <div class="sub">SCAN TO RETURN</div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              QR Inspection &amp; Direct Preview
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Physical Card Simulation */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-2">
          <div className="text-[11px] font-black font-display tracking-widest text-slate-900">
            FINDIX
          </div>

          <div className="relative w-44 h-44 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
            <img
              src={qrImageSrc}
              alt={tag.qrSlug}
              className="w-full h-full object-contain filter contrast-125"
            />
            {/* Centered Branded Findix Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-0.5 rounded-[4px] border border-slate-400 shadow-xs flex items-center justify-center pointer-events-none">
              <span className="font-display font-black text-[9px] tracking-widest text-slate-900 uppercase leading-none">
                FINDIX
              </span>
            </div>
          </div>

          <div>
            <div className="font-mono font-black text-sm text-cyan-800 tracking-wider">
              {tag.qrSlug}
            </div>
            <div className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              SCAN TO RETURN
            </div>
          </div>
        </div>

        {/* Tag Details */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
            <span>Hardware Type:</span>
            <span className="font-semibold text-slate-900 capitalize">
              {tag.productType === 'sticker' ? 'Weatherproof Sticker' : 'Laser Metal Keychain'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
            <span>Batch Reference:</span>
            <span className="font-mono font-semibold text-cyan-700">
              {tag.batchId || 'Factory Standard'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
            <span>Status:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              tag.isLost
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : tag.status === 'claimed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {tag.isLost ? 'LOST ALERT ACTIVE' : tag.status === 'claimed' ? 'CLAIMED BY BUYER' : 'DUMMY (UNCLAIMED)'}
            </span>
          </div>

          {tag.itemName && (
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Bound Asset:</span>
              <span className="font-bold text-slate-900">{tag.itemName}</span>
            </div>
          )}

          {tag.ownerId?.email && (
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Owner Email:</span>
              <span className="font-mono text-slate-700 truncate max-w-[160px]">{tag.ownerId.email}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyUrl}
              className="flex-1 text-xs font-semibold border-slate-300"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1 text-slate-600" />}
              <span>{copied ? 'Copied URL!' : 'Copy Link'}</span>
            </Button>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="primary" size="sm" className="w-full text-xs font-bold bg-cyan-600 hover:bg-cyan-700">
                <span>Test Live</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Button>
            </a>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrintSingle}
            className="w-full text-xs text-slate-600 hover:text-slate-900"
          >
            <Printer className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>Print Single Physical Label</span>
          </Button>
        </div>

      </div>
    </div>
  );
};

export default SingleQRModal;

