import useStore from '../store/useStore';

const LanguageToggle = () => {
    const { language, toggleLanguage } = useStore();

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                toggleLanguage();
            }}
            className="glass-panel rounded-full active:scale-95 hover:bg-white/10 transition-all border border-white/10 flex items-center gap-0 overflow-hidden pointer-events-auto"
            style={{ cursor: 'pointer' }}
            aria-label="Toggle language"
        >
            <span className={`px-3 py-1.5 text-[10px] font-extrabold tracking-widest transition-colors ${language === 'EN' ? 'text-white' : 'text-slate-500'}`}>
                EN
            </span>
            <span className="text-slate-600 text-[10px]">|</span>
            <span className={`px-3 py-1.5 text-[10px] font-extrabold tracking-widest transition-colors ${language === 'KR' ? 'text-white' : 'text-slate-500'}`}>
                KR
            </span>
        </button>
    );
};

export default LanguageToggle;
