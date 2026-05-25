import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Trash2, 
  Edit, 
  X, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  BarChart3,
  Heart,
  Upload,
  ArrowRight,
  Info
} from 'lucide-react';
import { OutreachEvent, OutreachImage, UserAccount } from '../types';
import { compressAndResizeImage } from '../utils/image';

interface OutreachHubProps {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  events: OutreachEvent[];
  onUpdateEvents: (newEvents: OutreachEvent[]) => void;
}

export default function OutreachHub({ 
  currentUser, 
  accounts, 
  events, 
  onUpdateEvents 
}: OutreachHubProps) {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventImpactMetrics, setEventImpactMetrics] = useState('');
  const [eventHours, setEventHours] = useState<number>(1);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [customParticipant, setCustomParticipant] = useState('');
  const [eventImages, setEventImages] = useState<OutreachImage[]>([]);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMinHours, setFilterMinHours] = useState<string>('0');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // UI state
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // File drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const getApprovedMembers = () => {
    return accounts.filter(acc => acc.status === 'Approved');
  };

  // Open modal for creation
  const openCreateModal = () => {
    setEditingEventId(null);
    setEventTitle('');
    // Default to today
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventLocation('');
    setEventDescription('');
    setEventImpactMetrics('');
    setEventHours(2);
    // Auto-select current user as participant if they exist
    setSelectedParticipants(currentUser ? [currentUser.name] : []);
    setEventImages([]);
    setCustomParticipant('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (event: OutreachEvent) => {
    setEditingEventId(event.id);
    setEventTitle(event.title);
    setEventDate(event.date);
    setEventLocation(event.location);
    setEventDescription(event.description);
    setEventImpactMetrics(event.impactMetrics);
    setEventHours(event.hoursLogged);
    setSelectedParticipants([...event.participants]);
    setEventImages([...event.images]);
    setCustomParticipant('');
    setIsModalOpen(true);
  };

  // Participant adding utility
  const handleToggleParticipant = (name: string) => {
    if (selectedParticipants.includes(name)) {
      setSelectedParticipants(selectedParticipants.filter(p => p !== name));
    } else {
      setSelectedParticipants([...selectedParticipants, name]);
    }
  };

  const handleAddCustomParticipant = () => {
    const trimmed = customParticipant.trim();
    if (trimmed && !selectedParticipants.includes(trimmed)) {
      setSelectedParticipants([...selectedParticipants, trimmed]);
      setCustomParticipant('');
    }
  };

  // Drag & drop file handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    const loadedImages: OutreachImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        showToast(`Skipped non-image file: ${file.name}`, 'danger');
        continue;
      }

      try {
        // Compress to keep local storage small
        const compressedBase64 = await compressAndResizeImage(file, 800, 0.75);
        loadedImages.push({
          id: `outreach-img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          dataUrl: compressedBase64,
          name: file.name,
          size: file.size
        });
      } catch (err) {
        console.error(err);
        showToast(`Failed to parse file: ${file.name}`, 'danger');
      }
    }

    if (loadedImages.length > 0) {
      setEventImages(prev => [...prev, ...loadedImages]);
      showToast(`Successfully added ${loadedImages.length} photo(s)!`, 'success');
    }
    setIsUploading(false);
  };

  const handleRemoveImage = (id: string) => {
    setEventImages(prev => prev.filter(img => img.id !== id));
    showToast('Removed photo draft', 'info');
  };

  // Handle Event submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      showToast('Event title is required!', 'danger');
      return;
    }
    if (!eventDate) {
      showToast('Event date is required!', 'danger');
      return;
    }
    if (selectedParticipants.length === 0) {
      showToast('At least one participant is required!', 'danger');
      return;
    }

    const editorName = currentUser?.name || 'Anonymous User';
    const editorEmail = currentUser?.schoolEmail || 'anonymous@roboraiders.org';

    if (editingEventId) {
      // Edit
      const updated = events.map(ev => {
        if (ev.id === editingEventId) {
          return {
            ...ev,
            title: eventTitle.trim(),
            date: eventDate,
            location: eventLocation.trim(),
            description: eventDescription.trim(),
            impactMetrics: eventImpactMetrics.trim(),
            hoursLogged: Number(eventHours) || 0,
            participants: selectedParticipants,
            images: eventImages,
            updatedAt: Date.now(),
            updatedBy: editorName
          };
        }
        return ev;
      });
      onUpdateEvents(updated);
      showToast(`Updated Outreach Event: "${eventTitle.trim()}"`, 'success');
    } else {
      // Create
      const newEvent: OutreachEvent = {
        id: `outreach-ev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: eventTitle.trim(),
        date: eventDate,
        location: eventLocation.trim(),
        description: eventDescription.trim(),
        impactMetrics: eventImpactMetrics.trim(),
        hoursLogged: Number(eventHours) || 0,
        participants: selectedParticipants,
        images: eventImages,
        creatorName: editorName,
        creatorEmail: editorEmail,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        updatedBy: editorName
      };
      onUpdateEvents([newEvent, ...events]);
      showToast(`Created Outreach Event: "${eventTitle.trim()}"`, 'success');
    }

    setIsModalOpen(false);
  };

  // Delete event
  const handleDeleteEvent = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete Outreach Event: "${name}"?`)) {
      const remaining = events.filter(ev => ev.id !== id);
      onUpdateEvents(remaining);
      showToast('Outreach event successfully removed.', 'info');
    }
  };

  // Metrics computation helper
  const totalEvents = events.length;
  const totalHours = events.reduce((sum, ev) => sum + ev.hoursLogged, 0);
  
  // Approximate total outreach reach from metrics string
  const totalReach = events.reduce((sum, ev) => {
    const firstNum = parseInt(ev.impactMetrics.match(/\d+/)?.[0] || '0', 10);
    return sum + (isNaN(firstNum) ? 0 : firstNum);
  }, 0);

  // Compute top participants helper
  const getTopParticipants = () => {
    const counts: Record<string, number> = {};
    events.forEach(ev => {
      ev.participants.forEach(p => {
        counts[p] = (counts[p] || 0) + ev.hoursLogged;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  // Filter events
  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          ev.impactMetrics.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesHours = ev.hoursLogged >= (Number(filterMinHours) || 0);

    const matchesStart = filterStartDate === '' || ev.date >= filterStartDate;
    const matchesEnd = filterEndDate === '' || ev.date <= filterEndDate;

    return matchesSearch && matchesHours && matchesStart && matchesEnd;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors animate-fade-in p-4 md:p-6" id="outreach-dashboard-root">
      
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl border bg-slate-900 dark:bg-slate-800 text-white border-slate-800 text-xs font-bold animate-fade-in">
          {toastMsg.type === 'success' && <span className="text-emerald-400">●</span>}
          {toastMsg.type === 'info' && <span className="text-blue-400">●</span>}
          {toastMsg.type === 'danger' && <span className="text-rose-400">●</span>}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-550 dark:bg-emerald-600 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/50 select-none tracking-widest leading-none">
              COMMUNITY IMPACT HIGHLIGHT
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight uppercase font-display text-slate-800 dark:text-slate-50 mt-1.5 flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-550 fill-emerald-500" />
            <span>Community Outreach Events Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            A real-time repository to register school demonstration days, FLL robotics workshops, mentor drives, and community outreach. Anyone can record events, tag team members, and upload photos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start xl:self-center">
          <button
            onClick={openCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer border border-emerald-555"
          >
            <Plus className="w-4 h-4" />
            <span>Record Outreach Event</span>
          </button>
        </div>
      </div>

      {/* HIGH-LEVEL IMPACT SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400">Total Events Done</span>
            <p className="text-lg font-black font-display text-slate-800 dark:text-slate-100">{totalEvents}</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400">Outreach Hours Devoted</span>
            <p className="text-lg font-black font-display text-slate-800 dark:text-slate-100">{totalHours} hrs</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400">Estimated Reach</span>
            <p className="text-lg font-black font-display text-slate-800 dark:text-slate-100">{totalReach}+ students</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-center">
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-slate-400 pl-1">Outreach Champions</span>
          <div className="flex flex-wrap gap-1 mt-1 pl-1">
            {getTopParticipants().length === 0 ? (
              <span className="text-[10px] text-slate-400 font-mono">No data logged yet</span>
            ) : (
              getTopParticipants().map(([name, hrs]) => (
                <span 
                  key={name} 
                  title={`${hrs} hours logged`}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 max-w-[90px] truncate"
                >
                  🏆 {name} ({hrs}h)
                </span>
              ))
            )}
          </div>
        </div>

      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm flex flex-col gap-3.5">
        
        <div className="flex flex-col lg:flex-row gap-3.5 items-center justify-between">
          
          {/* Keyword Search */}
          <div className="relative w-full lg:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, location, metrics, or member..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Minimum duration filter */}
            <div className="flex items-center gap-1.5 shrink-0 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">Min Hours:</span>
              <select
                value={filterMinHours}
                onChange={(e) => setFilterMinHours(e.target.value)}
                className="bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand font-bold"
              >
                <option value="0">All durations</option>
                <option value="1">1+ Hour</option>
                <option value="2">2+ Hours</option>
                <option value="4">4+ Hours</option>
                <option value="6">6+ Hours</option>
              </select>
            </div>

            {/* Date alignment filters */}
            <div className="flex items-center gap-1.5 shrink-0 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">From:</span>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2 py-0.5 text-xs text-slate-850 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand font-mono font-bold"
              />
              <span className="font-mono">To:</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2 py-0.5 text-xs text-slate-850 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand font-mono font-bold"
              />
            </div>

            {(searchQuery !== '' || filterMinHours !== '0' || filterStartDate !== '' || filterEndDate !== '') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterMinHours('0');
                  setFilterStartDate('');
                  setFilterEndDate('');
                  showToast('Reset search parameters', 'info');
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline font-mono uppercase tracking-wide cursor-pointer ml-auto lg:ml-0"
              >
                Clear Filters
              </button>
            )}

          </div>
        </div>
      </div>

      {/* OUTREACH EVENTS GRID */}
      {filteredEvents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center select-none shadow-sm min-h-[300px]">
          <Heart className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm font-display uppercase tracking-wide">
            No Outreach Event Records Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 leading-relaxed">
            There are no documented outreach workshops or presentation events fitting your filters. Click "Record Outreach Event" to create the first log!
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg shadow-md font-mono"
          >
            + Create Log Entry
          </button>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-emerald-500/20 flex flex-col justify-between"
            >
              
              {/* Card visual banner if has images */}
              {ev.images && ev.images.length > 0 ? (
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden group">
                  <img
                    src={ev.images[0].dataUrl}
                    alt={ev.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                    onClick={() => setLightboxImageUrl(ev.images[0].dataUrl)}
                  />
                  <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-white/10 flex items-center gap-1.5 shadow-sm">
                    <ImageIcon className="w-3 h-3 text-emerald-400" />
                    <span>{ev.images.length} Photos</span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/84 to-transparent pl-4 pb-2.5 flex items-end">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
                      📍 {ev.location}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-10 bg-gradient-to-r from-emerald-50 to-blue-50/50 dark:from-emerald-950/20 dark:to-blue-900/10 border-b border-slate-100 dark:border-slate-850" />
              )}

              {/* Event Body */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                
                <div>
                  {/* Date and Hours logged */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(ev.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-405 border border-emerald-100 dark:border-emerald-900 px-1.5 py-0.5 rounded font-black uppercase text-[9px]">
                      <Clock className="w-3 h-3" />
                      <span>{ev.hoursLogged} Hours logged</span>
                    </div>
                  </div>

                  {/* Title and location (if no banner layout) */}
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-800 dark:text-slate-100 font-display leading-tight mt-3">
                    {ev.title}
                  </h3>
                  
                  {!(ev.images && ev.images.length > 0) && (
                    <div className="text-[10px] text-emerald-605 dark:text-emerald-400 font-mono font-bold flex items-center gap-1 mt-1.5">
                      <span>📍 {ev.location}</span>
                    </div>
                  )}

                  {/* Description text */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2.5 font-sans whitespace-pre-line">
                    {ev.description}
                  </p>

                  {/* Impact metrics highlight */}
                  {ev.impactMetrics && (
                    <div className="mt-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/40 p-3 rounded-xl flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-550 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-mono font-black text-emerald-605 dark:text-emerald-400 uppercase tracking-widest block">
                          Impact Metrics Verified
                        </span>
                        <p className="text-[10px] font-sans text-slate-650 dark:text-slate-350 mt-0.5 leading-snug">
                          {ev.impactMetrics}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Participants checklist and Photos gallery */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-850/80 flex flex-col gap-3">
                  
                  {/* Small Photos Strip if edit layout */}
                  {ev.images && ev.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {ev.images.slice(1).map((img, idx) => (
                        <img
                          key={img.id || idx}
                          src={img.dataUrl}
                          alt="Sub proof"
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-md object-cover hover:scale-105 transition-all cursor-zoom-in border border-slate-200 dark:border-slate-800 shrink-0"
                          onClick={() => setLightboxImageUrl(img.dataUrl)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Attendants participants list */}
                  <div>
                    <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Participants Team Tag
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {ev.participants.map((p, idx) => (
                        <span 
                          key={idx} 
                          className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-705 text-[9px] font-semibold px-2 py-0.5 rounded flex items-center gap-1"
                        >
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                          <span>{p}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom control bar */}
              <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-t border-slate-100 dark:border-slate-850/50 flex justify-between items-center text-[9px] font-mono text-slate-400">
                <span>Ref: {ev.updatedBy}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(ev)}
                    title="Edit record parameters"
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-450 transition-all cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(ev.id, ev.title)}
                    title="Purge record"
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-slate-500 hover:text-red-500 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}



      {/* LIGHTBOX FOR FULL SCALE IMAGE INSPECTION */}
      {lightboxImageUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xs cursor-zoom-out animate-fade-in"
          onClick={() => setLightboxImageUrl(null)}
        >
          <button 
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 border border-white/10"
            onClick={() => setLightboxImageUrl(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img 
            src={lightboxImageUrl} 
            alt="Expanded view proof" 
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain animate-scale-up" 
          />
        </div>
      )}

      {/* EVENT POPUP CREATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="p-4 md:p-5 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-extrabold uppercase text-xs md:text-sm tracking-widest font-display text-slate-800 dark:text-slate-105 flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-550 fill-emerald-500" />
                <span>{editingEventId ? 'Edit Outreach Log' : 'Create Outreach Log'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-mono font-bold hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
              
              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                  Event Title / Name <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. FLL Robot Design Kickoff Clinic"
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold"
                />
              </div>

              {/* Grid 1: Date, Location, Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                    Event Date <span className="text-emerald-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono font-bold"
                  />
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Regional Library basement"
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-bold"
                  />
                </div>

                {/* Duration Hours */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                    Event Logged Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={eventHours}
                    onChange={(e) => setEventHours(parseFloat(e.target.value) || 0)}
                    placeholder="2.5"
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono font-bold"
                  />
                </div>

              </div>

              {/* Description text */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                  Event Description &amp; Details
                </label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Summarize the activities, topics taught, sponsor feedback, and robot performance tests..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-sans leading-relaxed"
                />
              </div>

              {/* Impact Metrics input */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                  Reach &amp; Quantized Impact Metrics
                </label>
                <input
                  type="text"
                  value={eventImpactMetrics}
                  onChange={(e) => setEventImpactMetrics(e.target.value)}
                  placeholder="e.g. 50 children reached, 2 local businesses signed sponsor packets"
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-bold"
                />
              </div>

              {/* Selected Team Members checkbox flow */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block">
                  Select Attending Participants <span className="text-emerald-500">*</span>
                </label>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-805 max-h-32 overflow-y-auto">
                  
                  {/* Internal members checkbox grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {getApprovedMembers().map(m => {
                      const isSelected = selectedParticipants.includes(m.name);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleToggleParticipant(m.name)}
                          className={`px-2 py-1 rounded text-left text-[11px] truncate flex items-center gap-1.5 border transition-all ${
                            isSelected 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span>{m.name}</span>
                        </button>
                      );
                    })}
                  </div>

                </div>

                {/* Additional custom participant input */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={customParticipant}
                    onChange={(e) => setCustomParticipant(e.target.value)}
                    placeholder="Add other name (external guest, adviser)..."
                    className="flex-1 bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomParticipant}
                    className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-3 py-1 rounded font-bold transition-all shrink-0 uppercase"
                  >
                    Add Label
                  </button>
                </div>

                {/* Selected participant list summary */}
                {selectedParticipants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {selectedParticipants.map((p, idx) => (
                      <span 
                        key={idx} 
                        className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-150 dark:border-emerald-900 text-emerald-700 dark:text-emerald-305 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        <span>{p}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleParticipant(p)}
                          className="hover:bg-emerald-200/50 dark:hover:bg-emerald-900/60 rounded p-0.5 text-[8px]"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo Upload with client side compression */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                  Attach outreach action proofs (Max 5MB total sandbox)
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isDragging 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-slate-300 dark:border-slate-800 hover:border-emerald-400/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-slate-400 dark:text-slate-600 mb-1" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Drag and drop photos here, or click to upload
                  </span>
                  <p className="text-[9px] text-slate-450 dark:text-slate-500 leading-normal">
                    Supported: JPG, PNG, WEBP (Images auto-shrink on upload to save storage)
                  </p>
                </div>

                {/* Upload preview grid */}
                {eventImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2.5 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {eventImages.map(img => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square">
                        <img
                          src={img.dataUrl}
                          alt="preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white rounded p-1"
                        >
                          <Trash2 className="w-4 h-4 text-rose-455" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded shadow-md text-xs uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{editingEventId ? 'Update Log' : 'Save Log Entry'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
