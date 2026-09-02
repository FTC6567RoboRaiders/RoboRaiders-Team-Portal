import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  X,
  Sliders,
  CheckSquare,
  Square,
  QrCode,
  Tag,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Maximize2,
  FileText,
  LayoutGrid,
  Info
} from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../types';

export type LabelPreset = 'drawer_2col' | 'compact_4col' | 'tote_1col' | 'avery_5160' | 'avery_5163' | 'cable_wrap';
export type CodeType = 'qr_code' | 'barcode_linear' | 'none';
export type BorderStyle = 'solid' | 'dashed' | 'heavy' | 'rounded' | 'borderless';
export type ColorTheme = 'mono' | 'slate' | 'category_accent';
export type NameFontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface LabelCustomizerConfig {
  preset: LabelPreset;
  headerText: string;
  showHeader: boolean;
  nameFontSize: NameFontSize;
  nameFontWeight: 'normal' | 'bold' | 'black';
  nameUppercase: boolean;
  showCategory: boolean;
  categoryStyle: 'solid' | 'outline' | 'text';
  showSkuVendor: boolean;
  showLocation: boolean;
  locationHighlight: boolean;
  codeType: CodeType;
  qrSize: 'sm' | 'md' | 'lg';
  showQuantity: boolean;
  showCost: boolean;
  showCustomFooter: boolean;
  customFooterText: string;
  borderStyle: BorderStyle;
  colorTheme: ColorTheme;
  scalePercent: number; // 80 to 140
  includeDate: boolean;
}

const DEFAULT_CONFIG: LabelCustomizerConfig = {
  preset: 'drawer_2col',
  headerText: 'FTC #6567 RoboRaiders',
  showHeader: true,
  nameFontSize: 'md',
  nameFontWeight: 'bold',
  nameUppercase: false,
  showCategory: true,
  categoryStyle: 'solid',
  showSkuVendor: true,
  showLocation: true,
  locationHighlight: true,
  codeType: 'qr_code',
  qrSize: 'md',
  showQuantity: true,
  showCost: false,
  showCustomFooter: true,
  customFooterText: 'Return to designated bin after robotics practice',
  borderStyle: 'solid',
  colorTheme: 'mono',
  scalePercent: 100,
  includeDate: false,
};

interface CustomOneOffLabel {
  id: string;
  name: string;
  category: InventoryCategory;
  sku?: string;
  vendor?: string;
  location: string;
  quantity?: number;
  unit?: string;
  notes?: string;
}

interface LabelCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
}

