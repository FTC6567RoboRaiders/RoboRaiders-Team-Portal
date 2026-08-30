import React, { useState, useMemo, useRef } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Tag, 
  MapPin, 
  DollarSign, 
  Printer, 
  Download, 
  RotateCcw, 
  ArrowRightLeft, 
  ChevronLeft, 
  ChevronRight, 
  Wrench, 
  Layers, 
  Cpu, 
  Zap, 
  Boxes, 
  Compass, 
  FileText, 
  Check, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Calendar, 
  User, 
  RefreshCw, 
  AlertCircle, 
  TrendingUp, 
  SlidersHorizontal,
  BookmarkPlus,
  QrCode,
  Sparkles
} from 'lucide-react';
import { 
  InventoryItem, 
  InventoryTransaction, 
  InventoryCategory, 
  InventoryItemStatus, 
  InventoryCondition, 
  UserAccount 
} from '../types';
import { compressAndResizeImage } from '../utils/image';
import { DEFAULT_INVENTORY_ITEMS } from '../data/inventoryDemo';
import { LabelCustomizerModal } from './LabelCustomizerModal';

interface InventoryManagerProps {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  onSaveItem: (item: InventoryItem) => Promise<boolean>;
  onDeleteItem: (id: string) => Promise<boolean>;
  onAddTransaction: (tx: Omit<InventoryTransaction, 'id' | 'timestamp'>) => Promise<boolean>;
  onBack: () => void;
  showToast: (text: string, type: 'success' | 'danger' | 'info') => void;
}

const CATEGORIES: InventoryCategory[] = [
  'REV Robotics Parts',
  'goBILDA & Motion',
  'Electronics & Power',
  'Hardware & Fasteners',
  'Raw Stock & Materials',
  'Tools & Equipment',
  'Game Elements & Field',
  'Consumables & Lab Supplies',
  'Other'
];

const CATEGORY_COLORS: Record<InventoryCategory, { bg: string; text: string; border: string; darkBg: string }> = {
  'REV Robotics Parts': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', darkBg: 'dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/40' },
  'goBILDA & Motion': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', darkBg: 'dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40' },
  'Electronics & Power': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', darkBg: 'dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40' },
  'Hardware & Fasteners': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', darkBg: 'dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700' },
  'Raw Stock & Materials': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', darkBg: 'dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40' },
  'Tools & Equipment': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', darkBg: 'dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/40' },
  'Game Elements & Field': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', darkBg: 'dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800/40' },
  'Consumables & Lab Supplies': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', darkBg: 'dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40' },
  'Other': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', darkBg: 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' }
};

