import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Check, 
  Copy,
  Scissors
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
    link.setAttribute('download', `Findix-42Sheet-${batchInfo?.batchId || 'BATCH'}-${Date.now()}.csv`);
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

  // Chunk tags into groups of 42 (1 chunk per A4 physical sheet)
  const tagChunks = [];
  for (let i = 0; i < tags.length; i += 42) {
    tagChunks.push(tags.slice(i, i + 42));
  }
  if (tagChunks.length === 0) {
    tagChunks.push([]);
  }

  return (
    <>
      {/* ========================================================= */}
      {/* EXACT A4 PRINT CSS: 42 CODES (6x7) ON EXACTLY 1 PAGE      */}
      {/* Zero overflow, light dashed cutting lines, tight spacing   */}
      {/* ========================================================= */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 1. Exact A4 Dimensions & Tight 4mm Margins */
          @page {
            size: A4 portrait;
            margin: 4mm 4mm 4mm 4mm !important;
          }

          /* 2. Reset html & body to prevent second page spill */
          html, body {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 3. Hide all screen UI */
          .no-print,
          .print\\:hidden,
          header,
          footer,
          nav,
          aside,
          .fixed {
            display: none !important;
          }

          /* 4. Root & ancestors reset */
          #root, #root > div, main {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
          }

          /* 5. Print Sheet Master Container */
          #findix-factory-print-sheet {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
          }

          /* 6. Page Sheet (Exactly 1 A4 Page per 42 codes) */
          .findix-a4-page-sheet {
            width: 100% !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-sheet-header {
            height: 3.5mm !important;
            max-height: 3.5mm !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            font-family: monospace !important;
            font-size: 7.5px !important;
            border-bottom: 0.5px solid #000 !important;
            margin-bottom: 1.2mm !important;
            padding-bottom: 0.5mm !important;
            line-height: 1 !important;
            box-sizing: border-box !important;
          }

          /* 7. 6x7 Grid: 6 columns x 7 rows (35.5mm height fits easily on Page 1!) */
          .findix-print-grid-42 {
            display: grid !important;
            grid-template-columns: repeat(6, 1fr) !important;
            grid-auto-rows: 35.5mm !important;
            gap: 1.2mm !important;
            width: 100% !important;
            box-sizing: border-box !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
          }

          /* 8. Dashed cutting line, centered tight QR and code */
          .print-card-item {
            height: 35.5mm !important;
            max-height: 35.5mm !important;
            box-sizing: border-box !important;
            border: 1px dashed #94a3b8 !important;
            border-radius: 3px !important;
            padding: 0.8mm 0.5mm !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            background: #ffffff !important;
            overflow: hidden !important;
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
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-cyan-600" />
                <span>Light dashed cutting guides · 42 codes fit on 1 A4 sheet without spilling.</span>
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
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
            <span className="font-mono text-[11px] text-slate-600">
              Dashed cutting guides · Zero thick borders · 42 codes per single A4 page · Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-semibold text-[10px]">Ctrl+P</kbd>
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
      {/* Exact 42 codes (6 x 7) on 1 single page with dashed lines  */}
      {/* ========================================================= */}
      <div id="findix-factory-print-sheet" className="hidden print:block bg-white text-black p-0 m-0">
        {tagChunks.map((chunk, pageIdx) => (
          <div 
            key={pageIdx} 
            className="findix-a4-page-sheet"
            style={{ 
              pageBreakAfter: pageIdx < tagChunks.length - 1 ? 'always' : 'auto',
              breakAfter: pageIdx < tagChunks.length - 1 ? 'page' : 'auto' 
            }}
          >
            {/* Minimal Factory Sheet Single-Line Header (Under 4mm height) */}
            <div className="print-sheet-header">
              <div className="font-bold tracking-wider text-[7.5px]">
                FINDIX FACTORY PRODUCTION SHEET · 42 CODES (6 × 7) · {batchCode}
              </div>
              <div className="text-[7px]">
                TOTAL: {tags.length} UNITS · SHEET {pageIdx + 1} OF {tagChunks.length} · {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* The 6 x 7 Printable Grid */}
            <div className="findix-print-grid-42">
              {chunk.map((tag, idx) => (
                <div key={tag._id || tag.qrSlug || idx} className="print-card-item">
                  <PrintCardItem
                    tag={tag}
                    isPrintMode={true}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/**
 * Individual QR Card Item calibrated for 42 codes per A4 page (6 x 7):
 * - Sharp QR code with central Findix Brand badge (ecc=H high redundancy)
 * - Alphanumeric Code with tight vertical spacing (FDX-KC01-0001)
 * - SCAN TO RETURN
 * - Light dashed cutting line (NO solid black border!)
 */
const PrintCardItem = ({
  tag,
  isPrintMode = false,
  onCopy,
  isCopied,
}) => {
  const url = `https://findix.pk/q/${tag.qrSlug}`;
  // High-redundancy QR code (Level H) allowing up to 30% center overlay without data loss
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}&ecc=H&margin=1`;

  if (isPrintMode) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-0 m-0 text-black bg-white select-none">
        {/* High-Resolution QR Graphic (23mm x 23mm) with Center Findix Badge */}
        <div className="relative w-[23mm] h-[23mm] flex items-center justify-center shrink-0">
          <img
            src={qrImageSrc}
            alt={tag.qrSlug}
            className="w-full h-full object-contain filter contrast-200"
            style={{ imageRendering: 'pixelated' }}
            loading="eager"
          />
          {/* Centered Branded Findix Badge */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-[1.2mm] py-[0.35mm] rounded-[1.5px] border-[0.6px] border-black flex items-center justify-center shadow-2xs pointer-events-none"
            style={{ backgroundColor: '#ffffff' }}
          >
            <span 
              className="font-sans font-black tracking-[0.4px] text-black leading-none uppercase select-none"
              style={{ fontSize: '3.8pt', fontWeight: 900 }}
            >
              FINDIX
            </span>
          </div>
        </div>

        {/* Minimal tight space between QR and alphanumeric code */}
        <div className="w-full text-center mt-[0.8mm] leading-none shrink-0">
          <div className="font-mono font-black text-[7.5pt] tracking-tight text-black leading-none">
            {tag.qrSlug}
          </div>
          <div className="font-mono uppercase font-bold tracking-wider text-[5pt] text-black leading-none mt-[0.5mm]">
            SCAN TO RETURN
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative bg-white text-black flex flex-col items-center justify-center text-center p-2 rounded-lg border border-dashed border-slate-300 shadow-2xs hover:border-cyan-600 transition-all"
      style={{
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
        color: '#000000',
      }}
    >
      {/* High-Resolution QR Graphic with Center Brand */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-0.5 mx-auto shrink-0">
        <img
          src={qrImageSrc}
          alt={tag.qrSlug}
          className="w-full h-full object-contain filter contrast-200"
          style={{ imageRendering: 'pixelated' }}
          loading="eager"
        />
        {/* Center Brand Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1.5 py-0.5 rounded-[3px] border border-slate-300 shadow-xs flex items-center justify-center pointer-events-none">
          <span className="font-display font-black text-[7px] sm:text-[8px] tracking-wider text-slate-900 uppercase leading-none">
            FINDIX
          </span>
        </div>
      </div>

      {/* Alphanumeric Code & SCAN TO RETURN */}
      <div className="w-full text-center mt-1 leading-tight shrink-0">
        <div className="font-mono font-black text-[10px] tracking-tight text-black">
          {tag.qrSlug}
        </div>
        <div className="font-mono uppercase font-bold tracking-wider text-[8px] text-slate-600 mt-0.5">
          SCAN TO RETURN
        </div>
      </div>

      {/* Copy Button (Only on screen preview, NEVER in print) */}
      {onCopy && (
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
