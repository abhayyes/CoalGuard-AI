import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class TelemetryErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[TelemetryErrorBoundary] Uncaught telemetry component error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-2xl p-6 border transition-all duration-300 shadow-lg relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #182635 0%, #0F172A 100%)',
            borderColor: 'rgba(239, 68, 68, 0.35)',
            boxShadow: '0 12px 32px rgba(239, 68, 68, 0.15)',
          }}
        >
          {/* Subtle warning glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  {this.props.fallbackTitle || 'Telemetry Stream Interrupted'}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono font-semibold border border-red-500/30">
                    FAIL-SAFE ISOLATED
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  An unexpected fault occurred in the statutory telemetry rendering pipe. Safe fallback triggered.
                </p>
              </div>
            </div>

            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-900/30 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recover Stream
            </button>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-red-300/90 break-words">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-1 font-sans">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span>Diagnostic Trace:</span>
            </div>
            {this.state.error?.message || 'Unknown render exception in telemetry tree.'}
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Statutory logs retained in background buffer
            </span>
            <span className="text-slate-500 font-mono">DGMS Compliance Watchdog v1.0</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
