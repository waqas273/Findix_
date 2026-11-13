import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Findix Client Error Boundary caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-obsidian-900 border border-slate-800 space-y-6 shadow-2xl backdrop-blur-2xl">
            <div className="w-16 h-16 rounded-3xl bg-neon-rose/10 border border-neon-rose/30 flex items-center justify-center mx-auto text-neon-rose shadow-[0_0_20px_rgba(255,0,127,0.2)]">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-neon-rose uppercase tracking-widest font-bold">
                APPLICATION SAFETY SHIELD
              </span>
              <h2 className="text-2xl font-display font-bold text-white">
                Something Went Wrong
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected interface error occurred. The Findix security shield has caught the exception to protect your session data.
              </p>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="p-3 rounded-xl bg-obsidian-950 border border-slate-800 text-left overflow-x-auto max-h-32 text-[11px] font-mono text-neon-rose">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button variant="secondary" size="md" onClick={this.handleReload} className="w-full sm:w-auto">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>

              <Button variant="primary" size="md" onClick={this.handleReset} className="w-full sm:w-auto shadow-neon-sm">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
