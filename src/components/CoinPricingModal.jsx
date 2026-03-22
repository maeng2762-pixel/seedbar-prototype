import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import useBillingStore from '../store/useBillingStore';

const i18n = {
  KR: {
    title1: 'Seedbar',
    title2: '요금제',
    subtitle: '품질은 그대로, 플랜으로 사용량을 관리합니다.',
    subtitle2: 'Free 월 3회 / Studio 무제한 / Team 커스텀 기능.',
    bestChoice: '추천',
    checkout: '플랜 적용',
    disclaimer: '* 실제 결제 연동 전 단계에서는 데모 플랜 전환만 수행됩니다.',
    plans: [
      { name: 'Free', desc: '월 3회 생성, 음악 추천, 제한적 기능' },
      { name: 'Studio', desc: '무제한 생성, 고급 PDF/PPT 패키지' },
      { name: 'Team/School', desc: 'Competition Mode, 단체 라이선스' },
    ],
  },
  EN: {
    title1: 'Seedbar',
    title2: 'Plans',
    subtitle: 'Keep quality, control usage with subscriptions.',
    subtitle2: 'Free 3/month / Studio unlimited / Team custom tools.',
    bestChoice: 'Best Choice',
    checkout: 'Apply Plan',
    disclaimer: '* Before payment integration, this acts as a demo plan switcher.',
    plans: [
      { name: 'Free', desc: '3 generations/month, music recs' },
      { name: 'Studio', desc: 'Unlimited generation, full export' },
      { name: 'Team/School', desc: 'Competition mode, group license' },
    ],
  },
};

const PLAN_META = [
  { id: 'free', icon: '🧪', price: { KR: '무료', EN: 'Free' }, highlight: false },
  { id: 'studio', icon: '🚀', price: { KR: '월 $15~20', EN: '$15~20 / month' }, highlight: true },
  { id: 'team', icon: '🏆', price: { KR: '문의', EN: 'Contact Us' }, highlight: false },
];

export default function CoinPricingModal({ isOpen, onClose, currentPlan = 'free', onSelectPlan }) {
  const { language } = useStore();
  const t = i18n[language] || i18n.EN;
  const initialIdx = Math.max(0, PLAN_META.findIndex((p) => p.id === currentPlan));
  const [selectedIdx, setSelectedIdx] = useState(initialIdx);
  const nativeStatus = useBillingStore((state) => state.nativeStatus);
  const billingLoading = useBillingStore((state) => state.loading);
  const refreshNativeStatus = useBillingStore((state) => state.refreshNativeStatus);
  const purchasePlan = useBillingStore((state) => state.purchasePlan);

  useEffect(() => {
    if (isOpen) {
      refreshNativeStatus().catch(() => {});
    }
  }, [isOpen, refreshNativeStatus]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#0D0A1C]/95 border border-white/10 rounded-[28px] w-full max-w-[920px] max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(91,19,236,0.15)] relative"
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/50 hover:text-white bg-white/5 hover:bg-white/15 rounded-full p-2 transition-all z-20 border border-white/5"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="px-4 py-6 md:p-10 text-center relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary/30 to-purple-600/10 border border-primary/40 rounded-xl mb-4 md:mb-6">
              <span className="text-2xl md:text-3xl">🧾</span>
            </div>

            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-2 md:mb-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white/70">{t.title1}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent-pink ml-2">{t.title2}</span>
            </h2>
            <p className="text-white/60 text-[12px] md:text-sm mb-6 md:mb-10 max-w-md mx-auto leading-relaxed px-2">
              {t.subtitle}<br className="hidden md:block" />{t.subtitle2}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 w-full mb-6">
              {PLAN_META.map((plan, idx) => {
                const isSelected = selectedIdx === idx;
                const label = t.plans[idx];
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={`relative flex flex-row md:flex-col items-center md:items-start px-4 py-3 md:p-6 rounded-2xl border transition-all duration-300 cursor-pointer text-left gap-3 md:gap-0
                    ${plan.highlight
                      ? 'border-primary bg-gradient-to-b from-primary/20 to-primary/5 ring-1 ring-primary/50'
                      : isSelected
                        ? 'border-white/40 bg-white/10 ring-1 ring-white/20'
                        : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF3366] to-[#9933FF] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                        {t.bestChoice}
                      </div>
                    )}
                    <div className="text-3xl opacity-90 mb-0 md:mb-4 w-10 text-center md:w-auto">{plan.icon}</div>
                    <div className="flex-1 flex flex-col md:w-full">
                      <h3 className="text-white font-bold text-[15px] md:text-lg mb-1">{label.name}</h3>
                      <p className="text-white/50 text-[11px] md:text-xs md:h-10 leading-tight">{label.desc}</p>
                    </div>
                    <div className="md:mt-4 md:pt-4 md:border-t border-white/10 md:w-full flex flex-col items-end md:items-start">
                      <div className={`text-[13px] md:text-xl font-bold tracking-tight ${plan.highlight ? 'text-accent-pink md:text-primary' : 'text-white/80'}`}>
                        {plan.price[language] || plan.price.EN}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center justify-center w-full max-w-xs md:max-w-sm mt-2 md:mt-4 pb-2">
              <button
                onClick={async () => {
                  const selected = PLAN_META[selectedIdx]?.id || 'free';
                  try {
                    if (selected !== 'free' && nativeStatus?.available) {
                      await purchasePlan(selected);
                    }
                    if (onSelectPlan) {
                      await onSelectPlan(selected);
                    }
                    onClose?.();
                  } catch (error) {
                    window.alert(error.message || 'Unable to complete purchase.');
                  }
                }}
                disabled={billingLoading}
                className="w-full py-3.5 md:py-4 rounded-xl font-bold text-[14px] md:text-lg text-white bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-[0_0_20px_rgba(91,19,236,0.4)] transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                  {billingLoading ? '...' : t.checkout}
                </span>
              </button>
              <p className="text-[10px] md:text-[11px] text-white/30 font-medium tracking-wide mt-4 px-4">
                {nativeStatus?.available
                  ? (language === 'KR' ? '모바일 빌드에서는 앱스토어 / 플레이스토어 결제 흐름을 우선 사용합니다.' : 'In the mobile build, App Store / Play Store billing flow is used first.')
                  : t.disclaimer}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
