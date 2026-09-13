import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Flame,
  Award,
  Sparkles,
  Zap,
  BookOpen,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  Calendar,
  Send,
  User,
  Users,
  Check,
  ShieldCheck,
  RotateCcw,
  Edit3,
  Trash2,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  BarChart2,
  Star,
  Info,
  Layers,
  Code,
  Wrench,
  Cpu,
  Compass,
  HeartHandshake,
  Lock,
  Eye,
  RefreshCw, Gift
} from 'lucide-react';
import {
  UserAccount,
  Subteam,
  QuestionOfTheDay,
  QuestionAnswerSubmission,
  QotdCategory,
  QotdLeaderboardEntry,
  XPAdjustment
} from '../types';

interface QuestionOfTheDayHubProps {
  currentUser: UserAccount | null;
  users: UserAccount[];
  questions: QuestionOfTheDay[];
  submissions: QuestionAnswerSubmission[];
  onCreateQuestion: (q: Omit<QuestionOfTheDay, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  onUpdateQuestion: (q: QuestionOfTheDay) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  onSubmitAnswer: (submission: Omit<QuestionAnswerSubmission, 'id' | 'submittedAt' | 'pointsAwarded' | 'status'> & { pointsAwarded?: number; status?: 'pending_review' | 'graded_correct' | 'graded_incorrect' }) => Promise<void>;
  onGradeSubmission: (submissionId: string, isCorrect: boolean, pointsAwarded: number, feedback: string) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'danger' | 'info') => void;
  onNavigate?: (view: string) => void;
}


