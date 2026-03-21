import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import LanguageToggle from '../components/LanguageToggle';
import useAuthStore from '../store/useAuthStore';
import useBillingStore from '../store/useBillingStore';

const i18n = {
  EN: {
    title: 'Account & Support',
    subtitle: 'Everything reviewers and real customers need to find quickly.',
    plan: 'Current Plan',
    supportTitle: 'Support',
    legalTitle: 'Legal & Subscription',
    safetyTitle: 'AI Safety & Feedback',
    accountTitle: 'Account Controls',
    deleteTitle: 'Delete Account',
    deleteDesc: 'You can permanently delete your account and all synced data from inside the app.',
    deleteBtn: 'Delete My Account',
    logout: 'Logout',
    restore: 'Restore Purchases',
    manageSub: 'Manage Subscription',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    cancelGuide: 'How to cancel subscription',
    contact: 'Contact Support',
    webDelete: 'Web deletion request link',
    demo: 'Review demo account: expert@seedbar.dev / seedbar1234',
    safety: 'Report AI output or send feedback',
    deleted: 'Account deleted successfully.',
  },
  KR: {
    title: '계정 및 지원',
    subtitle: '실제 사용자와 앱 심사자가 빠르게 찾아야 하는 항목을 한곳에 정리했습니다.',
    plan: '현재 플랜',
    supportTitle: '고객 지원',
    legalTitle: '약관 / 구독 / 복원',
    safetyTitle: 'AI 안전 및 피드백',
    accountTitle: '계정 관리',
    deleteTitle: '계정 삭제',
    deleteDesc: '앱 안에서 계정과 동기화된 데이터를 직접 영구 삭제할 수 있습니다.',
    deleteBtn: '내 계정 삭제',
    logout: '로그아웃',
    restore: '구매 복원',
    manageSub: '구독 관리 안내',
    privacy: '개인정보처리방침',
    terms: '이용약관',
    cancelGuide: '구독 해지 안내',
    contact: '고객 문의',
    webDelete: '웹 계정 삭제 요청 링크',
    demo: '심사용 데모 계정: expert@seedbar.dev / seedbar1234',
    safety: 'AI 결과 신고 / 피드백 보내기',
    deleted: '계정이 삭제되었습니다.',
  },
};