export function LabelCustomizerModal({
  isOpen,
  onClose,
  items
}: LabelCustomizerModalProps) {
  // Config state
  const [config, setConfig] = useState<LabelCustomizerConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'design' | 'selection' | 'custom_items'>('design');

  // Selection states
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => new Set(items.map(i => i.id)));
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Custom one-off labels created on the fly
  const [customLabels, setCustomLabels] = useState<CustomOneOffLabel[]>([]);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState<InventoryCategory>('REV Robotics Parts');
  const [newCustomLocation, setNewCustomLocation] = useState('Storage Bin 1');
  const [newCustomSku, setNewCustomSku] = useState('');

  // Generated QR Code Data URLs cache
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});

  // Sync item selection when items change or modal opens
  useEffect(() => {
    if (isOpen && selectedItemIds.size === 0 && items.length > 0) {
      setSelectedItemIds(new Set(items.map(i => i.id)));
    }
  }, [isOpen, items]);

  // Generate QR codes for all active items
  useEffect(() => {
    if (!isOpen || config.codeType !== 'qr_code') return;

    let isMounted = true;
    const generateAllQrs = async () => {
      const urls: Record<string, string> = {};

      const itemsToGen = [
        ...items.filter(i => selectedItemIds.has(i.id)),
        ...customLabels
      ];

      for (const item of itemsToGen) {
        const qrPayload = JSON.stringify({
          id: item.id,
          name: item.name,
          sku: item.sku || undefined,
          loc: item.location
        });

        try {
          const url = await QRCode.toDataURL(qrPayload, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: config.qrSize === 'sm' ? 64 : config.qrSize === 'lg' ? 128 : 96,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          if (isMounted) {
            urls[item.id] = url;
          }
        } catch {
          // fallback string
          urls[item.id] = '';
        }
      }

      if (isMounted) {
        setQrCodeUrls(urls);
      }
    };

    generateAllQrs();
    return () => {
      isMounted = false;
    };
  }, [isOpen, items, customLabels, selectedItemIds, config.codeType, config.qrSize]);

  // Filtered inventory items for selection tab
  const filteredInventory = useMemo(() => {
    return items.filter(item => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const mName = item.name.toLowerCase().includes(q);
        const mSku = item.sku?.toLowerCase().includes(q);
        const mLoc = item.location?.toLowerCase().includes(q);
        return mName || mSku || mLoc;
      }
      return true;
    });
  }, [items, categoryFilter, searchFilter]);

  // Combined active items to render
  const activeLabelsToRender = useMemo(() => {
    const selectedCatalogItems = items.filter(i => selectedItemIds.has(i.id));
    const customItemsAsInventory: InventoryItem[] = customLabels.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      sku: c.sku || '',
      vendor: c.vendor || 'Custom / In-House',
      quantity: c.quantity ?? 1,
      minQuantity: 1,
      unit: c.unit || 'pcs',
      location: c.location || 'Robotics Lab',
      status: 'In Stock',
      condition: 'Good',
      costPerUnit: 0,
      createdAt: Date.now(),
      createdBy: 'Custom Label',
      createdByEmail: '',
      updatedAt: Date.now(),
      updatedBy: 'Custom Label'
    }));

    return [...selectedCatalogItems, ...customItemsAsInventory];
  }, [items, selectedItemIds, customLabels]);

  // Toggle single item
  const handleToggleItem = (id: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all filtered
  const handleSelectAllFiltered = () => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      filteredInventory.forEach(i => next.add(i.id));
      return next;
    });
  };

  // Deselect all filtered
  const handleDeselectAllFiltered = () => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      filteredInventory.forEach(i => next.delete(i.id));
      return next;
    });
  };

  // Add custom label
  const handleAddCustomLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomName.trim()) return;

    const newLabel: CustomOneOffLabel = {
      id: `custom-label-${Date.now()}`,
      name: newCustomName.trim(),
      category: newCustomCategory,
      location: newCustomLocation.trim() || 'General Lab Storage',
      sku: newCustomSku.trim() || undefined
    };

    setCustomLabels(prev => [newLabel, ...prev]);
    setNewCustomName('');
    setNewCustomSku('');
  };

  // Remove custom label
  const handleRemoveCustomLabel = (id: string) => {
    setCustomLabels(prev => prev.filter(c => c.id !== id));
  };

  // Print Action
  const handleTriggerPrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  // Grid layout class based on preset
  const getGridClasses = () => {
    switch (config.preset) {
      case 'compact_4col':
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2';
      case 'tote_1col':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 'avery_5160':
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2';
      case 'avery_5163':
        return 'grid grid-cols-1 sm:grid-cols-2 gap-3';
      case 'cable_wrap':
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2';
      case 'drawer_2col':
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 gap-3';
    }
  };

  // Border classes based on style
  const getBorderClasses = () => {
    switch (config.borderStyle) {
      case 'dashed':
        return 'border border-dashed border-slate-400 dark:border-slate-600';
      case 'heavy':
        return 'border-2 border-slate-900 dark:border-slate-100';
      case 'rounded':
        return 'border border-slate-300 rounded-xl shadow-xs dark:border-slate-700';
      case 'borderless':
        return 'border-0 bg-slate-50 dark:bg-slate-900';
      case 'solid':
      default:
        return 'border border-slate-300 rounded-lg dark:border-slate-700';
    }
  };

  // Font size classes for item name
  const getNameSizeClass = () => {
    switch (config.nameFontSize) {
      case 'xs':
        return 'text-[11px] leading-tight';
      case 'sm':
        return 'text-xs leading-snug';
      case 'lg':
        return 'text-base font-bold leading-tight';
      case 'xl':
        return 'text-lg font-black leading-tight';
      case 'md':
      default:
        return 'text-sm font-bold leading-snug';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      {/* PRINT-ONLY CSS INJECTION */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-labels-sheet, #printable-labels-sheet * {
            visibility: visible;
          }
          #printable-labels-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10mm;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}} />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden dark:bg-slate-900 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center dark:bg-rose-500/20 dark:text-rose-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Robotics Label Customizer &amp; Print Studio
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-100 text-rose-700 font-bold dark:bg-rose-950 dark:text-rose-300">
                  {activeLabelsToRender.length} Labels Ready
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize dimensions, QR codes, typography, storage callouts, and print on any label sheets or standard paper.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              disabled={activeLabelsToRender.length === 0}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              id="print-custom-labels-btn"
            >
              <Printer className="w-4 h-4" />
              <span>Print Labels</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WORKSPACE TABS */}
        <div className="px-6 border-b border-slate-200 flex gap-4 bg-white dark:bg-slate-900 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('design')}
            className={`py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'design'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>1. Label Design &amp; Layout</span>
          </button>

          <button
            onClick={() => setActiveTab('selection')}
            className={`py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'selection'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>2. Select Catalog Items ({selectedItemIds.size}/{items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custom_items')}
            className={`py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'custom_items'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>3. Quick Custom Labels ({customLabels.length})</span>
          </button>
        </div>

        {/* MODAL BODY (SPLIT VIEW: CONTROLS & LIVE PREVIEW) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          
          {/* LEFT SIDE: CONFIGURATION CONTROLS */}
          <div className="lg:col-span-5 p-5 border-r border-slate-200 overflow-y-auto space-y-5 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800">
            
            {/* TAB 1: DESIGN & LAYOUT */}
            {activeTab === 'design' && (
              <div className="space-y-4">
                
                {/* PRESET TEMPLATES */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Label Sheet / Container Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, preset: 'drawer_2col', nameFontSize: 'md' }))}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        config.preset === 'drawer_2col'
                          ? 'border-rose-500 bg-rose-50/60 text-rose-900 font-bold dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-600'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>Bin &amp; Drawer</span>
                        <LayoutGrid className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">2-Column (2.5" × 1.25")</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, preset: 'compact_4col', nameFontSize: 'xs', qrSize: 'sm' }))}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        config.preset === 'compact_4col'
                          ? 'border-rose-500 bg-rose-50/60 text-rose-900 font-bold dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-600'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>Mini Compartment</span>
                        <LayoutGrid className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">4-Column (Hardware Bins)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, preset: 'tote_1col', nameFontSize: 'lg', qrSize: 'lg' }))}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        config.preset === 'tote_1col'
                          ? 'border-rose-500 bg-rose-50/60 text-rose-900 font-bold dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-600'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>Tote &amp; Robot Crate</span>
                        <Maximize2 className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Large 1-2 Col (4" × 2.5")</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, preset: 'avery_5160', nameFontSize: 'sm', qrSize: 'sm' }))}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        config.preset === 'avery_5160'
                          ? 'border-rose-500 bg-rose-50/60 text-rose-900 font-bold dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-600'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>Avery 5160 (30-up)</span>
                        <FileText className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">1" × 2.625" Standard Sheet</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, preset: 'avery_5163', nameFontSize: 'md', qrSize: 'md' }))}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        config.preset === 'avery_5163'
                          ? 'border-rose-500 bg-rose-50/60 text-rose-900 font-bold dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-600'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>Avery 5163 (10-up)</span>
                        <FileText className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">2" × 4" Large Shipping Sheet</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, preset: 'cable_wrap', nameFontSize: 'xs', qrSize: 'sm' }))}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        config.preset === 'cable_wrap'
                          ? 'border-rose-500 bg-rose-50/60 text-rose-900 font-bold dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-600'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>Cable / Wire Tag</span>
                        <Tag className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Narrow Banner for harnesses</div>
                    </button>
                  </div>
                </div>

                {/* TEAM / HEADER TEXT */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Team Header Banner
                    </label>
                    <input
                      type="checkbox"
                      checked={config.showHeader}
                      onChange={e => setConfig(prev => ({ ...prev, showHeader: e.target.checked }))}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                  </div>
                  {config.showHeader && (
                    <input
                      type="text"
                      value={config.headerText}
                      onChange={e => setConfig(prev => ({ ...prev, headerText: e.target.value }))}
                      placeholder="e.g. FTC #6567 RoboRaiders"
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
                    />
                  )}
                </div>

                {/* ITEM NAME & TYPOGRAPHY */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Item Name Typography
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Font Size</label>
                      <select
                        value={config.nameFontSize}
                        onChange={e => setConfig(prev => ({ ...prev, nameFontSize: e.target.value as NameFontSize }))}
                        className="w-full text-xs px-2 py-1 rounded border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
                      >
                        <option value="xs">Extra Small (11px)</option>
                        <option value="sm">Small (12px)</option>
                        <option value="md">Medium (14px - Default)</option>
                        <option value="lg">Large (16px)</option>
                        <option value="xl">Extra Large (18px)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Weight &amp; Casing</label>
                      <div className="flex gap-2">
                        <select
                          value={config.nameFontWeight}
                          onChange={e => setConfig(prev => ({ ...prev, nameFontWeight: e.target.value as any }))}
                          className="w-full text-xs px-2 py-1 rounded border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
                        >
                          <option value="normal">Regular</option>
                          <option value="bold">Bold</option>
                          <option value="black">Heavy Black</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.nameUppercase}
                        onChange={e => setConfig(prev => ({ ...prev, nameUppercase: e.target.checked }))}
                        className="rounded text-rose-600"
                      />
                      <span>Force Uppercase Text</span>
                    </label>
                  </div>
                </div>

                {/* QR CODE & BARCODE */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-rose-500" />
                      QR / Barcode Scanner Code
                    </span>
                    <select
                      value={config.codeType}
                      onChange={e => setConfig(prev => ({ ...prev, codeType: e.target.value as CodeType }))}
                      className="text-xs px-2 py-0.5 rounded border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 font-medium"
                    >
                      <option value="qr_code">QR Code (Phone/Scanner)</option>
                      <option value="barcode_linear">Code-128 Barcode</option>
                      <option value="none">No Code</option>
                    </select>
                  </div>

                  {config.codeType === 'qr_code' && (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] text-slate-500">QR Code Size</span>
                      <div className="flex gap-1.5">
                        {(['sm', 'md', 'lg'] as const).map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, qrSize: size }))}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer uppercase ${
                              config.qrSize === size
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* FIELD TOGGLES */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Visible Fields &amp; Badges
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={config.showCategory}
                        onChange={e => setConfig(prev => ({ ...prev, showCategory: e.target.checked }))}
                        className="rounded text-rose-600"
                      />
                      <span>Category Badge</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={config.showSkuVendor}
                        onChange={e => setConfig(prev => ({ ...prev, showSkuVendor: e.target.checked }))}
                        className="rounded text-rose-600"
                      />
                      <span>SKU &amp; Vendor</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={config.showLocation}
                        onChange={e => setConfig(prev => ({ ...prev, showLocation: e.target.checked }))}
                        className="rounded text-rose-600"
                      />
                      <span>Location Callout</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={config.showQuantity}
                        onChange={e => setConfig(prev => ({ ...prev, showQuantity: e.target.checked }))}
                        className="rounded text-rose-600"
                      />
                      <span>Quantity / Min</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={config.showCost}
                        onChange={e => setConfig(prev => ({ ...prev, showCost: e.target.checked }))}
                        className="rounded text-rose-600"
                      />
                      <span>Unit Cost</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={config.locationHighlight}
                        onChange={e => setConfig(prev => ({ ...prev, locationHighlight: e.target.checked }))}
                        className="rounded text-rose-600"
                      />
                      <span>Highlight Box for Loc</span>
                    </label>
                  </div>
                </div>

                {/* BORDER & CONTRAST STYLE */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Border &amp; Printer Contrast
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Cut Boundary</label>
                      <select
                        value={config.borderStyle}
                        onChange={e => setConfig(prev => ({ ...prev, borderStyle: e.target.value as BorderStyle }))}
                        className="w-full text-xs px-2 py-1 rounded border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
                      >
                        <option value="solid">Solid Cut Line</option>
                        <option value="dashed">Dashed Tear Line</option>
                        <option value="heavy">Heavy Black Box</option>
                        <option value="rounded">Rounded Card</option>
                        <option value="borderless">Borderless</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Color Mode</label>
                      <select
                        value={config.colorTheme}
                        onChange={e => setConfig(prev => ({ ...prev, colorTheme: e.target.value as ColorTheme }))}
                        className="w-full text-xs px-2 py-1 rounded border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
                      >
                        <option value="mono">High-Contrast B&amp;W (Best)</option>
                        <option value="slate">Modern Slate Gray</option>
                        <option value="category_accent">Category Color Accents</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* CUSTOM FOOTER / RETURN NOTE */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Bottom Instruction / Return Notice
                    </label>
                    <input
                      type="checkbox"
                      checked={config.showCustomFooter}
                      onChange={e => setConfig(prev => ({ ...prev, showCustomFooter: e.target.checked }))}
                      className="rounded text-rose-600"
                    />
                  </div>
                  {config.showCustomFooter && (
                    <input
                      type="text"
                      value={config.customFooterText}
                      onChange={e => setConfig(prev => ({ ...prev, customFooterText: e.target.value }))}
                      placeholder="e.g. Return to Bin after robotics practice"
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
                    />
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: SELECT ITEMS */}
            {activeTab === 'selection' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      placeholder="Filter parts by name, sku, location..."
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="text-xs px-2 py-1 rounded border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="All">All Categories</option>
                    <option value="REV Robotics Parts">REV Robotics Parts</option>
                    <option value="goBILDA & Motion">goBILDA & Motion</option>
                    <option value="Electronics & Power">Electronics & Power</option>
                    <option value="Hardware & Fasteners">Hardware & Fasteners</option>
                    <option value="Tools & Equipment">Tools & Equipment</option>
                    <option value="Game Elements & Field">Game Elements & Field</option>
                    <option value="Other">Other</option>
                  </select>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-[11px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllFiltered}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-[11px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                    >
                      Deselect
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {filteredInventory.map(item => {
                    const isSelected = selectedItemIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-50/70 border-rose-300 text-rose-950 dark:bg-rose-950/30 dark:border-rose-700 dark:text-rose-100'
                            : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div className="truncate">
                            <div className="font-bold truncate">{item.name}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                              {item.sku || item.vendor} • {item.location}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono shrink-0 px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    );
                  })}

                  {filteredInventory.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No matching items found.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: QUICK CUSTOM LABELS */}
            {activeTab === 'custom_items' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs dark:bg-amber-950/30 dark:border-amber-800/60 dark:text-amber-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">On-The-Fly Quick Labels:</span> Create custom bin, toolbox, or safety labels (e.g. "Safety Glasses", "Battery Charging Station", "LiPo Fire Bag") without adding them to your inventory catalog.
                  </div>
                </div>

                <form onSubmit={handleAddCustomLabel} className="bg-white p-3.5 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-3">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Add New One-Off Label
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Label Title / Item Name *</label>
                    <input
                      type="text"
                      required
                      value={newCustomName}
                      onChange={e => setNewCustomName(e.target.value)}
                      placeholder="e.g. M4 Locknuts &amp; Socket Screws, LiPo Battery Station..."
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Category</label>
                      <select
                        value={newCustomCategory}
                        onChange={e => setNewCustomCategory(e.target.value as InventoryCategory)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
                      >
                        <option value="REV Robotics Parts">REV Robotics Parts</option>
                        <option value="goBILDA & Motion">goBILDA & Motion</option>
                        <option value="Electronics & Power">Electronics & Power</option>
                        <option value="Hardware & Fasteners">Hardware & Fasteners</option>
                        <option value="Tools & Equipment">Tools & Equipment</option>
                        <option value="Game Elements & Field">Game Elements & Field</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Location / Bin #</label>
                      <input
                        type="text"
                        value={newCustomLocation}
                        onChange={e => setNewCustomLocation(e.target.value)}
                        placeholder="e.g. Drawer C4"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Optional SKU / Part #</label>
                    <input
                      type="text"
                      value={newCustomSku}
                      onChange={e => setNewCustomSku(e.target.value)}
                      placeholder="e.g. SKU-CUSTOM-01"
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Append Custom Label</span>
                  </button>
                </form>

                {/* LIST OF CUSTOM LABELS */}
                {customLabels.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center">
                      <span>Appended Labels ({customLabels.length})</span>
                      <button
                        type="button"
                        onClick={() => setCustomLabels([])}
                        className="text-[10px] text-rose-600 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    {customLabels.map(label => (
                      <div key={label.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs dark:bg-slate-800 dark:border-slate-700">
                        <div className="truncate">
                          <div className="font-bold truncate">{label.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{label.category} • {label.location}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomLabel(label.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT SIDE: LIVE WYSIWYG PREVIEW */}
          <div className="lg:col-span-7 p-6 overflow-y-auto bg-slate-100/90 dark:bg-slate-950 flex flex-col items-center">
            
            <div className="w-full max-w-2xl flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Printer className="w-3.5 h-3.5 text-rose-500" />
                Live Print Sheet Preview
              </span>
              <span>
                {activeLabelsToRender.length} Labels Formatted
              </span>
            </div>

            {/* PRINTABLE CANVAS / SHEET CONTAINER */}
            <div
              id="printable-labels-sheet"
              className="w-full max-w-2xl bg-white p-6 shadow-md rounded-lg text-slate-900 font-sans border border-slate-200 dark:border-slate-700"
            >
              {activeLabelsToRender.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <Tag className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                  <p className="font-bold">No Labels Selected</p>
                  <p className="text-[11px] mt-1">Select items from catalog or create quick custom labels to preview.</p>
                </div>
              ) : (
                <div className={getGridClasses()}>
                  {activeLabelsToRender.map(item => {
                    const qrUrl = qrCodeUrls[item.id];
                    return (
                      <div
                        key={item.id}
                        className={`p-3 bg-white ${getBorderClasses()} page-break-inside-avoid flex flex-col justify-between relative overflow-hidden transition-all`}
                      >
                        {/* TOP: TEAM HEADER & CATEGORY */}
                        <div className="space-y-1">
                          {config.showHeader && config.headerText && (
                            <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                              <span className="text-[9px] font-black uppercase tracking-wider text-rose-700">
                                {config.headerText}
                              </span>
                              {config.includeDate && (
                                <span className="text-[8px] font-mono text-slate-400">
                                  {new Date().toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}

                          {config.showCategory && (
                            <div className="pt-0.5">
                              <span className={`inline-block text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                config.colorTheme === 'category_accent'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-800 border border-slate-300'
                              }`}>
                                {item.category}
                              </span>
                            </div>
                          )}

                          {/* ITEM NAME */}
                          <div className={`mt-1 text-slate-900 ${getNameSizeClass()} ${
                            config.nameFontWeight === 'black' ? 'font-black' : config.nameFontWeight === 'bold' ? 'font-bold' : 'font-medium'
                          } ${config.nameUppercase ? 'uppercase' : ''}`}>
                            {item.name}
                          </div>

                          {/* SKU & VENDOR */}
                          {config.showSkuVendor && (item.sku || item.vendor) && (
                            <div className="text-[10px] font-mono text-slate-600 truncate">
                              {item.sku ? `SKU: ${item.sku}` : ''} {item.vendor && item.sku ? '•' : ''} {item.vendor}
                            </div>
                          )}
                        </div>

                        {/* MIDDLE: QR CODE + LOCATION CALLOUT */}
                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200">
                          
                          {/* LOCATION */}
                          {config.showLocation && (
                            <div className="flex-1 min-w-0">
                              <div className="text-[8px] uppercase tracking-wider font-bold text-slate-500">
                                Storage Location
                              </div>
                              <div className={`text-xs font-bold font-mono truncate ${
                                config.locationHighlight
                                  ? 'bg-slate-900 text-white px-2 py-0.5 rounded text-[11px] inline-block mt-0.5'
                                  : 'text-slate-900'
                              }`}>
                                {item.location || 'Bench / General'}
                              </div>
                            </div>
                          )}

                          {/* QR CODE DISPLAY */}
                          {config.codeType === 'qr_code' && qrUrl && (
                            <div className="shrink-0 bg-white p-0.5 border border-slate-300 rounded">
                              <img
                                src={qrUrl}
                                alt={`QR for ${item.name}`}
                                className={config.qrSize === 'sm' ? 'w-8 h-8' : config.qrSize === 'lg' ? 'w-14 h-14' : 'w-10 h-10'}
                              />
                            </div>
                          )}

                          {/* BARCODE LINEAR SIMULATION */}
                          {config.codeType === 'barcode_linear' && (
                            <div className="shrink-0 flex flex-col items-center">
                              <div className="flex items-end gap-[1px] h-6 px-1">
                                {[1,2,1,3,1,2,1,1,3,2,1,2,1,3,1].map((w, idx) => (
                                  <div
                                    key={idx}
                                    style={{ width: `${w * 1.5}px` }}
                                    className="bg-black h-full"
                                  />
                                ))}
                              </div>
                              <span className="text-[7px] font-mono text-slate-600 tracking-widest mt-0.5">
                                {item.sku ? item.sku.substring(0, 10) : item.id}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* BOTTOM STATS & INSTRUCTION */}
                        {(config.showQuantity || config.showCost || config.showCustomFooter) && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                            {config.showQuantity && (
                              <span className="font-bold text-slate-800">
                                Qty: {item.quantity} {item.unit} {item.minQuantity ? `(Min: ${item.minQuantity})` : ''}
                              </span>
                            )}

                            {config.showCost && Number(item.costPerUnit) > 0 && (
                              <span>${Number(item.costPerUnit).toFixed(2)}/unit</span>
                            )}
                          </div>
                        )}

                        {config.showCustomFooter && config.customFooterText && (
                          <div className="text-[8px] text-slate-400 italic mt-1 leading-tight text-center">
                            {config.customFooterText}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850 dark:border-slate-800 shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Tip: Set paper to US Letter or A4 in browser print dialog with default 100% scale and margins enabled.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close Studio
            </button>
            <button
              onClick={handleTriggerPrint}
              disabled={activeLabelsToRender.length === 0}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print {activeLabelsToRender.length} Labels</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