export default function QuestionOfTheDayHub({
  currentUser,
  users,
  questions,
  submissions,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onSubmitAnswer,
  onGradeSubmission,
  showToast,
  onNavigate
}: QuestionOfTheDayHubProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'challenge' | 'leaderboard' | 'archive' | 'mentor_desk'>('challenge');
  
  // Mentor creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<QotdCategory>('Game Rules & Field');
  const [newQuestionType, setNewQuestionType] = useState<'multiple_choice' | 'open_ended'>('multiple_choice');
  const [newOptions, setNewOptions] = useState<string[]>(['', '', '', '']);
  const [newCorrectOptionIndex, setNewCorrectOptionIndex] = useState<number>(0);
  const [newRubric, setNewRubric] = useState('');
  const [newPrize, setNewPrize] = useState('');
  const [newPoints, setNewPoints] = useState<number>(100);
  const [newDurationHours, setNewDurationHours] = useState<number>(24);
  const [isSubmittingNewQ, setIsSubmittingNewQ] = useState(false);

  // Student Answering state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [openAnswerText, setOpenAnswerText] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Leaderboard filters
  const [leaderboardSubteamFilter, setLeaderboardSubteamFilter] = useState<Subteam | 'All'>('All');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');

  // Mentor grading filter / state
  const [selectedQuestionForGrading, setSelectedQuestionForGrading] = useState<string>('all');
  const [gradingFeedbackMap, setGradingFeedbackMap] = useState<{ [submissionId: string]: string }>({});
  const [gradingPointsMap, setGradingPointsMap] = useState<{ [submissionId: string]: number }>({});
  const [isGrading, setIsGrading] = useState(false);

  // Live Timer Countdown State
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isMentor = currentUser?.role === 'mentor';

  // Find the currently active question (or latest active question)
  const activeQuestion = useMemo(() => {
    // Sort active questions by creation date descending
    const activeList = questions
      .filter(q => q.status === 'active' && q.expiresAt > now)
      .sort((a, b) => b.createdAt - a.createdAt);
    return activeList[0] || null;
  }, [questions, now]);

  // Current user's submission for the active question
  const userSubmissionForActive = useMemo(() => {
    if (!currentUser || !activeQuestion) return null;
    return submissions.find(s => s.questionId === activeQuestion.id && (s.userId === currentUser.id || s.userEmail === currentUser.schoolEmail)) || null;
  }, [currentUser, activeQuestion, submissions]);

  // Compute remaining time for active question
  const timeRemaining = useMemo(() => {
    if (!activeQuestion) return null;
    const diff = activeQuestion.expiresAt - now;
    if (diff <= 0) return { expired: true, text: 'Time Expired', hours: 0, minutes: 0, seconds: 0, percent: 0 };
    
    const totalDurationMs = activeQuestion.durationMinutes * 60 * 1000;
    const elapsed = totalDurationMs - diff;
    const percent = Math.min(100, Math.max(0, (diff / totalDurationMs) * 100));

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return {
      expired: false,
      text: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      hours,
      minutes,
      seconds,
      percent
    };
  }, [activeQuestion, now]);

  // Compute Leaderboard Data
  const leaderboardData = useMemo(() => {
    const userMap: { [userIdOrEmail: string]: QotdLeaderboardEntry } = {};

    // Initialize map from known users
    users.forEach(u => {
      userMap[u.schoolEmail] = {
        userId: u.id,
        userName: u.name,
        userEmail: u.schoolEmail,
        userSubteam: (u.primarySubteam as any) || 'Programming',
        totalPoints: 0,
        questionsAnswered: 0,
        correctCount: 0,
        streakDays: 0,
        fastestAnswerSeconds: undefined
      };
    });

    // Aggregate submissions
    submissions.forEach(sub => {
      let entry = userMap[sub.userEmail];
      if (!entry) {
        entry = {
          userId: sub.userId,
          userName: sub.userName,
          userEmail: sub.userEmail,
          userSubteam: sub.userSubteam,
          totalPoints: 0,
          questionsAnswered: 0,
          correctCount: 0,
          streakDays: 0,
          fastestAnswerSeconds: undefined
        };
        userMap[sub.userEmail] = entry;
      }

      entry.questionsAnswered += 1;
      entry.totalPoints += sub.pointsAwarded || 0;
      if (sub.isCorrect || sub.status === 'graded_correct') {
        entry.correctCount += 1;
      }

      if (sub.timeSpentSeconds) {
        if (!entry.fastestAnswerSeconds || sub.timeSpentSeconds < entry.fastestAnswerSeconds) {
          entry.fastestAnswerSeconds = sub.timeSpentSeconds;
        }
      }
    });

    // Calculate dynamic streaks (consecutive question submissions)
    const list = Object.values(userMap);
    list.forEach(entry => {
      // Mock/derived streak based on correct count
      entry.streakDays = Math.min(entry.correctCount, Math.max(1, Math.floor(entry.questionsAnswered * 0.8)));
    });

    // Sort by Total Points descending, then by Correct Count, then by Questions Answered
    list.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      return b.questionsAnswered - a.questionsAnswered;
    });

    // Assign Ranks
    return list.map((entry, idx) => ({
      ...entry,
      rank: idx + 1
    }));
  }, [users, submissions]);

  // Filtered Leaderboard
  const filteredLeaderboard = useMemo(() => {
    return leaderboardData.filter(entry => {
      if (leaderboardSubteamFilter !== 'All' && entry.userSubteam !== leaderboardSubteamFilter) {
        return false;
      }
      if (leaderboardSearch.trim()) {
        const q = leaderboardSearch.toLowerCase();
        return entry.userName.toLowerCase().includes(q) || entry.userEmail.toLowerCase().includes(q);
      }
      return true;
    });
  }, [leaderboardData, leaderboardSubteamFilter, leaderboardSearch]);

  // Subteam Rivalry Standings
  const subteamStandings = useMemo(() => {
    const stats: { [subteam: string]: { totalPoints: number; answers: number; correct: number } } = {};
    leaderboardData.forEach(entry => {
      if (!stats[entry.userSubteam]) {
        stats[entry.userSubteam] = { totalPoints: 0, answers: 0, correct: 0 };
      }
      stats[entry.userSubteam].totalPoints += entry.totalPoints;
      stats[entry.userSubteam].answers += entry.questionsAnswered;
      stats[entry.userSubteam].correct += entry.correctCount;
    });

    return Object.entries(stats)
      .map(([subteam, data]) => ({ subteam: subteam as Subteam, ...data }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [leaderboardData]);

  // Handler for Submitting Answer
  const handleSubmitAnswer = async () => {
    if (!currentUser || !activeQuestion) return;
    if (activeQuestion.questionType === 'multiple_choice' && selectedOption === null) {
      showToast('Please select one of the multiple-choice options before submitting.', 'info');
      return;
    }
    if (activeQuestion.questionType === 'open_ended' && !openAnswerText.trim()) {
      showToast('Please type your answer explanation before submitting.', 'info');
      return;
    }

    setIsSubmittingAnswer(true);
    try {
      const timeSpent = Math.max(5, Math.floor((now - activeQuestion.createdAt) / 1000));
      
      let isCorrect = false;
      let pointsAwarded = 0;
      let status: 'pending_review' | 'graded_correct' | 'graded_incorrect' = 'pending_review';

      if (activeQuestion.questionType === 'multiple_choice') {
        isCorrect = selectedOption === activeQuestion.correctOptionIndex;
        pointsAwarded = isCorrect ? activeQuestion.points : 0;
        status = isCorrect ? 'graded_correct' : 'graded_incorrect';
      }

      const answerText = activeQuestion.questionType === 'multiple_choice'
        ? (activeQuestion.options ? activeQuestion.options[selectedOption!] : `Option ${selectedOption}`)
        : openAnswerText.trim();

      await onSubmitAnswer({
        questionId: activeQuestion.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.schoolEmail,
        userSubteam: (currentUser.primarySubteam as any) || 'Programming',
        answer: answerText,
        selectedOptionIndex: selectedOption !== null ? selectedOption : undefined,
        isCorrect,
        pointsAwarded,
        status,
        timeSpentSeconds: timeSpent
      });

      if (activeQuestion.questionType === 'multiple_choice') {
        if (isCorrect) {
          showToast(`🎉 Brilliant! Correct answer! +${pointsAwarded} points awarded!`, 'success');
        } else {
          showToast('Answer recorded. Good effort! Review the explanation in the archive once the timer concludes.', 'info');
        }
      } else {
        showToast('Your open response has been submitted to mentors for grading and feedback!', 'success');
      }

      setSelectedOption(null);
      setOpenAnswerText('');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to submit answer. Please check your connection.', 'danger');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Handler for Mentors Creating New Question
  const handleCreateQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isMentor) return;
    if (!newQuestionText.trim()) {
      showToast('Please enter the question prompt.', 'danger');
      return;
    }

    if (newQuestionType === 'multiple_choice') {
      const filledOptions = newOptions.filter(o => o.trim().length > 0);
      if (filledOptions.length < 2) {
        showToast('Multiple-choice questions must have at least 2 non-empty options.', 'danger');
        return;
      }
    }

    setIsSubmittingNewQ(true);
    try {
      const durationMin = newDurationHours * 60;
      const expiresAt = Date.now() + durationMin * 60 * 1000;

      await onCreateQuestion({
        question: newQuestionText.trim(),
        description: newDescription.trim() || undefined,
        category: newCategory,
        questionType: newQuestionType,
        options: newQuestionType === 'multiple_choice' ? newOptions.map(o => o.trim()) : undefined,
        correctOptionIndex: newQuestionType === 'multiple_choice' ? newCorrectOptionIndex : undefined,
        rubricOrExpectedAnswer: newRubric.trim() || undefined,
        prize: newPrize.trim() || undefined,
        points: Number(newPoints) || 100,
        durationMinutes: durationMin,
        expiresAt: expiresAt,
        createdBy: currentUser?.name || 'Mentor',
        createdByEmail: currentUser?.schoolEmail || 'mentor@school.edu'
      });

      showToast(`⚡ Question of the Day published successfully with a ${newDurationHours}-hour timer!`, 'success');
      setShowCreateModal(false);
      // Reset form
      setNewQuestionText('');
      setNewDescription('');
      setNewOptions(['', '', '', '']);
      setNewCorrectOptionIndex(0);
      setNewRubric('');
      setNewPrize('');
      setNewPoints(100);
      setNewDurationHours(24);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to publish question. Please check permissions.', 'danger');
    } finally {
      setIsSubmittingNewQ(false);
    }
  };

  // Category Icon helper
  const getCategoryIcon = (cat: QotdCategory) => {
    switch (cat) {
      case 'Game Rules & Field': return <BookOpen className="w-4 h-4 text-amber-500" />;
      case 'Programming & Autonomous': return <Code className="w-4 h-4 text-cyan-500" />;
      case 'Design, CAD & Build': return <Wrench className="w-4 h-4 text-rose-500" />;
      case 'Electrical & Sensors': return <Cpu className="w-4 h-4 text-indigo-500" />;
      case 'Strategy & Scouting': return <Compass className="w-4 h-4 text-emerald-500" />;
      case 'Team Culture & Inspire': return <HeartHandshake className="w-4 h-4 text-purple-500" />;
    }
  };

  // Category Color helper
  const getCategoryBadgeClass = (cat: QotdCategory) => {
    switch (cat) {
      case 'Game Rules & Field': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Programming & Autonomous': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
      case 'Design, CAD & Build': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'Electrical & Sensors': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'Strategy & Scouting': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Team Culture & Inspire': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800';
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6" id="qotd-hub-root">
      
      {/* TOP HERO / HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-rose-950 text-white border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                Daily FIRST Challenge Hub
              </span>
              <span className="text-xs text-slate-400 font-mono">FTC #6567 RoboRaiders</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-display flex items-center gap-3">
              <span>Question of the Day</span>
              <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Master game rules, sharpen autonomous code, solve engineering mechanics, and climb the team trivia leaderboard to win points!
            </p>
          </div>

          {/* Action Area & Quick Stats */}
          <div className="flex items-center flex-wrap md:flex-col lg:flex-row gap-3">
            {isMentor && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-900/40 hover:shadow-xl transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Question</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('leaderboard')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>View Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Mini Status Ribbon */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Prize</span>
              <span className="font-bold text-white text-sm">{activeQuestion ? `+${activeQuestion.points} pts` : 'Waiting Next'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Countdown</span>
              <span className="font-mono font-bold text-rose-300 text-sm">{timeRemaining ? (timeRemaining.expired ? 'Expired' : timeRemaining.text) : 'No Active'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Submissions</span>
              <span className="font-bold text-white text-sm">{submissions.length} Logged</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Top Ranked</span>
              <span className="font-bold text-white text-sm truncate max-w-[120px]">{leaderboardData[0]?.userName || 'None yet'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('challenge')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'challenge'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Today's Question</span>
            {activeQuestion && !userSubmissionForActive && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard &amp; Ranks</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'archive'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Question Archive ({questions.length})</span>
          </button>

          {isMentor && (
            <button
              onClick={() => setActiveTab('mentor_desk')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'mentor_desk'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Mentor Grading Desk</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => onNavigate ? onNavigate('handbook') : null}
            className="hidden sm:flex items-center gap-1 hover:text-rose-600 cursor-pointer transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rulebook Reference</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TODAY'S CHALLENGE / ACTIVE QUESTION CARD                            */}
      {/* ========================================================================= */}
      {activeTab === 'challenge' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Question Box (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {activeQuestion ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-6 relative">
                
                {/* Header Tag Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getCategoryBadgeClass(activeQuestion.category)}`}>
                      {getCategoryIcon(activeQuestion.category)}
                      <span>{activeQuestion.category}</span>
                    </span>
                    <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      +{activeQuestion.points} pts
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeQuestion.prize && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                        <Gift className="w-3.5 h-3.5" />
                        Prize: {activeQuestion.prize}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      Posted by {activeQuestion.createdBy}
                    </span>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="space-y-3">
                  <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-snug">
                    {activeQuestion.question}
                  </h2>

                  {activeQuestion.description && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300 text-xs leading-relaxed flex items-start gap-3">
                      <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">Question Details &amp; Hint:</span>
                        <p>{activeQuestion.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Response Interface OR Result Display */}
                {userSubmissionForActive ? (
                  /* ALREADY ANSWERED STATE */
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {userSubmissionForActive.status === 'graded_correct' ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        ) : userSubmissionForActive.status === 'graded_incorrect' ? (
                          <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
                            <XCircle className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {userSubmissionForActive.status === 'graded_correct'
                              ? 'Correct Answer! Points Awarded!'
                              : userSubmissionForActive.status === 'graded_incorrect'
                              ? 'Incorrect Answer'
                              : 'Answer Submitted (Pending Mentor Review)'}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Submitted at {new Date(userSubmissionForActive.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                          +{userSubmissionForActive.pointsAwarded} pts
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs dark:bg-slate-900 dark:border-slate-700">
                      <span className="text-slate-400 font-bold block mb-1">Your Submitted Response:</span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {userSubmissionForActive.answer}
                      </p>
                    </div>

                    {userSubmissionForActive.mentorFeedback && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs dark:bg-amber-950/40 dark:border-amber-900/60 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-900 dark:text-amber-300">Mentor Feedback:</span>
                          <p className="text-amber-800 dark:text-amber-200 mt-0.5">{userSubmissionForActive.mentorFeedback}</p>
                        </div>
                      </div>
                    )}

                    {activeQuestion.rubricOrExpectedAnswer && (
                      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Explanation:</span>
                        <p className="text-slate-600 dark:text-slate-400">{activeQuestion.rubricOrExpectedAnswer}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ACTIVE ANSWERING FORM */
                  <div className="space-y-5 pt-2">
                    {activeQuestion.questionType === 'multiple_choice' ? (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Select the best answer:
                        </span>
                        <div className="space-y-2.5">
                          {activeQuestion.options?.map((option, idx) => {
                            const isSelected = selectedOption === idx;
                            const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedOption(idx)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                                  isSelected
                                    ? 'bg-rose-50 border-rose-500 shadow-xs text-rose-950 dark:bg-rose-950/40 dark:border-rose-500 dark:text-rose-100 ring-2 ring-rose-500/20'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 dark:bg-slate-850 dark:border-slate-750 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <span className={`w-7 h-7 rounded-xl font-bold font-mono text-xs flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}>
                                  {optionLetters[idx] || idx + 1}
                                </span>
                                <span className="text-xs font-medium leading-relaxed flex-1">
                                  {option}
                                </span>
                                {isSelected && (
                                  <CheckCircle2 className="w-5 h-5 text-rose-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Your Technical Response &amp; Justification:
                        </label>
                        <textarea
                          rows={4}
                          value={openAnswerText}
                          onChange={(e) => setOpenAnswerText(e.target.value)}
                          placeholder="Type your explanation, formula derivations, code outline, or rulebook justification..."
                          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                        <span className="text-[11px] text-slate-400">
                          {openAnswerText.length} characters • Mentors review and award up to {activeQuestion.points} points.
                        </span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="text-[11px] text-slate-500">
                        Need resources to study? 
                        <a href="https://ftc-resources.firstinspires.org/ftc/game" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline dark:text-rose-400 font-bold ml-1">
                          View official FTC Game Resources here
                        </a>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-[11px] text-slate-500">
                          {timeRemaining && !timeRemaining.expired ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Active countdown: {timeRemaining.text} remaining
                            </span>
                          ) : (
                            <span className="text-rose-500 font-bold">Countdown has concluded</span>
                          )}
                        </div>
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={isSubmittingAnswer || (timeRemaining?.expired ?? false)}
                          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          <span>{isSubmittingAnswer ? 'Verifying...' : 'Submit Answer'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* NO ACTIVE QUESTION FALLBACK */
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center dark:bg-amber-950/40 dark:text-amber-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    No Live Question Right Now
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                    Mentors post daily game rule and engineering questions before workshop meetings. Check back shortly or browse previous questions in the archive!
                  </p>
                  <div className="pt-2">
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Need resources to study? 
                      <a href="https://ftc-resources.firstinspires.org/ftc/game" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline dark:text-rose-400 font-bold ml-1">
                        View official FTC Game Resources here
                      </a>
                    </p>
                  </div>
                </div>
                {isMentor && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create &amp; Publish Question</span>
                  </button>
                )}
              </div>
            )}


          </div>
          {/* Sidebar / Leaderboard Preview & Stats (1 col) */}
          <div className="space-y-6">
            
            {/* LIVE TIMER CARD */}
            {activeQuestion && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Timer Countdown
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {activeQuestion.durationMinutes}m window
                  </span>
                </div>

                {/* Progress Visual */}
                <div className="text-center py-2 space-y-1">
                  <div className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                    {timeRemaining?.text}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {timeRemaining?.expired ? 'Submissions are now closed' : 'Time remaining until answer lock'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden dark:bg-slate-800">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      (timeRemaining?.percent ?? 0) < 20
                        ? 'bg-rose-500'
                        : (timeRemaining?.percent ?? 0) < 50
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${timeRemaining?.percent || 0}%` }}
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                  <span>Expires:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {new Date(activeQuestion.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}

            {/* MINI LEADERBOARD PREVIEW */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Trivia Podium
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer flex items-center gap-0.5"
                >
                  <span>Full Board</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {leaderboardData.slice(0, 5).map((entry, idx) => (
                  <div
                    key={entry.userEmail}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 dark:bg-slate-850 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-700 text-amber-100'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {entry.userName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {entry.userSubteam}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">
                        {entry.totalPoints} pts
                      </span>
                      {entry.streakDays > 0 && (
                        <div className="flex items-center justify-end gap-0.5 text-[10px] text-amber-600 font-bold">
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>{entry.streakDays}d</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUBTEAM RIVALRY BOX */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 dark:bg-slate-850 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Subteam League Points
                </span>
              </div>

              <div className="space-y-2">
                {subteamStandings.slice(0, 4).map((st, idx) => (
                  <div key={st.subteam} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{st.subteam}</span>
                      <span className="font-mono text-slate-900 dark:text-white">{st.totalPoints} pts</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(5, (st.totalPoints / (subteamStandings[0]?.totalPoints || 1)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FULL TRIVIA LEADERBOARD & RANKS                                    */}
      {/* ========================================================================= */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          
          {/* PODIUM TOP 3 CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {/* Rank 2 (Silver) */}
            {leaderboardData[1] && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center space-y-3 dark:bg-slate-900 dark:border-slate-800 order-2 sm:order-1 relative mt-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-700 font-black text-xl flex items-center justify-center border-4 border-slate-100 shadow-md">
                  2
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">2nd Place (Silver)</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{leaderboardData[1].userName}</h3>
                  <span className="text-xs text-slate-500">{leaderboardData[1].userSubteam}</span>
                </div>
                <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-around text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Points</span>
                    <span className="font-bold text-rose-600 font-mono text-sm">{leaderboardData[1].totalPoints} pts</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Correct</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{leaderboardData[1].correctCount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold / Champion) */}
            {leaderboardData[0] && (
              <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-3xl p-6 shadow-md flex flex-col items-center text-center space-y-3 dark:from-slate-850 dark:to-slate-900 dark:border-amber-500/40 order-1 sm:order-2 relative -mt-2">
                <div className="absolute -top-4 w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg">
                  <CrownIcon />
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 font-black text-2xl flex items-center justify-center border-4 border-amber-200 shadow-lg">
                  1
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400">Trivia Champion 👑</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{leaderboardData[0].userName}</h3>
                  <span className="text-xs text-slate-500">{leaderboardData[0].userSubteam}</span>
                </div>
                <div className="w-full pt-3 border-t border-amber-100 dark:border-slate-800 flex justify-around text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Total Score</span>
                    <span className="font-black text-rose-600 font-mono text-base">{leaderboardData[0].totalPoints} pts</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Streak</span>
                    <span className="font-bold text-amber-600 flex items-center gap-1 justify-center">
                      <Flame className="w-3.5 h-3.5" />
                      {leaderboardData[0].streakDays}d
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {leaderboardData[2] && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center space-y-3 dark:bg-slate-900 dark:border-slate-800 order-3 relative mt-6">
                <div className="w-14 h-14 rounded-full bg-amber-700/20 text-amber-800 font-black text-xl flex items-center justify-center border-4 border-amber-100 shadow-md">
                  3
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-700">3rd Place (Bronze)</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{leaderboardData[2].userName}</h3>
                  <span className="text-xs text-slate-500">{leaderboardData[2].userSubteam}</span>
                </div>
                <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-around text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Points</span>
                    <span className="font-bold text-rose-600 font-mono text-sm">{leaderboardData[2].totalPoints} pts</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Correct</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{leaderboardData[2].correctCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FILTER AND SEARCH BAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs dark:bg-slate-900 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={leaderboardSearch}
                onChange={(e) => setLeaderboardSearch(e.target.value)}
                placeholder="Search member name or school email..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
              {(['All', 'Programming', 'Design/Build/Fabrication', 'Outreach', 'Business & Media', 'Strategy', 'Inspire'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setLeaderboardSubteamFilter(st as any)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                    leaderboardSubteamFilter === st
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* LEADERBOARD TABLE */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-850 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                    <th className="py-3.5 px-4">Member</th>
                    <th className="py-3.5 px-4">Subteam</th>
                    <th className="py-3.5 px-4 text-center">Questions Answered</th>
                    <th className="py-3.5 px-4 text-center">Correct Count</th>
                    <th className="py-3.5 px-4 text-center">Streak</th>
                    <th className="py-3.5 px-4 text-right">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLeaderboard.map((entry) => (
                    <tr
                      key={entry.userEmail}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                        entry.userEmail === currentUser?.schoolEmail ? 'bg-rose-50/50 dark:bg-rose-950/20 font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          entry.rank === 1
                            ? 'bg-amber-400 text-amber-950'
                            : entry.rank === 2
                            ? 'bg-slate-300 text-slate-800'
                            : entry.rank === 3
                            ? 'bg-amber-700 text-amber-100'
                            : 'text-slate-500 font-mono'
                        }`}>
                          {entry.rank}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{entry.userName}</span>
                          {entry.userEmail === currentUser?.schoolEmail && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded-sm">You</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{entry.userEmail}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {entry.userSubteam}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-700 dark:text-slate-300">
                        {entry.questionsAnswered}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-emerald-600 font-bold">
                        {entry.correctCount}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {entry.streakDays > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold font-mono">
                            <Flame className="w-3.5 h-3.5" />
                            {entry.streakDays}d
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-black font-mono text-rose-600 dark:text-rose-400 text-sm">
                          {entry.totalPoints} pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUESTION ARCHIVE & PAST CHALLENGES                                */}
      {/* ========================================================================= */}
      {activeTab === 'archive' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Historical Questions Archive
              </h3>
              <p className="text-xs text-slate-500">
                Browse all previous daily questions, review answer keys, and study official game manual citations.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full dark:bg-slate-800 dark:text-slate-300">
              {questions.length} Total Questions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q) => {
              const isQActive = q.status === 'active' && q.expiresAt > now;
              const qSubmissions = submissions.filter(s => s.questionId === q.id);
              const correctSubs = qSubmissions.filter(s => s.isCorrect || s.status === 'graded_correct');
              const accuracy = qSubmissions.length > 0 ? Math.round((correctSubs.length / qSubmissions.length) * 100) : 0;

              return (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs dark:bg-slate-900 dark:border-slate-800 space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${getCategoryBadgeClass(q.category)}`}>
                        {getCategoryIcon(q.category)}
                        <span>{q.category}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
                          +{q.points} pts
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isQActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {isQActive ? 'Live Active' : 'Concluded'}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {q.question}
                    </h4>

                    {q.prize && (
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Prize: {q.prize}
                      </div>
                    )}

                    {q.rubricOrExpectedAnswer && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Answer Key / Explanation:</span>
                        <p>{q.rubricOrExpectedAnswer}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{qSubmissions.length} answers • {accuracy}% correct</span>
                    </span>

                    {isMentor && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MENTOR GRADING & REVIEW DESK                                      */}
      {/* ========================================================================= */}
      {activeTab === 'mentor_desk' && isMentor && (
        <div className="space-y-6">
          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-indigo-950/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Mentor Question &amp; Submissions Desk
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Review student answers, award custom bonus points, and provide constructive technical feedback.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Question</span>
              </button>
            </div>
          </div>

          {/* Submissions Review Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-4 p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Pending &amp; Graded Submissions ({submissions.length})
              </h4>

              <select
                value={selectedQuestionForGrading}
                onChange={(e) => setSelectedQuestionForGrading(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Questions</option>
                {questions.map(q => (
                  <option key={q.id} value={q.id}>{q.question.slice(0, 45)}...</option>
                ))}
              </select>
            </div>

            {submissions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No member submissions recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {submissions
                  .filter(s => selectedQuestionForGrading === 'all' || s.questionId === selectedQuestionForGrading)
                  .map((sub) => {
                    const relatedQ = questions.find(q => q.id === sub.questionId);
                    const feedback = gradingFeedbackMap[sub.id] ?? (sub.mentorFeedback || '');
                    const points = gradingPointsMap[sub.id] ?? sub.pointsAwarded ?? (relatedQ?.points || 100);

                    return (
                      <div
                        key={sub.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 dark:bg-slate-850 dark:border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                              <span>{sub.userName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({sub.userSubteam})</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                sub.status === 'graded_correct'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : sub.status === 'graded_incorrect'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {sub.status === 'graded_correct' ? 'Correct' : sub.status === 'graded_incorrect' ? 'Incorrect' : 'Pending Review'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Question: {relatedQ?.question || sub.questionId}
                            </p>
                          </div>

                          <span className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">
                            +{sub.pointsAwarded} pts
                          </span>
                        </div>

                        {/* Submitted Answer Text */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 text-xs">
                          <span className="text-slate-400 font-bold block mb-1">Student Answer:</span>
                          <p className="text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap">{sub.answer}</p>
                        </div>

                        {/* Grading Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              value={feedback}
                              onChange={(e) => setGradingFeedbackMap({ ...gradingFeedbackMap, [sub.id]: e.target.value })}
                              placeholder="Mentor feedback / commendation note..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                await onGradeSubmission(sub.id, true, Number(points) || (relatedQ?.points || 100), feedback);
                                showToast(`Graded correct! Awarded +${points} pts to ${sub.userName}`, 'success');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Pass (+{points} pts)</span>
                            </button>

                            <button
                              onClick={async () => {
                                await onGradeSubmission(sub.id, false, 0, feedback);
                                showToast(`Graded incorrect for ${sub.userName}`, 'info');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold text-xs cursor-pointer dark:bg-slate-800 dark:text-slate-300"
                            >
                              <span>Reject (0 pts)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW QUESTION OF THE DAY                                     */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-slate-900 dark:border-slate-800 p-6 md:p-8 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center dark:bg-rose-950/50 dark:text-rose-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                    Post Question of the Day
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set questions, assign points, and configure the live countdown timer.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestionSubmit} className="space-y-4 text-xs">
              
              {/* Question Text */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Question Prompt *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="e.g., What is the maximum height allowed for a robot during the autonomous period?"
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              {/* Category & Question Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  >
                    <option value="Game Rules & Field">Game Rules & Field</option>
                    <option value="Programming & Autonomous">Programming & Autonomous</option>
                    <option value="Design, CAD & Build">Design, CAD & Build</option>
                    <option value="Electrical & Sensors">Electrical & Sensors</option>
                    <option value="Strategy & Scouting">Strategy & Scouting</option>
                    <option value="Team Culture & Inspire">Team Culture & Inspire</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">Question Format *</label>
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  >
                    <option value="multiple_choice">Multiple Choice (Auto-Graded)</option>
                    <option value="open_ended">Open Response / Short Answer (Mentor Graded)</option>
                  </select>
                </div>
              </div>

              {/* Multiple Choice Options (if applicable) */}
              {newQuestionType === 'multiple_choice' && (
                <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Multiple Choice Choices (Select radio for correct answer):
                  </span>
                  {newOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctChoice"
                        checked={newCorrectOptionIndex === idx}
                        onChange={() => setNewCorrectOptionIndex(idx)}
                        className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <span className="font-mono font-bold text-slate-500 w-5 text-center">
                        {String.fromCharCode(65 + idx)}:
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const copy = [...newOptions];
                          copy[idx] = e.target.value;
                          setNewOptions(copy);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text...`}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Description / Hint & Rule Citation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Description or Code Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="e.g., Check Game Manual Part 1 Robot Sizing..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Prize (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPrize}
                    onChange={(e) => setNewPrize(e.target.value)}
                    placeholder="e.g., Free Snack, Team Sticker, Choice of Music..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Rubric / Explanation */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Official Explanation / Grading Rubric
                </label>
                <textarea
                  rows={2}
                  value={newRubric}
                  onChange={(e) => setNewRubric(e.target.value)}
                  placeholder="Detailed explanation displayed after timer expires or when reviewing..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              {/* Points & Timer Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-900 dark:text-amber-300 block flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Points Reward
                  </label>
                  <select
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-xs font-bold font-mono text-amber-900 dark:bg-slate-900 dark:border-amber-800 dark:text-amber-300"
                  >
                    <option value={25}>+25 pts (Quick Warmup)</option>
                    <option value={50}>+50 pts (Standard Trivia)</option>
                    <option value={75}>+75 pts (Game Rule Challenge)</option>
                    <option value={100}>+100 pts (Technical Engineering)</option>
                    <option value={150}>+150 pts (Deep Autonomous / CAD)</option>
                    <option value={250}>+250 pts (Grandmaster League)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-amber-900 dark:text-amber-300 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Timer Countdown Duration
                  </label>
                  <select
                    value={newDurationHours}
                    onChange={(e) => setNewDurationHours(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 dark:bg-slate-900 dark:border-amber-800 dark:text-amber-300"
                  >
                    <option value={0.25}>15 Minutes (Lightning Blitz)</option>
                    <option value={1}>1 Hour (Workshop Meeting)</option>
                    <option value={3}>3 Hours (Afternoon Sprint)</option>
                    <option value={6}>6 Hours (Half Day)</option>
                    <option value={12}>12 Hours (Day Challenge)</option>
                    <option value={24}>24 Hours (Full Daily Window)</option>
                    <option value={48}>48 Hours (Weekend Quest)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewQ}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingNewQ ? 'Publishing...' : 'Publish Question & Start Timer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CrownIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}
