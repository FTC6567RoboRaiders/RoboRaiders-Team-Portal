import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Filter, 
  User, 
  Tag, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  MoreVertical,
  Layers
} from 'lucide-react';
import { KanbanTask, KanbanColumn, Subteam, UserAccount } from '../types';

interface KanbanBoardProps {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  tasks: KanbanTask[];
  onUpdateTasks: (newTasks: KanbanTask[]) => void;
  formatSubteamLabel: (subteam: any) => string;
}

const COLUMNS: { id: KanbanColumn; name: string; color: string; border: string; bg: string; text: string }[] = [
  { 
    id: 'todo', 
    name: 'Backlog / To Do', 
    color: 'bg-slate-100 dark:bg-slate-900', 
    border: 'border-slate-300 dark:border-slate-800', 
    bg: 'bg-slate-50 dark:bg-slate-950', 
    text: 'text-slate-800 dark:text-slate-205' 
  },
  { 
    id: 'inprogress', 
    name: 'In Progress', 
    color: 'bg-amber-100 dark:bg-amber-950/20', 
    border: 'border-amber-350 dark:border-amber-900/45', 
    bg: 'bg-amber-50/50 dark:bg-amber-950/10', 
    text: 'text-amber-800 dark:text-amber-300' 
  },
  { 
    id: 'review', 
    name: 'In Review & Testing', 
    color: 'bg-blue-100 dark:bg-blue-950/20', 
    border: 'border-blue-350 dark:border-blue-900/45', 
    bg: 'bg-blue-50/50 dark:bg-blue-950/10', 
    text: 'text-blue-800 dark:text-blue-300' 
  },
  { 
    id: 'done', 
    name: 'Completed', 
    color: 'bg-emerald-100 dark:bg-emerald-950/20', 
    border: 'border-emerald-350 dark:border-emerald-900/45', 
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/10', 
    text: 'text-emerald-800 dark:text-emerald-300' 
  }
];

