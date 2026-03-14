import React from 'react';
import { useNavigate } from 'react-router-dom';

const PPTGenerator = () => {
    const navigate = useNavigate();

    return (
        <div className="relative flex flex-col h-screen w-full bg-background-dark font-display text-slate-100 overflow-hidden">
            <div className="relative z-30 flex items-center justify-between p-6 pt-12 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="size-10 rounded-full glass-panel flex items-center justify-center text-white active:scale-95 transition-all">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-white font-bold text-sm">Auto PPT Generator</h1>
                        <p className="text-[10px] text-slate-400">Exported from: Urban Echoes #04</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="glass-panel px-3 py-1 rounded-full border border-slate-700/50">
                        <p className="text-[10px] font-bold tracking-widest text-slate-300">KOR / <span className="text-primary">ENG</span></p>
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar px-6 pt-4 pb-32">
                <div className="flex flex-col gap-10">
                    {/* Slide 1 */}
                    <div className="w-full aspect-[16/9] bg-slide-bg rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden border border-white/5 relative">
                        <img alt="Cover Slide Background" className="absolute inset-0 w-full h-full object-cover opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXE6qwdSbDPutfwDiB8LNKFdhyPW_6OieztmmDYe9pIt16MwqRkgh96rhamNL8WoC6xc-bfab9azEywq5MPi1KWDyZ4NMCUu2fMBkjgSY8eUSPAhVxH_PtrV6jeJBRgLqq4D1mOmWLYzG0ISE8R3zGnMJMfExiEaMQilJ8-R9QqKq6t8WN3KtoPfSXF4mlKCWtr1Xi46UqdQu7QZ_-KxTdeq-ED5MFDU4dTE8mihi5TIaxePzV1_zwUbqsoiEEFzo1V4viC4_cbA" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                            <span className="text-primary text-[10px] font-bold tracking-[0.2em] mb-1">ARTISTIC INTENT</span>
                            <h2 className="text-xl font-bold leading-tight text-white">Urban Echoes: <br />Fluidity in Concrete</h2>
                            <div className="h-[1px] w-12 bg-primary my-3"></div>
                            <p className="text-[8px] text-slate-400">Curated by AI Choreography Engine</p>
                        </div>
                    </div>

                    {/* Slide 2 */}
                    <div className="w-full aspect-[16/9] bg-slide-bg rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden border border-white/5 p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-300">Visual Moodboard</span>
                            <span className="text-[8px] text-slate-500">Slide 02</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 h-full">
                            <div className="rounded-lg overflow-hidden bg-slate-800">
                                <img alt="Mood 1" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0MrZpBDEK_y7jL8T4qVGj-CzqStkLhjU3oakguMIc0tTKjzm0kPOobI7ynzDjKtXV9zakujz8YeQXW2f57IyrfzscQJOF6ZAvR1C1mUN5h2nkrgJ0KZL3bWrNWc3wfD_zgiu3L_gqqzqMiT9xLwlcUmUID0o8-N_alFf2G9Z-F4b9p-LWB7kLlz3HFQZPB46vycMW7NADG2N656B08Ic5XANmtC3BSb5wcX8TfICK_fey5fQxQ-KAq6DtfxAy7Z0fygj8a2nFtg" />
                            </div>
                            <div className="rounded-lg overflow-hidden bg-slate-800">
                                <img alt="Mood 2" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjNiUzAod5vPLKQymH5BkGCIOnHsELxjb7bMkqTbHFKyjflvi-bHvtTgV7TiD6WAIz_YVd3-1HEPlg6KGuk_4-BMygRWofovqZyDgzSW4T43ZKuEk5YpxPp-Fc7zelTg-Np3ASBQkvLgKS5bwVuRMACAyGyBw1lh-ysxOeIb7BDwFxQQLo4Aas0xzKfjXUpyTgQX0M7LTZGTBHI3Hh28kJYqWqt_zsFWHvQcIcsj6dVXeMAEqwIR98Rt0aDX4VGCaMo8jzcBDjYQ" />
                            </div>
                            <div className="rounded-lg overflow-hidden bg-slate-800">
                                <img alt="Mood 3" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATo1NG19Rt5g4x2eojodNB3BkIRKGKoIRirHCzAi4iyB950KaYecpg36Z3PIsukW4FF6kTJlZOHEwp8TD4Acbn71FyFSIjhye2NW3YpK6U9Q--xB0YPiZUjfzAyFhTsX64cJDqqml39-UzNDPCKKzFhZHk0nYCdC0gXwxwP6UJLH9CSsW-3NSj7UTBjYpLhy90P3zrUwgxdKHDB-8-UFT-Ncw3f2e6Xh8pmSRfTCjuL4iKOrMatIbg5IoAknwdKrSXlJ_-Hullbg" />
                            </div>
                        </div>
                        <p className="text-[8px] text-slate-400 leading-tight italic">Exploring the intersection of brutalist architecture and organic contemporary movement.</p>
                    </div>

                    {/* Slide 3 */}
                    <div className="w-full aspect-[16/9] bg-slide-bg rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden border border-white/5 p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-slate-300">Choreography Timeline</span>
                            <span className="text-[8px] text-slate-500">Slide 03</span>
                        </div>
                        <div className="flex-grow flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <span className="text-[8px] font-mono text-primary w-8">0:00</span>
                                <div className="h-2 flex-grow bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-1/4"></div>
                                </div>
                                <span className="text-[8px] text-slate-300 font-medium">Intro: Stillness</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[8px] font-mono text-primary w-8">0:45</span>
                                <div className="h-2 flex-grow bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary/60 w-1/2"></div>
                                </div>
                                <span className="text-[8px] text-slate-300 font-medium">Phase 1: Acceleration</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[8px] font-mono text-primary w-8">1:30</span>
                                <div className="h-2 flex-grow bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary/40 w-3/4"></div>
                                </div>
                                <span className="text-[8px] text-slate-300 font-medium">Climax: Multi-axis</span>
                            </div>
                        </div>
                    </div>

                    {/* Slide 4 */}
                    <div className="w-full aspect-[16/9] bg-slide-bg rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden border border-white/5 p-4 flex flex-col justify-center text-center">
                        <span className="material-symbols-outlined text-primary text-xl mb-2 mx-auto">insights</span>
                        <h3 className="text-xs font-bold mb-1 text-white">Kinetic Analysis</h3>
                        <p className="text-[9px] text-slate-400 max-w-[180px] mx-auto">Movement density peaks at 2:15 with an average complexity rating of 8.4/10 based on selected AI parameters.</p>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 w-full z-40 p-6 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent">
                <div className="flex flex-col gap-3">
                    <button className="w-full h-14 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/30 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-xl">download</span>
                        <span>Download as .pptx</span>
                    </button>
                    <div className="flex gap-3">
                        <button className="flex-1 h-12 glass-panel rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 text-white active:scale-95 transition-transform">
                            <span className="material-symbols-outlined text-sm">share</span>
                            Share Link
                        </button>
                        <button className="flex-1 h-12 glass-panel rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 text-white active:scale-95 transition-transform">
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit Slides
                        </button>
                    </div>
                </div>
            </div>
            {/* iOS style home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/10 rounded-full z-50"></div>
        </div>
    );
};

export default PPTGenerator;