const STATUS_BADGES: Record<InventoryItemStatus, { bg: string; text: string; dot: string }> = {
  'In Stock': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  'Low Stock': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500 animate-pulse' },
  'Out of Stock': { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  'Checked Out': { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  'Ordered': { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  'Damaged/Repair': { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' }
};

export default function InventoryManager({
  currentUser,
  accounts,
  items,
  transactions,
  onSaveItem,
  onDeleteItem,
  onAddTransaction,
  onBack,
  showToast
}: InventoryManagerProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'inventory' | 'checkout' | 'lowstock' | 'history' | 'locations'>('inventory');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedVendor, setSelectedVendor] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'category' | 'status' | 'updatedAt' | 'cost'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Check-Out Modal
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutTargetItem, setCheckoutTargetItem] = useState<InventoryItem | null>(null);
  const [checkoutBorrowerName, setCheckoutBorrowerName] = useState('');
  const [checkoutBorrowerEmail, setCheckoutBorrowerEmail] = useState('');
  const [checkoutReturnDate, setCheckoutReturnDate] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');

  // Check-In Modal
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [checkinTargetItem, setCheckinTargetItem] = useState<InventoryItem | null>(null);
  const [checkinCondition, setCheckinCondition] = useState<InventoryCondition>('Good');
  const [checkinNotes, setCheckinNotes] = useState('');

  // Quick Quantity Adjust Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetItem, setAdjustTargetItem] = useState<InventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('Restocked from shipment');
  const [adjustCustomNote, setAdjustCustomNote] = useState('');

  // Print / Export Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isLabelCustomizerOpen, setIsLabelCustomizerOpen] = useState(false);
  const [printLayoutType, setPrintLayoutType] = useState<'full_inventory' | 'low_stock_bom' | 'bin_labels'>('full_inventory');

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<InventoryCategory>('REV Robotics Parts');
  const [formSku, setFormSku] = useState('');
  const [formVendor, setFormVendor] = useState('REV Robotics');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formMinQuantity, setFormMinQuantity] = useState<number>(1);
  const [formUnit, setFormUnit] = useState('pcs');
  const [formLocation, setFormLocation] = useState('');
  const [formStatus, setFormStatus] = useState<InventoryItemStatus>('In Stock');
  const [formCondition, setFormCondition] = useState<InventoryCondition>('Good');
  const [formCostPerUnit, setFormCostPerUnit] = useState<string>('');
  const [formItemUrl, setFormItemUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formImageData, setFormImageData] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mentor / Admin check
  const isMentorOrCaptain = currentUser?.role === 'mentor' || currentUser?.role === 'captain' || currentUser?.leadership === 'Captain';

  // Derived lists for filters
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    items.forEach(i => {
      if (i.location && i.location.trim()) locs.add(i.location.trim());
    });
    return Array.from(locs).sort();
  }, [items]);

  const uniqueVendors = useMemo(() => {
    const vens = new Set<string>();
    items.forEach(i => {
      if (i.vendor && i.vendor.trim()) vens.add(i.vendor.trim());
    });
    return Array.from(vens).sort();
  }, [items]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalItems = items.length;
    const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const lowStockItems = items.filter(item => (Number(item.quantity) || 0) <= (Number(item.minQuantity) || 0) && item.status !== 'Checked Out');
    const checkedOutItems = items.filter(item => item.status === 'Checked Out' || (item.checkedOutBy && item.checkedOutBy.trim() !== ''));
    const totalValuation = items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const cost = Number(item.costPerUnit) || 0;
      return sum + (qty * cost);
    }, 0);

    return {
      totalItems,
      totalUnits,
      lowStockCount: lowStockItems.length,
      checkedOutCount: checkedOutItems.length,
      totalValuation
    };
  }, [items]);

  // Filtered & Sorted Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSku = item.sku?.toLowerCase().includes(q);
        const matchesVendor = item.vendor?.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        const matchesBorrower = item.checkedOutBy?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesVendor && !matchesLoc && !matchesNotes && !matchesBorrower) {
          return false;
        }
      }

      // Tab filtering
      if (activeTab === 'lowstock') {
        if (item.quantity > item.minQuantity) return false;
      } else if (activeTab === 'checkout') {
        if (item.status !== 'Checked Out' && !item.checkedOutBy) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

      // Status filter
      if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;

      // Location filter
      if (selectedLocation !== 'All' && item.location !== selectedLocation) return false;

      // Vendor filter
      if (selectedVendor !== 'All' && item.vendor !== selectedVendor) return false;

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'quantity') {
        comparison = a.quantity - b.quantity;
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === 'updatedAt') {
        comparison = (a.updatedAt || 0) - (b.updatedAt || 0);
      } else if (sortBy === 'cost') {
        comparison = (a.costPerUnit || 0) - (b.costPerUnit || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [items, searchQuery, activeTab, selectedCategory, selectedStatus, selectedLocation, selectedVendor, sortBy, sortOrder]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('REV Robotics Parts');
    setFormSku('');
    setFormVendor('REV Robotics');
    setFormQuantity(1);
    setFormMinQuantity(1);
    setFormUnit('pcs');
    setFormLocation('REV Cabinet - Shelf 1');
    setFormStatus('In Stock');
    setFormCondition('New');
    setFormCostPerUnit('');
    setFormItemUrl('');
    setFormNotes('');
    setFormImageData('');
    setIsItemModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormSku(item.sku || '');
    setFormVendor(item.vendor || '');
    setFormQuantity(item.quantity);
    setFormMinQuantity(item.minQuantity);
    setFormUnit(item.unit || 'pcs');
    setFormLocation(item.location);
    setFormStatus(item.status);
    setFormCondition(item.condition);
    setFormCostPerUnit(item.costPerUnit !== undefined ? String(item.costPerUnit) : '');
    setFormItemUrl(item.itemUrl || '');
    setFormNotes(item.notes || '');
    setFormImageData(item.imageUrl || '');
    setIsItemModalOpen(true);
  };

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressAndResizeImage(file, 600, 0.7);
      setFormImageData(compressedDataUrl);
      showToast('Item photo attached successfully.', 'info');
    } catch {
      showToast('Failed to process image file.', 'danger');
    }
  };

  // Submit Item Save
  const handleSaveItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter an item name.', 'danger');
      return;
    }
    if (!formLocation.trim()) {
      showToast('Please specify a storage location.', 'danger');
      return;
    }

    setIsSubmitting(true);
    const now = Date.now();
    const cost = formCostPerUnit ? parseFloat(formCostPerUnit) : undefined;

    // Determine status automatically if 0
    let autoStatus = formStatus;
    if (formQuantity <= 0 && autoStatus !== 'Checked Out' && autoStatus !== 'Ordered') {
      autoStatus = 'Out of Stock';
    } else if (formQuantity <= formMinQuantity && autoStatus === 'In Stock') {
      autoStatus = 'Low Stock';
    }

    const itemToSave: InventoryItem = {
      id: editingItem ? editingItem.id : 'inv_' + now + '_' + Math.random().toString(36).substring(2, 7),
      name: formName.trim(),
      category: formCategory,
      sku: formSku.trim() || undefined,
      vendor: formVendor.trim() || undefined,
      quantity: Number(formQuantity),
      minQuantity: Number(formMinQuantity),
      unit: formUnit.trim() || 'pcs',
      location: formLocation.trim(),
      status: autoStatus,
      condition: formCondition,
      costPerUnit: !isNaN(cost as number) ? cost : undefined,
      itemUrl: formItemUrl.trim() || undefined,
      notes: formNotes.trim() || undefined,
      imageUrl: formImageData || undefined,
      checkedOutBy: editingItem ? editingItem.checkedOutBy : null,
      checkedOutByEmail: editingItem ? editingItem.checkedOutByEmail : null,
      checkedOutDate: editingItem ? editingItem.checkedOutDate : null,
      checkedOutExpectedReturn: editingItem ? editingItem.checkedOutExpectedReturn : null,
      checkedOutNotes: editingItem ? editingItem.checkedOutNotes : null,
      createdAt: editingItem ? editingItem.createdAt : now,
      createdBy: editingItem ? editingItem.createdBy : (currentUser?.name || 'Team Member'),
      createdByEmail: editingItem ? editingItem.createdByEmail : (currentUser?.schoolEmail || 'member@school.edu'),
      updatedAt: now,
      updatedBy: currentUser?.name || 'Team Member'
    };

    const success = await onSaveItem(itemToSave);
    setIsSubmitting(false);
    if (success) {
      setIsItemModalOpen(false);
      showToast(editingItem ? 'Item updated successfully!' : 'New inventory item added!', 'success');

      // Log movement transaction if created new
      if (!editingItem) {
        onAddTransaction({
          itemId: itemToSave.id,
          itemName: itemToSave.name,
          type: 'restock',
          quantityChanged: itemToSave.quantity,
          resultingQuantity: itemToSave.quantity,
          performedBy: currentUser?.name || 'Team Member',
          performedByEmail: currentUser?.schoolEmail || 'member@school.edu',
          notes: 'Initial inventory creation'
        });
      }
    } else {
      showToast('Error saving item to database. Please check permissions.', 'danger');
    }
  };

  // Open Checkout Modal
  const handleOpenCheckout = (item: InventoryItem) => {
    setCheckoutTargetItem(item);
    setCheckoutBorrowerName(currentUser?.name || '');
    setCheckoutBorrowerEmail(currentUser?.schoolEmail || '');
    setCheckoutReturnDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
    setCheckoutNotes('');
    setIsCheckoutModalOpen(true);
  };

  // Submit Checkout
  const handleConfirmCheckout = async () => {
    if (!checkoutTargetItem || !checkoutBorrowerName.trim()) {
      showToast('Please select or specify a borrower name.', 'danger');
      return;
    }

    const updatedItem: InventoryItem = {
      ...checkoutTargetItem,
      status: 'Checked Out',
      checkedOutBy: checkoutBorrowerName.trim(),
      checkedOutByEmail: checkoutBorrowerEmail.trim() || null,
      checkedOutDate: new Date().toISOString().split('T')[0],
      checkedOutExpectedReturn: checkoutReturnDate || null,
      checkedOutNotes: checkoutNotes.trim() || null,
      updatedAt: Date.now(),
      updatedBy: currentUser?.name || 'Team Member'
    };

    const success = await onSaveItem(updatedItem);
    if (success) {
      await onAddTransaction({
        itemId: checkoutTargetItem.id,
        itemName: checkoutTargetItem.name,
        type: 'check_out',
        quantityChanged: 0,
        resultingQuantity: checkoutTargetItem.quantity,
        performedBy: checkoutBorrowerName.trim(),
        performedByEmail: checkoutBorrowerEmail.trim() || (currentUser?.schoolEmail || ''),
        notes: `Checked out to ${checkoutBorrowerName.trim()}${checkoutReturnDate ? ` (Return by: ${checkoutReturnDate})` : ''}: ${checkoutNotes || 'No notes'}`
      });

      setIsCheckoutModalOpen(false);
      showToast(`Checked out ${checkoutTargetItem.name} to ${checkoutBorrowerName}!`, 'success');
    } else {
      showToast('Failed to check out item.', 'danger');
    }
  };

  // Open Checkin Modal
  const handleOpenCheckin = (item: InventoryItem) => {
    setCheckinTargetItem(item);
    setCheckinCondition(item.condition || 'Good');
    setCheckinNotes('');
    setIsCheckinModalOpen(true);
  };

  // Submit Checkin
  const handleConfirmCheckin = async () => {
    if (!checkinTargetItem) return;

    let nextStatus: InventoryItemStatus = 'In Stock';
    if (checkinTargetItem.quantity <= 0) {
      nextStatus = 'Out of Stock';
    } else if (checkinTargetItem.quantity <= checkinTargetItem.minQuantity) {
      nextStatus = 'Low Stock';
    }

    const updatedItem: InventoryItem = {
      ...checkinTargetItem,
      status: checkinCondition === 'Damaged/Needs Repair' ? 'Damaged/Repair' : nextStatus,
      condition: checkinCondition,
      checkedOutBy: null,
      checkedOutByEmail: null,
      checkedOutDate: null,
      checkedOutExpectedReturn: null,
      checkedOutNotes: null,
      updatedAt: Date.now(),
      updatedBy: currentUser?.name || 'Team Member'
    };

    const success = await onSaveItem(updatedItem);
    if (success) {
      await onAddTransaction({
        itemId: checkinTargetItem.id,
        itemName: checkinTargetItem.name,
        type: 'check_in',
        quantityChanged: 0,
        resultingQuantity: checkinTargetItem.quantity,
        performedBy: currentUser?.name || 'Team Member',
        performedByEmail: currentUser?.schoolEmail || 'member@school.edu',
        notes: `Returned item in ${checkinCondition} condition. ${checkinNotes ? `Notes: ${checkinNotes}` : ''}`
      });

      setIsCheckinModalOpen(false);
      showToast(`Returned ${checkinTargetItem.name} to inventory!`, 'success');
    } else {
      showToast('Failed to return item.', 'danger');
    }
  };

  // Open Adjust Modal
  const handleOpenAdjust = (item: InventoryItem, delta = 1) => {
    setAdjustTargetItem(item);
    setAdjustDelta(delta);
    setAdjustReason(delta > 0 ? 'Restocked from shipment' : 'Used on robot assembly');
    setAdjustCustomNote('');
    setIsAdjustModalOpen(true);
  };

  // Submit Quick Adjust
  const handleConfirmAdjust = async () => {
    if (!adjustTargetItem) return;

    const newQty = Math.max(0, adjustTargetItem.quantity + adjustDelta);
    let newStatus: InventoryItemStatus = adjustTargetItem.status;
    if (newQty <= 0 && newStatus !== 'Checked Out') {
      newStatus = 'Out of Stock';
    } else if (newQty <= adjustTargetItem.minQuantity && newStatus !== 'Checked Out') {
      newStatus = 'Low Stock';
    } else if (newQty > adjustTargetItem.minQuantity && (newStatus === 'Low Stock' || newStatus === 'Out of Stock')) {
      newStatus = 'In Stock';
    }

    const updatedItem: InventoryItem = {
      ...adjustTargetItem,
      quantity: newQty,
      status: newStatus,
      updatedAt: Date.now(),
      updatedBy: currentUser?.name || 'Team Member'
    };

    const success = await onSaveItem(updatedItem);
    if (success) {
      await onAddTransaction({
        itemId: adjustTargetItem.id,
        itemName: adjustTargetItem.name,
        type: adjustDelta > 0 ? 'restock' : (adjustReason === 'Damaged / Broken' ? 'damage_report' : 'consume'),
        quantityChanged: adjustDelta,
        resultingQuantity: newQty,
        performedBy: currentUser?.name || 'Team Member',
        performedByEmail: currentUser?.schoolEmail || 'member@school.edu',
        notes: `${adjustReason}${adjustCustomNote ? ` (${adjustCustomNote})` : ''}`
      });

      setIsAdjustModalOpen(false);
      showToast(`Stock updated for ${adjustTargetItem.name} (${adjustDelta > 0 ? `+${adjustDelta}` : adjustDelta})`, 'success');
    } else {
      showToast('Failed to update stock quantity.', 'danger');
    }
  };

  // Delete Item
  const handleDeleteItemConfirm = async (item: InventoryItem) => {
    if (window.confirm(`Are you sure you want to permanently delete "${item.name}" from the inventory?`)) {
      const success = await onDeleteItem(item.id);
      if (success) {
        showToast(`Deleted ${item.name}`, 'info');
      } else {
        showToast('Failed to delete item.', 'danger');
      }
    }
  };

  // Detect seed / FTC Starter Kit demo items
  const starterKitItems = useMemo(() => {
    return items.filter(i => 
      DEFAULT_INVENTORY_ITEMS.some(d => d.id === i.id || d.name.toLowerCase().trim() === i.name.toLowerCase().trim()) ||
      i.id.startsWith('inv-item-') ||
      i.createdBy === 'FTC Kickoff Kit' ||
      i.createdBy === 'Mentor Steve'
    );
  }, [items]);

  // Remove / Purge FTC Starter Kit items
  const handleRemoveStarterKit = async () => {
    if (starterKitItems.length === 0) {
      showToast('No FTC Starter Kit items detected in inventory.', 'info');
      return;
    }
    if (window.confirm(`Are you sure you want to remove all ${starterKitItems.length} FTC Starter Kit sample items from your inventory? This will permanently delete the default sample parts.`)) {
      let deletedCount = 0;
      for (const item of starterKitItems) {
        const ok = await onDeleteItem(item.id);
        if (ok) deletedCount++;
      }
      showToast(`Removed ${deletedCount} FTC Starter Kit items from inventory.`, 'info');
    }
  };

  // Clear all items (mentor/captain only)
  const handleClearAllInventory = async () => {
    if (items.length === 0) {
      showToast('Inventory is already empty.', 'info');
      return;
    }
    if (window.confirm(`WARNING: This will permanently delete ALL ${items.length} inventory items from the database. Are you sure you want to proceed with a clean slate?`)) {
      let deletedCount = 0;
      for (const item of items) {
        const ok = await onDeleteItem(item.id);
        if (ok) deletedCount++;
      }
      showToast(`Cleared ${deletedCount} inventory items.`, 'info');
    }
  };

  // Seed / Reset Demo items
  const handleSeedDefaults = async () => {
    if (window.confirm('Would you like to populate the inventory with standard FTC Robotics parts, motors, electronics, fasteners, and tools? (Existing matching items will be kept).')) {
      let count = 0;
      for (const item of DEFAULT_INVENTORY_ITEMS) {
        if (!items.some(i => i.id === item.id || i.name.toLowerCase() === item.name.toLowerCase())) {
          await onSaveItem(item);
          count++;
        }
      }
      showToast(`Added ${count} robotics room starter items!`, 'success');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'SKU', 'Vendor', 'Quantity', 'Min Quantity', 'Unit', 'Location', 'Status', 'Condition', 'Cost Per Unit', 'Checked Out By', 'Notes'];
    const rows = filteredItems.map(item => [
      item.id,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${(item.sku || '').replace(/"/g, '""')}"`,
      `"${(item.vendor || '').replace(/"/g, '""')}"`,
      item.quantity,
      item.minQuantity,
      item.unit,
      `"${(item.location || '').replace(/"/g, '""')}"`,
      item.status,
      item.condition,
      item.costPerUnit || 0,
      `"${(item.checkedOutBy || '').replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FTC_6567_Robotics_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported inventory to CSV.', 'success');
  };

  // Group items by physical location for Location tab
  const locationGroups = useMemo(() => {
    const groups: Record<string, InventoryItem[]> = {};
    items.forEach(item => {
      const loc = item.location.trim() || 'Unassigned / Bench Top';
      if (!groups[loc]) groups[loc] = [];
      groups[loc].push(item);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 dark:bg-slate-950 dark:text-slate-100 font-sans">
      
      {/* TOP COMMAND HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Return to Hub"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl border border-rose-500/20">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold font-display tracking-tight text-slate-900 dark:text-white">
                    Robotics Room Inventory
                  </h1>
                  <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    FTC #6567
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Parts, Motors, Electronics, Hardware, Fasteners &amp; Tool Management
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* CUSTOMIZE LABELS STUDIO BUTTON */}
            <button
              onClick={() => setIsLabelCustomizerOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs dark:bg-rose-950/40 dark:border-rose-700/60 dark:text-rose-300 dark:hover:bg-rose-900/50"
              id="customize-labels-btn"
              title="Open full label customizer with QR codes, drawer sizes, and presets"
            >
              <Tag className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Customize Labels</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-750"
              id="print-inventory-btn"
              title="Print documents and sheets"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Print Docs</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-750"
              id="export-inventory-csv"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export CSV</span>
            </button>

            {/* REMOVE STARTER KIT BUTTON (WHEN SEED ITEMS PRESENT) */}
            {starterKitItems.length > 0 && (
              <button
                onClick={handleRemoveStarterKit}
                className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/50"
                title="Remove all FTC Starter Kit sample items"
                id="remove-starter-kit-btn"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span>Remove Starter Kit ({starterKitItems.length})</span>
              </button>
            )}

            {/* OPTIONAL SEED STARTER KIT (WHEN CATALOG HAS VERY FEW ITEMS) */}
            {items.length === 0 && (
              <button
                onClick={handleSeedDefaults}
                className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer dark:bg-amber-950/40 dark:border-amber-700/60 dark:text-amber-300 dark:hover:bg-amber-900/50"
                title="Optional: Populate with standard FTC robotics starter kit"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Optional: Seed Starter Kit</span>
              </button>
            )}

            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              id="add-new-item-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>

        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* METRICS DASHBOARD CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Catalog</span>
              <Package className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white">
                {metrics.totalItems}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">SKUs</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{metrics.totalUnits} total parts logged</p>
          </div>

          <div 
            onClick={() => { setActiveTab('lowstock'); setSelectedCategory('All'); setSelectedStatus('All'); }}
            className={`bg-white border rounded-xl p-4 shadow-2xs transition-all cursor-pointer dark:bg-slate-900 ${
              metrics.lowStockCount > 0 
                ? 'border-amber-300 hover:border-amber-500 bg-amber-50/30 dark:border-amber-800/60 dark:hover:border-amber-600' 
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Low Stock Alert
              </span>
              <AlertTriangle className={`w-4 h-4 ${metrics.lowStockCount > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl sm:text-2xl font-black font-display ${metrics.lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                {metrics.lowStockCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">need reorder</span>
            </div>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1">Below minimum threshold</p>
          </div>

          <div 
            onClick={() => { setActiveTab('checkout'); setSelectedCategory('All'); setSelectedStatus('All'); }}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-purple-300 transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Checked Out
              </span>
              <ArrowRightLeft className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-display text-purple-600 dark:text-purple-400">
                {metrics.checkedOutCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">on loan</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Tools / equipment in use</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Valuation</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-display text-emerald-600 dark:text-emerald-400">
                ${metrics.totalValuation.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Estimated lab assets</p>
          </div>

          <div 
            onClick={() => setActiveTab('locations')}
            className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-cyan-300 transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                Room Bins
              </span>
              <MapPin className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white">
                {uniqueLocations.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">storage spots</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Cabinets, shelves &amp; pit carts</p>
          </div>

        </div>

        {/* PRIMARY MODULE NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
              activeTab === 'inventory'
                ? 'border-rose-500 text-rose-600 bg-white dark:bg-slate-900 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>All Inventory Items</span>
            <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('checkout')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
              activeTab === 'checkout'
                ? 'border-purple-500 text-purple-600 bg-white dark:bg-slate-900 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Tool Loans &amp; Check-Out</span>
            {metrics.checkedOutCount > 0 && (
              <span className="bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {metrics.checkedOutCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('lowstock')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
              activeTab === 'lowstock'
                ? 'border-amber-500 text-amber-600 bg-white dark:bg-slate-900 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Low Stock Reorders</span>
            {metrics.lowStockCount > 0 && (
              <span className="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {metrics.lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
              activeTab === 'locations'
                ? 'border-cyan-500 text-cyan-600 bg-white dark:bg-slate-900 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Lab Storage Map</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-600 bg-white dark:bg-slate-900 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit &amp; Movement Log</span>
            <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {transactions.length}
            </span>
          </button>
        </div>

        {/* TAB 1: ALL INVENTORY ITEMS & LOW STOCK & CHECKOUT VIEWS */}
        {(activeTab === 'inventory' || activeTab === 'lowstock' || activeTab === 'checkout') && (
          <div className="space-y-4">
            
            {/* SEARCH, CATEGORY PILLS & FILTERS */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 dark:bg-slate-900 dark:border-slate-800">
              
              {/* Top search & quick toggles */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by part name, SKU, vendor, storage shelf, notes, or borrower..."
                    className="w-full pl-10 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-800"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status filter */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                  >
                    <option value="All">All Statuses</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Checked Out">Checked Out</option>
                    <option value="Ordered">Ordered</option>
                    <option value="Damaged/Repair">Damaged/Repair</option>
                  </select>

                  {/* Location filter */}
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 max-w-[140px] truncate"
                  >
                    <option value="All">All Locations</option>
                    {uniqueLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>

                  {/* Sort By */}
                  <select
                    value={`${sortBy}_${sortOrder}`}
                    onChange={(e) => {
                      const [sb, so] = e.target.value.split('_') as [any, 'asc' | 'desc'];
                      setSortBy(sb);
                      setSortOrder(so);
                    }}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                  >
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="quantity_asc">Quantity (Low → High)</option>
                    <option value="quantity_desc">Quantity (High → Low)</option>
                    <option value="category_asc">Category</option>
                    <option value="status_asc">Status</option>
                    <option value="cost_desc">Cost (High → Low)</option>
                    <option value="updatedAt_desc">Recently Updated</option>
                  </select>

                  {/* View mode toggle */}
                  <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                        viewMode === 'grid' 
                          ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white' 
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                      title="Grid View"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                        viewMode === 'table' 
                          ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white' 
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                      title="Table View"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'All'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  All Categories ({items.length})
                </button>
                {CATEGORIES.map(cat => {
                  const count = items.filter(i => i.category === cat).length;
                  if (count === 0 && selectedCategory !== cat) return null;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        selectedCategory === cat
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="opacity-70 text-[10px] font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* ITEMS LISTING (GRID OR TABLE) */}
            {filteredItems.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center dark:bg-slate-800">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No inventory items match your current filter
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto dark:text-slate-400">
                  Try clearing search keywords or selecting another category filter.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedStatus('All'); setSelectedLocation('All'); }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer dark:bg-slate-800 dark:text-slate-300"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Add First Item
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              
              /* GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => {
                  const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Other'];
                  const statusBadge = STATUS_BADGES[item.status] || STATUS_BADGES['In Stock'];
                  const isLow = item.quantity <= item.minQuantity;
                  const isCheckedOut = item.status === 'Checked Out' || (item.checkedOutBy && item.checkedOutBy.trim() !== '');

                  return (
                    <div
                      key={item.id}
                      className={`bg-white border rounded-xl p-4.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group dark:bg-slate-900 ${
                        isCheckedOut 
                          ? 'border-purple-200 dark:border-purple-900/50 hover:border-purple-400' 
                          : isLow 
                            ? 'border-amber-200 dark:border-amber-900/50 hover:border-amber-400' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Header: Category & Status */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border} ${catStyle.darkBg}`}>
                            {item.category}
                          </span>
                          
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                            <span>{item.status}</span>
                          </span>
                        </div>

                        {/* Title & SKU */}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {item.name}
                        </h4>

                        {/* SKU & Vendor */}
                        {(item.sku || item.vendor) && (
                          <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {item.vendor && <span>{item.vendor}</span>}
                            {item.vendor && item.sku && <span>•</span>}
                            {item.sku && <span className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-700 dark:text-slate-300 font-semibold">{item.sku}</span>}
                          </div>
                        )}

                        {/* Storage Location */}
                        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium truncate">{item.location}</span>
                        </div>

                        {/* Checked out info if loan */}
                        {isCheckedOut && (
                          <div className="mt-2.5 p-2 rounded-lg bg-purple-50 border border-purple-200 text-xs dark:bg-purple-950/40 dark:border-purple-800/40 space-y-1">
                            <div className="flex items-center justify-between font-bold text-purple-900 dark:text-purple-300">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-purple-600" />
                                <span>{item.checkedOutBy}</span>
                              </span>
                              {item.checkedOutExpectedReturn && (
                                <span className="text-[10px] font-mono font-normal">
                                  Return: {item.checkedOutExpectedReturn}
                                </span>
                              )}
                            </div>
                            {item.checkedOutNotes && (
                              <p className="text-[11px] text-purple-700 dark:text-purple-400 italic">
                                "{item.checkedOutNotes}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && !isCheckedOut && (
                          <p className="mt-2 text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Bottom row: Quantity stepper & Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 dark:border-slate-800">
                        
                        {/* Stock Counter */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenAdjust(item, -1)}
                            disabled={item.quantity <= 0}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs transition-all disabled:opacity-40 cursor-pointer dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            title="Decrease stock (-1)"
                          >
                            -
                          </button>
                          
                          <div className="text-center px-1.5">
                            <span className={`text-base font-black font-display ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                              {item.quantity}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1 font-mono">{item.unit || 'pcs'}</span>
                          </div>

                          <button
                            onClick={() => handleOpenAdjust(item, 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs transition-all cursor-pointer dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            title="Increase stock (+1)"
                          >
                            +
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          {item.itemUrl && (
                            <a
                              href={item.itemUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all"
                              title="Open supplier link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {isCheckedOut ? (
                            <button
                              onClick={() => handleOpenCheckin(item)}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                              title="Return checked out item"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Check In</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenCheckout(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 dark:hover:text-purple-300 transition-all cursor-pointer"
                              title="Check out item / tool to a team member"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                            title="Edit details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {isMentorOrCaptain && (
                            <button
                              onClick={() => handleDeleteItemConfirm(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-all cursor-pointer"
                              title="Delete from inventory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>

            ) : (

              /* TABLE VIEW */
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs dark:bg-slate-900 dark:border-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Item Details</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3 text-center">Stock Level</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Cost / Unit</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredItems.map(item => {
                        const isLow = item.quantity <= item.minQuantity;
                        const statusBadge = STATUS_BADGES[item.status] || STATUS_BADGES['In Stock'];
                        const isCheckedOut = item.status === 'Checked Out' || Boolean(item.checkedOutBy);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                                {item.vendor && <span>{item.vendor}</span>}
                                {item.sku && <span>SKU: {item.sku}</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{item.location}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenAdjust(item, -1)}
                                  disabled={item.quantity <= 0}
                                  className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs disabled:opacity-30 dark:bg-slate-800 dark:text-slate-200"
                                >
                                  -
                                </button>
                                <span className={`font-black font-display text-sm ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                                  {item.quantity}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">{item.unit}</span>
                                <button
                                  onClick={() => handleOpenAdjust(item, 1)}
                                  className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs dark:bg-slate-800 dark:text-slate-200"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                                <span>{item.status}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300">
                              {item.costPerUnit ? `$${item.costPerUnit.toFixed(2)}` : '—'}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                {isCheckedOut ? (
                                  <button
                                    onClick={() => handleOpenCheckin(item)}
                                    className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold"
                                  >
                                    Check In
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleOpenCheckout(item)}
                                    className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                                    title="Check out"
                                  >
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                {isMentorOrCaptain && (
                                  <button
                                    onClick={() => handleDeleteItemConfirm(item)}
                                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: LAB STORAGE MAP & BIN DIRECTORY */}
        {activeTab === 'locations' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Physical Storage Bin &amp; Cabinet Map
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quickly locate hardware, motors, tools, and electronics organized by their physical storage spots in the robotics lab.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 px-2.5 py-1 rounded-lg">
                {locationGroups.length} Defined Locations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locationGroups.map(([loc, locItems]) => (
                <div key={loc} className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs dark:bg-slate-900 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {loc}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
                      {locItems.length} items
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {locItems.map(item => (
                      <div key={item.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.sku ? `SKU: ${item.sku} • ` : ''}{item.category}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-black font-display text-xs ${item.quantity <= item.minQuantity ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => handleOpenAdjust(item, 1)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            title="Quick Stock Adjust"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT & MOVEMENT TRANSACTION LOG */}
        {activeTab === 'history' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs dark:bg-slate-900 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Inventory Movement &amp; Check-Out Audit Log
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chronological history of all tool loans, check-ins, restock receipts, and chassis part consumptions.
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                {transactions.length} Total Events
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No inventory transactions logged yet. Check out a tool or adjust part stock to see activity here.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {transactions.map(tx => {
                  let badge = { bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400', label: 'Restock' };
                  if (tx.type === 'check_out') badge = { bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400', label: 'Check Out' };
                  if (tx.type === 'check_in') badge = { bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', label: 'Check In' };
                  if (tx.type === 'consume') badge = { bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400', label: 'Consumed' };
                  if (tx.type === 'damage_report') badge = { bg: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400', label: 'Damage' };

                  return (
                    <div key={tx.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {tx.itemName}
                          </span>
                          {tx.quantityChanged !== 0 && (
                            <span className={`font-mono font-bold text-xs ${tx.quantityChanged > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              ({tx.quantityChanged > 0 ? `+${tx.quantityChanged}` : tx.quantityChanged})
                            </span>
                          )}
                        </div>
                        {tx.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {tx.notes}
                          </p>
                        )}
                      </div>

                      <div className="text-right sm:text-right text-[11px] text-slate-400 font-mono shrink-0">
                        <div>By: <span className="text-slate-700 dark:text-slate-300 font-semibold">{tx.performedBy}</span></div>
                        <div>{new Date(tx.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT ITEM MODAL */}
      {/* ========================================================================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 my-8 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingItem ? 'Edit Inventory Item' : 'Add New Robotics Item'}
                </h3>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemSubmit} className="space-y-4 text-xs">
              
              {/* Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. goBILDA 5203 Yellow Jacket Planetary Gear Motor (312 RPM)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              {/* Category & Vendor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as InventoryCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vendor / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    placeholder="e.g. REV Robotics, goBILDA, AndyMark, Amazon, McMaster"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* SKU & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Part Number / SKU
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. REV-31-1595, 5203-2402-0019"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Storage Location / Bin *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Electronics Cabinet A, Tool Wall, Bin #4"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Quantity, Min Quantity, Unit, Cost */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Min Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinQuantity}
                    onChange={(e) => setFormMinQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="pcs, kits, spools"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cost / Unit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formCostPerUnit}
                    onChange={(e) => setFormCostPerUnit(e.target.value)}
                    placeholder="24.99"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Status & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Stock Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as InventoryItemStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Checked Out">Checked Out</option>
                    <option value="Ordered">Ordered</option>
                    <option value="Damaged/Repair">Damaged/Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Condition
                  </label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as InventoryCondition)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  >
                    <option value="New">New / Sealed</option>
                    <option value="Good">Good Working Condition</option>
                    <option value="Fair">Fair / Well Used</option>
                    <option value="Damaged/Needs Repair">Damaged / Needs Repair</option>
                    <option value="Retired">Retired / Obsolete</option>
                  </select>
                </div>
              </div>

              {/* Supplier URL */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product / Purchase URL (Optional)
                </label>
                <input
                  type="url"
                  value={formItemUrl}
                  onChange={(e) => setFormItemUrl(e.target.value)}
                  placeholder="https://www.revrobotics.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              {/* Notes & Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Firmware version, motor gearbox ratios installed, wiring harness specifications..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition-all cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Create Item')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TOOL CHECK-OUT MODAL */}
      {/* ========================================================================= */}
      {isCheckoutModalOpen && checkoutTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Check Out Equipment / Tool
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Log who is borrowing this item from the robotics lab.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white text-xs">{checkoutTargetItem.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Location: <span className="font-semibold text-slate-700 dark:text-slate-300">{checkoutTargetItem.location}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Team Member / Borrower Name *
                </label>
                <input
                  type="text"
                  value={checkoutBorrowerName}
                  onChange={(e) => setCheckoutBorrowerName(e.target.value)}
                  placeholder="e.g. Alex Rivera or Sam Chen"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Borrower Email
                </label>
                <input
                  type="email"
                  value={checkoutBorrowerEmail}
                  onChange={(e) => setCheckoutBorrowerEmail(e.target.value)}
                  placeholder="student@school.edu"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  value={checkoutReturnDate}
                  onChange={(e) => setCheckoutReturnDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Purpose / Reason
                </label>
                <input
                  type="text"
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="e.g. Soldering intake wiring at home, or pit bag for league meet"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckout}
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Confirm Check Out
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TOOL CHECK-IN MODAL */}
      {/* ========================================================================= */}
      {isCheckinModalOpen && checkinTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Return Item / Tool Check-In
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Confirm return to laboratory storage.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckinModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">{checkinTargetItem.name}</div>
              <div className="text-slate-500 dark:text-slate-400">
                Borrowed by: <span className="font-semibold text-purple-600 dark:text-purple-400">{checkinTargetItem.checkedOutBy}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Storage Destination: <span className="font-semibold text-slate-700 dark:text-slate-300">{checkinTargetItem.location}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Returned Condition
                </label>
                <select
                  value={checkinCondition}
                  onChange={(e) => setCheckinCondition(e.target.value as InventoryCondition)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                >
                  <option value="Good">Good / Ready for use</option>
                  <option value="New">Like New</option>
                  <option value="Fair">Fair / Normal Wear</option>
                  <option value="Damaged/Needs Repair">Damaged / Needs Repair or Tips replaced</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Return Notes (Optional)
                </label>
                <input
                  type="text"
                  value={checkinNotes}
                  onChange={(e) => setCheckinNotes(e.target.value)}
                  placeholder="e.g. Cleaned soldering tip and returned to shelf"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCheckinModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckin}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Confirm Return
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: QUICK QUANTITY ADJUST MODAL */}
      {/* ========================================================================= */}
      {isAdjustModalOpen && adjustTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Stock Quantity Adjustment
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Log part consumption or shipment restock.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">{adjustTargetItem.name}</div>
              <div className="text-slate-500 mt-1 flex items-center gap-3">
                <span>Current: <strong className="text-slate-800 dark:text-slate-200 font-mono">{adjustTargetItem.quantity} {adjustTargetItem.unit}</strong></span>
                <span>→</span>
                <span>New: <strong className="text-rose-600 dark:text-rose-400 font-mono">{Math.max(0, adjustTargetItem.quantity + adjustDelta)} {adjustTargetItem.unit}</strong></span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Adjustment Amount ({adjustTargetItem.unit})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAdjustDelta(-1)}
                      className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 font-bold dark:bg-slate-800 text-xs"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustDelta(1)}
                      className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 font-bold dark:bg-slate-800 text-xs"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustDelta(5)}
                      className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 font-bold dark:bg-slate-800 text-xs"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Adjustment
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                >
                  <option value="Restocked from shipment">Restocked from shipment</option>
                  <option value="Used on robot assembly">Used on robot assembly</option>
                  <option value="Used for testing / prototyping">Used for testing / prototyping</option>
                  <option value="Damaged / Broken">Damaged / Broken / Worn Out</option>
                  <option value="Annual inventory count correction">Annual inventory count correction</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Audit Note (Optional)
                </label>
                <input
                  type="text"
                  value={adjustCustomNote}
                  onChange={(e) => setAdjustCustomNote(e.target.value)}
                  placeholder="e.g. Installed on intake wrist pivot assembly"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjust}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Save Adjustment
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PRINT INVENTORY & STORAGE BIN LABELS MODAL */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 my-8 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Print Robotics Lab Documents &amp; Storage Labels
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    High-contrast formatted sheets for room audits and plastic drawer labeling.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Layout selector */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPrintLayoutType('full_inventory')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  printLayoutType === 'full_inventory'
                    ? 'border-rose-500 bg-rose-50/40 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-600'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-750'
                }`}
              >
                <div className="font-bold text-xs mb-1">Full Lab Inventory</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">All {items.length} items organized by category for room audit.</div>
              </button>

              <button
                type="button"
                onClick={() => setPrintLayoutType('low_stock_bom')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  printLayoutType === 'low_stock_bom'
                    ? 'border-amber-500 bg-amber-50/40 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-600'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-750'
                }`}
              >
                <div className="font-bold text-xs mb-1">Low Stock Reorder BOM</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{metrics.lowStockCount} items below threshold with vendor part numbers.</div>
              </button>

              <button
                type="button"
                onClick={() => setPrintLayoutType('bin_labels')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  printLayoutType === 'bin_labels'
                    ? 'border-cyan-500 bg-cyan-50/40 text-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200 dark:border-cyan-600'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-750'
                }`}
              >
                <div className="font-bold text-xs mb-1">Drawer &amp; Bin Labels</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">High-contrast labels to cut and tape onto storage boxes.</div>
              </button>
            </div>

            {/* Print Preview Container */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 max-h-72 overflow-y-auto font-sans text-xs text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200">
              <div className="text-center font-bold pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="text-sm uppercase tracking-wider text-rose-600 dark:text-rose-400">FTC Team #6567 RoboRaiders</div>
                <div className="text-xs text-slate-500">
                  {printLayoutType === 'full_inventory' ? 'Master Robotics Room Inventory Audit' : printLayoutType === 'low_stock_bom' ? 'Low Stock Reorder Bill of Materials (BOM)' : 'Storage Bin Labels Sheet'}
                </div>
              </div>

              {printLayoutType === 'bin_labels' ? (
                <div className="grid grid-cols-2 gap-2 pt-3">
                  {filteredItems.map(item => (
                    <div key={item.id} className="border border-slate-400 bg-white p-2.5 rounded text-slate-900 space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-500">{item.category}</div>
                      <div className="font-bold text-xs">{item.name}</div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-600 pt-1 border-t border-slate-200">
                        <span>{item.sku ? `SKU: ${item.sku}` : item.vendor}</span>
                        <span>Loc: {item.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pt-3 space-y-2">
                  {(printLayoutType === 'low_stock_bom' ? items.filter(i => i.quantity <= i.minQuantity) : filteredItems).map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 py-1.5 text-xs">
                      <div>
                        <span className="font-bold">{item.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2 font-mono">{item.sku || item.vendor} • {item.location}</span>
                      </div>
                      <div className="font-mono font-bold">
                        {item.quantity} {item.unit} (Min: {item.minQuantity})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                Clicking print will trigger your browser print dialog.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOMIZE LABELS STUDIO MODAL */}
      <LabelCustomizerModal
        isOpen={isLabelCustomizerOpen}
        onClose={() => setIsLabelCustomizerOpen(false)}
        items={items}
      />

    </div>
  );
}
