import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Layers, 
  AlertCircle, 
  FolderPlus, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  Tag,
  Pencil,
  Save,
  RotateCcw
} from 'lucide-react';
import { StorageLocation } from '../data/storageLocations';

export interface StorageLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: StorageLocation[];
  onAddLocation: (name: string, zone?: string, description?: string, subAreas?: string[]) => string;
  onEditLocation?: (id: string, updates: { name: string; zone?: string; description?: string; subAreas?: string[] }) => void;
  onDeleteLocation: (id: string) => void;
  onAddSubArea?: (locationId: string, subAreaName: string) => void;
  onDeleteSubArea?: (locationId: string, subAreaName: string) => void;
  onRenameSubArea?: (locationId: string, oldSubAreaName: string, newSubAreaName: string) => void;
  onSelectLocation?: (locationName: string, subArea?: string) => void;
}

export const StorageLocationModal: React.FC<StorageLocationModalProps> = ({
  isOpen,
  onClose,
  locations,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
  onAddSubArea,
  onDeleteSubArea,
  onRenameSubArea,
  onSelectLocation
}) => {
  // New Location Creation State
  const [name, setName] = useState('');
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');
  const [subAreas, setSubAreas] = useState<string[]>([]);
  const [newSubAreaInput, setNewSubAreaInput] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing Location State
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editZone, setEditZone] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSubAreas, setEditSubAreas] = useState<string[]>([]);
  const [editNewSubAreaInput, setEditNewSubAreaInput] = useState('');
  const [editError, setEditError] = useState('');

  // Confirmation state for deleting a location
  const [confirmDeleteLocId, setConfirmDeleteLocId] = useState<string | null>(null);

  // Sub-area inline renaming state
  const [renamingSubAreaTarget, setRenamingSubAreaTarget] = useState<{ locId: string; oldName: string } | null>(null);
  const [renamingSubAreaText, setRenamingSubAreaText] = useState('');

  // Track inline adding of sub-area for an existing location
  const [addingSubAreaForLocId, setAddingSubAreaForLocId] = useState<string | null>(null);
  const [inlineSubAreaText, setInlineSubAreaText] = useState('');

  // Track expanded state of sub areas in location cards
  const [expandedLocIds, setExpandedLocIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleExpand = (locId: string) => {
    setExpandedLocIds(prev => ({
      ...prev,
      [locId]: !prev[locId]
    }));
  };

  // --- New Location Sub-Area Tags ---
  const handleAddSubAreaTag = (tagToAdd?: string) => {
    const text = (tagToAdd !== undefined ? tagToAdd : newSubAreaInput).trim();
    if (!text) return;
    if (subAreas.some(s => s.toLowerCase() === text.toLowerCase())) {
      setError(`Sub-area "${text}" already added.`);
      return;
    }
    setSubAreas(prev => [...prev, text]);
    setNewSubAreaInput('');
    setError('');
  };

  const handleRemoveSubAreaTag = (indexToRemove: number) => {
    setSubAreas(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleApplyPreset = (presetTags: string[]) => {
    const existingLower = new Set(subAreas.map(s => s.toLowerCase()));
    const toAdd = presetTags.filter(t => !existingLower.has(t.toLowerCase()));
    if (toAdd.length > 0) {
      setSubAreas(prev => [...prev, ...toAdd]);
    }
  };

  // --- Inline Add Sub-Area for existing location ---
  const handleInlineAddSubArea = (locationId: string) => {
    const trimmed = inlineSubAreaText.trim();
    if (!trimmed) {
      setAddingSubAreaForLocId(null);
      return;
    }
    if (onAddSubArea) {
      onAddSubArea(locationId, trimmed);
    }
    setInlineSubAreaText('');
    setAddingSubAreaForLocId(null);
  };

  // --- New Location Submission ---
  const handleSubmitNewLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Location name is required.');
      return;
    }

    if (locations.some(l => l.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A storage location with this name already exists.');
      return;
    }

    const createdName = onAddLocation(
      trimmedName, 
      zone.trim() || undefined, 
      description.trim() || undefined,
      subAreas.length > 0 ? subAreas : undefined
    );
    
    if (onSelectLocation) {
      onSelectLocation(createdName);
    }
    setName('');
    setZone('');
    setDescription('');
    setSubAreas([]);
    setNewSubAreaInput('');
    setError('');
    onClose();
  };

  // --- Edit Existing Location Handlers ---
  const handleStartEdit = (loc: StorageLocation) => {
    setEditingLocId(loc.id);
    setEditName(loc.name);
    setEditZone(loc.zone || '');
    setEditDescription(loc.description || '');
    setEditSubAreas([...(loc.subAreas || [])]);
    setEditNewSubAreaInput('');
    setEditError('');
    setConfirmDeleteLocId(null);
    setRenamingSubAreaTarget(null);
    // Expand this location card
    setExpandedLocIds(prev => ({ ...prev, [loc.id]: true }));
  };

  const handleCancelEdit = () => {
    setEditingLocId(null);
    setEditError('');
  };

  const handleAddEditSubAreaTag = (tagToAdd?: string) => {
    const text = (tagToAdd !== undefined ? tagToAdd : editNewSubAreaInput).trim();
    if (!text) return;
    if (editSubAreas.some(s => s.toLowerCase() === text.toLowerCase())) {
      setEditError(`Sub-area "${text}" already added to this location.`);
      return;
    }
    setEditSubAreas(prev => [...prev, text]);
    setEditNewSubAreaInput('');
    setEditError('');
  };

  const handleRemoveEditSubAreaTag = (indexToRemove: number) => {
    setEditSubAreas(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleApplyEditPreset = (presetTags: string[]) => {
    const existingLower = new Set(editSubAreas.map(s => s.toLowerCase()));
    const toAdd = presetTags.filter(t => !existingLower.has(t.toLowerCase()));
    if (toAdd.length > 0) {
      setEditSubAreas(prev => [...prev, ...toAdd]);
    }
  };

  const handleSaveEditLocation = (e: React.FormEvent, locId: string) => {
    e.preventDefault();
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditError('Location name is required.');
      return;
    }

    if (locations.some(l => l.id !== locId && l.name.toLowerCase() === trimmedName.toLowerCase())) {
      setEditError(`A storage location named "${trimmedName}" already exists.`);
      return;
    }

    if (onEditLocation) {
      onEditLocation(locId, {
        name: trimmedName,
        zone: editZone.trim() || undefined,
        description: editDescription.trim() || undefined,
        subAreas: editSubAreas
      });
    }

    setEditingLocId(null);
    setEditError('');
  };

  // --- Sub-Area Renaming Handlers ---
  const handleStartRenameSubArea = (locId: string, subAreaName: string) => {
    setRenamingSubAreaTarget({ locId, oldName: subAreaName });
    setRenamingSubAreaText(subAreaName);
  };

  const handleSaveRenameSubArea = () => {
    if (!renamingSubAreaTarget) return;
    const trimmed = renamingSubAreaText.trim();
    if (trimmed && trimmed !== renamingSubAreaTarget.oldName && onRenameSubArea) {
      onRenameSubArea(renamingSubAreaTarget.locId, renamingSubAreaTarget.oldName, trimmed);
    }
    setRenamingSubAreaTarget(null);
    setRenamingSubAreaText('');
  };

  const handleCancelRenameSubArea = () => {
    setRenamingSubAreaTarget(null);
    setRenamingSubAreaText('');
  };

  const filteredLocations = locations.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.zone && l.zone.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.subAreas && l.subAreas.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Storage Locations & Sub Areas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create, edit, and organize workshop cabinets, pit carts, and drawers into specific shelves and bins
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Creation Form */}
          <form onSubmit={handleSubmitNewLocation} className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Storage Location</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Location + Sub Areas</span>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Location Name / Main Unit *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Cabinet A, Pit Cart, Fastener Wall, Tool Chest"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Zone / Room (Optional)
                </label>
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="e.g. Robotics Lab, Fabrication Shop, Pit"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Description / Purpose (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Motion hardware, REV control hubs"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>

            {/* Sub Areas / Compartments Builder */}
            <div className="pt-1 border-t border-rose-100 dark:border-rose-900/30">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sub Areas / Shelves / Bins (Optional)
                </label>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {subAreas.length} {subAreas.length === 1 ? 'sub area' : 'sub areas'} defined
                </span>
              </div>

              {/* Sub-areas pill list */}
              {subAreas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5 p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-h-28 overflow-y-auto">
                  {subAreas.map((sub, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200"
                    >
                      <Tag className="w-2.5 h-2.5 opacity-60" />
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubAreaTag(idx)}
                        className="p-0.5 rounded-xs hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 transition-colors cursor-pointer"
                        title="Remove sub area"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input for new sub-area */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newSubAreaInput}
                  onChange={(e) => setNewSubAreaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubAreaTag();
                    }
                  }}
                  placeholder="Type a sub area (e.g. Shelf 1, Bin B4, Drawer 2) and press Enter..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddSubAreaTag()}
                  className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-900/60 dark:hover:bg-rose-900 dark:text-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Sub Area</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mr-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  <span>Presets:</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['Shelf 1', 'Shelf 2', 'Shelf 3'])}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium cursor-pointer transition-colors"
                >
                  + Shelves (1-3)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['Drawer 1', 'Drawer 2', 'Drawer 3', 'Drawer 4'])}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium cursor-pointer transition-colors"
                >
                  + Drawers (1-4)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['Bin A', 'Bin B', 'Bin C', 'Bin D'])}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium cursor-pointer transition-colors"
                >
                  + Bins (A-D)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['Top Tray', 'Middle Compartment', 'Bottom Tote'])}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium cursor-pointer transition-colors"
                >
                  + Pit Tray/Totes
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Location & Sub Areas</span>
              </button>
            </div>
          </form>

          {/* List of Existing Locations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Storage Locations ({locations.length})</span>
              </h4>

              {locations.length > 2 && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search locations or sub-areas..."
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-rose-500 w-48"
                />
              )}
            </div>

            {locations.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <MapPin className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  No custom storage locations created yet
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Use the form above to add your first bin, cabinet, or lab drawer with sub-areas.
                </p>
              </div>
            ) : filteredLocations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No locations match your search query.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {filteredLocations.map(loc => {
                  const isEditingThis = editingLocId === loc.id;
                  const locSubAreas = loc.subAreas || [];
                  const isAddingInline = addingSubAreaForLocId === loc.id;
                  const isExpanded = expandedLocIds[loc.id] !== false; // expanded by default
                  const isConfirmingDelete = confirmDeleteLocId === loc.id;

                  // --- RENDER INLINE EDITING CARD ---
                  if (isEditingThis) {
                    return (
                      <form
                        key={loc.id}
                        onSubmit={(e) => handleSaveEditLocation(e, loc.id)}
                        className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-600/70 shadow-md space-y-3 transition-all"
                      >
                        {/* Edit Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-amber-200/80 dark:border-amber-800/60">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                            <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Edit Location: <strong>{loc.name}</strong></span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs cursor-pointer"
                            title="Cancel editing"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {editError && (
                          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{editError}</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Location Name / Unit *
                          </label>
                          <input
                            type="text"
                            required
                            autoFocus
                            value={editName}
                            onChange={(e) => {
                              setEditName(e.target.value);
                              if (editError) setEditError('');
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                            placeholder="e.g. Cabinet A, Fastener Cart"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Zone / Room (Optional)
                            </label>
                            <input
                              type="text"
                              value={editZone}
                              onChange={(e) => setEditZone(e.target.value)}
                              placeholder="e.g. Robotics Lab, Pit"
                              className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Description / Purpose (Optional)
                            </label>
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="e.g. REV Control hubs, motor cables"
                              className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                          </div>
                        </div>

                        {/* Sub Areas Editor */}
                        <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Sub Areas / Shelves / Bins ({editSubAreas.length})
                            </label>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              Reorganize bins or add new compartments
                            </span>
                          </div>

                          {/* Pills */}
                          {editSubAreas.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 max-h-24 overflow-y-auto">
                              {editSubAreas.map((sub, idx) => (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200"
                                >
                                  <Tag className="w-2.5 h-2.5 opacity-60" />
                                  <span>{sub}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEditSubAreaTag(idx)}
                                    className="p-0.5 rounded-xs hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
                                    title="Remove sub area"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Add input */}
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={editNewSubAreaInput}
                              onChange={(e) => setEditNewSubAreaInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddEditSubAreaTag();
                                }
                              }}
                              placeholder="Add shelf, bin, drawer... press Enter"
                              className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddEditSubAreaTag()}
                              className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:hover:bg-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>

                          {/* Quick Presets */}
                          <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mr-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              <span>Presets:</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleApplyEditPreset(['Shelf 1', 'Shelf 2', 'Shelf 3'])}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                            >
                              + Shelves
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyEditPreset(['Drawer 1', 'Drawer 2', 'Drawer 3', 'Drawer 4'])}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                            >
                              + Drawers
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyEditPreset(['Bin A', 'Bin B', 'Bin C', 'Bin D'])}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                            >
                              + Bins
                            </button>
                          </div>
                        </div>

                        {/* Save / Cancel Action Bar */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/80 dark:border-amber-800/60">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Location Changes</span>
                          </button>
                        </div>
                      </form>
                    );
                  }

                  // --- RENDER STANDARD LOCATION CARD ---
                  return (
                    <div
                      key={loc.id}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all"
                    >
                      {/* Location Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(loc.id)}
                            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title={isExpanded ? "Collapse sub areas" : "Expand sub areas"}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                          
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {loc.name}
                          </span>
                          
                          {loc.zone && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                              {loc.zone}
                            </span>
                          )}

                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-200/70 text-slate-600 dark:bg-slate-700/60 dark:text-slate-400 shrink-0">
                            {locSubAreas.length} {locSubAreas.length === 1 ? 'sub area' : 'sub areas'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {onSelectLocation && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectLocation(loc.name);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span>Select</span>
                            </button>
                          )}

                          {/* Edit Location Button */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(loc)}
                            className="px-2 py-1 rounded-md text-slate-600 hover:text-amber-700 hover:bg-amber-50 dark:text-slate-300 dark:hover:text-amber-400 dark:hover:bg-amber-950/40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
                            title={`Edit ${loc.name}`}
                          >
                            <Pencil className="w-3 h-3 text-amber-500" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Location Button / Confirmation */}
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 p-1 rounded-md border border-red-200 dark:border-red-900">
                              <span className="text-[10px] font-bold text-red-700 dark:text-red-300">Delete?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteLocation(loc.id);
                                  setConfirmDeleteLocId(null);
                                }}
                                className="px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteLocId(null)}
                                className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteLocId(loc.id)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete storage location"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {loc.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1 ml-5">
                          {loc.description}
                        </p>
                      )}

                      {/* Sub-areas section */}
                      {isExpanded && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 ml-5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                              Sub Areas / Compartments:
                            </span>

                            {!isAddingInline && onAddSubArea && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingSubAreaForLocId(loc.id);
                                  setInlineSubAreaText('');
                                }}
                                className="text-[10px] text-rose-600 hover:text-rose-700 dark:text-rose-400 font-bold flex items-center gap-0.5 cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" />
                                <span>+ Add Sub Area</span>
                              </button>
                            )}
                          </div>

                          {/* Sub areas tags list */}
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {locSubAreas.length === 0 && !isAddingInline ? (
                              <span className="text-[11px] text-slate-400 italic">
                                No sub-areas defined yet (items stored in main area).
                              </span>
                            ) : (
                              locSubAreas.map((subName) => {
                                const isRenamingThis = renamingSubAreaTarget?.locId === loc.id && renamingSubAreaTarget.oldName === subName;

                                if (isRenamingThis) {
                                  return (
                                    <div key={subName} className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 p-1 rounded-md border border-amber-300 dark:border-amber-700">
                                      <input
                                        type="text"
                                        autoFocus
                                        value={renamingSubAreaText}
                                        onChange={(e) => setRenamingSubAreaText(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSaveRenameSubArea();
                                          } else if (e.key === 'Escape') {
                                            handleCancelRenameSubArea();
                                          }
                                        }}
                                        className="px-1.5 py-0.5 text-[11px] rounded bg-white dark:bg-slate-900 border border-amber-400 text-slate-900 dark:text-slate-100 outline-none w-24"
                                      />
                                      <button
                                        type="button"
                                        onClick={handleSaveRenameSubArea}
                                        className="p-1 rounded bg-amber-600 text-white hover:bg-amber-700 text-xs cursor-pointer"
                                        title="Save name"
                                      >
                                        <Check className="w-2.5 h-2.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleCancelRenameSubArea}
                                        className="p-1 rounded text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                                        title="Cancel"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  );
                                }

                                return (
                                  <span
                                    key={subName}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 group"
                                  >
                                    <Tag className="w-2.5 h-2.5 text-rose-500 opacity-75" />
                                    {onSelectLocation ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onSelectLocation(loc.name, subName);
                                          onClose();
                                        }}
                                        className="hover:underline hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                                        title={`Select ${loc.name} › ${subName}`}
                                      >
                                        {subName}
                                      </button>
                                    ) : (
                                      <span>{subName}</span>
                                    )}

                                    {/* Rename sub area button */}
                                    {onRenameSubArea && (
                                      <button
                                        type="button"
                                        onClick={() => handleStartRenameSubArea(loc.id, subName)}
                                        className="p-0.5 rounded-xs opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-600 transition-all cursor-pointer"
                                        title={`Rename sub area "${subName}"`}
                                      >
                                        <Pencil className="w-2.5 h-2.5" />
                                      </button>
                                    )}

                                    {/* Delete sub area button */}
                                    {onDeleteSubArea && (
                                      <button
                                        type="button"
                                        onClick={() => onDeleteSubArea(loc.id, subName)}
                                        className="p-0.5 rounded-xs opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                                        title={`Delete sub area "${subName}"`}
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </span>
                                );
                              })
                            )}

                            {/* Inline input for adding sub area */}
                            {isAddingInline && (
                              <div className="flex items-center gap-1 inline-flex">
                                <input
                                  type="text"
                                  autoFocus
                                  value={inlineSubAreaText}
                                  onChange={(e) => setInlineSubAreaText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleInlineAddSubArea(loc.id);
                                    } else if (e.key === 'Escape') {
                                      setAddingSubAreaForLocId(null);
                                    }
                                  }}
                                  placeholder="e.g. Shelf 4..."
                                  className="px-2 py-0.5 text-xs rounded-md bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 text-slate-900 dark:text-slate-100 outline-none w-28 focus:ring-1 focus:ring-rose-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleInlineAddSubArea(loc.id)}
                                  className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 text-xs cursor-pointer"
                                  title="Add"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAddingSubAreaForLocId(null)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Locations and sub areas are saved for lab inventory and bin labeling.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