function SupportLink({ label, href }) {
  const isExternal = href.startsWith('http') || href.startsWith('mailto:');
  const className = 'flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white transition-colors hover:bg-white/10';

  if (isExternal) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noreferrer' : undefined}
        className={className}
      >
        <span>{label}</span>
        <span className="material-symbols-outlined text-base text-primary-light">open_in_new</span>
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      <span>{label}</span>
      <span className="material-symbols-outlined text-base text-primary-light">chevron_right</span>
    </Link>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { language } = useStore();
  const t = i18n[language] || i18n.EN;
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const authLoading = useAuthStore((state) => state.loading);
  const restorePurchases = useBillingStore((state) => state.restorePurchases);
  const refreshNativeStatus = useBillingStore((state) => state.refreshNativeStatus);
  const nativeStatus = useBillingStore((state) => state.nativeStatus);
  const billingLoading = useBillingStore((state) => state.loading);
  const [notice, setNotice] = useState('');

  const planLabel = useMemo(() => {
    const plan = String(user?.plan || 'free').toLowerCase();
    if (plan === 'studio') return 'Studio';
    if (plan === 'team' || plan === 'school') return 'Team / School';
    if (plan === 'pro') return 'Pro';
    return 'Free';
  }, [user?.plan]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      language === 'KR'
        ? '계정을 삭제하면 프로젝트와 저장 데이터가 함께 삭제됩니다. 계속하시겠습니까?'
        : 'Deleting your account will remove synced projects and saved data. Continue?',
    );
    if (!confirmed) return;

    try {
      await deleteAccount();
      setNotice(t.deleted);
      navigate('/login', { replace: true });
    } catch (error) {
      setNotice(error.message || 'Failed to delete account.');
    }
  };

  React.useEffect(() => {
    refreshNativeStatus().catch(() => {});
  }, [refreshNativeStatus]);

  const handleRestorePurchases = async () => {
    try {
      await restorePurchases();
      setNotice(language === 'KR' ? '구매 복원이 완료되었습니다. 플랜 상태를 다시 확인해주세요.' : 'Purchases restored. Your plan status has been refreshed.');
    } catch (error) {
      setNotice(error.message || 'Restore failed.');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark font-display text-slate-100 pb-24">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(91,19,236,0.18),transparent_30%),linear-gradient(180deg,#110d1b_0%,#08060d_100%)]" />

      <div className="relative z-20 flex items-center justify-between px-6 pb-4 pt-12">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5"
        >
          <span className="material-symbols-outlined text-slate-300">arrow_back_ios_new</span>
        </button>
        <LanguageToggle />
      </div>

      <div className="relative z-20 flex flex-col gap-6 px-6">
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary">{t.plan}</p>
          <h1 className="mt-3 text-2xl font-bold text-white">{t.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{t.subtitle}</p>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-primary/30">
              <img
                alt="Profile"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehU8vtmOe_kzFXeXUq5uvkK1eYjGLudVbitAP71slxbnRmQdOX8fhT7SWMilUbjVCzmIOqnpXj8GYwzwSeHoMnEZ-8Y9UC0yZYiELfyUykxnXHRxrliMxdoj3QrStc2l03ySidtUu8li1GLxEizHg0pBSwcbH-p33cZsbfuI3pq5yeaHtNwDP3s1Il39Vkex_9dKJyQIdZuqAD49QFwxoKuzcmfozfCUiG5TW0Xa-vRFRfucKXP9rUHj45cyLcR5yCc3bNLMTmA"
              />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{user?.email || 'Seedbar User'}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-primary-light">{planLabel} plan</p>
            </div>
          </div>

          {notice ? (
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {notice}
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-white">{t.supportTitle}</h2>
          <div className="mt-4 grid gap-3">
            <SupportLink label={t.contact} href="mailto:support@seedbar.ai?subject=Seedbar%20Support" />
            <SupportLink label={t.safety} href="mailto:safety@seedbar.ai?subject=Seedbar%20AI%20Feedback" />
            <SupportLink label={t.webDelete} href="mailto:support@seedbar.ai?subject=Account%20Deletion%20Request" />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-white">{t.legalTitle}</h2>
          <div className="mt-4 grid gap-3">
            <SupportLink label={t.privacy} href="/policies?tab=privacy" />
            <SupportLink label={t.terms} href="/policies?tab=terms" />
            <SupportLink label={t.manageSub} href="/policies?tab=subscription" />
            <SupportLink label={t.cancelGuide} href="/policies?tab=subscription" />
            <SupportLink label={t.restore} href="/policies?tab=restore" />
          </div>
          <button
            type="button"
            onClick={handleRestorePurchases}
            disabled={billingLoading}
            className="mt-4 w-full rounded-2xl border border-primary/30 bg-primary/15 px-4 py-4 text-sm font-semibold text-white transition-colors hover:bg-primary/25 disabled:opacity-50"
          >
            {billingLoading ? '...' : t.restore}
          </button>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            {nativeStatus?.available
              ? (language === 'KR' ? '모바일 앱 빌드에서는 스토어 영수증을 기준으로 복원을 시도합니다.' : 'In the mobile app build, restore uses the store receipt entitlement.')
              : (language === 'KR' ? '웹에서는 정책 안내만 제공하며, 실제 복원은 모바일 앱 빌드에서 동작합니다.' : 'On the web, policy guidance is available here and real restore runs in the mobile app build.')}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">{t.demo}</p>
        </section>

        <section className="rounded-3xl border border-rose-500/15 bg-rose-500/[0.06] p-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-white">{t.accountTitle}</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h3 className="text-sm font-semibold text-white">{t.deleteTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{t.deleteDesc}</p>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={authLoading}
              className="w-full rounded-2xl border border-rose-400/30 bg-rose-500/15 px-4 py-4 text-sm font-bold text-rose-100 transition-colors hover:bg-rose-500/25 disabled:opacity-50"
            >
              {t.deleteBtn}
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login', { replace: true });
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t.logout}
            </button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
