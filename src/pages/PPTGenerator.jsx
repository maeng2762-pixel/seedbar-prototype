import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useChoreographyStudioStore from '../store/useChoreographyStudioStore';
import useStore from '../store/useStore';
import pptxgen from 'pptxgenjs';
import html2pdf from 'html2pdf.js';

const PPTGenerator = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { projects, listProjects } = useChoreographyStudioStore();
    const { language, setLanguage } = useStore();
    const [project, setProject] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const found = projects.find(p => p.id === projectId);
        if (found) {
            setProject(found);
        } else {
            listProjects().then(fetched => {
                const f = fetched.find(p => p.id === projectId);
                if (f) setProject(f);
            });
        }
    }, [projectId, projects, listProjects]);

    const title = project?.title || 'Untitled Project';
    const pkg = project?.currentContent?.generatedPackage || {};
    const draft = project?.currentContent || {};

    const t = language === 'KR' ? {
        loading: '문서를 불러오는 중...',
        docs: '프로덕션 패키지 문서',
        desc: '각 문서를 클릭하여 네이티브 PDF 뷰어로 열거나 로컬 장치로 다운로드할 수 있습니다.',
        ppt: '발표 PPT 열기',
        script: '발표 대본 열기',
        stage: '무대감독 지시서 열기',
        lighting: '조명감독 큐시트 열기',
        costume: '의상 정리표 열기',
        prop: '소품 정리표 열기',
        pamphlet: '팜플렛 열기',
        wait: '문서 생성 중...',
    } : {
        loading: 'Loading document...',
        docs: 'Production Package Documents',
        desc: 'Click each document to open in native PDF viewer or download locally.',
        ppt: 'Open Presentation PPT',
        script: 'Open Presentation Script',
        stage: 'Open Stage Director Doc',
        lighting: 'Open Lighting Cue Sheet',
        costume: 'Open Costume Sheet',
        prop: 'Open Prop Sheet',
        pamphlet: 'Open Pamphlet',
        wait: 'Generating Document...',
    };

    const handleGeneratePPT = () => {
        setIsGenerating(true);
        setTimeout(() => {
            let pptx = new pptxgen();
            pptx.layout = 'LAYOUT_16x9';

            // Cover slide
            let slide1 = pptx.addSlide();
            slide1.background = { color: "111827" }; // background-dark
            slide1.addText(t.ppt, { x: 1, y: 1.5, w: 8, h: 0.5, fontSize: 16, color: "8B5CF6", bold: true }); // Primary color
            slide1.addText(title, { x: 1, y: 2, w: 8, h: 1.5, fontSize: 44, color: "FFFFFF", bold: true });
            slide1.addText(pkg?.pptSlides?.[0]?.content || "Choreography Production Draft", { x: 1, y: 3.5, w: 8, h: 1, fontSize: 18, color: "94A3B8" });

            // Secondary Slides
            const slidesData = pkg?.pptSlides || [];
            if (slidesData.length > 1) {
                slidesData.slice(1).forEach(data => {
                    let s = pptx.addSlide();
                    s.background = { color: "1E293B" };
                    s.addText(data.title || "Slide", { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 24, color: "FFFFFF", bold: true });
                    s.addText(data.content || "", { x: 0.5, y: 1.8, w: 9, h: 3, fontSize: 16, color: "CBD5E1", valign: "top" });
                    if (data.designNotes) {
                        s.addText(`Note: ${data.designNotes}`, { x: 0.5, y: 5, w: 9, h: 0.5, fontSize: 12, color: "64748B", italic: true });
                    }
                });
            } else {
                // Fallback slides
                let slide2 = pptx.addSlide();
                slide2.background = { color: "1E293B" };
                slide2.addText(language === 'KR' ? "예술적 의도" : "Artistic Intent", { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 24, color: "FFFFFF", bold: true });
                slide2.addText(draft?.concept?.artisticStatement?.[language === 'KR' ? 'kr' : 'en'] || "No content", { x: 0.5, y: 1.8, w: 9, h: 4, fontSize: 16, color: "CBD5E1", valign: "top" });
            }

            pptx.writeFile({ fileName: `${title}_Presentation.pptx` }).then(() => {
                setIsGenerating(false);
            });
        }, 500); // UI feel
    };

    const handleOpenPDF = (docType, contentData) => {
        setIsGenerating(true);
        setTimeout(() => {
            const docTitle = {
                script: language === 'KR' ? '발표 대본' : 'Presentation Script',
                stage: language === 'KR' ? '무대감독 지시서' : 'Stage Director Document',
                lighting: language === 'KR' ? '조명감독 큐시트' : 'Lighting Cue Sheet',
                costume: language === 'KR' ? '의상 정리표' : 'Costume Sheet',
                prop: language === 'KR' ? '소품 정리표' : 'Prop Sheet',
                pamphlet: language === 'KR' ? '팜플렛' : 'Pamphlet',
            }[docType];

            let htmlString = `
                <div style="padding: 60px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937;">
                    <h1 style="font-size: 28px; margin-bottom: 8px; color: #111827;">${docTitle}</h1>
                    <h3 style="font-size: 16px; margin-bottom: 40px; color: #6b7280; font-weight: normal;">Project: ${title}</h3>
                    <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${contentData || '내용이 아직 생성되지 않았습니다.'}</div>
                </div>
            `;

            if (docType === 'pamphlet') {
                const intent = draft?.concept?.artisticStatement?.[language === 'KR' ? 'kr' : 'en'] || '';
                const music = draft?.music?.customPrompt || draft?.music?.recommendationKeywords?.join(', ') || '';
                htmlString = `
                    <div style="padding: 60px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937;">
                        <h1 style="font-size: 36px; margin-bottom: 16px; color: #111827; text-align: center;">${title}</h1>
                        <hr style="border-top: 2px solid #e5e7eb; margin-bottom: 40px;" />
                        <h3 style="font-size: 18px; margin-bottom: 16px; color: #374151;">[ ${language === 'KR' ? '예술적 의도' : 'Artistic Intent'} ]</h3>
                        <p style="font-size: 14px; line-height: 1.8; margin-bottom: 40px;">${intent}</p>
                        
                        <h3 style="font-size: 18px; margin-bottom: 16px; color: #374151;">[ ${language === 'KR' ? '음악/사운드스케이프' : 'Music/Soundscape'} ]</h3>
                        <p style="font-size: 14px; line-height: 1.8; margin-bottom: 40px;">${music}</p>
                        
                        <div style="margin-top: 60px; font-size: 12px; color: #9ca3af; text-align: center;">
                            Powered by AI Choreography Designer
                        </div>
                    </div>
                `;
            }

            const element = document.createElement('div');
            element.innerHTML = htmlString;
            
            // Generate PDF and open Blob
            const opt = {
                margin:       0,
                filename:     `${title}_${docType}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).outputPdf('bloburl').then((pdfUrl) => {
                window.open(pdfUrl, '_blank');
                setIsGenerating(false);
            }).catch(err => {
                console.error("PDF generation failed:", err);
                setIsGenerating(false);
            });
        }, 100);
    };

    if (!project) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background-dark text-white">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
            </div>
        );
    }

    const DocumentCard = ({ icon, label, onClick }) => (
        <button 
            onClick={onClick}
            disabled={isGenerating}
            className="flex items-center justify-between p-5 bg-slate-800/40 border border-white/5 rounded-2xl hover:bg-slate-800 transition-colors group text-left w-full disabled:opacity-50"
        >
            <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm mb-1">{label}</h3>
                    <p className="text-[10px] text-slate-400">Click to open / download</p>
                </div>
            </div>
            <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">
                {icon === 'slideshow' ? 'download' : 'open_in_new'}
            </span>
        </button>
    );

    return (
        <div className="relative flex flex-col h-screen w-full bg-background-dark font-display text-slate-100 overflow-hidden">
            <div className="relative z-30 flex items-center justify-between p-6 pt-12 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="size-10 rounded-full glass-panel flex items-center justify-center text-white active:scale-95 transition-all">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-white font-bold text-sm">Package Results</h1>
                        <p className="text-[10px] text-slate-400">Exported from: {title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setLanguage(language === 'KR' ? 'EN' : 'KR')} className="glass-panel px-3 py-1 rounded-full border border-slate-700/50 cursor-pointer hover:bg-white/5 transition-colors">
                        <p className="text-[10px] font-bold tracking-widest text-slate-300">
                            {language === 'KR' ? <span className="text-primary">KOR</span> : 'KOR'} / {language === 'EN' ? <span className="text-primary">ENG</span> : 'ENG'}
                        </p>
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar px-6 pt-2 pb-24">
                <div className="flex flex-col mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">{t.docs}</h2>
                    <p className="text-xs text-slate-400 max-w-sm">{t.desc}</p>
                </div>

                <div className="flex flex-col gap-3">
                    <DocumentCard 
                        icon="slideshow" 
                        label={t.ppt} 
                        onClick={handleGeneratePPT} 
                    />
                    <DocumentCard 
                        icon="description" 
                        label={t.script} 
                        onClick={() => handleOpenPDF('script', pkg?.presentationScript)} 
                    />
                    <DocumentCard 
                        icon="engineering" 
                        label={t.stage} 
                        onClick={() => handleOpenPDF('stage', pkg?.stageDirectorDoc)} 
                    />
                    <DocumentCard 
                        icon="lightbulb" 
                        label={t.lighting} 
                        onClick={() => handleOpenPDF('lighting', pkg?.lightingDirectorDoc)} 
                    />
                    <DocumentCard 
                        icon="checkroom" 
                        label={t.costume} 
                        onClick={() => handleOpenPDF('costume', pkg?.costumePropDoc)} 
                    />
                    <DocumentCard 
                        icon="chair_alt" 
                        label={t.prop} 
                        onClick={() => handleOpenPDF('prop', pkg?.costumePropDoc)} 
                    />
                    <DocumentCard 
                        icon="import_contacts" 
                        label={t.pamphlet} 
                        onClick={() => handleOpenPDF('pamphlet')} 
                    />
                </div>
            </div>

            {isGenerating && (
                <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <div className="size-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center animate-pulse mb-4 shadow-2xl">
                        <span className="material-symbols-outlined text-primary text-3xl animate-spin">sync</span>
                    </div>
                    <p className="text-sm font-bold text-white tracking-widest">{t.wait}</p>
                </div>
            )}
            
            {/* iOS style home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/10 rounded-full z-50"></div>
        </div>
    );
};

export default PPTGenerator;

