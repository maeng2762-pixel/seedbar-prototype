import React from 'react';
import { reportRuntimeDiagnostic } from '../services/runtimeDiagnostics';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected rendering error.',
    };
  }

  componentDidCatch(error, info) {
    console.error('[Seedbar] route render error:', error, info);
    reportRuntimeDiagnostic({
      category: 'react_render_error',
      message: error?.message || 'Route render failed.',
      stack: error?.stack || '',
      meta: {
        boundary: 'route',
        componentStack: info?.componentStack || '',
      },
      severity: 'error',
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (typeof this.props.onRetry === 'function') {
      this.props.onRetry();
      return;
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background-dark px-6 text-slate-100">
          <div className="w-full max-w-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Seedbar Recovery UI</p>
            <h1 className="mt-4 text-2xl font-semibold text-white">새 프로젝트 화면을 다시 불러오는 중 문제가 발생했습니다.</h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              검은 화면 대신 복구 화면을 표시했습니다. 다시 시도 버튼으로 최신 상태를 다시 렌더링할 수 있습니다.
            </p>
            {this.state.errorMessage ? (
              <p className="mt-4 break-all border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                {this.state.errorMessage}
              </p>
            ) : null}
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-6 border border-white/15 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-slate-200"
            >
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
