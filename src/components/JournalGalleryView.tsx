import React, { useState, useMemo, useEffect } from 'react';
import { 
  Images, 
  Search, 
  ZoomIn, 
  Download, 
  Calendar, 
  User, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  Lock, 
  CheckCircle2, 
  Clock, 
  RotateCcw,
  Wrench,
  Cpu,
  Globe,
  Briefcase,
  Award,
  Compass,
  ShieldCheck,
  Grid,
  Layers,
  ArrowUpDown,
  Plus
} from 'lucide-react';
import { JournalEntry, Subteam } from '../types';
import { getEntryReferenceCode } from '../utils/referenceCode';

export interface JournalGalleryViewProps {
  entries: JournalEntry[];
  onSelectEntry?: (entry: JournalEntry) => void;
  onOpenNewJournal?: () => void;
  onBackToLogs?: () => void;
}

export interface GalleryPhotoItem {
  id: string;
  dataUrl: string;
  name: string;
  size: number;
  entry: JournalEntry;
  subteam: Subteam;
  author: string;
  date: string;
  title: string;
  status: string;
  referenceCode: string;
  indexInEntry: number;
}

const ALL_SUBTEAMS: Subteam[] = [
  'Design/Build/Fabrication',
  'Programming',
  'Outreach',
  'Business & Media',
  'Inspire',
  'Strategy',
  'Mentoring'
];

const getSubteamBadgeStyle = (subteam: Subteam) => {
  switch (subteam) {
    case 'Design/Build/Fabrication':
      return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    case 'Programming':
      return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
    case 'Outreach':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    case 'Business & Media':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    case 'Inspire':
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
    case 'Strategy':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    case 'Mentoring':
      return 'bg-pink-50 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300 border-pink-300 dark:border-pink-800';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
  }
};

