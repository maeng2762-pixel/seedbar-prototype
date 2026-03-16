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
        title: 'Elastic Recoil',
        description: 'Throw energy out of the center and delay the return, creating a rubber-band effect.',
        mood: 'Tension / Release',
        energy: 'High',
        genre: 'Contemporary',
        formation: 'Expanding circles',
        promptState: { genre: 'Contemporary Dance', moodKeywords: ['#Tension', '#Release'], duration: '02:00' }
    },
    {
        id: 'm2',
        title: 'Fractured Balance',
        description: 'Constantly interrupt your own weight shifts before completion.',
        mood: 'Unstable / Anxious',
        energy: 'Medium',
        genre: 'Experimental',
        formation: 'Asymmetric lines',
        promptState: { genre: 'Experimental Dance', moodKeywords: ['#Unstable', '#Anxious'], duration: '03:00' }
    },
    {
        id: 'm3',
        title: 'Sequential Grounding',
        description: 'Melt into the floor joint by joint like liquid metal.',
        mood: 'Heavy / Smooth',
        energy: 'Low',
        genre: 'Lyrical',
        formation: 'Floorwork nodes',
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
        mood: 'Tension & Build-up',
        genre: 'Contemporary / Experimental',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80',
        promptState: { genre: 'Experimental Dance', moodKeywords: ['#Cinematic', '#Tension'] }
    },
    {
        id: 'mu2',
        playlist: 'Minimalist Piano',
        mood: 'Emotional & Breath',
        genre: 'Ballet / Lyrical',
        image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80',
        promptState: { genre: 'Ballet', moodKeywords: ['#Minimalist', '#Piano', '#Emotional'] }
    }
];

const mockQuickStartPrompts = [
    {
        id: 'q1',
        title: 'Competition Solo',
        description: 'High impact, contrast-heavy short piece',
        icon: 'emoji_events',
        promptState: { genre: 'Contemporary Dance Competition', peopleCount: '1', moodKeywords: ['#Explosive', '#Contrast'], duration: '02:00' }
    },
    {
        id: 'q2',
        title: 'Dark Experimental Group',
        description: 'Avante-garde group routines with heavy tension',
        icon: 'groups',
        promptState: { genre: 'Experimental Dance', peopleCount: '5', moodKeywords: ['#Dark', '#Avante-garde'], duration: '04:00' }
    },
    {
        id: 'q3',
        title: 'Lyrical Duet',
        description: 'Smooth partner work emphasizing connection',
        icon: 'favorite',
        promptState: { genre: 'Lyrical Dance', peopleCount: '2', moodKeywords: ['#Connection', '#Fluid'], duration: '03:15' }
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
    quickStartPrompts: [],
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
            quickStartPrompts: mockQuickStartPrompts,
            learningHighlights: mockLearningHighlights,
            loading: false
        });
    }
}));

export default useExploreStore;
