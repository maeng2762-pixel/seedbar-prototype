import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const hydrated = useAuthStore((s) => s.hydrated);
  const loading = useAuthStore((s) => s.loading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark px-6 text-slate-100">
        <div className="w-full max-w-lg border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Seedbar Auth Guard</p>
          <h1 className="mt-4 text-2xl font-semibold text-white">세션을 확인하는 중입니다.</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            인증 상태와 프로젝트 진입 경로를 정리하고 있습니다. 검은 화면 대신 안전한 로딩 화면을 표시합니다.
          </p>
          <div className="mx-auto mt-6 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
