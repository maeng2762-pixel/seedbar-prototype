import { create } from 'zustand';

const mockChoreographyLibrary = [
    {
        id: 'c1',
        title: 'Spiral Collapse',
        genre: 'Contemporary Dance',
        dancers: 1,
        mood: '#Dark #Tension',
        description: 'A solo piece exploring emotional limits and gravitational pull.',
        image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80',
        promptState: { genre: 'Contemporary Dance', peopleCount: '1', moodKeywords: ['#Dark', '#Tension'], duration: '02:30' }
    },
    {
        id: 'c2',
        title: 'Neon Pulse',
        genre: 'Hip-Hop',
        dancers: 5,
        mood: '#Dynamic #Energetic',
        description: 'High energy crew routine focusing on precise isolations and formations.',
        image: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?auto=format&fit=crop&q=80',
        promptState: { genre: 'Hip-Hop', peopleCount: '5', moodKeywords: ['#Dynamic', '#Energetic'], duration: '03:15' }
    },
    {
        id: 'c3',
        title: 'Golden Arch',
        genre: 'Contemporary Dance Competition',
        dancers: 3,
        mood: '#Elegant #Stretching',
        description: 'Trio piece engineered for maximum visual contrast on a proscenium stage.',
        image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&q=80',
        promptState: { genre: 'Contemporary Dance Competition', peopleCount: '3', moodKeywords: ['#Elegant', '#Stretching'], duration: '03:45' }
    }
];

const mockMovementIdeas = [
    {
        id: 'm1',
        title: 'Spinal Wave',
        description: 'Energy transfer focusing on the spine.',
        motionPrompt: '움직임이 척추에서 시작해 팔로 퍼져나간다.',
        mood: 'Fluid / Connected',
        energy: 'Medium',
        genre: 'Contemporary',
        promptState: { genre: 'Contemporary Dance', moodKeywords: ['#Fluid', '#Spinal'], duration: '02:00' }
    },
    {
        id: 'm2',
        title: 'Fractured Balance',
        description: 'Constantly interrupt your own weight shifts before completion.',
        motionPrompt: '무게 중심을 이동하다가 중간에 끊어내며 불안정한 균형을 만든다.',
        mood: 'Unstable / Anxious',
        energy: 'High',
        genre: 'Experimental',
        promptState: { genre: 'Experimental Dance', moodKeywords: ['#Unstable', '#Anxious'], duration: '03:00' }
    },
    {
        id: 'm3',
        title: 'Sequential Grounding',
        description: 'Melt into the floor joint by joint like liquid metal.',
        motionPrompt: '신체의 관절이 하나씩 무너지며 바닥으로 액체처럼 녹아내린다.',
        mood: 'Heavy / Smooth',
        energy: 'Low',
        genre: 'Lyrical',
        promptState: { genre: 'Lyrical Dance', moodKeywords: ['#Heavy', '#Smooth'], duration: '02:45' }
    }
];

const mockStagePatterns = [
    {
        id: 's1',
        title: 'V-Formation Drive',
        dancers: '5-9',
        description: 'A powerful advancing wedge that commands space.',
        preview: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80',
        promptState: { peopleCount: '7', moodKeywords: ['#Powerful', '#Commanding'] }
    },
    {
        id: 's2',
        title: 'Orbiting Center',
        dancers: '4-6',
        description: 'One stationary subject while others orbit with shifting speeds.',
        preview: 'https://images.unsplash.com/photo-1502519144081-acca18599776?auto=format&fit=crop&q=80',
        promptState: { peopleCount: '5', moodKeywords: ['#Hypnotic', '#Circular'] }
    }
];

const mockMusicDiscovery = [
    {
        id: 'mu1',
        playlist: 'Cinematic Sub-bass',
        tempo: 'Slow (60-80 BPM)',
        mood: 'Tension & Build-up',
        recommendedStyle: 'Experimental Floorwork',
        genre: 'Contemporary / Experimental',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80',
        promptState: { genre: 'Experimental Dance', moodKeywords: ['#Cinematic', '#Tension'] }
    },
    {
        id: 'mu2',
        playlist: 'Minimalist Piano',
        tempo: 'Rubato (Free timing)',
        mood: 'Emotional & Breath',
        recommendedStyle: 'Lyrical Connections',
        genre: 'Ballet / Lyrical',
        image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80',
        promptState: { genre: 'Ballet', moodKeywords: ['#Minimalist', '#Piano', '#Emotional'] }
    },
    {
        id: 'mu3',
        playlist: 'Dark Syncopation',
        tempo: 'Fast (120+ BPM)',
        mood: 'Aggressive & Sharp',
        recommendedStyle: 'Hard-hitting Hip-Hop',
        genre: 'Hip-Hop',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80',
        promptState: { genre: 'Hip-Hop', moodKeywords: ['#Aggressive', '#Sharp'] }
    }
];

const mockAiTemplates = [
    {
        id: 't1',
        titleEn: 'Contemporary Solo',
        titleKr: '컨템포러리 솔로',
        description: 'Deeply expressive emotional piece',
        icon: 'person',
        promptState: { genre: 'Contemporary Dance', peopleCount: '1', moodKeywords: ['#Expressive', '#Emotional'], duration: '03:00' }
    },
    {
        id: 't2',
        titleEn: 'Duet Structure',
        titleKr: '듀엣 안무 구조',
        description: 'Interconnected partner choreography',
        icon: 'group',
        promptState: { genre: 'Contemporary Dance', peopleCount: '2', moodKeywords: ['#Connection', '#Interdependent'], duration: '04:00' }
    },
    {
        id: 't3',
        titleEn: 'Improv Structure',
        titleKr: '즉흥 안무 구조',
        description: 'Guided rules for freeform expression',
        icon: 'waves',
        promptState: { genre: 'Experimental Dance', peopleCount: '1', moodKeywords: ['#Improvisation', '#Freeform'], duration: '05:00' }
    },
    {
        id: 't4',
        titleEn: 'Graduation Piece',
        titleKr: '졸업 작품 안무',
        description: 'Large-scale, high-impact final project',
        icon: 'school',
        promptState: { genre: 'Contemporary Dance', peopleCount: '7', moodKeywords: ['#Epic', '#Professional'], duration: '07:00' }
    }
];

const mockLearningHighlights = [
    {
        id: 'l1',
        title: 'Understanding Energy Curves',
        category: 'Choreography Basics',
    },
    {
        id: 'l2',
        title: 'Competition Stage Utilization',
        category: 'Pro Tips',
    }
];

const useExploreStore = create((set) => ({
    choreographyLibrary: [],
    movementIdeas: [],
    stagePatterns: [],
    musicDiscovery: [],
    aiTemplates: [],
    learningHighlights: [],
    loading: false,

    fetchExploreData: async () => {
        set({ loading: true });
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({
            choreographyLibrary: mockChoreographyLibrary,
            movementIdeas: mockMovementIdeas,
            stagePatterns: mockStagePatterns,
            musicDiscovery: mockMusicDiscovery,
            aiTemplates: mockAiTemplates,
            learningHighlights: mockLearningHighlights,
            loading: false
        });
    }
}));

export default useExploreStore;

