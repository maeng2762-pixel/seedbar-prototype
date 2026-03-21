import { create } from 'zustand';

const curatedLibrary = {
  latestReferences: [
    {
      id: 'latest-1',
      title: 'Sadler’s Wells Digital Stage',
      category: 'Latest References',
      source: 'Sadler’s Wells',
      period: 'Recent',
      rationale: '공식 공연 기관이 공개한 최신 무용 레퍼런스를 안정적으로 참고할 수 있습니다.',
      description: 'Official digital stage archive with contemporary dance excerpts, talks, and rehearsal context.',
      image: 'https://images.unsplash.com/photo-1543360212-32a222345b59?auto=format&fit=crop&q=80',
      externalUrl: 'https://www.sadlerswells.com',
      promptState: { genre: 'Contemporary Dance', moodKeywords: ['#Stage', '#Contemporary', '#Reference'] },
    },
    {
      id: 'latest-2',
      title: 'The Royal Ballet & Opera Insights',
      category: 'Latest References',
      source: 'Royal Ballet & Opera',
      period: 'Recent',
      rationale: '공식 기관의 리허설/하이라이트 자료라 작품성과 학습 가치를 동시에 확인하기 좋습니다.',
      description: 'Performance excerpts and behind-the-scenes material from a major repertory institution.',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80',
      externalUrl: 'https://www.rbo.org.uk',
      promptState: { genre: 'Ballet', moodKeywords: ['#Precision', '#Rehearsal', '#Institutional'] },
    },
  ],
  todayDanceVids: [
    {
      id: 'today-1',
      title: 'Contemporary Performance Clip',
      category: 'Today’s Dance Video',
      source: 'Official Performance Clip',
      period: '2016-2025',
      rationale: '짧은 구간 안에 밀도 높은 움직임과 시선 설계가 있어 빠르게 참고하기 좋습니다.',
      description: 'A short, high-impact contemporary clip selected for movement density and strong visual composition.',
      image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&q=80',
      externalUrl: 'https://www.youtube.com/results?search_query=official+contemporary+dance+performance+clip',
      promptState: { genre: 'Contemporary Dance', moodKeywords: ['#Impact', '#Clip', '#Performance'] },
    },
    {
      id: 'today-2',
      title: 'Acclaimed Ballet Highlight',
      category: 'Today’s Dance Video',
      source: 'Official Ballet Channel',
      period: '2010-2025',
      rationale: '고전 형식을 현대적으로 읽는 방법을 관찰하기에 적합합니다.',
      description: 'A well-regarded ballet highlight chosen for clarity of line, timing, and stage architecture.',
      image: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?auto=format&fit=crop&q=80',
      externalUrl: 'https://www.youtube.com/results?search_query=official+ballet+highlight',
      promptState: { genre: 'Ballet', moodKeywords: ['#Line', '#Timing', '#Highlight'] },
    },
  ],
  highlights: [
    {
      id: 'highlight-1',
      title: 'Climax Cut Reference',
      category: 'Performance Highlights',
      source: 'Performance Highlight',
      period: 'Short Clip',
      rationale: '카타르시스가 강한 핵심 구간만 참고하고 싶을 때 유용합니다.',
      description: 'Focused excerpt designed to study climax timing, acceleration, and stage emphasis.',
      image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80',
      externalUrl: 'https://www.youtube.com/results?search_query=dance+performance+highlight+official',
      promptState: { genre: 'Modern Dance', moodKeywords: ['#Climax', '#Acceleration', '#Highlight'] },
    },
  ],
  structureNotes: [
    {
      id: 'structure-1',
      title: 'Canon / Counterpoint Structure',
      category: 'Choreography Structure',
      source: 'Dance Analysis Note',
      period: 'Study',
      rationale: '구조를 읽는 눈을 키워서 안무 설계에 바로 가져다 쓰기 좋습니다.',
      description: 'Reference note on canon, counterpoint, and timing offsets inside ensemble choreography.',
      image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80',
      externalUrl: 'https://scholar.google.com/scholar?q=choreography+canon+counterpoint+dance',
      promptState: { genre: 'Contemporary Dance', moodKeywords: ['#Canon', '#Counterpoint', '#Structure'] },
    },
    {
      id: 'structure-2',
      title: 'Breath-Led Phrase Architecture',
      category: 'Choreography Structure',
      source: 'Movement Research',
      period: 'Study',
      rationale: '감정 곡선과 호흡 중심 구조를 연결하는 데 도움이 됩니다.',
      description: 'A movement research angle on phrase length, stillness, and breath-led transitions.',
      image: 'https://images.unsplash.com/photo-1502519144081-acca18599776?auto=format&fit=crop&q=80',
      externalUrl: 'https://scholar.google.com/scholar?q=breath+phrase+architecture+dance',
      promptState: { genre: 'Experimental Contemporary', moodKeywords: ['#Breath', '#Phrase', '#Stillness'] },
    },
  ],
  workshops: [
    {
      id: 'workshop-1',
      title: 'Floorwork Training Session',
      category: 'Workshop / 따라하기',
      source: 'Workshop / Class',
      period: 'Training',
      rationale: '바로 따라 하면서 신체 감각을 익히기에 좋은 실용 자료입니다.',
      description: 'Practical floorwork and transition training material for repeat practice.',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80',
      externalUrl: 'https://www.youtube.com/results?search_query=official+contemporary+dance+floorwork+workshop',
      promptState: { genre: 'Contemporary Dance', moodKeywords: ['#Floorwork', '#Training', '#Technique'] },
    },
    {
      id: 'workshop-2',
      title: 'Rhythm & Body Coordination Drill',
      category: 'Workshop / 따라하기',
      source: 'Training Clip',
      period: 'Training',
      rationale: '리듬감과 분절을 동시에 연습하기에 좋습니다.',
      description: 'Short drill for rhythmic phrasing, weight shift, and upper-body coordination.',
      image: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?auto=format&fit=crop&q=80',
      externalUrl: 'https://www.youtube.com/results?search_query=dance+rhythm+coordination+workshop',
      promptState: { genre: 'Contemporary Dance', moodKeywords: ['#Rhythm', '#Coordination', '#Drill'] },
    },
  ],
  researchInsights: [
    {
      id: 'research-1',
      title: 'Dance Research Insight',
      category: 'Research Insight',
      source: 'Academic / Archive',
      period: 'Reference',
      rationale: '논문/비평 기반이라 단순 이미지 소비보다 깊은 안무 인사이트를 줍니다.',
      description: 'Research-driven prompt for reading staging, phrasing, and audience attention in dance.',
      image: 'https://images.unsplash.com/photo-1582215286596-85fb9fbd6c9c?q=80&w=800&auto=format&fit=crop',
      externalUrl: 'https://scholar.google.com/scholar?q=dance+performance+analysis+audience+attention',
      promptState: { genre: 'Contemporary Dance', moodKeywords: ['#Research', '#Analysis', '#Insight'] },
    },
  ],
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
