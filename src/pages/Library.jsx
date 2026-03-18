import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import LanguageToggle from '../components/LanguageToggle';
import useChoreographyStudioStore from '../store/useChoreographyStudioStore';
import { useNavigate } from 'react-router-dom';

const i18n = {
    EN: {
        title: 'Creative Library',
        recent: 'Recently Exported',
        seeAll: 'See all',
        tabs: ['Projects', 'Moodboards'],
        stats: { choreography: 'Choreo', active: 'Active' },
        edited: 'Edited',
        continue: 'Continue',
        generateDoc: 'Produce Document',
        versionControl: 'Versions',
        newVersion: 'New',
        rename: 'Rename',
        delete: 'Delete',
        restore: 'Restore',
    },
    KR: {
        title: '나의 보관함',
        recent: '최근 내보낸 항목',
        seeAll: '전체 보기',
        tabs: ['프로젝트', '무드보드'],
        stats: { choreography: '안무 구성', active: '작업 중' },
        edited: '수정됨',
        continue: '계속 작업',
        generateDoc: '발표 문서 생성',
        versionControl: '버전 관리',
        newVersion: '새 버전',
        rename: '이름 변경',
        delete: '삭제',
        restore: '복원',
    }
};

const mockMoodboardItems = [
    { id: 1, type: 'image', src: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80', title: 'Spiral Collapse Inspiration' },
    { id: 2, type: 'ai_card', title: 'Emotional Curve', description: '#Dark #Tension Contemporary Solo' },
    { id: 3, type: 'prompt', title: 'Spinal Wave', text: '움직임이 척추에서 시작해 팔로 퍼져나간다.' },
    { id: 4, type: 'image', src: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&q=80', title: 'Golden Arch Color Scheme' }
];

const Library = () => {
    const navigate = useNavigate();
    const { language } = useStore();
    const t = i18n[language];
    const { projects, listProjects, deleteProject, setProjectId, projectId: activeProjectId } = useChoreographyStudioStore();
    
    const [activeTab, setActiveTab] = useState(0);
    const [expandedProjectId, setExpandedProjectId] = useState(null);
    const [generatingDocId, setGeneratingDocId] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [showToast, setShowToast] = useState(false);

    React.useEffect(() => {
        listProjects().catch(() => {});
    }, [listProjects]);

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            await deleteProject(projectToDelete.id);
            setProjectToDelete(null);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            await listProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
            alert(language === 'KR' ? '삭제에 실패했습니다.' : 'Failed to delete.');
        }
    };


    const handleGenerateDoc = (id) => {
        setGeneratingDocId(id);
        setTimeout(() => {
            setGeneratingDocId(null);
            alert(language === 'KR' 
                ? "🌟 발표 문서가 성공적으로 생성되었습니다!\n[포함된 내용]\n- 작품 개념\n- 안무 철학\n- 움직임 구조\n- 음악\n- 무대 연출"
                : "🌟 Presentation Document generated successfully!\n[Included Contents]\n- Concept\n- Philosophy\n- Movement Structure\n- Music\n- Stage Direction");
        }, 1500);
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-slate-100 antialiased overflow-x-hidden pb-24">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] size-80 bg-primary/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] size-80 bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-20 flex items-center justify-between p-6 pt-12">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl glass-panel flex items-center justify-center border border-white/10">
                        <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    <div className="size-10 rounded-full border-2 border-primary/30 overflow-hidden shadow-[0_0_10px_rgba(91,19,236,0.3)]">
                        <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehU8vtmOe_kzFXeXUq5uvkK1eYjGLudVbitAP71slxbnRmQdOX8fhT7SWMilUbjVCzmIOqnpXj8GYwzwSeHoMnEZ-8Y9UC0yZYiELfyUykxnXHRxrliMxdoj3QrStc2l03ySidtUu8li1GLxEizHg0pBSwcbH-p33cZsbfuI3pq5yeaHtNwDP3s1Il39Vkex_9dKJyQIdZuqAD49QFwxoKuzcmfozfCUiG5TW0Xa-vRFRfucKXP9rUHj45cyLcR5yCc3bNLMTmA" />
                    </div>
                </div>
            </div>

            <div className="relative z-20 px-6 mt-2">
                <div className="flex gap-6 border-b border-white/10 pb-2 mb-6 cursor-pointer">
                    <button 
                        onClick={() => setActiveTab(0)}
                        className={`text-sm relative font-bold transition-colors ${activeTab === 0 ? 'text-white' : 'text-slate-500'}`}
                    >
                        {t.tabs[0]}
                        {activeTab === 0 && <span className="absolute -bottom-[9px] left-0 w-full h-[2px] bg-primary"></span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab(1)}
                        className={`text-sm relative font-bold transition-colors ${activeTab === 1 ? 'text-white' : 'text-slate-500'}`}
                    >
                        {t.tabs[1]}
                        {activeTab === 1 && <span className="absolute -bottom-[9px] left-0 w-full h-[2px] bg-primary"></span>}
                    </button>
                </div>

                {activeTab === 0 && (
                    <div className="grid grid-cols-1 gap-4">
                        {projects.length === 0 ? (
                            <div className="glass-panel p-4 rounded-2xl text-xs text-slate-400 text-center py-10">
                                {language === 'KR' ? '저장된 프로젝트가 없습니다.' : 'No saved projects yet.'}
                            </div>
                        ) : projects.map((project) => (
                            <div key={project.id} className="glass-panel border-white/10 p-4 rounded-2xl flex flex-col gap-4">
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-[15px] font-bold text-white truncate">{project.title}</h3>
                                            <button 
                                                onClick={() => setProjectToDelete(project)}
                                                className="text-slate-500 hover:text-rose-400 p-1 flex items-center justify-center rounded transition-colors"
                                                title={t.delete}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                            {t.edited} {new Date(project.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setProjectId(project.id);
                                            navigate('/ideation', { state: { mode: 'draft' } });
                                        }}
                                        className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-xl text-[11px] font-bold active:scale-95 transition-all ml-2 shrink-0"
                                    >
                                        {t.continue}
                                    </button>
                                </div>
                                
                                <div className="flex gap-2 border-t border-white/5 pt-3">
                                    <button 
                                        onClick={() => handleGenerateDoc(project.id)}
                                        className="flex-[1.5] flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-slate-100 py-2.5 rounded-xl text-[11px] font-semibold transition-all border border-white/5 relative overflow-hidden"
                                    >
                                        {generatingDocId === project.id && (
                                            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                                        )}
                                        <span className="material-symbols-outlined text-[15px] text-purple-300">description</span>
                                        {generatingDocId === project.id ? (language === 'KR' ? '생성 중...' : 'Generating...') : t.generateDoc}
                                    </button>
                                    <button 
                                        onClick={() => setExpandedProjectId(expandedProjectId === project.id ? null : project.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-semibold transition-all border border-white/5 ${expandedProjectId === project.id ? 'bg-slate-700/80 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/60'}`}
                                    >
                                        <span className="material-symbols-outlined text-[15px]">history</span>
                                        {t.versionControl}
                                        <span className="material-symbols-outlined text-[15px] ml-auto mr-1 transition-transform" style={{ transform: expandedProjectId === project.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                                    </button>
                                </div>

                                {/* Version Control Accordion Region */}
                                {expandedProjectId === project.id && (
                                    <div className="mt-1 bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col gap-2 relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50"></div>
                                        <div className="flex justify-between items-center mb-1 pl-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.versionControl}</span>
                                            <button className="text-[10px] text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-1 hover:bg-primary/20 transition-colors font-bold">
                                                <span className="material-symbols-outlined text-[12px]">add</span> {t.newVersion}
                                            </button>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2 pl-2 mt-1">
                                            {[
                                                { id: 'v2', name: 'v2.0 (최신 작업본)', date: '방금 전', latest: true },
                                                { id: 'v1', name: 'v1.0 (초안 구조)', date: '2일 전', latest: false },
                                            ].map(v => (
                                                <div key={v.id} className="flex flex-col gap-2 bg-white/5 rounded-lg p-2.5 hover:bg-white/10 transition-colors group">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-semibold ${v.latest ? 'text-primary-light' : 'text-slate-300'}`}>{v.name}</span>
                                                            {v.latest && <span className="text-[8px] bg-primary/20 text-primary px-1.5 rounded-sm">Current</span>}
                                                        </div>
                                                        <span className="text-[9px] text-slate-500">{v.date}</span>
                                                    </div>
                                                    <div className="flex gap-3 justify-end items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                                        {!v.latest && (
                                                            <button className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[11px]">restore</span>{t.restore}
                                                            </button>
                                                        )}
                                                        <button className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[11px]">edit</span>{t.rename}
                                                        </button>
                                                        <button className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[11px]">delete</span>{t.delete}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 1 && (
                    <div className="grid grid-cols-2 gap-3">
                        {mockMoodboardItems.map(item => (
                            <div key={item.id} className="glass-panel border-white/10 overflow-hidden rounded-2xl flex flex-col group cursor-pointer hover:border-primary/50 transition-colors relative">
                                <button className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-md size-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-white text-[12px]">close</span>
                                </button>
                                
                                {item.type === 'image' && (
                                    <img src={item.src} alt={item.title} className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                )}
                                
                                {item.type === 'ai_card' && (
                                     <div className="h-32 bg-primary/10 flex flex-col items-center justify-center p-3 text-center border-b border-primary/20">
                                         <span className="material-symbols-outlined text-primary text-3xl mb-1">auto_awesome</span>
                                         <span className="text-[10px] text-primary-light font-bold">AI Idea Storage</span>
                                     </div>
                                )}
                                
                                {item.type === 'prompt' && (
                                     <div className="h-32 bg-slate-800/80 flex flex-col items-center justify-center p-4 text-center border-b border-white/5">
                                         <span className="material-symbols-outlined text-slate-400 text-xl mb-1">psychology</span>
                                         <span className="text-[10px] text-slate-200 line-clamp-3 leading-relaxed mt-1">"{item.text}"</span>
                                     </div>
                                )}

                                <div className="p-3 bg-black/40">
                                    <h4 className="text-[11px] font-bold text-white mb-1 truncate">{item.title}</h4>
                                    {item.description && <p className="text-[9px] text-slate-400 truncate">{item.description}</p>}
                                </div>
                            </div>
                        ))}
                        
                        {/* Add new moodboard item placeholder */}
                        <div className="glass-panel border-white/10 border-dashed overflow-hidden rounded-2xl flex flex-col items-center justify-center h-[178px] cursor-pointer hover:bg-white/5 transition-colors">
                            <span className="material-symbols-outlined text-3xl text-slate-500 mb-2">add_photo_alternate</span>
                            <span className="text-[11px] font-bold text-slate-400">Add Inspiration</span>
                        </div>
                    </div>
                )}

            </div>
            
            {/* Delete Confirmation Modal */}
            {projectToDelete && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0D0A1C] border border-white/20 p-6 rounded-2xl w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex bg-rose-500/20 w-12 h-12 rounded-full items-center justify-center mb-1">
                            <span className="material-symbols-outlined text-rose-500">delete_forever</span>
                        </div>
                        <h3 className="text-white text-lg font-bold tracking-tight">
                            {language === 'KR' ? '프로젝트 삭제' : 'Delete Project'}
                        </h3>
                        <div>
                            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line mb-1">
                                {language === 'KR' 
                                    ? `"${projectToDelete.title}"\n이 프로젝트를 삭제하시겠습니까?\n삭제된 프로젝트는 복구할 수 없습니다.` 
                                    : `"${projectToDelete.title}"\nAre you sure you want to delete this project?\nThis action cannot be undone.`}
                            </p>
                            {activeProjectId === projectToDelete.id && (
                                <p className="text-rose-400 text-xs font-bold mt-2 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                                    {language === 'KR' ? '⚠️ 현재 작업 중인 프로젝트입니다.' : '⚠️ You are currently working on this project.'}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            <button onClick={handleConfirmDelete} className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl text-sm font-bold transition-colors">
                                {language === 'KR' ? '삭제' : 'Delete'}
                            </button>
                            <button onClick={() => setProjectToDelete(null)} className="w-full bg-white/5 text-slate-300 border border-white/10 py-3 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
                                {language === 'KR' ? '취소' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 border border-emerald-400 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span className="text-[13px] font-bold">{language === 'KR' ? '프로젝트가 삭제되었습니다.' : 'Project has been deleted.'}</span>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

export default Library;
