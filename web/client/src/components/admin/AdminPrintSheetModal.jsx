import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Check, 
  Copy
} from 'lucide-react';
import { Button } from '../ui/Button';

export const AdminPrintSheetModal = ({ isOpen, onClose, tags = [], batchInfo = null }) => {
  const [copiedSlug, setCopiedSlug] = useState(null);

  if (!isOpen) return null;

  // Export CSV for Laser Machine Operator or Commercial Barcode Printers
  const handleExportCSV = () => {
    if (!tags || tags.length === 0) return;

    const headers = ['QR Slug', 'Full Activation URL', 'Product Type', 'Batch ID', 'Status', 'Generated Date'];
    const rows = tags.map((t) => [
      t.qrSlug,
      t.qrUrl || `https://findix.pk/q/${t.qrSlug}`,
      t.productType || 'keychain',
      t.batchId || batchInfo?.batchId || 'FACTORY-RUN',
      t.status || 'unclaimed',
      t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Findix-42Grid-${batchInfo?.batchId || 'BATCH'}-${Date.now()}.csv`);
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

  const batchCode = batchInfo?.batchId || tags[0]?.batchId || 'BATCH-PROD-42';
  const totalSheets = Math.ceil(tags.length / 42) || 1;

  return (
    <>
      {/* ========================================================= */}
      {/* PRINT-SPECIFIC CSS RULES                                  */}
      {/* Calibrated exactly for 42 Codes per A4 Page (6 x 7 Grid)  */}
      {/* ========================================================= */}
      <style>{`
        @media print {
          /* 1. Exact A4 Portrait Page Setup */
          @page {
            size: A4 portrait;
            margin: 8mm 6mm;
          }

          /* 2. Full reset on html and body */
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

          /* 5. 6x7 Grid: 6 columns per row, exactly 7 rows per A4 page */
          .findix-print-grid-42 {
            display: grid !important;
            grid-template-columns: repeat(6, 1fr) !important;
            gap: 2mm !important;
            width: 100% !important;
          }

          /* 6. Page-break pagination: Never slice any individual card */
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
                  A4 Print Sheet (42 Codes per Page · 6 × 7 Grid)
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                  {tags.length} Codes ({totalSheets} {totalSheets === 1 ? 'Sheet' : 'Sheets'})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Top sheet header · 6 columns × 7 rows per A4 page · Alphanumeric code &amp; SCAN TO RETURN.
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
                <span>Print A4 Sheet ({tags.length})</span>
              </Button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Screen Preview Container */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60">
            <div className="max-w-4xl mx-auto bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200">
              
              {/* Preview Header */}
              <div className="text-center pb-3 mb-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>PREVIEW MODE · A4 SHEET (6 × 7 = 42 CODES/PAGE)</span>
                <span>BATCH: {batchCode}</span>
                <span>TOTAL: {tags.length} CODES</span>
              </div>

              {/* Render the 6-column grid inside screen preview */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5">
                {tags.map((tag, idx) => (
                  <PrintCardItem
                    key={tag._id || tag.qrSlug || idx}
                    tag={tag}
                    onCopy={() => copyToClipboard(`https://findix.pk/q/${tag.qrSlug}`, tag.qrSlug)}
                    isCopied={copiedSlug === tag.qrSlug}
                    isPrintMode={false}
                  />
                ))}
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
            <span className="font-mono">
              Format: 42 codes per A4 sheet · Zero page clipping · Click "Print A4 Sheet" or press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-semibold">Ctrl+P</kbd>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="xs" onClick={onClose} className="border-slate-300">
                Cancel
              </Button>
              <Button variant="primary" size="xs" onClick={handleTriggerPrint} className="bg-cyan-600 hover:bg-cyan-700 font-bold">
                <Printer className="w-3.5 h-3.5 mr-1" />
                <span>Print Document</span>
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. THE CLEAN PRINTABLE SHEET (Visible ONLY when printing)  */}
      {/* Exact 42 codes (6 x 7) per A4 page with minimal top header */}
      {/* ========================================================= */}
      <div id="findix-factory-print-sheet" className="hidden print:block bg-white text-black p-0 m-0">
        
        {/* Minimal Factory Sheet Single-Line Header */}
        <div className="text-[9px] font-mono text-black border-b border-black pb-1 mb-2 flex items-center justify-between print-card-avoid-break">
          <div className="font-bold tracking-wider">
            FINDIX PRODUCTION FACTORY SHEET · 42 CODES (6 × 7) · {batchCode}
          </div>
          <div>
            TOTAL: {tags.length} UNITS · {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* The 6 x 7 Printable Grid */}
        <div
          className="findix-print-grid-42"
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '2mm',
          }}
        >
          {tags.map((tag, idx) => (
            <div key={tag._id || tag.qrSlug || idx} className="print-card-avoid-break">
              <PrintCardItem
                tag={tag}
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
 * Individual QR Card Item calibrated for 42 codes per A4 page (6 x 7):
 * - Sharp QR code
 * - Alphanumeric Code (e.g. FDX-8XNR-3CKX)
 * - SCAN TO RETURN
 */
const PrintCardItem = ({
  tag,
  isPrintMode = false,
  onCopy,
  isCopied,
}) => {
  const url = `https://findix.pk/q/${tag.qrSlug}`;
  // High-resolution crisp QR code
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}&margin=1`;

  return (
    <div
      className={`relative bg-white text-black flex flex-col items-center justify-between text-center border border-black rounded-lg transition-all ${
        isPrintMode
          ? 'h-[36.5mm] max-h-[36.5mm] p-1'
          : 'p-2 aspect-[1/1.18] shadow-2xs hover:border-cyan-600'
      }`}
      style={{
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
        color: '#000000',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      {/* High-Resolution QR Graphic */}
      <div className={`${isPrintMode ? 'w-[23mm] h-[23mm]' : 'w-16 h-16 sm:w-20 sm:h-20'} flex items-center justify-center p-0.5 mx-auto`}>
        <img
          src={qrImageSrc}
          alt={tag.qrSlug}
          className="w-full h-full object-contain filter contrast-200"
          style={{ imageRendering: 'pixelated' }}
          loading="eager"
        />
      </div>

      {/* Alphanumeric Code & SCAN TO RETURN */}
      <div className="w-full text-center leading-none space-y-0.5">
        <div className={`font-mono font-black tracking-tight text-black ${isPrintMode ? 'text-[7.5px]' : 'text-[10px]'}`}>
          {tag.qrSlug}
        </div>
        <div className={`font-mono uppercase font-bold tracking-wider text-black ${isPrintMode ? 'text-[6px]' : 'text-[8px]'}`}>
          SCAN TO RETURN
        </div>
      </div>

      {/* Copy Button (Only on screen preview, NEVER in print) */}
      {!isPrintMode && onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="absolute top-1 right-1 p-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] cursor-pointer no-print"
          title="Copy URL"
        >
          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
        </button>
      )}
    </div>
  );
};

export default AdminPrintSheetModal;
