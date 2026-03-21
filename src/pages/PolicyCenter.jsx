import React, { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';

const CONTENT = {
  EN: {
    title: 'Policies & Support',
    subtitle: 'Everything app reviewers, subscribers, and real customers need to find quickly.',
    tabs: {
      privacy: 'Privacy',
      terms: 'Terms',
      subscription: 'Subscription',
      restore: 'Restore',
      safety: 'AI Safety',
      delete: 'Account Deletion',
    },
    sections: {
      privacy: {
        heading: 'Privacy Policy',
        body: [
          'Seedbar stores account information, saved projects, autosaves, and package outputs only to provide choreography planning and production features.',
          'We keep synced project data in your account workspace, and we do not sell personal data to third parties.',
          'If you want your account and synced data removed, you can delete the account inside the app or send a web deletion request from this page.',
        ],
      },
      terms: {
        heading: 'Terms of Service',
        body: [
          'Seedbar is a choreography planning and studio workflow tool intended for lawful creative use.',
          'Users remain responsible for checking rights, permissions, and performance usage when they reference external music, videos, or archival material.',
          'We may limit or suspend abusive or harmful use, including misuse of AI generation or attempts to bypass plan limits.',
        ],
      },
      subscription: {
        heading: 'Subscriptions, Billing, and Cancellation',
        body: [
          'Paid subscriptions unlock advanced studio tools, exports, and higher creation limits.',
          'Subscriptions should be managed through the same platform where you purchased them, such as the App Store, Play Store, or the web billing portal.',
          'Cancellation takes effect at the end of the current billing period unless local store policy states otherwise.',
        ],
      },
      restore: {
        heading: 'Restore Purchases',
        body: [
          'If you purchased on a mobile store and your entitlement is missing, use restore purchases in the mobile build or contact billing support.',
          'On the web, plan access is restored when the billing status syncs successfully with your account.',
          'If the plan still appears wrong, contact support with the purchase email and receipt details.',
        ],
      },
      safety: {
        heading: 'AI Safety & Feedback',
        body: [
          'If a generated result is unsafe, unusable, misleading, or low quality, report it through safety feedback so we can review the prompt path and filters.',
          'External reference content is curated to prioritize official archives, institutions, workshops, and performance documentation instead of random feed scraping.',
          'Music and reference suggestions should respect copyright, embed permissions, and platform playback limits.',
        ],
      },
      delete: {
        heading: 'Account Deletion',
        body: [
          'You can delete your account directly inside the app from the Profile screen.',
          'For web deletion requests, contact support@seedbar.ai with the subject "Account Deletion Request".',
          'Deleted accounts remove synced access, and soft-deleted projects remain recoverable only within the retention window if the account still exists.',
        ],
      },
    },
    supportTitle: 'Need help right now?',
    supportLinks: {
      contact: 'Contact Support',
      billing: 'Billing & Subscription Help',
      safety: 'Report AI Output',
      delete: 'Web Deletion Request',
    },
    demo: 'Demo account for review: expert@seedbar.dev / seedbar1234',
    back: 'Back',
  },
  KR: {
    title: '정책 및 지원',
    subtitle: '앱 심사자, 구독 사용자, 실제 고객이 빠르게 찾아야 하는 정보를 한곳에 정리했습니다.',
    tabs: {
      privacy: '개인정보',
      terms: '이용약관',
      subscription: '구독 안내',
      restore: '복원',
      safety: 'AI 안전',
      delete: '계정 삭제',
    },
    sections: {
      privacy: {
        heading: '개인정보처리방침',
        body: [
          'Seedbar는 안무 기획, 자동 저장, 프로덕션 패키지 생성을 제공하기 위해 계정 정보와 저장된 프로젝트 데이터를 보관합니다.',
          '동기화된 프로젝트 데이터는 사용자 작업 공간에서만 사용되며, 개인정보를 제3자에게 판매하지 않습니다.',
          '계정과 동기화 데이터를 제거하려면 앱 내 계정 삭제 기능 또는 이 페이지의 웹 삭제 요청 경로를 이용할 수 있습니다.',
        ],
      },
      terms: {
        heading: '이용약관',
        body: [
          'Seedbar는 적법한 창작 활동을 위한 안무 기획 및 스튜디오 워크플로 툴입니다.',
          '외부 음악, 영상, 아카이브 자료를 참고할 때의 사용 권리와 공연 권한 확인은 사용자 책임입니다.',
          'AI 생성 악용, 유해한 사용, 플랜 제한 우회 시도가 확인되면 이용이 제한될 수 있습니다.',
        ],
      },
      subscription: {
        heading: '구독, 결제, 해지 안내',
        body: [
          '유료 플랜은 고급 스튜디오 기능, 내보내기, 더 높은 생성 한도를 제공합니다.',
          '구독은 결제가 이루어진 동일 플랫폼(App Store, Play Store, 웹 결제 포털)에서 관리하는 것을 원칙으로 합니다.',
          '해지는 현재 결제 주기 종료 시점부터 적용되며, 세부 정책은 결제 플랫폼 규정을 따릅니다.',
        ],
      },
      restore: {
        heading: '구매 복원',
        body: [
          '모바일 스토어 결제 후 권한이 보이지 않으면 모바일 앱의 구매 복원 또는 고객 지원을 이용해 주세요.',
          '웹에서는 결제 상태가 계정과 다시 동기화되면 플랜 권한이 복원됩니다.',
          '권한이 계속 잘못 보이면 구매 이메일과 영수증 정보를 함께 전달해 주세요.',
        ],
      },
      safety: {
        heading: 'AI 안전 및 피드백',
        body: [
          '생성 결과가 부정확하거나 부적절하거나 활용 가치가 낮다면 안전 피드백 경로로 신고해 주세요.',
          '레퍼런스 자료는 랜덤 피드보다 공식 기관, 아카이브, 워크숍, 공연 문서 중심으로 큐레이션하는 것을 우선합니다.',
          '음악 및 레퍼런스 제안은 저작권, 임베드 허용 범위, 플랫폼 재생 제한을 존중해야 합니다.',
        ],
      },
      delete: {
        heading: '계정 삭제',
        body: [
          '앱 안의 프로필 화면에서 계정을 직접 삭제할 수 있습니다.',
          '웹 삭제 요청은 support@seedbar.ai 로 "Account Deletion Request" 제목으로 보낼 수 있습니다.',
          '계정이 유지되는 동안만 soft delete 된 프로젝트 복구가 가능하며, 계정 삭제 후에는 동기화 접근이 종료됩니다.',
        ],
      },
    },
    supportTitle: '지금 바로 도움이 필요하신가요?',
    supportLinks: {
      contact: '고객 문의',
      billing: '결제 / 구독 문의',
      safety: 'AI 결과 신고',
      delete: '웹 계정 삭제 요청',
    },
    demo: '심사용 데모 계정: expert@seedbar.dev / seedbar1234',
    back: '뒤로가기',
  },
};

const TAB_ORDER = ['privacy', 'terms', 'subscription', 'restore', 'safety', 'delete'];

export default function PolicyCenter() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useStore();
  const t = CONTENT[language] || CONTENT.EN;
  const activeTab = TAB_ORDER.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'privacy';

  const activeSection = useMemo(() => t.sections[activeTab], [activeTab, t.sections]);

  return (
    <div className="min-h-screen bg-background-dark text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 pb-16 pt-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-base">arrow_back_ios_new</span>
            {t.back}
          </button>
          <Link to="/login" className="text-xs uppercase tracking-[0.24em] text-slate-500 transition-colors hover:text-white">
            Seedbar
          </Link>
        </div>

        <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary-light">Seedbar</p>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{t.subtitle}</p>
          <p className="mt-4 text-xs text-slate-500">{t.demo}</p>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
            <div className="grid gap-2">
              {TAB_ORDER.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSearchParams({ tab })}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-primary/40 bg-primary/15 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {t.tabs[tab]}
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-white">{activeSection.heading}</h2>
            <div className="mt-5 space-y-4">
              {activeSection.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-slate-300">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-primary-light">{t.supportTitle}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <a href="mailto:support@seedbar.ai?subject=Seedbar%20Support" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white transition-colors hover:bg-white/10">
                  {t.supportLinks.contact}
                </a>
                <a href="mailto:billing@seedbar.ai?subject=Seedbar%20Billing%20Support" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white transition-colors hover:bg-white/10">
                  {t.supportLinks.billing}
                </a>
                <a href="mailto:safety@seedbar.ai?subject=Seedbar%20AI%20Safety%20Feedback" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white transition-colors hover:bg-white/10">
                  {t.supportLinks.safety}
                </a>
                <a href="mailto:support@seedbar.ai?subject=Account%20Deletion%20Request" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white transition-colors hover:bg-white/10">
                  {t.supportLinks.delete}
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
