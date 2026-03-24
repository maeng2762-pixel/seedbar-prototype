import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import LanguageToggle from '../components/LanguageToggle';
import useChoreographyStudioStore from '../store/useChoreographyStudioStore';
import { useNavigate } from 'react-router-dom';
import { navigateToDraftProject, navigateToNewProject } from '../lib/projectNavigation';
import StableArtworkPreview from '../components/StableArtworkPreview';
import { resolveArtworkUrl } from '../lib/artworkMedia.js';

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

const Library = () => {
    const navigate = useNavigate();
    const { language } = useStore();
    const t = i18n[language];
    const {
        projects,
        deletedProjects,
        listProjects,
        listDeletedProjects,
        deleteProject,
        restoreProject,
        setProjectId,
        projectId: activeProjectId,
        generatePPTForProject,
        fetchProjectVersions
    } = useChoreographyStudioStore();
    
    const [activeTab, setActiveTab] = useState(0);
    const [expandedProjectId, setExpandedProjectId] = useState(null);
    const [projectVersions, setProjectVersions] = useState({});
    const [loadingVersions, setLoadingVersions] = useState({});
    const [generatingDocId, setGeneratingDocId] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [showToast, setShowToast] = useState(false);

    React.useEffect(() => {
        listProjects().catch(() => {});
        listDeletedProjects().catch(() => {});
    }, [listDeletedProjects, listProjects]);

    const handleExpandVersions = async (projectId) => {
        if (expandedProjectId === projectId) {
            setExpandedProjectId(null);
        } else {
            setExpandedProjectId(projectId);
            if (!projectVersions[projectId]) {
                setLoadingVersions(prev => ({ ...prev, [projectId]: true }));
                try {
                    const fetched = await fetchProjectVersions(projectId);
                    setProjectVersions(prev => ({ ...prev, [projectId]: fetched }));
                } catch (err) {
                    console.error('Failed to fetch versions', err);
                } finally {
                    setLoadingVersions(prev => ({ ...prev, [projectId]: false }));
                }
            }
        }
    };

    const actualMoodboardItems = React.useMemo(() => {
        if (!Array.isArray(projects)) return [];
        return projects.reduce((acc, proj) => {
            const content = proj.currentContent;
            if (content?.concept?.artisticStatement) {
                acc.push({
                    id: `prompt_${proj.id}`,
                    type: 'prompt',
                    text: content.concept.artisticStatement.en || content.concept.artisticStatement.kr || "Inspirational Idea",
                    title: proj.title,
                    description: language === 'KR' ? '예술적 의도' : 'Artistic Intent',
                    projectId: proj.id
                });
            }
            if (content?.designDna?.colors?.length > 0) {
                acc.push({
                    id: `dna_${proj.id}`,
                    type: 'ai_card',
                    title: proj.title,
                    description: language === 'KR' ? '디자인 DNA 색상' : 'Design DNA Colors',
                    projectId: proj.id
                });
            }
            return acc;
        }, []);
    }, [projects, language]);

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            await deleteProject(projectToDelete.id);
            setProjectToDelete(null);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            await listProjects();
            await listDeletedProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
            alert(language === 'KR' ? '삭제에 실패했습니다.' : 'Failed to delete.');
        }
    };


    const handleGenerateDoc = async (id) => {
        setGeneratingDocId(id);
        try {
            await generatePPTForProject(id);
            await listProjects();
            alert(language === 'KR' 
                ? "🌟 발표 문서가 성공적으로 생성되었습니다!"
                : "🌟 Presentation Document generated successfully!");
            navigate(`/ppt/${id}`);
        } catch (error) {
            console.error('Document Gen Error:', error);
            alert(language === 'KR' ? '생성에 실패했습니다.' : 'Failed to generate presentation.');
        } finally {
            setGeneratingDocId(null);
        }
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
                            <div className="glass-panel p-4 rounded-2xl text-center py-10">
                                <p className="text-xs text-slate-400">{language === 'KR' ? '저장된 프로젝트가 없습니다.' : 'No saved projects yet.'}</p>
                                <button
                                    type="button"
                                    onClick={() => navigateToNewProject(navigate)}
                                    className="mt-4 border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
                                >
                                    {language === 'KR' ? '새 프로젝트 시작' : 'Start New Project'}
                                </button>
                            </div>
                        ) : projects.map((project) => (
                            <div key={project.id} className="glass-panel border-white/10 p-4 rounded-2xl flex flex-col gap-4">
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                        <div className="size-14 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shrink-0">
                                            <StableArtworkPreview
                                                src={resolveArtworkUrl(project.currentContent || {}, { prefer: 'thumbnail' })}
                                                alt={project.title}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-[15px] font-bold text-white truncate">{project.title}</h3>
                                            <button 
                                                onClick={() => setProjectToDelete(project)}
                                                className="text-slate-500 hover:text-rose-400 p-1 flex items-center justify-center rounded transition-colors"
                                                title={language === 'KR' ? '휴지통으로 이동' : 'Move to trash'}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                            {t.edited} {new Date(project.updatedAt).toLocaleDateString()}
                                        </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setProjectId(project.id);
                                            navigateToDraftProject(navigate, project.id);
                                        }}
                                        className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-xl text-[11px] font-bold active:scale-95 transition-all ml-2 shrink-0"
                                    >
                                        {t.continue}
                                    </button>
                                </div>
                                
                                <div className="flex gap-2 border-t border-white/5 pt-3">
                                    {project.currentContent?.generatedPackage ? (
                                        <div className="flex-[1.5] flex gap-1">
                                            <button 
                                                onClick={() => navigate(`/ppt/${project.id}`)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/30 to-blue-500/30 hover:from-purple-500/40 hover:to-blue-500/40 text-slate-100 py-2.5 rounded-xl text-[11px] font-semibold transition-all border border-white/10"
                                            >
                                                <span className="material-symbols-outlined text-[15px] text-purple-300">open_in_new</span>
                                                {language === 'KR' ? '문서 열기' : 'Open Doc'}
                                            </button>
                                            <button 
                                                onClick={() => handleGenerateDoc(project.id)}
                                                className="flex-shrink-0 px-3 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 py-2.5 rounded-xl transition-all border border-white/5 disabled:opacity-50"
                                                title={language === 'KR' ? '다시 생성' : 'Regenerate'}
                                                disabled={generatingDocId === project.id}
                                            >
                                                {generatingDocId === project.id ? (
                                                    <span className="material-symbols-outlined text-[15px] animate-spin text-purple-300">sync</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-[15px]">refresh</span>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleGenerateDoc(project.id)}
                                            disabled={generatingDocId === project.id}
                                            className="flex-[1.5] flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-slate-100 py-2.5 rounded-xl text-[11px] font-semibold transition-all border border-white/5 relative overflow-hidden disabled:opacity-50"
                                        >
                                            {generatingDocId === project.id && (
                                                <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                                            )}
                                            <span className="material-symbols-outlined text-[15px] text-purple-300">
                                                {generatingDocId === project.id ? 'sync' : 'description'}
                                            </span>
                                            {generatingDocId === project.id ? (language === 'KR' ? '생성 중...' : 'Generating...') : t.generateDoc}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleExpandVersions(project.id)}
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
                                            {loadingVersions[project.id] ? (
                                                <div className="py-4 flex justify-center text-primary-light">
                                                    <span className="material-symbols-outlined animate-spin">sync</span>
                                                </div>
                                            ) : (projectVersions[project.id] && projectVersions[project.id].length > 0) ? (
                                                projectVersions[project.id].map((v, index) => (
                                                    <div key={v.id} className="flex flex-col gap-2 bg-white/5 rounded-lg p-2.5 hover:bg-white/10 transition-colors group">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs font-semibold ${index === 0 ? 'text-primary-light' : 'text-slate-300'}`}>v{v.versionNumber}.0 {v.label ? `(${v.label})` : (index === 0 ? '(최신 작업본)' : '')}</span>
                                                                {index === 0 && <span className="text-[8px] bg-primary/20 text-primary px-1.5 rounded-sm">Current</span>}
                                                            </div>
                                                            <span className="text-[9px] text-slate-500">{new Date(v.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex gap-3 justify-end items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                                            {index !== 0 && (
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
                                                ))
                                            ) : (
                                                <div className="py-2 text-center text-xs text-slate-500">버전 기록이 없습니다.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {deletedProjects.length > 0 && (
                            <div className="glass-panel border-white/10 p-4 rounded-2xl flex flex-col gap-3">
                                <div>
                                    <h3 className="text-[14px] font-bold text-white">{language === 'KR' ? '삭제 보관함' : 'Trash & Recovery'}</h3>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {language === 'KR' ? '삭제된 프로젝트는 30일 동안 복구할 수 있습니다.' : 'Deleted projects remain restorable for 30 days.'}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {deletedProjects.map((project) => (
                                        <div key={project.id} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-white">{project.title}</p>
                                                <p className="mt-1 text-[10px] text-slate-500">
                                                    {language === 'KR' ? '삭제 시각' : 'Deleted'} {new Date(project.deletedAt || project.updatedAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        await restoreProject(project.id);
                                                        await listProjects();
                                                        await listDeletedProjects();
                                                    } catch (error) {
                                                        alert(error.message);
                                                    }
                                                }}
                                                className="shrink-0 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200 transition-colors hover:bg-emerald-500/20"
                                            >
                                                {language === 'KR' ? '복구' : 'Restore'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 1 && (
                    <div className="grid grid-cols-2 gap-3">
                        {actualMoodboardItems.map(item => (
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