export default function KanbanBoard({ 
  currentUser, 
  accounts, 
  tasks, 
  onUpdateTasks,
  formatSubteamLabel
}: KanbanBoardProps) {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskSubteam, setTaskSubteam] = useState<Subteam>('Design/Build/Fabrication');
  const [taskAssignedTo, setTaskAssignedTo] = useState('Unassigned');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskColumn, setTaskColumn] = useState<KanbanColumn>('todo');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubteam, setFilterSubteam] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDragColumn, setActiveDragColumn] = useState<KanbanColumn | null>(null);

  // Toast indicator state
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  // Set up task submission/editing
  const openCreateModal = (col: KanbanColumn = 'todo') => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskSubteam(currentUser?.primarySubteam && currentUser.primarySubteam !== 'None' && currentUser.primarySubteam !== 'Mentor' && currentUser.primarySubteam !== 'Lead/Captain' ? currentUser.primarySubteam as any : 'Design/Build/Fabrication');
    setTaskAssignedTo(currentUser?.name || 'Unassigned');
    setTaskPriority('Medium');
    setTaskColumn(col);
    setIsModalOpen(true);
  };

  const openEditModal = (task: KanbanTask) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskSubteam(task.subteam);
    setTaskAssignedTo(task.assignedTo);
    setTaskPriority(task.priority);
    setTaskColumn(task.column);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      showToast('Task title is required!', 'danger');
      return;
    }

    const updaterName = currentUser?.name || 'Anonymous User';

    if (editingTaskId) {
      // Edit mode
      const updated = tasks.map(t => {
        if (t.id === editingTaskId) {
          return {
            ...t,
            title: taskTitle.trim(),
            description: taskDescription.trim(),
            subteam: taskSubteam,
            assignedTo: taskAssignedTo,
            priority: taskPriority,
            column: taskColumn,
            updatedAt: Date.now(),
            updatedBy: updaterName
          };
        }
        return t;
      });
      onUpdateTasks(updated);
      showToast(`Updated task: "${taskTitle.trim()}" successfully!`, 'success');
    } else {
      // Create mode
      const newTask: KanbanTask = {
        id: `k-task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        subteam: taskSubteam,
        assignedTo: taskAssignedTo,
        priority: taskPriority,
        column: taskColumn,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        updatedBy: updaterName
      };
      onUpdateTasks([...tasks, newTask]);
      showToast(`Created draft task: "${taskTitle.trim()}"!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete task "${name}"?`)) {
      const remaining = tasks.filter(t => t.id !== id);
      onUpdateTasks(remaining);
      showToast(`Task deleted: "${name}"`, 'info');
    }
  };

  const moveTaskColumn = (taskId: string, targetCol: KanbanColumn) => {
    const updaterName = currentUser?.name || 'Anonymous User';
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          column: targetCol,
          updatedAt: Date.now(),
          updatedBy: updaterName
        };
      }
      return t;
    });
    onUpdateTasks(updated);
    showToast(`Task moved to ${COLUMNS.find(c => c.id === targetCol)?.name || targetCol}`, 'success');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: KanbanColumn) => {
    e.preventDefault();
    if (activeDragColumn !== columnId) {
      setActiveDragColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setActiveDragColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetCol: KanbanColumn) => {
    e.preventDefault();
    setActiveDragColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.column !== targetCol) {
        moveTaskColumn(taskId, targetCol);
      }
    }
    setDraggedTaskId(null);
  };

  // Render priority badge
  const renderPriorityBadge = (priority: 'Low' | 'Medium' | 'High') => {
    const colors = {
      Low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      Medium: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      High: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900'
    };
    return (
      <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase border ${colors[priority]}`}>
        {priority} Priority
      </span>
    );
  };

  // Render Subteam badge on ticket
  const renderSubteamBadge = (subteam: Subteam) => {
    return (
      <span className="px-2 py-0.5 rounded font-sans text-[9px] font-bold bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-705">
        ⚙️ {formatSubteamLabel(subteam)}
      </span>
    );
  };

  // Filter tasks based on query controls
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubteam = filterSubteam === 'All' || t.subteam === filterSubteam;
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchesSearch && matchesSubteam && matchesPriority;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors animate-fade-in p-4 md:p-6">
      
      {/* Toast alert overlay */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl border bg-slate-900 dark:bg-slate-800 text-white border-slate-800 text-xs font-bold animate-fade-in animate-bounce">
          {toastMsg.type === 'success' && <span className="text-emerald-400">●</span>}
          {toastMsg.type === 'info' && <span className="text-blue-400">●</span>}
          {toastMsg.type === 'danger' && <span className="text-rose-400">●</span>}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* HEADER CONTROLS BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-brand text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded border border-brand/50 select-none tracking-widest leading-none">
              TEAM MANAGEMENT
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight uppercase font-display text-slate-800 dark:text-slate-50 mt-1.5 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand" />
            <span>Interactive Team Kanban Board</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            A real-time workspace backlog where subteams can draft, track, update status, and take ownership of development tasks. Changes are saved automatically.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start xl:self-center">
          <button
            onClick={() => openCreateModal('todo')}
            className="bg-brand hover:bg-brand-hover text-white font-extrabold text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task Ticket</span>
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-3.5 w-3.5 text-slate-400" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords or assignee..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Subteam select filter */}
          <div className="flex items-center gap-1.5 shrink-0 text-xs">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSubteam}
              onChange={(e) => setFilterSubteam(e.target.value)}
              className="bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1 text-xs text-slate-805 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand font-bold"
            >
              <option value="All">All Subteams</option>
              <option value="Design/Build/Fabrication">Design/Build</option>
              <option value="Programming">Programming</option>
              <option value="Outreach">Outreach</option>
              <option value="Business & Media">Business & Media</option>
              <option value="Inspire">Inspire Focus</option>
              <option value="Strategy">Strategy Focus</option>
              <option value="Mentoring">Mentoring</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 shrink-0 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1 text-xs text-slate-805 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand font-bold"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {(searchQuery !== '' || filterSubteam !== 'All' || filterPriority !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterSubteam('All');
                setFilterPriority('All');
                showToast('Reset board filter limits', 'info');
              }}
              className="text-xs text-brand font-bold hover:underline font-mono uppercase tracking-wide cursor-pointer ml-auto md:ml-0"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* KANBAN GRID */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto min-h-[450px] select-none">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter(t => t.column === col.id);
          const isDraggingOverThis = activeDragColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-xl overflow-hidden border ${
                isDraggingOverThis 
                  ? 'border-dashed border-brand bg-slate-100/60 dark:bg-brand/5 scale-[1.01] transition-transform duration-200' 
                  : 'border-slate-200 dark:border-slate-900 bg-slate-50/40 dark:bg-slate-900/40'
              } h-full flex-1 max-h-[800px] shadow-sm`}
            >
              {/* Column header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-900 flex justify-between items-center bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.id === 'todo' ? 'bg-slate-400' : col.id === 'inprogress' ? 'bg-amber-450' : col.id === 'review' ? 'bg-blue-450' : 'bg-emerald-450'}`} />
                  <span className="text-[11px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {col.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                    {colTasks.length}
                  </span>
                  <button
                    onClick={() => openCreateModal(col.id)}
                    title={`Add ticket direct to ${col.name}`}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Column contents body */}
              <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-3 max-h-[700px]">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 dark:border-slate-850 text-center rounded-lg mt-2 select-none">
                    <AlertTriangle className="w-5 h-5 text-slate-300 dark:text-slate-700 mb-1" />
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-normal">
                      Column Empty
                    </span>
                    <button
                      onClick={() => openCreateModal(col.id)}
                      className="text-[9px] font-bold text-brand hover:underline mt-1 font-mono uppercase"
                    >
                      + Add Task
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-lg p-2.5 shadow-sm hover:shadow-md transition-all hover:border-brand/30 cursor-grab active:cursor-grabbing group relative flex flex-col gap-1.5"
                    >
                      {/* Subteam and priority tags */}
                      <div className="flex flex-wrap items-center gap-1">
                        {renderSubteamBadge(task.subteam)}
                        {renderPriorityBadge(task.priority)}
                      </div>

                      {/* Title and Action menu */}
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-100 leading-tight tracking-wide font-sans group-hover:text-brand transition-colors">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug font-sans mt-1 line-clamp-2 white-space-pre-line">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Assigned and updated status */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850/80 pt-1.5 mt-0.5 text-[9px] font-mono text-slate-400 dark:text-slate-505">
                        <div className="flex items-center gap-1 text-slate-650 dark:text-slate-350">
                          <User className="w-2.5 h-2.5 text-slate-400" />
                          <span className="font-bold max-w-[95px] truncate">{task.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          <span>{new Date(task.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Footer Actions Panel */}
                      <div className="flex items-center justify-between mt-0.5 pt-1.5 border-t border-slate-100 dark:border-slate-850/50">
                        {/* Column flow controls (very useful for touch devices or immediate mouse clicks!) */}
                        <div className="flex items-center gap-1 text-[8px] font-mono">
                          {col.id !== 'todo' && (
                            <button
                              onClick={() => moveTaskColumn(task.id, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) - 1].id)}
                              title="Demote status"
                              className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer border border-slate-100 dark:border-slate-805"
                            >
                              <ChevronLeft className="w-2.5 h-2.5" />
                            </button>
                          )}
                          <span className="px-0.5 text-slate-420 font-bold uppercase tracking-wider">Move</span>
                          {col.id !== 'done' && (
                            <button
                              onClick={() => moveTaskColumn(task.id, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) + 1].id)}
                              title="Promote status"
                              className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer border border-slate-100 dark:border-slate-805"
                            >
                              <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        {/* Edit and Delete operations */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(task)}
                            title="Edit task parameters"
                            className="p-0.5 text-slate-400 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all cursor-pointer"
                          >
                            <Edit className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            title="Purge task ticket"
                            className="p-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      {/* Show last editors metadata */}
                      <div className="text-[7.5px] font-mono text-slate-402 dark:text-slate-501 mt-[-4px] text-right">
                        Ref: {task.updatedBy}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK KANBAN LEGEND STATEMENT */}
      <div className="bg-slate-100 dark:bg-slate-900/40 p-3.5 border border-slate-200 dark:border-slate-800/80 rounded-xl mt-6 flex items-start gap-3.5 text-xs font-sans">
        <AlertTriangle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[10.5px] uppercase">
            Collaborative Sync Protocols:
          </span>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-450 leading-relaxed mt-0.5">
            This workspace Kanban board is synchronized via a common local team state register. High-fidelity drag-and-drop actions automatically log the target user as the editor. Remember to export the database periodic binaries periodically!
          </p>
        </div>
      </div>

      {/* TICKET POPUP EDIT / CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="p-4 md:p-5 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-extrabold uppercase text-xs md:text-sm tracking-widest font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand" />
                <span>{editingTaskId ? 'Edit Task Ticket' : 'Create New Task Ticket'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-mono font-bold hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
              {/* Task Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Task Title <span className="text-brand">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Manufacture intake plates"
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-909 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-bold"
                />
              </div>

              {/* Task Description */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Detailed Description
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Detail mechanical constraints, firmware specifications or outreach target outcomes..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-909 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-sans leading-normal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Target Subteam */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Target Subteam
                  </label>
                  <select
                    value={taskSubteam}
                    onChange={(e) => setTaskSubteam(e.target.value as Subteam)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-909 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand font-bold"
                  >
                    <option value="Design/Build/Fabrication">Design / Build</option>
                    <option value="Programming">Programming</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Business & Media">Business & Media</option>
                    <option value="Inspire">Inspire Focus</option>
                    <option value="Strategy">Strategy Focus</option>
                    <option value="Mentoring">Mentoring</option>
                  </select>
                </div>

                {/* Team Priority */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Task Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-909 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand font-bold"
                  >
                    <option value="Low">🟢 Low Priority</option>
                    <option value="Medium">🔵 Medium Priority</option>
                    <option value="High">🔴 High Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Board Column */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Status Column
                  </label>
                  <select
                    value={taskColumn}
                    onChange={(e) => setTaskColumn(e.target.value as KanbanColumn)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-909 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand font-bold"
                  >
                    <option value="todo">Backlog / To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="review">In Review & Testing</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                {/* Assignee */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Assignee Member
                  </label>
                  <select
                    value={taskAssignedTo}
                    onChange={(e) => setTaskAssignedTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-909 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand font-bold"
                  >
                    <option value="Unassigned">👤 Unassigned</option>
                    {accounts.filter(a => a.status === 'Approved').map(acc => (
                      <option key={acc.id} value={acc.name}>👤 {acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit / Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand hover:bg-brand-hover text-white font-extrabold px-5 py-2.5 rounded shadow-sm text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{editingTaskId ? 'Update Ticket' : 'Insert Ticket'}</span>
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
