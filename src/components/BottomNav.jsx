import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';

const i18n = {
    EN: { home: 'Home', explore: 'Explore', library: 'Library', profile: 'Profile' },
    KR: { home: '홈', explore: '탐색', library: '보관함', profile: '프로필' },
};

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useStore();
    const t = i18n[language] || i18n.EN;

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed bottom-0 w-full z-50 pb-5 px-4 pointer-events-none">
            <div className="glass-panel rounded-full h-16 flex items-center justify-around px-2 border-white/10 pointer-events-auto">
                {/* Home */}
                <button
                    onClick={() => navigate('/home')}
                    className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors ${isActive('/home') ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <span className="material-symbols-outlined text-[22px]" style={isActive('/home') ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
                    <span className="text-[9px] font-bold tracking-wide">{t.home}</span>
                </button>

                {/* Explore */}
                <button
                    onClick={() => navigate('/explore')}
                    className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors ${isActive('/explore') ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <span className="material-symbols-outlined text-[22px]" style={isActive('/explore') ? { fontVariationSettings: "'FILL' 1" } : {}}>explore</span>
                    <span className="text-[9px] font-bold tracking-wide">{t.explore}</span>
                </button>

                {/* Center FAB */}
                <div className="flex-1 flex justify-center -mt-10">
                    <button
                        onClick={() => navigate('/ideation', { state: { mode: 'planning' } })}
                        className="size-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-background-dark active:scale-95 transition-transform"
                        aria-label="Create"
                    >
                        <span className="material-symbols-outlined text-white text-3xl">add</span>
                    </button>
                </div>

                {/* Library */}
                <button
                    onClick={() => navigate('/library')}
                    className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors ${isActive('/library') ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <span className="material-symbols-outlined text-[22px]" style={isActive('/library') ? { fontVariationSettings: "'FILL' 1" } : {}}>movie</span>
                    <span className="text-[9px] font-bold tracking-wide">{t.library}</span>
                </button>

                {/* Profile */}
                <button
                    onClick={() => navigate('/profile')}
                    className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors ${isActive('/profile') ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <span className="material-symbols-outlined text-[22px]" style={isActive('/profile') ? { fontVariationSettings: "'FILL' 1" } : {}}>person</span>
                    <span className="text-[9px] font-bold tracking-wide">{t.profile}</span>
                </button>
            </div>
        </div>
    );
};

export default BottomNav;
