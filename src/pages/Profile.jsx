import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import LanguageToggle from '../components/LanguageToggle';
import useAuthStore from '../store/useAuthStore';
import useBillingStore from '../store/useBillingStore';
import useChoreographyStudioStore from '../store/useChoreographyStudioStore';
import usePortfolioStore from '../store/usePortfolioStore';
import { navigateToDraftProject } from '../lib/projectNavigation';
import StableArtworkPreview from '../components/StableArtworkPreview';
import { resolveArtworkUrl } from '../lib/artworkMedia.js';

const i18n = {
  EN: {
    title: 'Creator Profile',
    portfolioTitle: 'Portfolio & Works',
    statsLabel1: 'Projects',
    statsLabel2: 'Exports',
    statsLabel3: 'Drafts',
    exportPortfolioBtn: 'Export Portfolio Package',
    heroProject: 'Featured Project',
    recentWorks: 'Recent Works',
    emptyWorks: 'No projects created yet. Start ideating!',
    
    // Settings Menu
    settingsTitle: 'Settings & Support',
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
    close: 'Close',
  },
  KR: {
    title: '창작자 프로필',
    portfolioTitle: '포트폴리오 & 작업물',
    statsLabel1: '프로젝트',
    statsLabel2: '출력물',
    statsLabel3: '초안',
    exportPortfolioBtn: '내 포트폴리오 패키지 내보내기',
    heroProject: '대표 프로젝트',
    recentWorks: '최근 작업물',
    emptyWorks: '아직 작업물이 없습니다. 새로운 영감을 스케치해보세요!',

    // Settings Menu
    settingsTitle: '설정 및 지원',
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
    close: '닫기',
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
  
  const { projects, listProjects, generatePPTForProject } = useChoreographyStudioStore();
  const { portfolioItems, heroItemId, removeFromPortfolio, setHeroItem, renameItem } = usePortfolioStore();

  const [notice, setNotice] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    refreshNativeStatus().catch(() => {});
    listProjects().catch(() => {});
  }, [refreshNativeStatus, listProjects]);

  const planLabel = useMemo(() => {
    const plan = String(user?.plan || 'free').toLowerCase();
    if (plan === 'studio') return 'Studio';
    if (plan === 'enterprise') return 'Enterprise';
    if (plan === 'team_starter' || plan === 'team') return 'Team Starter';
    if (plan === 'pro' || plan === 'premium') return 'Studio';
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

  const handleRestorePurchases = async () => {
    try {
      await restorePurchases();
      setNotice(language === 'KR' ? '구매 복원이 완료되었습니다. 플랜 상태를 다시 확인해주세요.' : 'Purchases restored. Your plan status has been refreshed.');
    } catch (error) {
      setNotice(error.message || 'Restore failed.');
    }
  };

  const heroItem = useMemo(() => {
    return portfolioItems.find(i => i.id === heroItemId) || portfolioItems[0];
  }, [portfolioItems, heroItemId]);
  const heroItemCover = resolveArtworkUrl({
    thumbnailUrl: heroItem?.thumbnailUrl || heroItem?.coverImage,
    coverImageUrl: heroItem?.coverImage,
  }, { prefer: 'original' });

  const handleExportPortfolio = async () => {
      const exportTargetId = heroItem?.projectId || projects[0]?.id;
      if (!exportTargetId) {
          alert(language === 'KR' ? '새 안무 프로젝트를 시작하거나 포트폴리오를 추가하세요.' : 'Please add projects to your portfolio first.');
          navigate('/ideation');
          return;
      }

      setIsExporting(true);
      try {
          await generatePPTForProject(exportTargetId);
          alert(language === 'KR' ? '패키지 준비가 완료되었습니다. 내보내기 화면을 엽니다.' : 'Portfolio package ready. Opening export screen.');
          navigate(`/ppt/${exportTargetId}`);
      } catch (e) {
          console.error('Failed to export', e);
          alert(language === 'KR' ? '포트폴리오 내보내기에 실패했습니다.' : 'Failed to export portfolio package.');
      } finally {
          setIsExporting(false);
      }
  };

  const recentProjects = (projects || []).slice(0, 3);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark font-display text-slate-100 pb-24">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(91,19,236,0.18),transparent_30%),linear-gradient(180deg,#110d1b_0%,#08060d_100%)]" />

      {/* Profile Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-background-dark/85 px-6 pb-4 pt-12 backdrop-blur-md">
        <h1 className="text-xl font-bold text-white">{t.title}</h1>
        <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="flex size-10 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
                <span className="material-symbols-outlined text-slate-300">settings</span>
            </button>
        </div>
      </div>

      <div className="relative z-20 flex flex-col gap-8 px-6 pt-6">
        {/* Creator Info Section */}
        <section className="flex flex-col items-center">
            <div className="flex size-24 items-center justify-center shadow-[0_0_24px_rgba(91,19,236,0.3)] overflow-hidden rounded-full border border-primary/40 relative">
              <img
                alt="Profile"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehU8vtmOe_kzFXeXUq5uvkK1eYjGLudVbitAP71slxbnRmQdOX8fhT7SWMilUbjVCzmIOqnpXj8GYwzwSeHoMnEZ-8Y9UC0yZYiELfyUykxnXHRxrliMxdoj3QrStc2l03ySidtUu8li1GLxEizHg0pBSwcbH-p33cZsbfuI3pq5yeaHtNwDP3s1Il39Vkex_9dKJyQIdZuqAD49QFwxoKuzcmfozfCUiG5TW0Xa-vRFRfucKXP9rUHj45cyLcR5yCc3bNLMTmA"
              />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">{user?.email || 'Seedbar User'}</h2>
            <p className="mt-1 flex items-center justify-center gap-2 text-sm text-slate-400">
                <span className="material-symbols-outlined text-sm text-primary">verified</span>
                {planLabel} Creator
            </p>
            <p className="mt-2 text-[11px] text-slate-500 italic max-w-xs text-center leading-relaxed">
                {language === 'KR' ? '"안무 창작의 새로운 차원을 엽니다."' : '"Opening new dimensions of choreography."'}
            </p>

            <div className="mt-6 flex w-full items-center justify-between rounded-3xl border border-white/5 bg-white/[0.02] p-6 shadow-inner">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold text-slate-200">{projects?.length || 0}</span>
                    <span className="text-xs font-medium uppercase tracking-widest text-slate-500">{t.statsLabel1}</span>
                </div>
                <div className="h-10 w-[1px] bg-white/10"></div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold text-primary-light">{Math.floor((projects?.length || 0) * 1.5)}</span>
                    <span className="text-xs font-medium uppercase tracking-widest text-slate-500">{t.statsLabel2}</span>
                </div>
                <div className="h-10 w-[1px] bg-white/10"></div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold text-slate-200">{(projects?.length || 0) + 2}</span>
                    <span className="text-xs font-medium uppercase tracking-widest text-slate-500">{t.statsLabel3}</span>
                </div>
            </div>
        </section>

        {/* Portfolio Section */}
        <section className="mb-4">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">star</span>
                {t.portfolioTitle || (language === 'KR' ? '내 포트폴리오' : 'My Portfolio')}
            </h3>

            {portfolioItems.length === 0 ? (
                <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-center text-sm text-slate-500">
                    <p className="mb-1 text-slate-300">{language === 'KR' ? '아직 포트폴리오에 저장된 작업물이 없습니다.' : 'No items saved to portfolio yet.'}</p>
                    <p className="text-xs text-slate-500">{language === 'KR' ? '프로젝트나 문서를 포트폴리오에 추가해보세요.' : 'Try adding projects or documents to your portfolio.'}</p>
                </div>
            ) : (
                <>
                    {/* Hero Item */}
                    {heroItem && (
                        <div 
                            onClick={() => navigate(`/ppt/${heroItem.projectId}`)}
                            className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden cursor-pointer group shadow-lg border border-white/10 mb-6"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-blue-500/20 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"></div>
                            <StableArtworkPreview src={heroItemCover} alt="Hero" className="absolute inset-0 opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-5 flex flex-col">
                                <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest mb-1 shadow-black drop-shadow-md">
                                    {language === 'KR' ? '대표작' : 'HERO WORK'}
                                </span>
                                <h4 className="text-xl font-bold text-white shadow-black drop-shadow-lg leading-tight group-hover:text-primary-light transition-colors">
                                    {heroItem.title || 'Untitled'}
                                </h4>
                                <p className="text-xs text-slate-300 mt-2 flex items-center gap-1 shadow-black drop-shadow-md">
                                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                                    {new Date(heroItem.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Export Button */}
                    <button
                        type="button"
                        onClick={handleExportPortfolio}
                        disabled={isExporting}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-[linear-gradient(180deg,rgba(91,19,236,0.3)_0%,rgba(91,19,236,0.1)_100%)] px-6 py-4 mb-6 text-[13px] font-semibold tracking-wide text-white shadow-[0_0_20px_rgba(91,19,236,0.15)] transition-all hover:bg-[linear-gradient(180deg,rgba(91,19,236,0.4)_0%,rgba(91,19,236,0.15)_100%)] disabled:opacity-50"
                    >
                        {isExporting ? (
                            <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">ios_share</span>
                        )}
                        {t.exportPortfolioBtn}
                    </button>

                    {/* Portfolio Items List */}
                    <div className="grid gap-3">
                        {portfolioItems.map(item => (
                            <div key={item.id} className="relative rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2 relative">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0 pr-4 cursor-pointer" onClick={() => navigate(`/ppt/${item.projectId}`)}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary-light text-[9px] font-bold uppercase tracking-wider border border-primary/20">
                                                {item.docType || 'PROJECT'}
                                            </span>
                                            {item.id === heroItemId && <span className="material-symbols-outlined text-[14px] text-yellow-500 fill-current">star</span>}
                                        </div>
                                        <h4 className="text-[14px] font-bold text-white truncate">{item.title}</h4>
                                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                            {new Date(item.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === item.id ? null : item.id); }}
                                        className="size-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                    </button>
                                </div>

                                {/* Menu Dropdown */}
                                {activeMenuId === item.id && (
                                    <div className="absolute top-12 right-4 w-44 rounded-xl border border-white/10 bg-[#151221] shadow-2xl overflow-hidden z-20">
                                        <button onClick={() => navigate(`/ppt/${item.projectId}`)} className="w-full text-left px-4 py-3 text-xs font-semibold text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                            {language === 'KR' ? '열기' : 'Open'}
                                        </button>
                                        <button onClick={() => {
                                            const newTitle = prompt(language === 'KR' ? '새 이름을 입력하세요' : 'Enter new name', item.title);
                                            if (newTitle) renameItem(item.id, newTitle);
                                            setActiveMenuId(null);
                                        }} className="w-full text-left px-4 py-3 text-xs font-semibold text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                            {language === 'KR' ? '이름 변경' : 'Rename'}
                                        </button>
                                        <button onClick={() => { setHeroItem(item.id); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 text-xs font-semibold text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">star</span>
                                            {language === 'KR' ? '대표작으로 설정' : 'Set as Representative'}
                                        </button>
                                        <div className="h-[1px] bg-white/5"></div>
                                        <button onClick={() => { removeFromPortfolio(item.id); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                            {language === 'KR' ? '포트폴리오에서 제거' : 'Remove'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>

        {/* Recent Projects (List) */}
        <section className="mb-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400 mt-6">{t.recentWorks}</h3>
            {recentProjects.length === 0 ? (
                <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-center text-sm text-slate-500">
                    {t.emptyWorks}
                </div>
            ) : (
                <div className="grid gap-3">
                    {recentProjects.slice(1, 4).map((project) => (
                        <div 
                            key={project.id}
                            onClick={() => navigateToDraftProject(navigate, project.id)}
                            className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/20 hover:bg-white/10"
                        >
                            <div className="flex flex-col gap-1">
                                <h4 className="text-[14px] font-bold text-slate-200 group-hover:text-white transition-colors">
                                    {project.name || project.title || 'Untitled Project'}
                                </h4>
                                <span className="text-[10px] text-slate-500">
                                    {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <span className="material-symbols-outlined text-slate-600 group-hover:text-white transition-colors">arrow_forward</span>
                        </div>
                    ))}
                    {recentProjects.length > 1 && projects.length > 4 && (
                        <button onClick={() => navigate('/library')} className="mt-2 w-full text-center text-[11px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest py-3 rounded-xl border border-white/5 bg-white/[0.02]">
                            {language === 'KR' ? '보관함 전체 보기' : 'View all library'}
                        </button>
                    )}
                </div>
            )}
        </section>

      </div>

      <BottomNav />

      {/* Settings Modal Overlay */}
      <div className={`fixed inset-0 z-50 flex flex-col bg-background-dark/95 backdrop-blur-xl transition-transform duration-300 ${showSettings ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between border-b border-white/5 bg-black/20 px-6 py-5">
            <h2 className="text-lg font-bold text-white">{t.settingsTitle}</h2>
            <button onClick={() => setShowSettings(false)} className="flex size-10 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors border border-white/10">
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full px-6 py-8 pb-32">
            
          {/* Notice Banner */}
          {notice ? (
            <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 relative">
               <span>{notice}</span>
               <button onClick={() => setNotice('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-100/50 hover:text-emerald-100"><span className="material-symbols-outlined text-[16px]">close</span></button>
            </div>
          ) : null}

          {/* Support Section */}
          <section className="mb-8">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{t.supportTitle}</h3>
            <div className="grid gap-2">
                <SupportLink label={t.contact} href="mailto:support@seedbar.ai?subject=Seedbar%20Support" />
                <SupportLink label={t.safety} href="mailto:safety@seedbar.ai?subject=Seedbar%20AI%20Feedback" />
                <SupportLink label={t.webDelete} href="mailto:support@seedbar.ai?subject=Account%20Deletion%20Request" />
            </div>
          </section>

          {/* Legal / Billing Section */}
          <section className="mb-8">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{t.legalTitle}</h3>
            <div className="grid gap-2">
                <SupportLink label={t.privacy} href="/policies?tab=privacy" />
                <SupportLink label={t.terms} href="/policies?tab=terms" />
                <SupportLink label={t.manageSub} href="/policies?tab=subscription" />
                <SupportLink label={t.cancelGuide} href="/policies?tab=subscription" />
            </div>
            <button
                type="button"
                onClick={handleRestorePurchases}
                disabled={billingLoading}
                className="mt-3 w-full rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary/20 disabled:opacity-50"
            >
                {billingLoading ? '...' : t.restore}
            </button>
            <p className="mt-3 px-1 text-[11px] leading-relaxed text-slate-500">
                {nativeStatus?.available
                  ? (language === 'KR' ? '모바일 환경에 맞춰 기기의 스토어 영수증으로 복원합니다.' : 'Restore uses the store receipt entitlement on mobile.')
                  : (language === 'KR' ? '앱이 아닌 환경에서는 복원이 불가능합니다. 앱에서 시도해주세요.' : 'Real restore applies in mobile environment.')}
            </p>
          </section>

          {/* Danger Zone */}
          <section className="mb-8 rounded-3xl border border-rose-500/15 bg-rose-500/[0.03] p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-rose-400/70">{t.accountTitle}</h3>
            <div className="space-y-3">
                <button
                    type="button"
                    onClick={async () => {
                        await logout();
                        navigate('/login', { replace: true });
                    }}
                    className="w-full flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5"
                >
                    {t.logout}
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
                <div className="h-[1px] w-full bg-white/5 my-2"></div>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={authLoading}
                    className="w-full rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3.5 text-sm font-bold text-rose-200 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
                >
                    {t.deleteBtn}
                </button>
                <p className="text-center text-[10px] text-rose-300/50 pt-2">{t.deleteDesc}</p>
            </div>
          </section>
          
          <p className="text-center text-xs text-slate-600 pb-10">{t.demo}</p>
        </div>
      </div>
    </div>
  );
}
