import React from 'react';
import { RotateCcw, ShieldAlert } from 'lucide-react';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  public state: AppErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error): void {
    console.error('[SKSSF Guide Game Boundary]', error);
  }

  private handleRecover = () => {
    this.setState({ hasError: false });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto my-8 rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              ഈ ഭാഗം ലോഡ് ചെയ്യുന്നതിൽ ചെറിയ തടസ്സം നേരിട്ടു
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              നിങ്ങളുടെ പഠന പുരോഗതി സുരക്ഷിതമായി സേവ് ചെയ്തിട്ടുണ്ട്. താഴെയുള്ള ബട്ടൺ അമർത്തി വീണ്ടും തുറക്കാം.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleRecover}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-extrabold border-b-4 border-emerald-950 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>വീണ്ടും ശ്രമിക്കാം</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
