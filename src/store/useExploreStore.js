import { create } from 'zustand';

const curatedLibrary = {
  workflowGuides: [
    {
      id: 'workflow-1',
      title: 'AI 동선을 실제 무대에 적용하는 법',
      category: 'Workflow',
      source: 'Seedbar Guide',
      period: 'Practical',
      rationale: '생성된 스테이지 맵을 백지 상태의 무용수들에게 직관적으로 설명하는 과정을 익힙니다.',
      description: 'How to translate AI-recommended spatial paths into actual studio rehearsals with dancers.',
      image: 'https://images.unsplash.com/photo-1543360212-32a222345b59?auto=format&fit=crop&q=80',
      externalUrl: '#',
      promptState: { genre: 'Contemporary Dance', moodKeywords: ['#StageDirection', '#Blocking'] },
    },
    {
      id: 'workflow-2',
      title: '감정 곡선을 물리적 에너지로 변환하기',
      category: 'Workflow',
      source: 'Seedbar Guide',
      period: 'Practical',
      rationale: '추상적인 감정 키워드를 구체적인 에너지 수치와 근육의 긴장도로 쪼개는 방법을 제시합니다.',
      description: 'Converting abstract emotion keywords into physical energy metrics.',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80',
      externalUrl: '#',
      promptState: { genre: 'Contemporary Dance', moodKeywords: ['#EmotionCurve', '#Energy'] },
    },
  ],
  productionTips: [
    {
      id: 'prod-1',
      title: '의상 컬러로 작품 분위기를 반전시키는 공식',
      category: 'Production',
      source: 'Stage Design Tip',
      period: 'Tip',
      rationale: '조명과 의상 컬러의 보색 대비를 활용해 적은 예산으로 시각적 퀄리티를 최적화합니다.',
      description: 'Rules to shift a piece\'s mood using lighting and costume color contrast efficiently.',
      image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&q=80',
      externalUrl: '#',
      promptState: { genre: 'Contemporary Dance', moodKeywords: ['#Costume', '#Lighting', '#Visual'] },
    },
    {
      id: 'prod-2',
      title: '핀조명 하나로 공간감을 지배하는 꿀팁',
      category: 'Production',
      source: 'Lighting Masterclass',
      period: 'Tip',
      rationale: '단독 조명 세팅을 통해 솔로 구간이나 클라이맥스 직전의 정적을 극대화합니다.',
      description: 'Mastering space with a single pin spot: setting up lighting to amplify solos.',
      image: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?auto=format&fit=crop&q=80',
      externalUrl: '#',
      promptState: { genre: 'Contemporary Dance', moodKeywords: ['#Lighting', '#Focus', '#Solo'] },
    },
  ],
  inspirationNotes: [
    {
      id: 'inspire-1',
      title: '건축물에서 안무 구조를 역산출하는 방법',
      category: 'Idea Note',
      source: 'Inspiration',
      period: 'Idea',
      rationale: '공간의 형태(나선형 계단, 좁은 복도)를 움직임의 제약 조건으로 활용해 새로운 구조를 만듭니다.',
      description: 'Reverse engineering choreographic structure from architectural constraints.',
      image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80',
      externalUrl: '#',
      promptState: { genre: 'Modern Dance', moodKeywords: ['#Architecture', '#Structure', '#Space'] },
    },
  ]
};

const useExploreStore = create((set) => ({
  sections: {},
  loading: false,

  fetchExploreData: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 250));
    set({
      sections: curatedLibrary,
      loading: false,
    });
  },
}));

export default useExploreStore;
