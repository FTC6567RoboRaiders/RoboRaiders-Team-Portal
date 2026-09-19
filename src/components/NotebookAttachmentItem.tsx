import React from 'react';
import { 
  FileText, 
  Table, 
  Presentation, 
  Box, 
  Code, 
  FileCheck, 
  Eye, 
  Sparkles, 
  Trash2, 
  Download, 
  ExternalLink 
} from 'lucide-react';
import { JournalImage } from '../types';

interface NotebookAttachmentItemProps {
  file: JournalImage;
  onOpenViewer: (file: JournalImage) => void;
  onRemove?: (id: string) => void;
  isEditable?: boolean;
}

export const NotebookAttachmentItem: React.FC<NotebookAttachmentItemProps> = ({
  file,
  onOpenViewer,
  onRemove,
  isEditable = false
}) => {
  const isWord = file.fileCategory === 'ms_word' || file.googleDocType === 'doc' || file.name.endsWith('.docx') || file.name.endsWith('.doc');
  const isExcel = file.fileCategory === 'ms_excel' || file.googleDocType === 'sheet' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
  const isPowerPoint = file.fileCategory === 'ms_powerpoint' || file.googleDocType === 'slide' || file.name.endsWith('.pptx') || file.name.endsWith('.ppt');
  const isCad = file.fileCategory === 'cad';
  const isCode = file.fileCategory === 'code';
  const isPdf = file.fileCategory === 'pdf' || file.name.endsWith('.pdf');
  const isImage = file.fileCategory === 'image' || (file.dataUrl && file.dataUrl.startsWith('data:image/'));

  return (
    <div 
      onClick={() => onOpenViewer(file)}
      className="group relative border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-xs hover:shadow-md hover:border-slate-400 dark:hover:border-slate-700 transition cursor-pointer select-none"
    >
      {/* Left Icon / Thumbnail */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative shrink-0">
          {isImage ? (
            <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <img 
                src={file.dataUrl} 
                alt={file.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition" 
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center shadow-xs border ${
              isWord 
                ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-400' 
                : isExcel 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-400' 
                  : isPowerPoint 
                    ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-400' 
                    : isCad 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-400' 
                      : isCode 
                        ? 'bg-sky-50 border-sky-200 text-sky-600 dark:bg-sky-950/60 dark:border-sky-800 dark:text-sky-400' 
                        : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}>
              {isWord && <FileText className="w-5 h-5" />}
              {isExcel && <Table className="w-5 h-5" />}
              {isPowerPoint && <Presentation className="w-5 h-5" />}
              {isCad && <Box className="w-5 h-5" />}
              {isCode && <Code className="w-5 h-5" />}
              {isPdf && <FileText className="w-5 h-5" />}
              {!isWord && !isExcel && !isPowerPoint && !isCad && !isCode && !isPdf && <FileCheck className="w-5 h-5" />}
            </div>
          )}

          {/* Sparkle badge for Google Converted file */}
          {file.isGoogleConverted && (
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

        {/* Text Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[170px] sm:max-w-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              {file.googleDocTitle || file.name}
            </span>

            {/* Google Conversion Pill */}
            {file.isGoogleConverted && (
              <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded-full border shrink-0 ${
                isWord 
                  ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' 
                  : isExcel 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' 
                    : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
              }`}>
                {isWord && 'Google Doc'}
                {isExcel && 'Google Sheet'}
                {isPowerPoint && 'Google Slide'}
              </span>
            )}
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
            {file.isGoogleConverted ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Accessible Google File • Free to view
              </span>
            ) : (
              <span>{(file.size / 1024).toFixed(1)} KB • {file.fileCategory?.toUpperCase() || 'FILE'}</span>
            )}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onOpenViewer(file)}
          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
          title="Open interactive viewer"
        >
          <Eye className="w-3 h-3" />
          <span className="hidden sm:inline">View</span>
        </button>

        {isEditable && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 p-1 rounded-md transition cursor-pointer"
            title="Remove attachment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
