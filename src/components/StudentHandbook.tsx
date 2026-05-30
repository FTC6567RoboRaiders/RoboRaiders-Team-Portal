import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Printer, 
  Clock, 
  Compass, 
  Award, 
  Mail, 
  Scroll, 
  Briefcase, 
  Heart,
  UserCheck,
  HelpCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HANDBOOK_CHAPTERS, HANDBOOK_METADATA, HandbookChapter, HandbookSection } from '../data/handbookData';

interface StudentHandbookProps {
  currentUser: any;
  showToast: (msg: string, type: 'success' | 'danger' | 'info' | 'warning') => void;
  onBack: () => void;
}

export default function StudentHandbook({ currentUser, showToast, onBack }: StudentHandbookProps) {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeChapter = HANDBOOK_CHAPTERS[activeChapterIndex] || HANDBOOK_CHAPTERS[0];

  // Set first section active when active chapter shifts if not already set
  React.useEffect(() => {
    if (activeChapter && activeChapter.sections.length > 0) {
      setActiveSectionId(activeChapter.sections[0].id);
    }
  }, [activeChapterIndex]);



  // Search filter index
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return HANDBOOK_CHAPTERS;
    const query = searchQuery.toLowerCase();

    return HANDBOOK_CHAPTERS.map(ch => {
      const matchingSections = ch.sections.filter(sec => 
        sec.title.toLowerCase().includes(query) || 
        sec.content.toLowerCase().includes(query) ||
        (sec.subTitle && sec.subTitle.toLowerCase().includes(query))
      );

      return {
        ...ch,
        sections: matchingSections
      };
    }).filter(ch => ch.sections.length > 0);
  }, [searchQuery]);

  // Group chapters and appendices from filteredChapters
  const { chaptersOnly, appendicesOnly } = useMemo(() => {
    const chapters: HandbookChapter[] = [];
    const appendices: HandbookChapter[] = [];

    filteredChapters.forEach(ch => {
      if (ch.title.toLowerCase().includes('appendix')) {
        appendices.push(ch);
      } else {
        chapters.push(ch);
      }
    });

    return { chaptersOnly: chapters, appendicesOnly: appendices };
  }, [filteredChapters]);

  // Total pages count
  const totalChapters = HANDBOOK_CHAPTERS.length;

  const handleNextChapter = () => {
    if (activeChapterIndex < totalChapters - 1) {
      setActiveChapterIndex(activeChapterIndex + 1);
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex(activeChapterIndex - 1);
    }
  };

  // Process text rendering with highlighted queries and inline markdown elements
  const highlightedContent = (text: string): React.ReactNode => {
    if (!text) return null;

    let hlCounter = 0;
    let linkCounter = 0;

    // Helper to highlight a leaf node of text
    const applyHighlight = (chunk: string): React.ReactNode[] => {
      if (!searchQuery.trim()) return [chunk];
      const escapedQuery = searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const parts = chunk.split(new RegExp(`(${escapedQuery})`, 'gi'));
      return parts.map((part) => 
        part.toLowerCase() === searchQuery.toLowerCase()
          ? <mark key={`hl-${hlCounter++}`} className="bg-yellow-200 text-slate-950 font-bold px-0.5 rounded-sm dark:bg-yellow-400 dark:text-slate-900">{part}</mark>
          : part
      );
    };

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    // Split by ** first to separate bold blocks
    const boldParts = text.split(/\*\*([\s\S]*?)\*\*/g);
    const elements: React.ReactNode[] = [];
    
    boldParts.forEach((part, boldIdx) => {
      const isBold = boldIdx % 2 !== 0;
      const subParts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      
      linkRegex.lastIndex = 0;
      
      while ((match = linkRegex.exec(part)) !== null) {
        const precedingText = part.slice(lastIndex, match.index);
        if (precedingText) {
          subParts.push(...applyHighlight(precedingText));
        }
        
        const label = match[1];
        const url = match[2];
        const isMail = url.startsWith('mailto:');
        
        subParts.push(
          <a
            key={`link-${linkCounter++}-${boldIdx}`}
            href={url}
            target={isMail ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className="text-brand hover:underline font-semibold font-mono break-all inline-flex items-center gap-0.5 bg-brand/5 px-1 rounded hover:bg-brand/10"
          >
            {label}
          </a>
        );
        
        lastIndex = linkRegex.lastIndex;
      }
      
      const remainingText = part.slice(lastIndex);
      if (remainingText) {
        subParts.push(...applyHighlight(remainingText));
      }
      
      if (isBold) {
        elements.push(
          <strong key={`bold-${boldIdx}`} className="font-extrabold text-slate-950 dark:text-white bg-slate-100/50 dark:bg-slate-800/30 px-1 py-0.5 rounded mx-0.5">
            {subParts}
          </strong>
        );
      } else {
        // Wrap elements as list in elements. Since subParts has React nodes,
        // we can assign a unique key to any non-string element or use fragments, but the uniquely keyed <mark> and <a> elements inside subParts already have unique keys from our incremental counters.
        elements.push(...subParts);
      }
    });
    
    return <>{elements}</>;
  };



  return (
    <div className="flex-1 flex flex-col gap-6 lg:p-10 p-4 max-w-[1700px] mx-auto w-full no-print animate-fade-in" id="student-handbook-page">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black border border-brand/35 px-2 py-1 rounded bg-brand/10 uppercase tracking-wide text-brand">
              OFFICIAL FTC GUIDELINES
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">2026-2027 Season</span>
          </div>
          <h1 className="text-2xl font-extrabold uppercase text-slate-900 dark:text-white mt-1">
            Student Team Handbook
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rules, expectations, FLL mentoring hours requirements, and lab safety procedures for RoboRaiders #6567.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 md:flex-initial bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-1.5 rounded text-xs font-bold uppercase font-mono tracking-wider flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-750 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Handbook</span>
          </button>
          
          <button
            onClick={onBack}
            className="flex-1 md:flex-initial bg-brand hover:bg-brand-hover text-white px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Dashboard Hub</span>
          </button>
        </div>
      </div>

      {/* THREE PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        
        {/* PANEL A: TABLE OF CONTENTS SIDEBAR (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xs">
          <div>
            <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
              Search Index
            </span>
            <div className="relative">
              <input
                type="text"
                placeholder="Search handbook rules..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveChapterIndex(0);
                }}
                className="w-full bg-slate-50 border border-slate-250 dark:bg-slate-855 dark:border-slate-800 rounded pl-10 pr-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand font-mono"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white absolute right-1.5 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="relative flex-1 flex flex-col min-h-0 border border-slate-150 dark:border-slate-800/80 rounded-xl p-2.5 bg-slate-50/40 dark:bg-slate-950/20">
            <div className="flex-1 overflow-y-auto max-h-[380px] lg:max-h-[580px] pr-2.5 space-y-4 visible-scrollbar">
              {chaptersOnly.length > 0 && (
                <div>
                  <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                    Chapters Index
                  </span>
                  <div className="space-y-1">
                    {chaptersOnly.map((ch) => {
                      const globalIndex = HANDBOOK_CHAPTERS.findIndex(c => c.id === ch.id);
                      const isActive = globalIndex === activeChapterIndex;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => setActiveChapterIndex(globalIndex)}
                          className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer text-xs font-mono border ${
                            isActive 
                              ? 'bg-brand/10 dark:bg-brand/15 border-brand/50 text-brand font-extrabold' 
                              : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-150 dark:border-slate-850 text-slate-700 dark:text-slate-350 shadow-2xs'
                          }`}
                        >
                          <span className="truncate pr-1">{ch.title}</span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-90 text-brand scale-110' : 'text-slate-400'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {appendicesOnly.length > 0 && (
                <div>
                  <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                    Appendices Index
                  </span>
                  <div className="space-y-1">
                    {appendicesOnly.map((ch) => {
                      const globalIndex = HANDBOOK_CHAPTERS.findIndex(c => c.id === ch.id);
                      const isActive = globalIndex === activeChapterIndex;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => setActiveChapterIndex(globalIndex)}
                          className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer text-xs font-mono border ${
                            isActive 
                              ? 'bg-brand/10 dark:bg-brand/15 border-brand/50 text-brand font-extrabold' 
                              : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-150 dark:border-slate-850 text-slate-700 dark:text-slate-350 shadow-2xs'
                          }`}
                        >
                          <span className="truncate pr-1">{ch.title}</span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-90 text-brand scale-110' : 'text-slate-400'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredChapters.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-450 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-lg">
                  <span className="font-bold">No matches found for search</span>
                  <p className="text-[10px] mt-1 text-slate-400">Try checking spelling or shorten query terms.</p>
                </div>
              )}
            </div>

            {/* Fading bottom indicator layout overlay */}
            <div className="absolute bottom-2.5 left-2.5 right-3 h-10 bg-gradient-to-t from-slate-50 dark:from-slate-950/40 to-transparent pointer-events-none rounded-b-xl opacity-85" />
          </div>

          <div className="text-center py-1 mt-0.5 border-t border-slate-105 dark:border-slate-800/60">
            <span className="text-[8.5px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5 animate-pulse">
              <span>⇅ Scroll inside index to view all elements</span>
            </span>
          </div>

        </div>

        {/* PANEL B: INTENSE INTERACTIVE READER CONTAINER (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl flex flex-col shadow-xs relative max-h-[750px] min-h-[500px]">
          
          {/* Reader Top Sub navigation bar */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 border-b border-slate-205 dark:border-slate-850 rounded-t-xl flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-350 leading-none">
              <BookOpen className="w-4 h-4 text-brand" />
              <span>Chapter:</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">{activeChapter.title}</span>
            </div>
            
            <div className="flex gap-1.5">
              <button
                onClick={handlePrevChapter}
                disabled={activeChapterIndex === 0}
                className={`p-1 border border-slate-201 dark:border-slate-800 rounded bg-white dark:bg-slate-900 leading-none ${activeChapterIndex === 0 ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800 cursor-pointer'}`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextChapter}
                disabled={activeChapterIndex === totalChapters - 1}
                className={`p-1 border border-slate-201 dark:border-slate-800 rounded bg-white dark:bg-slate-900 leading-none ${activeChapterIndex === totalChapters - 1 ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800 cursor-pointer'}`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Core scrollable content reader */}
          <div 
            className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 text-slate-900 dark:text-slate-1 py-6"
            id="handbook-reader-content"
          >
            {activeChapter.sections.map((section) => (
              <div key={section.id} className="border-b border-slate-105 dark:border-slate-850 pb-6 last:border-0" id={`section-${section.id}`}>
                <div className="flex items-center gap-1.5 mb-1.5 label-section">
                  <span className="text-[10px] font-mono border border-slate-300 dark:border-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wide">
                    {section.id.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-black uppercase text-slate-950 dark:text-slate-50 tracking-tight font-display mb-2 border-b border-dashed border-slate-200 dark:border-slate-800 pb-1">
                  {highlightedContent(section.title)}
                </h2>
                {section.subTitle && (
                  <h3 className="text-sm font-bold text-brand uppercase font-mono tracking-wide mb-3">
                    {highlightedContent(section.subTitle)}
                  </h3>
                )}
                
                <div className="prose prose-slate dark:prose-invert max-w-none text-xs leading-relaxed space-y-3 font-sans text-slate-750 dark:text-slate-250">
                  {/* Parse basic formatting headers, lists and tables */}
                  {section.content.split('\n\n').map((block, bIdx) => {
                    const line = block.trim();
                    if (!line) return null;

                    // Header lines: ### or ## or #
                    if (line.startsWith('### ')) {
                      return <h4 key={bIdx} className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-display mt-4 mb-2">{highlightedContent(line.replace('### ', ''))}</h4>;
                    }
                    if (line.startsWith('## ')) {
                      return <h3 key={bIdx} className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 mt-4 mb-2">{highlightedContent(line.replace('## ', ''))}</h3>;
                    }
                    if (line.startsWith('# ')) {
                      return <h2 key={bIdx} className="text-base font-black uppercase text-slate-950 dark:text-slate-50 mt-5 mb-3">{highlightedContent(line.replace('# ', ''))}</h2>;
                    }

                    // Bullet lists
                    if (line.startsWith('- ') || line.startsWith('• ')) {
                      const items = line.split(/\n[-•] /g).map(s => s.replace(/^[-•] /g, ''));
                      return (
                        <ul key={bIdx} className="list-disc pl-5 mt-2 space-y-1 text-slate-700 dark:text-slate-300">
                          {items.map((it, iIdx) => (
                            <li key={iIdx}>{highlightedContent(it)}</li>
                          ))}
                        </ul>
                      );
                    }

                    // Numbered lists
                    if (/^\d+\.\s/.test(line)) {
                      const items = line.split(/\n\d+\.\s/g).map(s => s.replace(/^\d+\.\s/g, ''));
                      return (
                        <ol key={bIdx} className="list-decimal pl-5 mt-2 space-y-1 text-slate-700 dark:text-slate-300">
                          {items.map((it, iIdx) => (
                            <li key={iIdx}>{highlightedContent(it)}</li>
                          ))}
                        </ol>
                      );
                    }

                    // Check tables (marked with |)
                    if (line.startsWith('|')) {
                      const rows = line.split('\n').filter(r => r.trim().startsWith('|'));
                      if (rows.length > 1) {
                        return (
                          <div key={bIdx} className="overflow-x-auto my-3 border border-slate-150 dark:border-slate-800 rounded">
                            <table className="min-w-full text-[11px] text-left divide-y divide-slate-205 dark:divide-slate-800 font-mono">
                              <thead className="bg-slate-50 dark:bg-slate-950 font-black text-slate-600 dark:text-slate-400">
                                <tr>
                                  {rows[0].split('|').slice(1, -1).map((h, hIdx) => (
                                    <th key={hIdx} className="px-3 py-2 text-[10px] uppercase font-bold">{h.trim()}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                                {rows.slice(2).map((r, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                                    {r.split('|').slice(1, -1).map((tdVal, tdIdx) => (
                                      <td key={tdIdx} className="px-3 py-1.5">{highlightedContent(tdVal.trim())}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                    }

                    // Blockquote
                    if (line.startsWith('>')) {
                      return (
                        <blockquote key={bIdx} className="border-l-4 border-brand/40 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-r-lg my-3 text-slate-700 dark:text-slate-300 italic">
                          {highlightedContent(line.replace(/^>\s*/, ''))}
                        </blockquote>
                      );
                    }

                    // Standard Paragraph block
                    return <p key={bIdx} className="leading-relaxed">{highlightedContent(line)}</p>;
                  })}
                </div>
              </div>
            ))}


          </div>

          {/* Reader Footer Indicators */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-201 dark:border-slate-850 rounded-b-xl flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>FTC Team #6567 RoboRaiders</span>
            <span>Page {activeChapterIndex + 1} of {totalChapters}</span>
          </div>
        </div>

        {/* PANEL C: HANDBOOK META INFO CARD (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xs">
          <div>
            <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
              Document Owner
            </span>
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850/60 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center font-bold text-xs select-none shadow-sm shrink-0">
                RR
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold uppercase text-slate-950 dark:text-slate-100 truncate">RoboRaiders</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">FTC Team 6567</p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
              Handbook At-a-Glance
            </span>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-350">
                <Clock className="w-4 h-4 text-cyan-500 shrink-0" />
                <div>
                  <div className="font-bold text-[11px] uppercase text-slate-900 dark:text-slate-100 leading-none">Meetings Requirement</div>
                  <span className="text-[10px] text-slate-400">Log minimum 24 hrs / month</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-350">
                <Compass className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-[11px] uppercase text-slate-900 dark:text-slate-100 leading-none">FLL Mentoring</div>
                  <span className="text-[10px] text-slate-400">Total min 10 hours required</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-350">
                <Briefcase className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="font-bold text-[11px] uppercase text-slate-900 dark:text-slate-100 leading-none">Weekly Sprints</div>
                  <span className="text-[10px] text-slate-400">Mondays 2:30pm – 4:00pm</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-350">
                <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <div className="font-bold text-[11px] uppercase text-slate-900 dark:text-slate-100 leading-none">Outreach Focus</div>
                  <span className="text-[10px] text-slate-400">Min 6 Dutchess Fair shifts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-150 dark:border-slate-800 pt-3">
            <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
              Core Leadership Contacts
            </span>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="bg-slate-50 dark:bg-slate-950/25 p-2 rounded border border-slate-150 dark:border-slate-850 flex flex-col gap-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">Dwane Decker</span>
                <span className="text-[9px] text-slate-400">Faculty Advisor</span>
                <a href={`mailto:${HANDBOOK_METADATA.advisor.match(/[\w.-]+@[\w.-]+/)?.[0] || 'dadecker@rhcsd.org'}`} className="text-brand hover:underline truncate mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-brand" /> dadecker@rhcsd.org
                </a>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/25 p-2 rounded border border-slate-150 dark:border-slate-850 flex flex-col gap-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">Steve Kocik</span>
                <span className="text-[9px] text-slate-400">Core Mentor</span>
                <a href={`mailto:${HANDBOOK_METADATA.mentor.match(/[\w.-]+@[\w.-]+/)?.[0] || 'smkocik23@hvc.rr.com'}`} className="text-brand hover:underline truncate mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-brand" /> smkocik23@hvc.rr.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2 text-slate-800 dark:text-slate-200 text-[10px] leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Safety Watch:</strong> Safety glasses and closed-toe shoes are completely mandatory inside room 181 build laboratory.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
