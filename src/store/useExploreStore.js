import { create } from 'zustand';

const mockLatestReferences = [
    {
        id: 'lr1',
        title: 'Gravity Defiance',
        genre: 'Contemporary',
        dancers: 1,
        learningObject: '도입부 긴장 형성에 좋은 레퍼런스',
        description: '오프닝에서 중력에 반하는 극단적인 체공 시간을 사용해 긴장을 유발하는 솔로 레퍼런스.',
        image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80',
        promptState: { genre: 'Contemporary', peopleCount: '1', moodKeywords: ['#Tension', '#Gravity Defying'] }
    },
    {
        id: 'lr2',
        title: 'Syncopated Isolation',
        genre: 'Hip-Hop',
        dancers: 3,
        learningObject: '엇박자 리듬과 아이솔레이션의 결합',
        description: '정박을 쪼개어 쓰는 아이솔레이션(Isolation) 기술의 최신 활용 사례.',
        image: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?auto=format&fit=crop&q=80',
        promptState: { genre: 'Hip-Hop', peopleCount: '3', moodKeywords: ['#Syncopation', '#Isolation'] }
    }
];

const mockTodayDanceVids = [
    {
        id: 'td1',
        title: 'Fluidity in Chaos',
        genre: 'Experimental',
        dancers: 5,
        learningObject: '빠른 군무 속 유연한 동선 전환',
        description: '다수가 빠르게 얽히는 상황에서 혼란스럽지 않게 유기적으로 동선이 전환되는 예시.',
        image: 'https://images.unsplash.com/photo-1543360212-32a222345b59?auto=format&fit=crop&q=80',
        promptState: { genre: 'Experimental', peopleCount: '5', moodKeywords: ['#Fluid', '#Chaos'] }
    }
];

const mockPerformanceHighlights = [
    {
        id: 'ph1',
        title: 'The Silent Climax',
        genre: 'Lyrical Dance',
        dancers: 2,
        learningObject: '절정 직전 에너지 축적 방식 참고',
        description: '음악이 고조되기 전 오히려 움직임을 최소화하여 폭발력을 비축하는 듀엣 장면.',
        image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&q=80',
        promptState: { genre: 'Lyrical Dance', peopleCount: '2', moodKeywords: ['#Silence', '#Climax'] }
    },
    {
        id: 'ph2',
        title: 'Asymmetric Echo',
        genre: 'Modern',
        dancers: 7,
        learningObject: '비대칭 구도에서의 시각적 밸런스',
        description: '7인의 군무가 비대칭으로 서 있을 때 에너지를 어떻게 분배하는지 보여주는 하이라이트.',
        image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80',
        promptState: { genre: 'Modern', peopleCount: '7', moodKeywords: ['#Asymmetric', '#Balance'] }
    }
];

const mockStructureRef = [
    {
        id: 'sr1',
        title: 'A-B-A Canon Structure',
        description: '캐논(Canon) 기법을 활용한 A-B-A 서사 구조',
        motionPrompt: '한 명의 무용수가 동작을 시작하면, 2박자 뒤 다음 무용수가 똑같이 따라하며 캐논을 형성한다.',
        learningObject: '시간차를 둔 돌림노래식 안무 전개 학습',
        energy: 'Medium',
        genre: 'Contemporary',
        promptState: { genre: 'Contemporary', moodKeywords: ['#Canon', '#Structure'] }
    },
    {
        id: 'sr2',
        title: 'Converging Paths',
        description: '사방에서 중앙으로 수렴하는 기승전결',
        motionPrompt: '스테이지 외곽에 흩어져 있던 댄서들이 하나의 중앙 구심점을 향해 소용돌이치며 모여든다.',
        learningObject: '군무의 시선 집중 및 수렴 과정 학습용',
        energy: 'High',
        genre: 'Jazz',
        promptState: { genre: 'Jazz', moodKeywords: ['#Converging', '#Climax'] }
    }
];

const mockMovementLearning = [
    {
        id: 'ml1',
        title: 'Smooth Floor Transition',
        dancers: '1',
        description: '스탠딩 상태에서 플로어로 미끄러지듯 전환하는 기술.',
        learningObject: '플로어워크 전환 학습용',
        preview: 'https://images.unsplash.com/photo-1502519144081-acca18599776?auto=format&fit=crop&q=80',
        promptState: { genre: 'Contemporary', peopleCount: '1', moodKeywords: ['#Floorwork', '#Transition'] }
    },
    {
        id: 'ml2',
        title: 'Weight Shift Delay',
        dancers: '2',
        description: '체중을 넘기기 직전 0.5초의 딜레이를 주어 긴장감을 유도.',
        learningObject: '무게 중심 컨트롤 및 타이밍 심화',
        preview: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80',
        promptState: { genre: 'Experimental', peopleCount: '2', moodKeywords: ['#Weight Shift', '#Delay'] }
    }
];

const useExploreStore = create((set) => ({
    latestReferences: [],
    todayDanceVids: [],
    performanceHighlights: [],
    structureRef: [],
    movementLearning: [],
    loading: false,

    fetchExploreData: async () => {
        set({ loading: true });
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({
            latestReferences: mockLatestReferences,
            todayDanceVids: mockTodayDanceVids,
            performanceHighlights: mockPerformanceHighlights,
            structureRef: mockStructureRef,
            movementLearning: mockMovementLearning,
            loading: false
        });
    }
}));

export default useExploreStore;

