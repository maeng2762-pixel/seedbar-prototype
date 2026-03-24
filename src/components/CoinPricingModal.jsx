import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import useBillingStore from '../store/useBillingStore';

const i18n = {
  KR: {
    title1: 'Seedbar',
    title2: '요금제',
    subtitle: '조직 규모에 맞춰 바로 시작 가능한 플랜을 선택하세요.',
    subtitle2: '작은 팀과 학교는 즉시 구독, 대규모 도입은 문의해주세요.',
    bestChoice: '추천',
    disclaimer: '* 실제 결제 연동 전 단계에서는 데모 플랜 전환만 수행됩니다.',
    monthly: '월간 결제',
    annual: '연간 결제 (20% 할인)',
    plans: [
      { name: 'Studio', desc: '개인 창작자용 전체 기획, 음악 추천, 팜플렛 및 PPT 발표 패키지 생성' },
      { name: 'Team Starter', desc: '협업/공유 기능이 포함된 소규모 팀용(멤버 초대, 실시간 리뷰)' },
      { name: 'Enterprise', desc: '대규모 도입(20석 이상), 맞춤 기능 특화, 대학/기관 B2B 계약' },
    ],
  },
  EN: {
    title1: 'Seedbar',
    title2: 'Plans',
    subtitle: 'Choose a self-serve plan that fits your organization size.',
    subtitle2: 'Start immediately for small teams. Contact for large setups.',
    bestChoice: 'Best Choice',
    disclaimer: '* Before payment integration, this acts as a demo plan switcher.',
    monthly: 'Monthly',
    annual: 'Annually (Save 20%)',
    plans: [
      { name: 'Studio', desc: 'For independent creators: full ideation, music, pamphlets & PPT packages' },
      { name: 'Team Starter', desc: 'For small teams: collaboration, sharing, invites & review' },
      { name: 'Enterprise', desc: 'Large scale (20+ seats), custom features, B2B contracts' },
    ],
  },
};

const PLAN_META = [
  { 
    id: 'studio', 
    icon: '👤', 
    monthlyPrice: { KR: '월 $15', EN: '$15 / mo' }, 
    annualPrice: { KR: '월 $12 (연결제)', EN: '$12 / mo (Annually)' }, 
    detail: { KR: '개인 1계정', EN: '1 Personal Account' },
    action: { KR: '바로 시작하기', EN: 'Start Now' },
    highlight: false 
  },
  { 
    id: 'team_starter', 
    icon: '🤝', 
    monthlyPrice: { KR: '월 $45', EN: '$45 / mo' }, 
    annualPrice: { KR: '월 $36 (연결제)', EN: '$36 / mo (Annually)' }, 
    detail: { KR: '*시트 수 기반 (기본 3~5인)', EN: '*Scales with seats (Base 3-5)' },
    action: { KR: '팀으로 시작하기', EN: 'Start as Team' },
    highlight: true 
  },
  { 
    id: 'enterprise', 
    icon: '🏢', 
    monthlyPrice: { KR: '별도 문의 (20석+)', EN: 'Contact (20+ seats)' }, 
    annualPrice: { KR: '별도 문의 (20석+)', EN: 'Contact (20+ seats)' }, 
    detail: { KR: '대규모 커스텀 및 B2B 계약', EN: 'Large scale custom & B2B' },
    action: { KR: '대규모 도입 문의', EN: 'Contact Sales' },
    highlight: false,
    isContact: true
  },
];

