import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetState = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-800/80 border border-slate-700/80 p-8 rounded-3xl max-w-md w-full shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold mb-2">တစ်စုံတစ်ခု လွဲမှားသွားပါသည်</h1>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              အက်ပလီကေးရှင်းတွင် မျှော်လင့်မထားသော အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်။ စာမျက်နှာကို ပြန်လည် Reload လုပ်ပေးပါ။
            </p>
            {this.state.error?.message && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-6 text-xs text-red-300 font-mono text-left overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-blue-600/30"
              >
                <RefreshCw className="w-4 h-4" />
                ပြန်လည်စတင်မည် (Reload)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