const getSubteamMeta = (subteam: Subteam) => {
  switch (subteam) {
    case 'Design/Build/Fabrication':
      return { label: 'Design & Build', icon: Wrench, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-500' };
    case 'Programming':
      return { label: 'Programming & Autonomous', icon: Cpu, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500' };
    case 'Outreach':
      return { label: 'Community Outreach', icon: Globe, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' };
    case 'Business & Media':
      return { label: 'Business & Media', icon: Briefcase, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' };
    case 'Inspire':
      return { label: 'Inspire & Culture', icon: Award, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500' };
    case 'Strategy':
      return { label: 'Strategy & Scouting', icon: Compass, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500' };
    case 'Mentoring':
      return { label: 'Advisory & Mentorship', icon: ShieldCheck, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500' };
    default:
      return { label: subteam, icon: Wrench, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-500' };
  }
};

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return 'Image';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const JournalGalleryView: React.FC<JournalGalleryViewProps> = ({
  entries,
  onSelectEntry,
  onOpenNewJournal,
  onBackToLogs
}) => {
  const [selectedSubteam, setSelectedSubteam] = useState<Subteam | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending Review' | 'Draft' | 'Needs Revision'>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [viewGrouping, setViewGrouping] = useState<'categorized' | 'grid'>('categorized');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Extract all photos across all journal entries
  const allPhotos = useMemo<GalleryPhotoItem[]>(() => {
    const items: GalleryPhotoItem[] = [];
    entries.forEach((entry) => {
      if (entry.images && Array.isArray(entry.images) && entry.images.length > 0) {
        entry.images.forEach((img, idx) => {
          if (img && (img.dataUrl || img.name)) {
            items.push({
              id: img.id || `${entry.id}-photo-${idx}`,
              dataUrl: img.dataUrl,
              name: img.name || `Photo_${idx + 1}.jpg`,
              size: img.size || 0,
              entry,
              subteam: entry.subteam,
              author: entry.author || 'Team Member',
              date: entry.date || new Date().toISOString().split('T')[0],
              title: entry.title || entry.planned || 'Robotics Work Session',
              status: entry.status || 'Draft',
              referenceCode: getEntryReferenceCode(entry, entries),
              indexInEntry: idx
            });
          }
        });
      }
    });
    return items;
  }, [entries]);

  // Compute counts per subteam
  const subteamCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allPhotos.length };
    ALL_SUBTEAMS.forEach((sub) => {
      counts[sub] = allPhotos.filter((p) => p.subteam === sub).length;
    });
    return counts;
  }, [allPhotos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter((photo) => {
      // Subteam filter
      if (selectedSubteam !== 'All' && photo.subteam !== selectedSubteam) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'All' && photo.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = photo.name.toLowerCase().includes(query);
        const matchAuthor = photo.author.toLowerCase().includes(query);
        const matchTitle = photo.title.toLowerCase().includes(query);
        const matchSubteam = photo.subteam.toLowerCase().includes(query);
        const matchRef = photo.referenceCode.toLowerCase().includes(query);
        const matchDate = photo.date.includes(query);
        if (!matchName && !matchAuthor && !matchTitle && !matchSubteam && !matchRef && !matchDate) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortOrder === 'newest') {
        const dateDiff = b.date.localeCompare(a.date);
        if (dateDiff !== 0) return dateDiff;
        return (b.entry.createdAt || 0) - (a.entry.createdAt || 0);
      } else if (sortOrder === 'oldest') {
        const dateDiff = a.date.localeCompare(b.date);
        if (dateDiff !== 0) return dateDiff;
        return (a.entry.createdAt || 0) - (b.entry.createdAt || 0);
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  }, [allPhotos, selectedSubteam, statusFilter, searchQuery, sortOrder]);

  // Subteams with at least one filtered photo (for categorized view)
  const categorizedSections = useMemo(() => {
    const subteamsToRender = selectedSubteam === 'All' 
      ? ALL_SUBTEAMS 
      : [selectedSubteam];

    return subteamsToRender
      .map((sub) => {
        const photos = filteredPhotos.filter((p) => p.subteam === sub);
        return {
          subteam: sub,
          photos,
          meta: getSubteamMeta(sub)
        };
      })
      .filter((section) => section.photos.length > 0);
  }, [filteredPhotos, selectedSubteam]);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  const activeLightboxPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  const handleDownloadPhoto = (photo: GalleryPhotoItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const link = document.createElement('a');
      link.href = photo.dataUrl;
      link.download = photo.name || `ftc_journal_${photo.subteam}_${photo.date}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(photo.dataUrl, '_blank');
    }
  };

  const handleOpenEntryFromGallery = (entry: JournalEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxIndex(null);
    if (onSelectEntry) {
      onSelectEntry(entry);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6" id="journal-automated-gallery-root">
      {/* GALLERY TOP BAR & STATS BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center shrink-0">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-black border border-brand/35 px-2 py-0.5 rounded bg-brand/10 uppercase tracking-wide text-brand">
                  AUTOMATED REPOSITORY
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                  {allPhotos.length} Total {allPhotos.length === 1 ? 'Image' : 'Images'} Across All Journals
                </span>
              </div>
              <h2 className="text-xl font-extrabold uppercase text-slate-900 dark:text-white tracking-tight mt-0.5">
                Subteam Media &amp; Photo Gallery
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automated visual showcase of CAD renders, physical hardware assemblies, code screenshots, and team outreach media categorized by subteam.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {onBackToLogs && (
              <button
                onClick={onBackToLogs}
                className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Return to Journal Logs and Reader"
                id="btn-back-to-logs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Logs Directory</span>
              </button>
            )}

            {onOpenNewJournal && (
              <button
                onClick={onOpenNewJournal}
                className="px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Create a new journal entry with photos"
                id="btn-new-journal-with-photo"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Log &amp; Upload</span>
              </button>
            )}
          </div>
        </div>

        {/* SEARCH, FILTER & VIEW CONTROLS */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search images by filename, author, task, date, or reference code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand font-medium placeholder:text-slate-400"
              id="gallery-search-input"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand font-bold"
              id="gallery-status-filter"
            >
              <option value="All">All Journal Statuses</option>
              <option value="Approved">✅ Approved Only</option>
              <option value="Pending Review">⏳ Pending Review</option>
              <option value="Draft">✍️ Drafts</option>
              <option value="Needs Revision">❌ Needs Revision</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-1 w-full">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand font-bold"
                id="gallery-sort-select"
              >
                <option value="newest">📅 Newest Date</option>
                <option value="oldest">📅 Oldest Date</option>
                <option value="name">🔤 Filename A-Z</option>
              </select>
            </div>
          </div>

          {/* View Grouping Mode Switch */}
          <div className="sm:col-span-2 flex items-center justify-end">
            <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewGrouping('categorized')}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  viewGrouping === 'categorized'
                    ? 'bg-white dark:bg-slate-900 text-brand shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Organized into Subteam categories"
                id="btn-group-by-subteam"
              >
                <Layers className="w-3 h-3" />
                <span>By Subteam</span>
              </button>
              <button
                type="button"
                onClick={() => setViewGrouping('grid')}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  viewGrouping === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-brand shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Unified Chronological Grid"
                id="btn-group-unified-grid"
              >
                <Grid className="w-3 h-3" />
                <span>All Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* SUBTEAM CATEGORIZATION TABS / CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedSubteam('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedSubteam === 'All'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            id="gallery-tab-subteam-all"
          >
            <span>All Subteams</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
              selectedSubteam === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {subteamCounts.All || 0}
            </span>
          </button>

          {ALL_SUBTEAMS.map((sub) => {
            const isSelected = selectedSubteam === sub;
            const meta = getSubteamMeta(sub);
            const SIcon = meta.icon;
            const count = subteamCounts[sub] || 0;

            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubteam(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                id={`gallery-tab-subteam-${sub.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                <SIcon className="w-3 h-3" />
                <span>{meta.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {(selectedSubteam !== 'All' || searchQuery || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSelectedSubteam('All');
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className="ml-auto text-[11px] font-bold text-brand hover:underline flex items-center gap-1 shrink-0 px-2"
              id="gallery-reset-filters-btn"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* GALLERY MAIN CONTENT AREA */}
      {allPhotos.length === 0 ? (
        /* Empty State: No photos exist in any entry */
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
            <Images className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-extrabold uppercase text-slate-900 dark:text-white">
              No Journal Photos Uploaded Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              When team members attach CAD model renders, robot mechanism photos, wiring schematics, or outreach pictures to their daily journal logs, this gallery will automatically organize them by subteam.
            </p>
          </div>
          {onOpenNewJournal && (
            <button
              onClick={onOpenNewJournal}
              className="mt-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              id="btn-create-first-journal-with-photo"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Journal Entry With Photos</span>
            </button>
          )}
        </div>
      ) : filteredPhotos.length === 0 ? (
        /* Filter Empty State: Photos exist but none match filter */
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-10 text-center flex flex-col items-center justify-center gap-2 shadow-xs">
          <Search className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-1" />
          <h3 className="text-sm font-extrabold uppercase text-slate-800 dark:text-slate-200">
            No Photos Match Your Filters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Try adjusting your search keywords, switching the subteam category tab, or resetting status filters.
          </p>
          <button
            onClick={() => {
              setSelectedSubteam('All');
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className="mt-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : viewGrouping === 'categorized' && selectedSubteam === 'All' ? (
        /* CATEGORIZED BY SUBTEAM SECTIONS */
        <div className="space-y-8" id="gallery-categorized-container">
          {categorizedSections.map((section) => {
            const SIcon = section.meta.icon;
            const badgeClass = getSubteamBadgeStyle(section.subteam);

            return (
              <div 
                key={section.subteam} 
                className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col gap-4"
                id={`subteam-gallery-section-${section.subteam.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${badgeClass} border flex items-center justify-center`}>
                      <SIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold uppercase text-slate-900 dark:text-white tracking-tight">
                          {section.meta.label}
                        </h3>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                          {section.photos.length} {section.photos.length === 1 ? 'Photo' : 'Photos'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Official {section.subteam} engineering logs and media captures
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSubteam(section.subteam)}
                    className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                    title={`Focus exclusively on ${section.subteam}`}
                  >
                    <span>View Section Only</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Grid of photo cards for this subteam */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {section.photos.map((photo) => {
                    const globalIdx = filteredPhotos.findIndex((p) => p.id === photo.id);
                    return (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onZoom={() => setLightboxIndex(globalIdx !== -1 ? globalIdx : 0)}
                        onDownload={(e) => handleDownloadPhoto(photo, e)}
                        onViewEntry={(e) => handleOpenEntryFromGallery(photo.entry, e)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* UNIFIED CHRONOLOGICAL GRID VIEW OR SINGLE SUBTEAM FOCUSED VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase text-slate-800 dark:text-slate-200">
                {selectedSubteam === 'All' ? 'All Subteam Photos' : `${selectedSubteam} Photos`}
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                {filteredPhotos.length} {filteredPhotos.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              Ordered by {sortOrder}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onZoom={() => setLightboxIndex(index)}
                onDownload={(e) => handleDownloadPhoto(photo, e)}
                onViewEntry={(e) => handleOpenEntryFromGallery(photo.entry, e)}
              />
            ))}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {activeLightboxPhoto && lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex flex-col justify-between p-4 sm:p-6 no-print select-none"
          onClick={() => setLightboxIndex(null)}
          id="gallery-lightbox-modal"
        >
          {/* Lightbox Header */}
          <div 
            className="flex items-center justify-between text-white w-full max-w-6xl mx-auto pb-3 border-b border-white/10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono border ${getSubteamBadgeStyle(activeLightboxPhoto.subteam)}`}>
                {activeLightboxPhoto.subteam}
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {activeLightboxPhoto.name}
              </span>
              <span className="text-[11px] font-mono text-white/50">
                Photo {lightboxIndex + 1} of {filteredPhotos.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleDownloadPhoto(activeLightboxPhoto, e)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Download original photo"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Close lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Stage */}
          <div 
            className="flex-1 flex items-center justify-center relative w-full max-w-6xl mx-auto my-3 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : filteredPhotos.length - 1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer z-10"
              title="Previous photo (Left Arrow)"
              id="lightbox-btn-prev"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Main Preview Image */}
            <div className="max-w-full max-h-[65vh] flex items-center justify-center p-2">
              <img
                src={activeLightboxPhoto.dataUrl}
                alt={activeLightboxPhoto.name}
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-2xl border border-white/10"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex < filteredPhotos.length - 1 ? lightboxIndex + 1 : 0);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer z-10"
              title="Next photo (Right Arrow)"
              id="lightbox-btn-next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Footer & Connected Journal Entry Details */}
          <div 
            className="bg-slate-900/90 border border-white/15 rounded-xl p-4 text-white w-full max-w-6xl mx-auto shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
                  {activeLightboxPhoto.referenceCode}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Logged on {activeLightboxPhoto.date}
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  By {activeLightboxPhoto.author}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  • {formatFileSize(activeLightboxPhoto.size)}
                </span>
              </div>
              <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                <span className="font-bold text-white">Journal Context: </span>
                {activeLightboxPhoto.entry.planned || activeLightboxPhoto.title}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={(e) => handleOpenEntryFromGallery(activeLightboxPhoto.entry, e)}
                className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                id="lightbox-btn-view-entry"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Jump to Full Journal Log</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* INDIVIDUAL PHOTO CARD SUBCOMPONENT */
interface PhotoCardProps {
  photo: GalleryPhotoItem;
  onZoom: () => void;
  onDownload: (e: React.MouseEvent) => void;
  onViewEntry: (e: React.MouseEvent) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onZoom,
  onDownload,
  onViewEntry
}) => {
  const badgeStyle = getSubteamBadgeStyle(photo.subteam);
  const meta = getSubteamMeta(photo.subteam);
  const SIcon = meta.icon;

  return (
    <div 
      className="group relative bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md hover:border-brand/40 transition-all duration-200 flex flex-col cursor-pointer"
      onClick={onZoom}
      id={`photo-card-${photo.id}`}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full bg-slate-900/90 overflow-hidden flex items-center justify-center">
        <img
          src={photo.dataUrl}
          alt={photo.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
          <div className="flex justify-between items-start">
            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase flex items-center gap-0.5 ${badgeStyle}`}>
              <SIcon className="w-2.5 h-2.5" />
              {photo.subteam}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onDownload}
                className="p-1 rounded bg-black/60 hover:bg-black/90 text-white transition-all"
                title="Download photo"
              >
                <Download className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onZoom();
                }}
                className="p-1 rounded bg-black/60 hover:bg-black/90 text-white transition-all"
                title="Inspect in lightbox"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="text-left">
            <span className="text-[10px] font-mono text-amber-300 font-bold">
              {photo.referenceCode}
            </span>
          </div>
        </div>

        {/* Persistent Subteam chip on top-left if not hovered */}
        <div className="absolute top-2 left-2 group-hover:opacity-0 transition-opacity duration-150">
          <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase border shadow-2xs ${badgeStyle}`}>
            {photo.subteam}
          </span>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-2">
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block max-w-[170px]" title={photo.name}>
              {photo.name}
            </span>
            <span className="text-[9px] font-mono text-slate-400 shrink-0">
              {formatFileSize(photo.size)}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
            {photo.entry.planned || photo.title}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-mono">{photo.date}</span>
            <span>•</span>
            <span className="truncate">{photo.author.split('(')[0].trim()}</span>
          </div>

          <button
            type="button"
            onClick={onViewEntry}
            className="text-[10px] font-bold text-brand hover:underline flex items-center gap-0.5 shrink-0"
            title="Read associated journal entry"
          >
            <span>Log</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
