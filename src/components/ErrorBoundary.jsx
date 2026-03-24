import React from 'react';
import { reportRuntimeDiagnostic } from '../services/runtimeDiagnostics';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        reportRuntimeDiagnostic({
            category: 'react_render_error',
            message: error?.message || 'Section render failed.',
            stack: error?.stack || '',
            meta: {
                boundary: 'section',
                componentStack: errorInfo?.componentStack || '',
            },
        });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                if (typeof this.props.fallback === 'function') {
                    return this.props.fallback({
                        error: this.state.error,
                        retry: () => this.setState({ hasError: false, error: null }),
                    });
                }
                return this.props.fallback;
            }
            return (
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 my-4">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-rose-500">warning</span>
                        <h3 className="text-sm font-bold text-rose-400">
                            해당 섹션을 불러오는 중 오류가 발생했습니다. (Section Error)
                        </h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono overflow-auto max-h-24">
                        {this.state.error?.message || 'Unknown error'}
                    </p>
                    <button 
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-3 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded text-xs transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
