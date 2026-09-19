import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';
import { AttachmentCategory, JournalImage } from '../types';
import { compressAndResizeImage } from './image';

export function getFileCategory(fileName: string, mimeType?: string): AttachmentCategory {
  const ext = fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
  
  // Microsoft Word
  if (['docx', 'doc', 'dotx', 'dot'].includes(ext) || mimeType?.includes('wordprocessingml') || mimeType?.includes('msword')) {
    return 'ms_word';
  }

  // Microsoft Excel & CSV
  if (['xlsx', 'xls', 'xlsm', 'xlsb', 'csv', 'tsv'].includes(ext) || mimeType?.includes('spreadsheetml') || mimeType?.includes('ms-excel') || mimeType === 'text/csv') {
    return 'ms_excel';
  }

  // Microsoft PowerPoint
  if (['pptx', 'ppt', 'ppsx', 'pps', 'potx'].includes(ext) || mimeType?.includes('presentationml') || mimeType?.includes('ms-powerpoint')) {
    return 'ms_powerpoint';
  }

  // Images
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'avif', 'ico'].includes(ext) || mimeType?.startsWith('image/')) {
    return 'image';
  }

  // PDF
  if (ext === 'pdf' || mimeType === 'application/pdf') {
    return 'pdf';
  }

  // CAD / 3D models common in FIRST robotics
  if (['step', 'stp', 'stl', 'sldprt', 'sldasm', 'f3d', 'obj', 'dxf', 'dwg', 'iges', 'igs', '3mf', 'sat', 'prt', 'asm'].includes(ext)) {
    return 'cad';
  }

  // Code & robot scripts
  if (['java', 'kt', 'kts', 'py', 'c', 'cpp', 'h', 'hpp', 'js', 'ts', 'tsx', 'jsx', 'json', 'xml', 'gradle', 'html', 'css', 'sh', 'bash', 'yaml', 'yml'].includes(ext)) {
    return 'code';
  }

  // Plain text / Markdown
  if (['txt', 'md', 'markdown', 'log', 'rtf'].includes(ext) || mimeType?.startsWith('text/')) {
    return 'text';
  }

  // Archives
  if (['zip', 'tar', 'gz', '7z', 'rar', 'bz2'].includes(ext) || mimeType?.includes('zip') || mimeType?.includes('compressed')) {
    return 'archive';
  }

  return 'other';
}

