import useStore from '../store/useStore';

const LanguageToggle = () => {
    const { language, toggleLanguage } = useStore();

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                toggleLanguage();
            }}
            className="relative bg-[#0F0C1B] rounded-full active:scale-95 transition-all border border-white/10 p-1 flex items-center shadow-inner pointer-events-auto shrink-0 select-none"
            style={{ cursor: 'pointer', width: '72px', height: '28px' }}
            aria-label="Toggle language"
        >
            <div 
                className={`absolute top-1 bottom-1 w-[30px] rounded-full bg-primary/80 shadow-[0_0_10px_rgba(91,19,236,0.6)] transition-all duration-300 ease-out ${language === 'KR' ? 'translate-x-[32px]' : 'translate-x-0'}`}
            ></div>
            <span 
                className={`flex-1 text-center text-[9px] font-extrabold tracking-widest z-10 transition-colors duration-300 ${language === 'EN' ? 'text-white' : 'text-slate-500'}`}
            >
                EN
            </span>
            <span 
                className={`flex-1 text-center text-[9px] font-extrabold tracking-widest z-10 transition-colors duration-300 ${language === 'KR' ? 'text-white' : 'text-slate-500'}`}
            >
                KR
            </span>
        </button>
    );
};

export default LanguageToggle;
