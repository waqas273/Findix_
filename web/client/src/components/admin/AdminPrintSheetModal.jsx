import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  QrCode, 
  Check, 
  Copy, 
  Sliders, 
  Maximize2, 
  Grid, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Button } from '../ui/Button';

export const AdminPrintSheetModal = ({ isOpen, onClose, tags = [], batchInfo = null }) => {
  // Detect default template based on batch data
  const initialFormat = 
    tags[0]?.productType === 'keychain' || batchInfo?.batchId?.includes('KEYCHAIN')
      ? 'keychain'
      : 'sticker';

  const [printFormat, setPrintFormat] = useState(initialFormat);
  const [gridDensity, setGridDensity] = useState('24'); // '24' (4x6) | '12' (3x4)
  const [showLaserJig, setShowLaserJig] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState(null);

  useEffect(() => {
    if (tags.length > 0) {
      const isKeychain = tags[0]?.productType === 'keychain' || batchInfo?.batchId?.includes('KEYCHAIN');
      setPrintFormat(isKeychain ? 'keychain' : 'sticker');
    }
  }, [tags, batchInfo]);

  if (!isOpen) return null;

  // Export CSV for Laser Machine Operator or Commercial Barcode Printers
  const handleExportCSV = () => {
    if (!tags || tags.length === 0) return;

    const headers = ['QR Slug', 'Full Activation URL', 'Product Type', 'Batch ID', 'Status', 'Generated Date'];
    const rows = tags.map((t) => [
      t.qrSlug,
      t.qrUrl || `https://findix.pk/q/${t.qrSlug}`,
      t.productType || (printFormat === 'keychain' ? 'keychain' : 'sticker'),
      t.batchId || batchInfo?.batchId || 'FACTORY-RUN',
      t.status || 'unclaimed',
      t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Findix-${printFormat.toUpperCase()}-${batchInfo?.batchId || 'BATCH'}-${Date.now()}.csv`);
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

  const batchCode = batchInfo?.batchId || tags[0]?.batchId || 'BATCH-PROD-2026';

  return (
    <>
      {/* ========================================================= */}
      {/* PRINT-SPECIFIC CSS RULES                                  */}
      {/* Ensures normal page flow & eliminates row-cutting issues! */}
      {/* ========================================================= */}
      <style>{`
        @media print {
          /* 1. Standard A4 Page Setup */
          @page {
            size: A4 portrait;
            margin: 10mm 8mm;
          }

          /* 2. Full reset on body/html */
          html, body, #root, #root > div {
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 3. Hide all non-print screen elements */
          .no-print,
          .print\\:hidden,
          header,
          footer,
          nav,
          .fixed {
            display: none !important;
          }

          /* 4. Normal document flow for printable sheet */
          #findix-factory-print-sheet {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
          }

          /* 5. NEVER cut a label card in half across page boundaries */
          .print-card-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            page-break-after: auto !important;
            display: block !important;
          }
        }
      `}</style>

      {/* Screen Modal Container (Hidden during physical print) */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in no-print">
        <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
          
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/90 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                  Factory Print & Laser Production Sheet
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                  {tags.length} Codes
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Formatted specifically for laser engraving machines (LightBurn/EzCad) and A4 sticker sheets.
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

          {/* Production Controls Bar */}
          <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            
            {/* Format Selector */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Target Hardware:</span>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPrintFormat('keychain')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    printFormat === 'keychain'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Laser Metal Keychain (High-Contrast B&W)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFormat('sticker')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    printFormat === 'sticker'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Weatherproof Stickers (Pack Sheet)
                </button>
              </div>
            </div>

            {/* Density & Alignment Toggles */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span>Density:</span>
                <select
                  value={gridDensity}
                  onChange={(e) => setGridDensity(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="24">Standard (4 columns / 16-24 per A4)</option>
                  <option value="12">Large (3 columns / 12 per A4)</option>
                </select>
              </div>

              {printFormat === 'keychain' && (
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={showLaserJig}
                    onChange={(e) => setShowLaserJig(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-0 cursor-pointer"
                  />
                  <span>Show Jig Guide Outline</span>
                </label>
              )}
            </div>

          </div>

          {/* Interactive Screen Preview Container */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60">
            <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-center pb-4 mb-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>PREVIEW MODE · A4 SHEET</span>
                <span>BATCH: {batchCode}</span>
                <span>TOTAL: {tags.length} UNITS</span>
              </div>

              {/* Render the grid inside preview */}
              <div
                className={`grid gap-3.5 ${
                  gridDensity === '24'
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                    : 'grid-cols-2 sm:grid-cols-3'
                }`}
              >
                {tags.map((tag, idx) => (
                  <LabelCard
                    key={tag._id || tag.qrSlug || idx}
                    tag={tag}
                    printFormat={printFormat}
                    showLaserJig={showLaserJig}
                    gridDensity={gridDensity}
                    onCopy={() => copyToClipboard(`https://findix.pk/q/${tag.qrSlug}`, tag.qrSlug)}
                    isCopied={copiedSlug === tag.qrSlug}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
            <span className="font-mono">
              Ready for physical printing: Click "Print Sheet (A4)" or press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-semibold">Ctrl+P</kbd>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="xs" onClick={onClose} className="border-slate-300">
                Cancel
              </Button>
              <Button variant="primary" size="xs" onClick={handleTriggerPrint} className="bg-cyan-600 hover:bg-cyan-700">
                <Printer className="w-3.5 h-3.5 mr-1" />
                <span>Print Document</span>
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. THE CLEAN PRINTABLE SHEET (Visible ONLY when printing)  */}
      {/* Normal in-flow block so the browser paginates without cuts */}
      {/* ========================================================= */}
      <div id="findix-factory-print-sheet" className="hidden print:block bg-white text-black p-0 m-0">
        
        {/* Minimal Factory Sheet Identification Header */}
        <div className="text-[10px] font-mono text-black border-b border-black pb-1 mb-2.5 flex items-center justify-between print-card-avoid-break">
          <div className="font-bold tracking-wider">
            FINDIX PRODUCTION FACTORY SHEET · {printFormat === 'keychain' ? 'LASER METAL KEYCHAIN' : 'WEATHERPROOF QR STICKERS'}
          </div>
          <div>
            BATCH: {batchCode} · {tags.length} UNITS · {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* The Clean Printable Grid */}
        <div
          className={`grid gap-3 ${
            gridDensity === '24'
              ? 'grid-cols-4'
              : 'grid-cols-3'
          }`}
          style={{
            width: '100%',
            display: 'grid',
          }}
        >
          {tags.map((tag, idx) => (
            <div key={tag._id || tag.qrSlug || idx} className="print-card-avoid-break">
              <LabelCard
                tag={tag}
                printFormat={printFormat}
                showLaserJig={showLaserJig}
                gridDensity={gridDensity}
                isPrintMode={true}
              />
            </div>
          ))}
        </div>

      </div>
    </>
  );
};

