import React from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Coins, 
  FileText, 
  UserCheck, 
  UserX,
  Lock,
  ListOrdered
} from 'lucide-react';
import { JournalEntry, MeetingTodoItem } from '../types';

interface GeneralMeetingViewProps {
  entry: JournalEntry;
  refCode: string;
  onToggleTodo?: (todoId: string) => void;
  onImageClick?: (index: number) => void;
}

export const GeneralMeetingView: React.FC<GeneralMeetingViewProps> = ({
  entry,
  refCode,
  onToggleTodo,
  onImageClick
}) => {
  const attendees = entry.attendees || [];
  const absentAttendees = entry.absentAttendees || [];
  const abcs = entry.abcs || [];
  const finalTodoList = entry.finalTodoList || [];

  return (
    <div className="space-y-6" id={`general-meeting-view-${entry.id}`}>
      
      {/* 1. EXECUTIVE HEADER & METADATA */}
      <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 font-mono font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
              👥 GENERAL MEETING
            </span>
            <span className="bg-slate-800 text-slate-300 border border-slate-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
              REF: {refCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
              entry.status === 'Approved'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                : entry.status === 'Pending Review'
                ? 'bg-amber-950/80 text-amber-300 border-amber-700 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {entry.status === 'Approved' ? '🔒 Approved & Sealed' : entry.status}
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight uppercase leading-snug">
          {entry.title || entry.planned || 'General Team All-Hands Meeting'}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Meeting Date</span>
            <span className="font-bold text-white flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {entry.date}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Meeting Chair</span>
            <span className="font-bold text-white truncate block mt-0.5">
              {entry.author}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Present Roll Call</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <UserCheck className="w-3.5 h-3.5" />
              {attendees.length} Members
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Action Items</span>
            <span className="font-bold text-indigo-300 flex items-center gap-1 mt-0.5">
              <CheckSquare className="w-3.5 h-3.5" />
              {finalTodoList.length} Tasks
            </span>
          </div>
        </div>
      </div>

      {/* 2. AGENDA SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-105 dark:border-slate-800 pb-2.5 mb-3">
          <ListOrdered className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-[11px] font-black uppercase font-mono tracking-wider text-slate-800 dark:text-slate-200">
            1. Meeting Agenda &amp; Topics
          </h2>
        </div>
        <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-850">
          {entry.agenda || entry.planned || 'No formalized agenda logged.'}
        </div>
      </div>

      {/* 3. ATTENDANCE AREA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-105 dark:border-slate-800 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-[11px] font-black uppercase font-mono tracking-wider text-slate-800 dark:text-slate-200">
              2. Attendance Roster
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
            {attendees.length} Present {absentAttendees.length > 0 ? `• ${absentAttendees.length} Excused` : ''}
          </span>
        </div>

        {attendees.length === 0 && absentAttendees.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No attendance list recorded.</p>
        ) : (
          <div className="space-y-2.5">
            {attendees.length > 0 && (
              <div>
                <span className="text-[9px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400 block mb-1.5">
                  Present in Meeting ({attendees.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {attendees.map((name, i) => (
                    <span 
                      key={i}
                      className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {absentAttendees.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[9px] font-mono uppercase font-bold text-rose-600 dark:text-rose-400 block mb-1.5">
                  Excused / Absent ({absentAttendees.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {absentAttendees.map((name, i) => (
                    <span 
                      key={i}
                      className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 px-2.5 py-0.5 rounded-md text-xs font-medium line-through flex items-center gap-1"
                    >
                      <UserX className="w-3 h-3 text-rose-500" />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. MEMBER ABCS (ACCOMPLISHMENTS, BLOCKERS, COMMITMENTS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-105 dark:border-slate-800 pb-2.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded">
              ABC
            </span>
            <h2 className="text-[11px] font-black uppercase font-mono tracking-wider text-slate-800 dark:text-slate-200">
              3. Team ABCs (Accomplishments • Blockers • Commitments)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {abcs.length} Member Check-ins
          </span>
        </div>

        {abcs.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No member ABCs documented for this meeting.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {abcs.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5"
              >
                {/* Person Header */}
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {item.name || 'Anonymous Member'}
                    </span>
                  </div>
                  {item.subteam && (
                    <span className="text-[9px] font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 uppercase">
                      {item.subteam}
                    </span>
                  )}
                </div>

                {/* The 3 Sections: A, B, C */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  {/* A */}
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-950/60 space-y-1">
                    <div className="text-[9px] font-black font-mono uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Accomplishments (A)</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                      {item.accomplishments || <span className="text-slate-400 italic font-sans">None recorded.</span>}
                    </p>
                  </div>

                  {/* B */}
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-rose-100 dark:border-rose-950/60 space-y-1">
                    <div className="text-[9px] font-black font-mono uppercase text-rose-700 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-500" />
                      <span>Blockers (B)</span>
                    </div>
                    <p className={`whitespace-pre-wrap leading-relaxed font-sans ${
                      item.blockers && item.blockers.toLowerCase() !== 'none'
                        ? 'text-rose-700 dark:text-rose-300 font-medium'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {item.blockers || <span className="text-slate-400 italic">None.</span>}
                    </p>
                  </div>

                  {/* C */}
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-950/60 space-y-1">
                    <div className="text-[9px] font-black font-mono uppercase text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      <span>Commitments (C)</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                      {item.commitments || <span className="text-slate-400 italic">None recorded.</span>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. FINANCE ANNOUNCED */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-105 dark:border-slate-800 pb-2.5 mb-3">
          <Coins className="w-4 h-4 text-amber-500" />
          <h2 className="text-[11px] font-black uppercase font-mono tracking-wider text-slate-800 dark:text-slate-200">
            4. Finance Announced
          </h2>
        </div>

        {entry.financeAnnounced ? (
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-4 text-xs font-mono leading-relaxed text-amber-950 dark:text-amber-200 whitespace-pre-wrap">
            {entry.financeAnnounced}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No financial announcements made during this session.</p>
        )}
      </div>

      {/* 6. FINAL TO-DO LIST & ACTION ITEMS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-105 dark:border-slate-800 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-[11px] font-black uppercase font-mono tracking-wider text-slate-800 dark:text-slate-200">
              5. Final To-Do List &amp; Action Items
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {finalTodoList.filter(t => t.completed).length} / {finalTodoList.length} Complete
          </span>
        </div>

        {finalTodoList.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No final action items recorded.</p>
        ) : (
          <div className="space-y-2">
            {finalTodoList.map((todo, idx) => (
              <div 
                key={todo.id || idx}
                onClick={() => onToggleTodo && onToggleTodo(todo.id)}
                className={`flex items-start sm:items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                  todo.completed
                    ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                }`}
              >
                <div className={`mt-0.5 sm:mt-0 w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                  todo.completed ? 'bg-emerald-600 text-white' : 'border border-slate-400 dark:border-slate-600'
                }`}>
                  {todo.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                </div>

                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-medium block leading-snug ${
                    todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
                  }`}>
                    {todo.task}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                  {todo.assignee && (
                    <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded font-bold">
                      👤 {todo.assignee}
                    </span>
                  )}
                  {todo.dueDate && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                      📅 {todo.dueDate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. MEETING IMAGERY (WHITEBOARD, SLIDES, PROOFS) */}
      {entry.images && entry.images.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-2">
          <h2 className="text-[11px] font-black uppercase font-mono tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-105 dark:border-slate-800 pb-2">
            6. Meeting Imagery &amp; Whiteboard Notes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {entry.images.map((img, idx) => (
              <div 
                key={img.id}
                onClick={() => onImageClick && onImageClick(idx)}
                className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 cursor-zoom-in hover:opacity-90 transition relative group"
              >
                <img 
                  src={img.dataUrl} 
                  alt={img.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-mono uppercase font-bold">
                  Expand
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. FORMAL SIGN-OFF BLOCK */}
      <div className="pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] font-mono text-slate-500 dark:text-slate-400 gap-2">
        <span>FIRST TECH CHALLENGE #6567 ROBORAIDERS — GENERAL MEETING PROTOCOL</span>
        {entry.status === 'Approved' ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            OFFICIALLY RATIFIED BY MENTOR: {entry.reviewer || 'LEAD MENTOR'}
          </span>
        ) : (
          <span className="border-b border-slate-400 dark:border-slate-600 w-48 text-right">
            LEAD SIGNATURE: _______________
          </span>
        )}
      </div>

    </div>
  );
};
export default GeneralMeetingView;
