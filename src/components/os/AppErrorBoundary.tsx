import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  appName: string;
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error?: string;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, error: err instanceof Error ? err.message : String(err) };
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6 select-none">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle size={26} className="text-red-400" />
        </div>
        <div>
          <p className="text-[14px] font-medium text-white/80">{this.props.appName} crashed</p>
          <p className="text-[12px] text-white/40 mt-1 max-w-[260px] leading-relaxed">
            {this.state.error ?? "An unexpected error occurred."}
          </p>
        </div>
        <button
          onClick={this.reset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-[13px] text-white/70 hover:text-white transition-all"
        >
          <RefreshCw size={13} />
          Reload app
        </button>
      </div>
    );
  }
}

/** Shimmer skeleton shown while a lazy chunk loads */
export function AppLoadingShimmer() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="h-9 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
        <div className="w-16 h-3 rounded bg-white/10" />
        <div className="w-24 h-3 rounded bg-white/10" />
        <div className="flex-1" />
        <div className="w-12 h-3 rounded bg-white/10" />
      </div>
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="w-3/4 h-4 rounded bg-white/8" />
        <div className="w-full h-4 rounded bg-white/5" />
        <div className="w-5/6 h-4 rounded bg-white/5" />
        <div className="mt-2 w-full h-28 rounded-xl bg-white/5" />
        <div className="w-2/3 h-4 rounded bg-white/5" />
        <div className="w-full h-4 rounded bg-white/5" />
      </div>
    </div>
  );
}
