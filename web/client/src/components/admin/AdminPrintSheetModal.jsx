import React, { useState } from 'react';
import { Printer, Download, X, QrCode, ExternalLink, Check, Copy, Tag, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export const AdminPrintSheetModal = ({ isOpen, onClose, tags = [], batchInfo = null }) => {
  const [printFormat, setPrintFormat] = useState('sticker'); // 'sticker' | 'keychain'
  const [copiedSlug, setCopiedSlug] = useState(null);

  if (!isOpen) return null;

  // Export CSV for Laser Machine Operator or Barcode Labelers
  const handleExportCSV = () => {
    if (!tags || tags.length === 0) return;

    const headers = ['QR Slug', 'Full Activation URL', 'Product Type', 'Batch ID', 'Status', 'Generated Date'];
    const rows = tags.map((t) => [
      t.qrSlug,
      t.qrUrl || `https://findix.pk/q/${t.qrSlug}`,
      t.productType || 'keychain',
      t.batchId || batchInfo?.batchId || 'N/A',
      t.status || 'unclaimed',
      t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Findix-QR-${batchInfo?.batchId || 'Batch'}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const copyToClipboard = (text, slug) => {
    navigator.clipboard.writeText(text);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header - Hidden in Print */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0 print:hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Factory QR Print & Production Sheet
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {tags.length} unique tags ready for laser engraving or sticker label printing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs font-semibold border-slate-300"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-slate-600" />
              <span>Export CSV</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleTriggerPrint}
              className="text-xs font-bold shadow-md bg-cyan-600 hover:bg-cyan-700"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              <span>Print Sheet (A4)</span>
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Format Selector Bar - Hidden in Print */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Target Template:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setPrintFormat('sticker')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  printFormat === 'sticker'
                    ? 'bg-white text-cyan-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Weatherproof Sticker Sheet (3-per-item)
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('keychain')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  printFormat === 'keychain'
                    ? 'bg-white text-cyan-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Laser Metal Keychain Grid
              </button>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            A4 Standard Grid · 300 DPI QR Codes
          </span>
        </div>

        {/* Printable Grid Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/50 print:bg-white print:p-0">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">
            {tags.map((tag, idx) => {
              const url = `https://findix.pk/q/${tag.qrSlug}`;
              const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}&margin=1`;
              const isCopied = copiedSlug === tag.qrSlug;

              return (
                <div
                  key={tag._id || tag.qrSlug || idx}
                  className={`relative p-3.5 bg-white rounded-2xl border transition-all flex flex-col items-center justify-between text-center space-y-2 shadow-xs print:shadow-none print:border-slate-300 print:rounded-xl ${
                    printFormat === 'keychain'
                      ? 'border-slate-300 aspect-square justify-center'
                      : 'border-cyan-200/80'
                  }`}
                >
                  {/* Brand Tag Top */}
                  <div className="flex items-center justify-between w-full px-1">
                    <div className="flex items-center gap-1">
                      <div className="w-3.5 h-3.5 rounded-full bg-cyan-50 border border-cyan-300 flex items-center justify-center p-0.5">
                        <img src="/logo.png" alt="F" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] font-black font-display tracking-wider text-slate-900">
                        FIND<span className="text-cyan-600">IX</span>
                      </span>
                    </div>
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-500 uppercase">
                      {printFormat === 'keychain' ? 'KEYCHAIN' : 'STICKER'}
                    </span>
                  </div>

                  {/* QR Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center shadow-2xs print:border-none print:p-0">
                    <img
                      src={qrImageSrc}
                      alt={`QR ${tag.qrSlug}`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* Identifier & Instructions */}
                  <div className="w-full space-y-0.5">
                    <div className="font-mono font-black text-xs text-slate-900 tracking-wider">
                      {tag.qrSlug}
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium leading-tight">
                      Scan with camera to activate
                    </div>
                  </div>

                  {/* Hover Copy Action - Hidden in Print */}
                  <div className="w-full pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] print:hidden">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(url, tag.qrSlug)}
                      className="text-cyan-700 hover:text-cyan-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                    </button>

                    <a
                      href={`/q/${tag.qrSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-700 inline-flex items-center gap-0.5"
                    >
                      <span>Test</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Footer info bar - Hidden in Print */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-slate-700">Factory Dispatch:</span>
            <span>Laser speed 120mm/s · Resolution 0.05mm · High-tack 3M Vinyl for stickers</span>
          </div>
          <Button variant="secondary" size="xs" onClick={onClose} className="border-slate-300">
            Close Preview
          </Button>
        </div>

      </div>
    </div>
  );
};

export default AdminPrintSheetModal;