export default function CoinPricingModal({ isOpen, onClose, currentPlan = 'free', onSelectPlan }) {
  const { language } = useStore();
  const t = i18n[language] || i18n.EN;
  const initialIdx = Math.max(0, PLAN_META.findIndex((p) => p.id === currentPlan));
  const [selectedIdx, setSelectedIdx] = useState(initialIdx === -1 ? 1 : initialIdx); 
  const [billingTerm, setBillingTerm] = useState('monthly'); // 'monthly' | 'annual'
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

  const handleActionClick = async () => {
    const selectedPlan = PLAN_META[selectedIdx];
    
    if (selectedPlan.isContact) {
       window.location.href = "mailto:expert@seedbar.dev?subject=Enterprise Inquiry";
       onClose?.();
       return;
    }

    try {
      if (nativeStatus?.available) {
        await purchasePlan(selectedPlan.id);
      } else {
        const checkoutProvider = language === 'KR' ? 'Toss Payments' : 'PayPal';
        const isConfirmed = window.confirm(
           language === 'KR' 
           ? `웹 안전 결제(${checkoutProvider})로 [${selectedPlan.id}] 플랜 ${billingTerm === 'annual' ? '연간' : '월간'} 구독을 진행하시겠습니까? (데모)`
           : `Proceed to ${checkoutProvider} web checkout to subscribe [${selectedPlan.id}] ${billingTerm}? (Demo)`
        );

        if (isConfirmed) {
           await useBillingStore.getState().syncEntitlement({
               provider: checkoutProvider.toLowerCase().replace(' ', '_'),
               platform: 'web',
               plan: selectedPlan.id,
               status: 'active',
               expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
               billingTerm
           });
           window.alert(
              language === 'KR' 
              ? `${checkoutProvider} 결제가 완료되어 구독 상태가 동기화되었습니다.`
              : `${checkoutProvider} payment completed and synced.`
           );
        } else {
           return;
        }
      }

      if (onSelectPlan) {
        await onSelectPlan(selectedPlan.id);
      }
      onClose?.();
    } catch (error) {
      window.alert(error.message || 'Unable to complete purchase.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#0D0A1C]/95 border border-white/10 rounded-[28px] w-full max-w-[900px] max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(91,19,236,0.15)] relative"
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
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2 md:mb-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white/70">{t.title1}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent-pink ml-2">{t.title2}</span>
            </h2>
            <p className="text-white/60 text-[12px] md:text-sm mb-6 md:mb-6 max-w-md mx-auto leading-relaxed px-2">
              {t.subtitle}<br className="hidden md:block" />{t.subtitle2}
            </p>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center gap-4 mb-8 md:mb-10 bg-white/5 p-1 rounded-full border border-white/10 relative">
               <button 
                  onClick={() => setBillingTerm('monthly')}
                  className={`relative z-10 px-5 md:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-sm font-bold transition-colors ${billingTerm === 'monthly' ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
               >
                 {t.monthly}
               </button>
               <button 
                  onClick={() => setBillingTerm('annual')}
                  className={`relative z-10 px-5 md:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-sm font-bold transition-colors ${billingTerm === 'annual' ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
               >
                 {t.annual}
               </button>
               <div 
                 className={`absolute top-1 bottom-1 w-[50%] bg-[#5B13EC] rounded-full shadow-[0_0_15px_rgba(91,19,236,0.5)] transition-all duration-300 ease-in-out`}
                 style={{ left: billingTerm === 'monthly' ? '4px' : 'calc(50% - 4px)' }}
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">
              {PLAN_META.map((plan, idx) => {
                const isSelected = selectedIdx === idx;
                const label = t.plans[idx];
                const displayPrice = billingTerm === 'monthly' ? (plan.monthlyPrice[language] || plan.monthlyPrice.EN) : (plan.annualPrice[language] || plan.annualPrice.EN);
                const showDiscount = billingTerm === 'annual' && !plan.isContact;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={`relative flex flex-col items-start p-5 md:p-6 rounded-2xl border transition-all duration-300 cursor-pointer text-left h-full
                    ${plan.highlight
                      ? 'border-primary bg-gradient-to-b from-primary/20 to-primary/5 ring-1 ring-primary/50'
                      : isSelected
                        ? 'border-white/40 bg-white/10 ring-1 ring-white/20'
                        : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF3366] to-[#9933FF] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                        {t.bestChoice}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl opacity-90">{plan.icon}</div>
                        <h3 className="text-white font-bold text-[16px] md:text-lg leading-tight">{label.name}</h3>
                    </div>
                    
                    <p className="text-white/60 text-[11px] md:text-[12px] leading-relaxed mb-4 flex-1">
                        {label.desc}
                    </p>

                    <div className="w-full mt-auto pt-4 border-t border-white/10 flex flex-col items-start gap-1">
                      <div className={`text-[15px] md:text-[17px] font-extrabold tracking-tight w-full flex items-center gap-2 ${plan.highlight ? 'text-accent-pink md:text-primary-light' : 'text-white/90'}`}>
                        {displayPrice}
                        {showDiscount && <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded shadow-sm align-middle whitespace-nowrap">20%↓</span>}
                      </div>
                      <div className="text-[10px] text-white/40 mt-1 leading-tight w-full break-normal">
                         {plan.detail[language] || plan.detail.EN}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center justify-center w-full max-w-xs md:max-w-sm mt-2 md:mt-4 pb-2">
              <button
                onClick={handleActionClick}
                disabled={billingLoading}
                className={`w-full py-3.5 md:py-4 rounded-xl font-bold text-[14px] md:text-lg text-white shadow-[0_0_20px_rgba(91,19,236,0.2)] transition-all flex items-center justify-center gap-2
                    ${PLAN_META[selectedIdx]?.isContact 
                        ? 'bg-white/10 border border-white/20 hover:bg-white/20' 
                        : 'bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-[0_0_20px_rgba(91,19,236,0.4)]'
                    }
                `}
              >
                {!PLAN_META[selectedIdx]?.isContact && <span className="material-symbols-outlined text-[20px]">rocket_launch</span>}
                {PLAN_META[selectedIdx]?.isContact ? <span className="material-symbols-outlined text-[20px]">mail</span> : null}
                {billingLoading ? '...' : (() => {
                     const plan = PLAN_META[selectedIdx];
                     if (plan?.isContact) return plan.action[language];
                     if (nativeStatus?.available) {
                         if (nativeStatus.platform === 'ios') return language === 'KR' ? 'App Store 결제로 구독' : 'Subscribe with Apple';
                         if (nativeStatus.platform === 'android') return language === 'KR' ? 'Google Play 결제로 구독' : 'Subscribe with Google Play';
                     }
                     return language === 'KR' ? 'Toss 결제로 계속하기' : 'Subscribe with PayPal';
                })()}
              </button>
              
              <div className="flex items-center gap-2 mt-4">
                  {nativeStatus?.available && (
                    <button 
                       onClick={async () => {
                          try {
                              await useBillingStore.getState().restorePurchases();
                              window.alert(language === 'KR' ? '구매 복원이 완료되었습니다.' : 'Purchases restored successfully.');
                              onClose?.();
                          } catch (e) {
                              window.alert(e.message || 'Failed to restore purchases.');
                          }
                       }}
                       disabled={billingLoading}
                       className="text-[10px] md:text-[11px] text-white/50 hover:text-white underline font-medium tracking-wide transition-colors"
                    >
                      {language === 'KR' ? '📱 앱스토어 구매 복원' : '📱 Restore App Purchases'}
                    </button>
                  )}
                  {nativeStatus?.available && <span className="text-white/20">|</span>}
                  <p className="text-[10px] md:text-[11px] text-white/40 font-medium tracking-wide">
                    {nativeStatus?.available
                      ? (language === 'KR' ? '모바일 플랫폼 결제(앱내 스토어)가 진행됩니다.' : 'Native in-app billing will be utilized.')
                      : (language === 'KR' ? '웹에서는 국가별(Toss/PayPal) 결제로 연동됩니다.' : 'Web routes to regional checkouts (Toss/PayPal).')}
                  </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
