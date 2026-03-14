import { create } from 'zustand';

const useStore = create((set) => ({
    language: 'EN', // 'EN' or 'KR'
    toggleLanguage: () => set((state) => ({ language: state.language === 'EN' ? 'KR' : 'EN' })),

    // Timeline state
    activeSection: 'climax',
    setActiveSection: (section) => set({ activeSection: section }),

    // Blocks on timeline
    blocks: [
        { id: 'b1', type: 'Intro', start: 0, length: 2, name: 'Slow Rise' },
        { id: 'b2', type: 'Build-up', start: 2, length: 4, name: 'Fluid Walk' },
        { id: 'b3', type: 'Climax', start: 6, length: 3, name: 'Jump Sequence' },
        { id: 'b4', type: 'Outro', start: 9, length: 3, name: 'Fade Pose' },
    ],
    updateBlockLength: (id, diff) => set((state) => ({
        blocks: state.blocks.map(b => b.id === id ? { ...b, length: Math.max(1, b.length + diff) } : b)
    })),
    moveBlock: (id, diffStart) => set((state) => ({
        blocks: state.blocks.map(b => b.id === id ? { ...b, start: Math.max(0, b.start + diffStart) } : b)
    })),

    // New: staged generation pipeline state
    pipelineStep: 1,
    setPipelineStep: (step) => set({ pipelineStep: step }),
    draftOptions: [],
    setDraftOptions: (draftOptions) => set({ draftOptions }),
    selectedConcept: null,
    setSelectedConcept: (selectedConcept) => set({ selectedConcept }),
    expandedResult: null,
    setExpandedResult: (expandedResult) => set({ expandedResult }),
    planInfo: null,
    setPlanInfo: (planInfo) => set({ planInfo }),

    // Stage flow player state
    isPlaying: false,
    currentTime: 0,
    duration: 150,
    stageFlow: [],
    dancers: [],
    selectedSection: '',
    setIsPlaying: (isPlaying) => set((state) => ({
        isPlaying: typeof isPlaying === 'function' ? isPlaying(state.isPlaying) : isPlaying
    })),
    setCurrentTime: (currentTime) => set((state) => ({
        currentTime: typeof currentTime === 'function' ? currentTime(state.currentTime) : currentTime
    })),
    setDuration: (duration) => set((state) => ({
        duration: typeof duration === 'function' ? duration(state.duration) : duration
    })),
    setStageFlow: (stageFlow) => set({ stageFlow }),
    setDancers: (dancers) => set({ dancers }),
    setSelectedSection: (selectedSection) => set({ selectedSection }),
}));

export default useStore;
