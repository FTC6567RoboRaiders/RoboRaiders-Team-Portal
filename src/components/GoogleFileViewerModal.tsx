import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  Table, 
  Presentation, 
  Code, 
  Box, 
  FileCheck, 
  Search, 
  Eye, 
  Sparkles, 
  Globe,
  Share2
} from 'lucide-react';
import { JournalImage } from '../types';

interface GoogleFileViewerModalProps {
  file: JournalImage | null;
  onClose: () => void;
  showToast?: (message: string, type: 'success' | 'danger' | 'info') => void;
}

export const GoogleFileViewerModal: React.FC<GoogleFileViewerModalProps> = ({
  file,
  onClose,
  showToast
}) => {
  if (!file) return null;

  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [sheetSearchQuery, setSheetSearchQuery] = useState('');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docViewMode, setDocViewMode] = useState<'doc' | 'text'>('doc');
  const [copied, setCopied] = useState(false);

  const isWord = file.fileCategory === 'ms_word' || file.googleDocType === 'doc' || file.name.endsWith('.docx') || file.name.endsWith('.doc');
  const isExcel = file.fileCategory === 'ms_excel' || file.googleDocType === 'sheet' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
  const isPowerPoint = file.fileCategory === 'ms_powerpoint' || file.googleDocType === 'slide' || file.name.endsWith('.pptx') || file.name.endsWith('.ppt');
  const isCad = file.fileCategory === 'cad';
  const isCode = file.fileCategory === 'code';
  const isPdf = file.fileCategory === 'pdf' || file.name.endsWith('.pdf');
  const isImage = file.fileCategory === 'image' || file.dataUrl?.startsWith('data:image/');

  const sheets = file.extractedSheets || {};
  const sheetNames = file.sheetNames && file.sheetNames.length > 0 
    ? file.sheetNames 
    : Object.keys(sheets).length > 0 
      ? Object.keys(sheets) 
      : ['Sheet1'];

  const currentSheetName = sheetNames[activeSheetIndex] || sheetNames[0];
  const currentSheetRows: any[][] = useMemo(() => {
    const raw = sheets[currentSheetName] || [];
    if (!sheetSearchQuery.trim()) return raw;
    const query = sheetSearchQuery.toLowerCase();
    return raw.filter((row: any[]) => 
      Array.isArray(row) && row.some(cell => String(cell || '').toLowerCase().includes(query))
    );
  }, [sheets, currentSheetName, sheetSearchQuery]);

  // Helper for column letter headers: 0 -> A, 25 -> Z, 26 -> AA
  const getColLetter = (index: number): string => {
    let letter = '';
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (showToast) showToast('Copied content to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    const rows = sheets[currentSheetName] || [];
    if (rows.length === 0) {
      if (showToast) showToast('No rows to export in current sheet.', 'info');
      return;
    }
    const csvContent = rows
      .map((row: any[]) => 
        (row || []).map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, '')}_${currentSheetName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast(`Exported ${currentSheetName} to CSV`, 'success');
  };

  const handleDownloadOriginal = () => {
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    a.click();
    if (showToast) showToast(`Downloading ${file.name}`, 'info');
  };

  const handleOpenGoogle = () => {
    if (isWord) {
      window.open('https://docs.google.com/document/u/0/', '_blank');
    } else if (isExcel) {
      window.open('https://docs.google.com/spreadsheets/u/0/', '_blank');
    } else if (isPowerPoint) {
      window.open('https://docs.google.com/presentation/u/0/', '_blank');
    } else if (file.googleViewUrl) {
      window.open(file.googleViewUrl, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className={`px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 text-white ${
          isWord 
            ? 'bg-blue-600 border-blue-700' 
            : isExcel 
              ? 'bg-emerald-600 border-emerald-700' 
              : isPowerPoint 
                ? 'bg-amber-600 border-amber-700' 
                : 'bg-slate-900 border-slate-800'
        }`}>
          {/* File Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-xs border border-white/20">
              {isWord && <FileText className="w-5 h-5 text-white" />}
              {isExcel && <Table className="w-5 h-5 text-white" />}
              {isPowerPoint && <Presentation className="w-5 h-5 text-white" />}
              {isCad && <Box className="w-5 h-5 text-white" />}
              {isCode && <Code className="w-5 h-5 text-white" />}
              {isPdf && <FileText className="w-5 h-5 text-white" />}
              {isImage && <Eye className="w-5 h-5 text-white" />}
              {!isWord && !isExcel && !isPowerPoint && !isCad && !isCode && !isPdf && !isImage && <FileCheck className="w-5 h-5 text-white" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                  {file.googleDocTitle || file.name}
                </h3>
                
                {file.isGoogleConverted && (
                  <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full tracking-wider border border-white/30 shrink-0">
                    <Sparkles className="w-3 h-3" />
                    {isWord && 'Google Doc Format'}
                    {isExcel && 'Google Sheet Format'}
                    {isPowerPoint && 'Google Slide Format'}
                  </span>
                )}

                <span className="text-[10px] font-mono text-white/80 shrink-0">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>

              <p className="text-[11px] text-white/85 font-medium flex items-center gap-1 mt-0.5">
                <Globe className="w-3 h-3 shrink-0" />
                <span>Accessible Google File • Open &amp; free to be seen for anyone</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {(isWord || isExcel || isPowerPoint) && (
              <button
                type="button"
                onClick={handleOpenGoogle}
                className="flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                title="Open in Google Workspace"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isWord ? 'Open in Google Docs' : isExcel ? 'Open in Google Sheets' : 'Open in Google Slides'}
                </span>
                <span className="sm:hidden">Google</span>
              </button>
            )}

            {isExcel && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition border border-white/20 cursor-pointer"
                title="Export active sheet as CSV"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Export CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadOriginal}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition border border-white/20 cursor-pointer"
              title="Download original file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition border border-white/20 cursor-pointer ml-1"
              title="Close viewer (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SUB-HEADER / NOTIFICATION BANNER */}
        <div className="px-4 sm:px-6 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-[11px] sm:text-xs">
              {isWord && 'Auto-converted from Microsoft Word (.docx) into an open Google Doc.'}
              {isExcel && 'Auto-converted from Microsoft Excel (.xlsx) into an interactive Google Sheet.'}
              {isPowerPoint && 'Auto-converted from Microsoft PowerPoint (.pptx) into an accessible Google Slide deck.'}
              {isCad && '3D CAD Engineering Model asset. Free to view metadata and download.'}
              {isCode && `Robotics Code file: ${file.codeLanguage || 'Source Script'}.`}
              {isPdf && 'PDF Document attached to engineering log.'}
              {isImage && 'Session photograph / engineering diagram.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              Publicly Accessible
            </span>
          </div>
        </div>

        {/* MAIN VIEWER CANVAS */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 flex flex-col items-center">
          
          {/* ================= 1. GOOGLE DOCS (MS WORD CONVERTED) ================= */}
          {isWord && (
            <div className="w-full max-w-3xl flex flex-col gap-4">
              {/* Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search document..."
                      value={docSearchQuery}
                      onChange={(e) => setDocSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 w-44 sm:w-60"
                    />
                  </div>

                  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDocViewMode('doc')}
                      className={`px-2.5 py-1 rounded-md transition ${docViewMode === 'doc' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      Doc View
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocViewMode('text')}
                      className={`px-2.5 py-1 rounded-md transition ${docViewMode === 'text' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      Raw Text
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyText(file.extractedText || '')}
                    className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Google Doc Clean White Page Canvas */}
              <div className="bg-white text-slate-900 border border-slate-200 rounded-xl shadow-lg p-8 sm:p-12 min-h-[500px] w-full select-text transition-all font-sans leading-relaxed">
                <div className="border-b border-slate-200 pb-4 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {file.googleDocTitle || file.name}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-2">
                    <span>DOCUMENT SOURCE: Microsoft Word (.docx)</span>
                    <span>•</span>
                    <span>FORMAT: Google Doc Web Reader</span>
                  </div>
                </div>

                {docViewMode === 'doc' ? (
                  file.extractedHtml ? (
                    <div 
                      className="prose prose-slate max-w-none prose-headings:font-black prose-h1:text-xl prose-h2:text-lg prose-table:border prose-td:border prose-td:p-2 prose-th:border prose-th:bg-slate-100 text-slate-800"
                      dangerouslySetInnerHTML={{ __html: file.extractedHtml }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-slate-800 font-sans leading-relaxed">
                      {file.extractedText || 'No text extracted.'}
                    </div>
                  )
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {file.extractedText || 'No text extracted.'}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* ================= 2. GOOGLE SHEETS (MS EXCEL CONVERTED) ================= */}
          {isExcel && (
            <div className="w-full flex flex-col gap-3">
              {/* Sheet Control Bar */}
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 flex-wrap">
                {/* Search in Sheet */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search in ${currentSheetName}...`}
                    value={sheetSearchQuery}
                    onChange={(e) => setSheetSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 w-48 sm:w-64"
                  />
                  {sheetSearchQuery && (
                    <button
                      onClick={() => setSheetSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Sheet Metadata */}
                <div className="text-xs font-mono text-slate-500 flex items-center gap-3">
                  <span>Sheet: <strong>{currentSheetName}</strong></span>
                  <span>•</span>
                  <span>{currentSheetRows.length} Rows</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Google Sheet View</span>
                </div>
              </div>

              {/* Interactive Spreadsheet Table Container */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-x-auto max-h-[600px] select-text">
                {currentSheetRows.length > 0 ? (
                  <table className="w-full border-collapse text-xs font-sans text-left">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 z-10 border-b border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-black uppercase tracking-wider">
                        {/* Row number column header */}
                        <th className="w-12 px-2 py-1.5 text-center bg-slate-200 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700">#</th>
                        {Array.from({ length: Math.max(...currentSheetRows.map(r => (r || []).length), 1) }).map((_, colIdx) => (
                          <th key={colIdx} className="px-3 py-1.5 border-r border-slate-300 dark:border-slate-700 min-w-[120px]">
                            {getColLetter(colIdx)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {currentSheetRows.map((row: any[], rowIdx: number) => {
                        const isHeader = rowIdx === 0 && !sheetSearchQuery;
                        return (
                          <tr 
                            key={rowIdx} 
                            className={`hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors ${
                              isHeader ? 'bg-slate-50 dark:bg-slate-850 font-bold' : ''
                            }`}
                          >
                            {/* Row number index */}
                            <td className="px-2 py-1.5 text-center font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-850 border-r border-slate-200 dark:border-slate-800 select-none">
                              {rowIdx + 1}
                            </td>
                            {row.map((cellVal: any, colIdx: number) => (
                              <td 
                                key={colIdx} 
                                className="px-3 py-1.5 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 truncate max-w-xs"
                                title={String(cellVal ?? '')}
                              >
                                {cellVal !== null && cellVal !== undefined ? String(cellVal) : ''}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center text-slate-400 font-mono text-xs">
                    {sheetSearchQuery ? `No rows matched query "${sheetSearchQuery}"` : 'Empty sheet content'}
                  </div>
                )}
              </div>

              {/* Sheet Tabs Bar (Authentic Google Sheets style at bottom) */}
              {sheetNames.length > 1 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto shadow-xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 px-2">Tabs:</span>
                  {sheetNames.map((name, idx) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setActiveSheetIndex(idx);
                        setSheetSearchQuery('');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        activeSheetIndex === idx 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Table className="w-3 h-3" />
                      <span>{name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 3. GOOGLE SLIDES (MS POWERPOINT CONVERTED) ================= */}
          {isPowerPoint && (
            <div className="w-full max-w-3xl flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[420px]">
                <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-md">
                  <Presentation className="w-10 h-10" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
                  {file.googleDocTitle || file.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                  Converted from Microsoft PowerPoint (.pptx) into Google Slides. Accessible and free to be seen and edited by any team member or reviewer.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenGoogle}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in Google Slides</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadOriginal}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PPTX</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. CAD / 3D MODEL FILES ================= */}
          {isCad && (
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <Box className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">
                {file.name}
              </h2>
              <span className="text-[11px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full mb-4 border border-indigo-200 dark:border-indigo-800">
                {file.cadInfo?.extension || '3D CAD Asset'} • {(file.size / 1024).toFixed(1)} KB
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                Robot CAD geometry and assembly model. Compatible with Onshape, Autodesk Fusion 360, SolidWorks, and PTC Creo.
              </p>

              <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-6 text-left">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">CAD Model Metadata:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                  <div>Model Name: <span className="font-bold text-slate-900 dark:text-white">{file.name}</span></div>
                  <div>Format: <span className="font-bold text-slate-900 dark:text-white">{file.cadInfo?.extension || 'STEP/STL'}</span></div>
                  <div>File Size: <span className="font-bold text-slate-900 dark:text-white">{(file.size / 1024).toFixed(1)} KB</span></div>
                  <div>Attached Date: <span className="font-bold text-slate-900 dark:text-white">{new Date(file.createdAt || Date.now()).toLocaleDateString()}</span></div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadOriginal}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download CAD Geometry File</span>
              </button>
            </div>
          )}

          {/* ================= 5. ROBOTICS CODE / SCRIPTS ================= */}
          {isCode && (
            <div className="w-full max-w-4xl flex flex-col gap-3">
              <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-300">
                    <Code className="w-4 h-4 text-sky-400" />
                    <span>{file.name}</span>
                    <span className="text-[10px] text-slate-500">({file.codeLanguage || 'Source Code'})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(file.extractedText || '')}
                    className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-xs font-mono text-sky-200 leading-relaxed max-h-[550px] select-text">
                  <code>{file.extractedText || '// Code loaded'}</code>
                </pre>
              </div>
            </div>
          )}

          {/* ================= 6. PDF DOCUMENTS ================= */}
          {isPdf && (
            <div className="w-full max-w-4xl flex flex-col gap-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden p-4 flex flex-col items-center">
                <iframe 
                  src={file.dataUrl} 
                  title={file.name} 
                  className="w-full h-[580px] rounded-lg border border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>
          )}

          {/* ================= 7. IMAGES ================= */}
          {isImage && (
            <div className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center">
              <img 
                src={file.dataUrl} 
                alt={file.name} 
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800" 
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-mono text-slate-400 mt-2">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          {/* ================= 8. OTHER FORMATS ================= */}
          {!isWord && !isExcel && !isPowerPoint && !isCad && !isCode && !isPdf && !isImage && (
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 mb-4">
                <FileCheck className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-1">{file.name}</h2>
              <span className="text-xs font-mono text-slate-500 mb-4">{(file.size / 1024).toFixed(1)} KB</span>
              <p className="text-xs text-slate-500 mb-6">File stored in FTC robotics engineering notebook log repository.</p>
              <button
                type="button"
                onClick={handleDownloadOriginal}
                className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
