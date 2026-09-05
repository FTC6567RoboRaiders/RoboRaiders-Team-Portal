import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Camera,
  X,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  Package,
  MapPin,
  Tag,
  ArrowRight,
  SlidersHorizontal,
  Plus,
  Volume2,
  VolumeX,
  Search,
  ExternalLink,
  Edit,
  Boxes
} from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onOpenItemDetails: (item: InventoryItem) => void;
  onOpenQuickAdjust?: (item: InventoryItem) => void;
  onOpenCheckout?: (item: InventoryItem) => void;
  onFilterListByItem?: (query: string) => void;
  onAddNewItemWithPrefill?: (prefill: { name: string; sku?: string; location?: string; subArea?: string }) => void;
}

interface ScannedPayload {
  rawText: string;
  parsedId?: string;
  parsedName?: string;
  parsedSku?: string;
  parsedLoc?: string;
  parsedSubArea?: string;
}

export function InventoryQrScannerModal({
  isOpen,
  onClose,
  items,
  onOpenItemDetails,
  onOpenQuickAdjust,
  onOpenCheckout,
  onFilterListByItem,
  onAddNewItemWithPrefill
}: InventoryQrScannerModalProps) {
  const [scannerMode, setScannerMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Manual input state
  const [manualInput, setManualInput] = useState('');

  // Scanned match state
  const [scannedResult, setScannedResult] = useState<{
    payload: ScannedPayload;
    matchedItem: InventoryItem | null;
  } | null>(null);

  // Cameras available
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'inventory-qr-reader-container';

  // Play a brief high-pitch chime upon successful scan
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio playback failed or blocked by policy
    }
  }, [soundEnabled]);

  // Resolve scanned text into a catalog item
  const resolveScannedText = useCallback((decodedText: string): { payload: ScannedPayload; matchedItem: InventoryItem | null } => {
    const trimmed = decodedText.trim();
    let payload: ScannedPayload = { rawText: trimmed };

    // 1. Try JSON parse (Label Maker format: { id, name, sku, loc })
    try {
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        payload = {
          rawText: trimmed,
          parsedId: parsed.id,
          parsedName: parsed.name,
          parsedSku: parsed.sku,
          parsedLoc: parsed.loc,
          parsedSubArea: parsed.subArea
        };
      }
    } catch {
      // Not JSON, continue with plain text
    }

    // 2. Find matching item in catalog
    let matched: InventoryItem | null = null;

    if (payload.parsedId) {
      matched = items.find(i => i.id === payload.parsedId) || null;
    }

    if (!matched && payload.parsedSku) {
      const normSku = payload.parsedSku.toLowerCase();
      matched = items.find(i => i.sku && i.sku.toLowerCase() === normSku) || null;
    }

    if (!matched && payload.parsedName) {
      const normName = payload.parsedName.toLowerCase();
      matched = items.find(i => i.name.toLowerCase() === normName) || null;
    }

    // Plain text matching
    if (!matched) {
      // Match by exact item ID
      matched = items.find(i => i.id === trimmed) || null;
    }

    if (!matched) {
      // Match by SKU (case insensitive)
      matched = items.find(i => i.sku && i.sku.toLowerCase() === trimmed.toLowerCase()) || null;
    }

    if (!matched) {
      // Match by exact name
      matched = items.find(i => i.name.toLowerCase() === trimmed.toLowerCase()) || null;
    }

    if (!matched) {
      // Check if URL containing ID parameter or fragment
      try {
        if (trimmed.includes('http://') || trimmed.includes('https://')) {
          const url = new URL(trimmed);
          const itemId = url.searchParams.get('item') || url.searchParams.get('id');
          if (itemId) {
            matched = items.find(i => i.id === itemId) || null;
          }
        }
      } catch {
        // ignore url parsing
      }
    }

    return { payload, matchedItem: matched };
  }, [items]);

  // Handle successful scan
  const handleScanSuccess = useCallback((decodedText: string) => {
    playBeep();
    const result = resolveScannedText(decodedText);
    setScannedResult(result);
  }, [playBeep, resolveScannedText]);

  // Stop camera stream safely
  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch {
        // Ignore stop error
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async (cameraId?: string) => {
    setCameraError(null);
    setIsProcessing(true);

    try {
      await stopCamera();

      // Ensure container element is in DOM
      const element = document.getElementById(scannerContainerId);
      if (!element) {
        setIsProcessing(false);
        return;
      }

      const qrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.CODE_128],
        verbose: false
      });
      html5QrCodeRef.current = qrCode;

      // Query available cameras if not yet cached
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          setAvailableCameras(cameras);
        }
      } catch {
        // Could not enumerate cameras, will use facingMode
      }

      const cameraConfig = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: 'environment' };

      await qrCode.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // ignore scan frame misses
        }
      );

      setIsCameraActive(true);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('Permission denied') || errMsg.includes('NotAllowedError')) {
        setCameraError('Camera access was denied. Please allow camera permissions in your browser, or use image upload / manual lookup below.');
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('no camera')) {
        setCameraError('No video camera detected on this device. You can still scan by uploading an image or entering part details.');
      } else {
        setCameraError(`Camera could not be started: ${errMsg}. Try uploading a photo instead.`);
      }
      setIsCameraActive(false);
    } finally {
      setIsProcessing(false);
    }
  }, [handleScanSuccess, stopCamera]);

  // Handle switching camera
  const handleSwitchCamera = async (cameraId: string) => {
    setSelectedCameraId(cameraId);
    if (scannerMode === 'camera') {
      await startCamera(cameraId);
    }
  };

  // Handle image upload scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCameraError(null);

    try {
      await stopCamera();

      // Ensure instance
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch {
      setCameraError('No readable QR code or barcode found in this image. Please ensure the code is well-lit and in focus.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Handle manual input submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScanSuccess(manualInput.trim());
  };

  // Reset scan to scan another
  const handleScanAnother = () => {
    setScannedResult(null);
    if (scannerMode === 'camera' && !isCameraActive) {
      startCamera(selectedCameraId || undefined);
    }
  };

  // Manage open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      setCameraError(null);
      if (scannerMode === 'camera') {
        const timer = setTimeout(() => {
          startCamera(selectedCameraId || undefined);
        }, 150);
        return () => clearTimeout(timer);
      }
    } else {
      stopCamera();
    }
  }, [isOpen, scannerMode, selectedCameraId, startCamera, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden dark:bg-slate-900 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* HEADER */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 dark:bg-slate-850 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center dark:bg-emerald-500/20 dark:text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Inventory QR Scanner
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                  Live
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scan team labels, bin QR codes, or SKU barcodes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute beep audio' : 'Enable beep audio'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCANNER MODES TABS */}
        <div className="px-5 border-b border-slate-200 flex gap-2 bg-white dark:bg-slate-900 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setScannerMode('camera');
              setScannedResult(null);
            }}
            className={`py-2.5 px-3 font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              scannerMode === 'camera'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScannerMode('upload');
              stopCamera();
              setScannedResult(null);
            }}
            className={`py-2.5 px-3 font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              scannerMode === 'upload'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScannerMode('manual');
              stopCamera();
              setScannedResult(null);
            }}
            className={`py-2.5 px-3 font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              scannerMode === 'manual'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>

        {/* SCANNER VIEWPORT AREA */}
        <div className="p-5 space-y-4">

          {/* ACTIVE MATCHED ITEM DISPLAY CARD */}
          {scannedResult ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
              {scannedResult.matchedItem ? (
                <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Item Identified in Catalog
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-semibold">
                      {scannedResult.matchedItem.status}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    {scannedResult.matchedItem.imageUrl ? (
                      <img
                        src={scannedResult.matchedItem.imageUrl}
                        alt={scannedResult.matchedItem.name}
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-white shrink-0 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 dark:bg-slate-800 dark:border-slate-700">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                        {scannedResult.matchedItem.name}
                      </h3>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Qty: {scannedResult.matchedItem.quantity} {scannedResult.matchedItem.unit}
                        </span>
                        {scannedResult.matchedItem.sku && (
                          <span>• SKU: {scannedResult.matchedItem.sku}</span>
                        )}
                        <span>• {scannedResult.matchedItem.category}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {scannedResult.matchedItem.location || 'General Lab'}
                        </span>
                        {scannedResult.matchedItem.subArea && (
                          <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                            › {scannedResult.matchedItem.subArea}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* QUICK ACTIONS FOR MATCHED ITEM */}
                  <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/40 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (scannedResult.matchedItem) {
                          onOpenItemDetails(scannedResult.matchedItem);
                          onClose();
                        }
                      }}
                      className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>View / Edit Details</span>
                    </button>

                    {onOpenQuickAdjust && (
                      <button
                        type="button"
                        onClick={() => {
                          if (scannedResult.matchedItem) {
                            onOpenQuickAdjust(scannedResult.matchedItem);
                            onClose();
                          }
                        }}
                        className="py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Boxes className="w-3.5 h-3.5 text-slate-500" />
                        <span>Adjust Stock (+/-)</span>
                      </button>
                    )}

                    {onFilterListByItem && (
                      <button
                        type="button"
                        onClick={() => {
                          if (scannedResult.matchedItem) {
                            onFilterListByItem(scannedResult.matchedItem.name);
                            onClose();
                          }
                        }}
                        className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Search className="w-3 h-3" />
                        <span>Show in Catalog</span>
                      </button>
                    )}

                    {onOpenCheckout && (
                      <button
                        type="button"
                        onClick={() => {
                          if (scannedResult.matchedItem) {
                            onOpenCheckout(scannedResult.matchedItem);
                            onClose();
                          }
                        }}
                        className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Tag className="w-3 h-3" />
                        <span>Check Out / Loan</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* SCANNED CODE WAS DECODED BUT NOT FOUND IN INVENTORY ITEMS */
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-700/60 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Scanned Code Decoded — Not in Catalog Yet</span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-amber-200 dark:border-amber-800/40 text-xs font-mono space-y-1">
                    {scannedResult.payload.parsedName ? (
                      <div>
                        <span className="text-slate-400">Scanned Title: </span>
                        <strong className="text-slate-900 dark:text-white">{scannedResult.payload.parsedName}</strong>
                      </div>
                    ) : (
                      <div className="break-all">
                        <span className="text-slate-400">Payload: </span>
                        <span className="text-slate-800 dark:text-slate-200">{scannedResult.payload.rawText}</span>
                      </div>
                    )}
                    {scannedResult.payload.parsedSku && (
                      <div>
                        <span className="text-slate-400">SKU: </span>
                        <span className="text-slate-800 dark:text-slate-200">{scannedResult.payload.parsedSku}</span>
                      </div>
                    )}
                    {scannedResult.payload.parsedLoc && (
                      <div>
                        <span className="text-slate-400">Location: </span>
                        <span className="text-slate-800 dark:text-slate-200">{scannedResult.payload.parsedLoc}</span>
                      </div>
                    )}
                  </div>

                  {onAddNewItemWithPrefill && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddNewItemWithPrefill({
                          name: scannedResult.payload.parsedName || scannedResult.payload.rawText,
                          sku: scannedResult.payload.parsedSku,
                          location: scannedResult.payload.parsedLoc,
                          subArea: scannedResult.payload.parsedSubArea
                        });
                        onClose();
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add as New Inventory Item</span>
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleScanAnother}
                className="w-full py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Scan Another Code</span>
              </button>
            </div>
          ) : null}

          {/* CAMERA SCANNING VIEW */}
          {!scannedResult && scannerMode === 'camera' && (
            <div className="space-y-3">
              <div className="relative w-full aspect-square max-h-72 rounded-xl overflow-hidden bg-black border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                <div id={scannerContainerId} className="w-full h-full" />

                {/* TARGETING RETICLE OVERLAY */}
                {isCameraActive && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br" />
                      
                      {/* Animated scanline */}
                      <div className="absolute left-2 right-2 h-0.5 bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                    </div>
                    <span className="mt-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                      Align QR Code Inside Box
                    </span>
                  </div>
                )}

                {isProcessing && !isCameraActive && (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 text-white">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                    <span className="text-xs font-mono">Initializing camera feed...</span>
                  </div>
                )}
              </div>

              {/* CAMERA SELECTION & SWITCH */}
              {availableCameras.length > 1 && (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 text-[11px]">Select Camera:</span>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => handleSwitchCamera(e.target.value)}
                    className="text-xs px-2 py-1 rounded border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                  >
                    {availableCameras.map(cam => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label || `Camera ${cam.id.substring(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {cameraError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => startCamera(selectedCameraId || undefined)}
                      className="px-2.5 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/60 dark:hover:bg-red-900 text-red-800 dark:text-red-200 rounded font-bold text-[11px] cursor-pointer"
                    >
                      Retry Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => setScannerMode('upload')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-red-200 text-slate-700 rounded font-bold text-[11px] cursor-pointer dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                    >
                      Use Image Upload Instead
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IMAGE UPLOAD SCANNING VIEW */}
          {!scannedResult && scannerMode === 'upload' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/30 dark:bg-slate-800/40 dark:border-slate-700 dark:hover:border-emerald-500">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Upload or Drop a Label Image
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Supports PNG, JPG, WEBP, screenshots of printed bins
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {cameraError && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          )}

          {/* MANUAL LOOKUP VIEW */}
          {!scannedResult && scannerMode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Enter QR Payload, SKU, or Item ID
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g. REV-41-1125, Core Hex Motor, or JSON payload..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Catalog</span>
              </button>
            </form>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/90 dark:bg-slate-850 dark:border-slate-800 text-[11px] text-slate-500">
          <span>Supported: QR Code &amp; Code-128</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Close Scanner
          </button>
        </div>

      </div>
    </div>
  );
}

export default InventoryQrScannerModal;
