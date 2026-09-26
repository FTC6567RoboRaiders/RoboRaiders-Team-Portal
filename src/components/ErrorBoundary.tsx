import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Props;
  declare state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FTC Studio ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      // Clear non-essential items
      localStorage.removeItem('ftc_dispatched_emails');
      localStorage.removeItem('ftc_dismissed_announcements');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'An unexpected runtime error occurred.';
      const isQuota = errorMsg.toLowerCase().includes('quota');

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  {isQuota ? 'Storage Limit Protected' : 'RoboRaiders System Notice'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isQuota ? 'Local browser storage was full' : 'App recovered safely'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 break-words">
              {errorMsg}
            </div>

            <p className="text-xs text-slate-400">
              All team logs, inventory records, and outreach entries remain safely intact in persistent database storage.
            </p>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload App</span>
              </button>
              <button
                onClick={this.handleResetStorage}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-sm transition"
              >
                Clear Temp Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