/**
 * Individual Label Component (Renders Laser Engraving format or Sticker format)
 * Calibrated specifically so 4 rows fit on A4 without touching the bottom boundary!
 */
const LabelCard = ({
  tag,
  printFormat,
  showLaserJig = true,
  gridDensity = '24',
  isPrintMode = false,
  onCopy,
  isCopied,
}) => {
  const url = `https://findix.pk/q/${tag.qrSlug}`;
  // High-resolution crisp QR code (300 DPI friendly)
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(url)}&margin=1`;

  // =============================================================
  // 1. LASER METAL KEYCHAIN TEMPLATE (Pure B&W for Laser Cutters)
  // =============================================================
  if (printFormat === 'keychain') {
    return (
      <div
        className={`relative bg-white text-black flex flex-col items-center justify-between text-center transition-all ${
          showLaserJig
            ? 'border-2 border-black rounded-2xl'
            : 'border border-dashed border-slate-300 rounded-xl'
        } ${
          gridDensity === '24' 
            ? 'p-2 sm:p-2.5 h-[55mm] max-h-[55mm]' 
            : 'p-3 h-[64mm] max-h-[64mm]'
        } ${!isPrintMode ? 'shadow-2xs hover:border-cyan-500' : ''}`}
        style={{
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          color: '#000000',
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
        }}
      >
        {/* Brand Top */}
        <div className="w-full flex items-center justify-center pt-0.5">
          <span className="font-display font-black text-[11px] tracking-widest text-black uppercase">
            FINDIX
          </span>
        </div>

        {/* Pure Contrast QR Graphic */}
        <div className="w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center p-0.5 my-auto">
          <img
            src={qrImageSrc}
            alt={tag.qrSlug}
            className="w-full h-full object-contain filter contrast-200"
            style={{ imageRendering: 'pixelated' }}
            loading="eager"
          />
        </div>

        {/* Serial Slug & Laser Alignment Instruction */}
        <div className="w-full pb-0.5">
          <div className="font-mono font-black text-[11px] tracking-wider text-black">
            {tag.qrSlug}
          </div>
          <div className="text-[7.5px] font-mono uppercase tracking-widest text-black/80 font-bold">
            SCAN TO RETURN
          </div>
        </div>

        {/* Copy Button (Only on screen preview, NEVER in print) */}
        {!isPrintMode && onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="absolute top-1 right-1 p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] cursor-pointer no-print"
            title="Copy URL"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    );
  }

  // =============================================================
  // 2. WEATHERPROOF STICKER TEMPLATE (Color / Cut Guides)
  // =============================================================
  return (
    <div
      className={`relative bg-white flex flex-col items-center justify-between text-center rounded-2xl border border-dashed border-slate-400 transition-all ${
        gridDensity === '24' 
          ? 'p-2 sm:p-2.5 h-[55mm] max-h-[55mm]' 
          : 'p-3 h-[64mm] max-h-[64mm]'
      } ${!isPrintMode ? 'shadow-xs hover:border-cyan-500' : 'print:border-slate-400'}`}
      style={{
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between w-full px-0.5 pt-0.5">
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-50 border border-cyan-400 flex items-center justify-center p-0.5">
            <img src="/logo.png" alt="F" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-black text-[10px] tracking-wider text-slate-900">
            FIND<span className="text-cyan-600">IX</span>
          </span>
        </div>
        <span className="text-[7.5px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-bold uppercase">
          STICKER
        </span>
      </div>

      {/* QR Code */}
      <div className="w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center p-0.5 my-auto">
        <img
          src={qrImageSrc}
          alt={tag.qrSlug}
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>

      {/* Serial ID & Instructions */}
      <div className="w-full pb-0.5 space-y-0.5">
        <div className="font-mono font-black text-[11px] text-slate-900 tracking-wider">
          {tag.qrSlug}
        </div>
        <div className="text-[8px] font-medium text-slate-600 leading-tight">
          Scan with camera to link / return
        </div>
      </div>

      {/* Copy Button (Only on screen preview, NEVER in print) */}
      {!isPrintMode && onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="absolute top-1.5 right-1.5 p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] cursor-pointer no-print"
          title="Copy URL"
        >
          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
};

export default AdminPrintSheetModal;