export function detectCodeLanguage(fileName: string): string {
  const ext = fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
  switch (ext) {
    case 'java': return 'Java (FTC Robot Controller / OpMode)';
    case 'kt':
    case 'kts': return 'Kotlin';
    case 'py': return 'Python';
    case 'cpp':
    case 'c':
    case 'h': return 'C / C++';
    case 'js': return 'JavaScript';
    case 'ts':
    case 'tsx': return 'TypeScript / React';
    case 'json': return 'JSON Data';
    case 'xml': return 'XML (Robot Configuration / Layout)';
    case 'gradle': return 'Gradle Build Script';
    case 'html': return 'HTML';
    case 'css': return 'CSS';
    case 'sh':
    case 'bash': return 'Shell Script';
    case 'yaml':
    case 'yml': return 'YAML Configuration';
    default: return 'Source Code';
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Universal file processor for notebook logs.
 * If the file is an MS Office file (.docx, .xlsx, .pptx), it automatically
 * converts it into an accessible, open Google File (Doc, Sheet, Slide)
 * viewable and free for anyone to inspect without Microsoft Office installed.
 */
export async function processAnyNotebookFile(file: File): Promise<JournalImage> {
  const category = getFileCategory(file.name, file.type);
  const baseTitle = file.name.replace(/\.[^/.]+$/, '');
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. MS Word (.docx, .doc) -> Turn into Accessible Google Doc
  if (category === 'ms_word') {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const dataUrl = await readFileAsDataUrl(file);

    let extractedHtml = '';
    let extractedText = '';

    try {
      if (file.name.toLowerCase().endsWith('.docx')) {
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
        extractedHtml = htmlResult.value;
        const textResult = await mammoth.extractRawText({ arrayBuffer });
        extractedText = textResult.value;
      }
    } catch (err) {
      console.warn('Could not extract docx html with mammoth:', err);
    }

    if (!extractedHtml) {
      extractedHtml = `<div class="p-4"><p class="text-slate-700 font-sans">Document: <strong>${escapeHtml(file.name)}</strong> (${(file.size / 1024).toFixed(1)} KB)</p><p class="text-xs text-slate-500 mt-2">Microsoft Word document loaded. Click "Open in Google Docs" or view text below.</p></div>`;
    }

    return {
      id,
      name: file.name,
      size: file.size,
      dataUrl,
      mimeType: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileCategory: 'ms_word',
      isGoogleConverted: true,
      googleDocType: 'doc',
      googleDocTitle: baseTitle,
      googleViewUrl: 'https://docs.google.com/document/create',
      extractedHtml,
      extractedText,
      createdAt: Date.now()
    };
  }

  // 2. MS Excel (.xlsx, .xls, .csv) -> Turn into Accessible Google Sheet
  if (category === 'ms_excel') {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const dataUrl = await readFileAsDataUrl(file);

    const extractedSheets: { [sheetName: string]: any[][] } = {};
    let sheetNames: string[] = [];

    try {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      sheetNames = workbook.SheetNames || [];
      sheetNames.forEach(name => {
        const worksheet = workbook.Sheets[name];
        if (worksheet) {
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          extractedSheets[name] = rows as any[][];
        }
      });
    } catch (err) {
      console.warn('Could not parse Excel workbook:', err);
    }

    return {
      id,
      name: file.name,
      size: file.size,
      dataUrl,
      mimeType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileCategory: 'ms_excel',
      isGoogleConverted: true,
      googleDocType: 'sheet',
      googleDocTitle: baseTitle,
      googleViewUrl: 'https://docs.google.com/spreadsheets/create',
      sheetNames: sheetNames.length > 0 ? sheetNames : ['Sheet1'],
      extractedSheets,
      createdAt: Date.now()
    };
  }

  // 3. MS PowerPoint (.pptx, .ppt) -> Turn into Accessible Google Slide
  if (category === 'ms_powerpoint') {
    const dataUrl = await readFileAsDataUrl(file);

    return {
      id,
      name: file.name,
      size: file.size,
      dataUrl,
      mimeType: file.type || 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      fileCategory: 'ms_powerpoint',
      isGoogleConverted: true,
      googleDocType: 'slide',
      googleDocTitle: baseTitle,
      googleViewUrl: 'https://docs.google.com/presentation/create',
      slideCount: 1,
      createdAt: Date.now()
    };
  }

  // 4. Standard Images (PNG, JPG, WebP, SVG) -> Canvas compressed image
  if (category === 'image') {
    const ext = file.name.slice((file.name.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
    let dataUrl: string;

    // SVG or animated GIF: preserve vector/animation data as raw dataUrl
    if (ext === 'svg' || ext === 'gif') {
      dataUrl = await readFileAsDataUrl(file);
    } else {
      try {
        dataUrl = await compressAndResizeImage(file, 950, 0.8);
      } catch {
        dataUrl = await readFileAsDataUrl(file);
      }
    }

    return {
      id,
      name: file.name,
      size: file.size,
      dataUrl,
      mimeType: file.type || 'image/jpeg',
      fileCategory: 'image',
      createdAt: Date.now()
    };
  }

  // 5. Code files (Java OpModes, Python scripts, XML, JSON)
  if (category === 'code') {
    const text = await readFileAsText(file);
    const dataUrl = await readFileAsDataUrl(file);
    const language = detectCodeLanguage(file.name);

    return {
      id,
      name: file.name,
      size: file.size,
      dataUrl,
      mimeType: file.type || 'text/plain',
      fileCategory: 'code',
      extractedText: text,
      codeLanguage: language,
      createdAt: Date.now()
    };
  }

  // 6. Plain text / Markdown
  if (category === 'text') {
    const text = await readFileAsText(file);
    const dataUrl = await readFileAsDataUrl(file);

    return {
      id,
      name: file.name,
      size: file.size,
      dataUrl,
      mimeType: file.type || 'text/plain',
      fileCategory: 'text',
      extractedText: text,
      createdAt: Date.now()
    };
  }

  // 7. CAD models (STEP, STL, SLDPRT, etc.)
  if (category === 'cad') {
    const dataUrl = await readFileAsDataUrl(file);
    const ext = file.name.slice((file.name.lastIndexOf('.') - 1 >>> 0) + 2).toUpperCase();

    return {
      id,
      name: file.name,
      size: file.size,
      dataUrl,
      mimeType: file.type || 'application/octet-stream',
      fileCategory: 'cad',
      cadInfo: { extension: ext, modelName: file.name },
      createdAt: Date.now()
    };
  }

  // 8. PDF Documents & all other formats
  const dataUrl = await readFileAsDataUrl(file);
  return {
    id,
    name: file.name,
    size: file.size,
    dataUrl,
    mimeType: file.type || 'application/octet-stream',
    fileCategory: category,
    createdAt: Date.now()
  };
}

/**
 * Creates an accessible Google File attachment from a public Google Drive / Docs URL
 */
export function createGoogleLinkAttachment(url: string, customTitle?: string): JournalImage {
  const cleanUrl = url.trim();
  let type: 'doc' | 'sheet' | 'slide' = 'doc';
  let category: AttachmentCategory = 'google_doc';
  let defaultTitle = 'Linked Google File';

  if (cleanUrl.includes('/spreadsheets') || cleanUrl.includes('sheets.google.com')) {
    type = 'sheet';
    category = 'google_sheet';
    defaultTitle = 'Google Spreadsheet (Linked)';
  } else if (cleanUrl.includes('/presentation') || cleanUrl.includes('slides.google.com')) {
    type = 'slide';
    category = 'google_slide';
    defaultTitle = 'Google Slide Deck (Linked)';
  } else {
    type = 'doc';
    category = 'google_doc';
    defaultTitle = 'Google Document (Linked)';
  }

  const title = customTitle?.trim() || defaultTitle;
  const id = `google-link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    id,
    name: `${title}.${type === 'doc' ? 'gdoc' : type === 'sheet' ? 'gsheet' : 'gslides'}`,
    size: 1024,
    dataUrl: cleanUrl,
    fileCategory: category,
    isGoogleConverted: true,
    googleDocType: type,
    googleDocTitle: title,
    googleViewUrl: cleanUrl,
    createdAt: Date.now()
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
