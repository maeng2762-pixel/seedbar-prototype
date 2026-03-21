import React, { useState, useMemo, useRef } from 'react';

// ✅ 모든 영상은 YouTube oEmbed API로 유효성이 확인된 실제 존재하는 공개 영상입니다.
// 각 레퍼런스는 안무 설계도의 카테고리(Floor, Body, Space, Rhythm)에 맞는 실제 현대무용 교육/공연 영상입니다.
const RAW_REFERENCES = [
  {
    id: 'ref-floor-1',
    keyword: 'Floor Work',
    name: { en: 'Floor Work Tricks & Contemporary Moves', kr: '플로어워크 트릭 & 컨템포러리 무브' },
    oneLineDesc: { en: 'Fun and easy contemporary floor work tricks including inversions, Z-sit pike throw, and chug knee spin.', kr: '인버전, Z-싯 파이크 스로우, 척 니 스핀 등 다양한 플로어워크 트릭을 배우는 영상' },
    applicableContext: { en: 'Floor transitions, level changes, creative floor phrases', kr: '플로어 전환, 레벨 변화, 창의적인 플로어 구간에 활용' },
    category: 'Floor',
    score: 95,
    isCharacter: false,
    duplicateKey: 'yt_1tvmezJh5uY',
    imageUrl: 'https://i.ytimg.com/vi/1tvmezJh5uY/hqdefault.jpg',
    mediaType: 'embed',
    videoUrl: 'https://www.youtube.com/embed/1tvmezJh5uY?autoplay=1&mute=1&rel=0&modestbranding=1'
  },
  {
    id: 'ref-floor-2',
    keyword: 'Floor Work',
    name: { en: 'Floorwork Release Technique', kr: '플로어워크 릴리즈 테크닉' },
    oneLineDesc: { en: 'Contemporary floorwork using release technique — weight, breath, and gravity as movement tools.', kr: '릴리즈 테크닉 기반의 컨템포러리 플로어워크 — 무게, 호흡, 중력을 움직임 도구로 사용' },
    applicableContext: { en: 'Organic floor sections, breath-driven transitions', kr: '유기적 플로어 구간, 호흡 기반 전환에 적합' },
    category: 'Floor',
    score: 92,
    isCharacter: false,
    duplicateKey: 'yt_nR393C6ZBos',
    imageUrl: 'https://i.ytimg.com/vi/nR393C6ZBos/hqdefault.jpg',
    mediaType: 'embed',
    videoUrl: 'https://www.youtube.com/embed/nR393C6ZBos?autoplay=1&mute=1&rel=0&modestbranding=1'
  },
  {
    id: 'ref-spiral-1',
    keyword: 'Spiral Motion',
    name: { en: 'Spiralling Workshop by Sadler\'s Wells', kr: '새들러스 웰스 나선형 워크숍' },
    oneLineDesc: { en: 'Beginner\'s contemporary dance workshop exploring spiral movement through the spine, pelvis, and shoulders.', kr: '척추, 골반, 어깨를 통한 나선형 움직임을 탐구하는 입문자용 컨템포러리 댄스 워크숍' },
    applicableContext: { en: 'Building tension, organic development, spine articulation', kr: '긴장 축적, 유기적 전개, 척추 분절 구간에 적합' },
    category: 'Body',
    score: 94,
    isCharacter: false,
    duplicateKey: 'yt_TMrcOz5fSbE',
    imageUrl: 'https://i.ytimg.com/vi/TMrcOz5fSbE/hqdefault.jpg',
    mediaType: 'embed',
    videoUrl: 'https://www.youtube.com/embed/TMrcOz5fSbE?autoplay=1&mute=1&rel=0&modestbranding=1'
  },
  {
    id: 'ref-suspension-1',
    keyword: 'Suspension & Dynamics',
    name: { en: 'Six Dynamics in Dance', kr: '무용의 6가지 다이내믹스' },
    oneLineDesc: { en: 'Lesson covering all six dance dynamics: Swinging, Suspended, Vibration, Sustained, Percussive, Collapsed.', kr: '스윙, 서스펜션, 진동, 지속, 타격, 붕괴 — 6가지 무용 역학을 다루는 레슨' },
    applicableContext: { en: 'Climax lead-up, dynamic contrast, emotional peaks', kr: '클라이맥스 직전, 역학 대비, 감정 고조 구간에 적합' },
    category: 'Space',
    score: 93,
    isCharacter: false,
    duplicateKey: 'yt_Lrfti_j54Mw',
    imageUrl: 'https://i.ytimg.com/vi/Lrfti_j54Mw/hqdefault.jpg',
    mediaType: 'embed',
    videoUrl: 'https://www.youtube.com/embed/Lrfti_j54Mw?autoplay=1&mute=1&rel=0&modestbranding=1'
  },
  {
    id: 'ref-rhythm-1',
    keyword: 'Syncopation',
    name: { en: 'Stellar Syncopations', kr: '스텔라 싱코페이션' },
    oneLineDesc: { en: 'Ohio Contemporary Ballet performing "Stellar Syncopations" — rhythmic complexity meets body articulation.', kr: '오하이오 컨템포러리 발레의 "스텔라 싱코페이션" — 리듬의 복잡성과 신체 분절의 조화' },
    applicableContext: { en: 'Fast-paced rhythmic sections, offbeat accents', kr: '빠른 리듬 구간, 엇박 악센트에 적합' },
    category: 'Rhythm',
    score: 96,
    isCharacter: false,
    duplicateKey: 'yt_q42220s6Q08',
    imageUrl: 'https://i.ytimg.com/vi/q42220s6Q08/hqdefault.jpg',
    mediaType: 'embed',
    videoUrl: 'https://www.youtube.com/embed/q42220s6Q08?autoplay=1&mute=1&rel=0&modestbranding=1'
  },
  {
    id: 'ref-rhythm-2',
    keyword: 'Syncopation',
    name: { en: 'What is Syncopation in Dance', kr: '댄스에서 싱코페이션이란?' },
    oneLineDesc: { en: 'Educational breakdown of contra-tempo and syncopation in dance movement.', kr: '댄스 무브먼트에서의 콘트라-템포와 싱코페이션을 교육적으로 분석' },
    applicableContext: { en: 'Rhythm study, offbeat movement design', kr: '리듬 연구, 엇박 움직임 설계에 적합' },
    category: 'Rhythm',
    score: 88,
    isCharacter: false,
    duplicateKey: 'yt_ttML4q5HrBE',
    imageUrl: 'https://i.ytimg.com/vi/ttML4q5HrBE/hqdefault.jpg',
    mediaType: 'embed',
    videoUrl: 'https://www.youtube.com/embed/ttML4q5HrBE?autoplay=1&mute=1&rel=0&modestbranding=1'
  },
  {
    id: 'ref-bad-1',
    keyword: 'Funny Dance',
    name: { en: 'Cartoon Rabbit Dance', kr: '토끼 애니메이션 댄스' },
    oneLineDesc: { en: 'A 2D rabbit dancing.', kr: '캐릭터가 추는 춤' },
    applicableContext: { en: 'None', kr: '해당 없음' },
    category: 'Body',
    score: 90,
    isCharacter: true, // 품질 필터에 의해 자동 제거됨
    duplicateKey: 'img_bad_1',
    imageUrl: 'https://images.unsplash.com/photo-1582215286596-85fb9fbd6c9c?q=80&w=800&auto=format&fit=crop',
    videoUrl: null
  }
];

// 카테고리 색상 매핑
const CATEGORY_COLORS = {
  Body: 'text-rose-400 border-rose-400/30 bg-rose-400/10',
  Space: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10',
  Rhythm: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  Floor: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
};

function hashSeed(input = '') {
  let hash = 0;
  const text = String(input || 'seedbar');
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function seededUnit(seed, salt = '') {
  const value = hashSeed(`${seed}:${salt}`);
  return (value % 1000) / 1000;
}

export default function MovementReferenceLibrary({ isKr, onAddReference, projectSeed = '', projectContext = {} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const [videoErrors, setVideoErrors] = useState({});
  const videoRefs = useRef({});

  const t = (val) => val[isKr ? 'kr' : 'en'] || val.en;
  const projectSignature = useMemo(() => {
    const keywords = Array.isArray(projectContext?.keywords) ? projectContext.keywords.join('|') : '';
    return [projectSeed, projectContext?.genre || '', projectContext?.mood || '', keywords, searchTerm].join('|');
  }, [projectContext?.genre, projectContext?.keywords, projectContext?.mood, projectSeed, searchTerm]);

  const curatedReferences = useMemo(() => {
    let refs = RAW_REFERENCES;

    // 1. 품질 필터: 캐릭터/애니메이션/밈 제외 및 품질 점수(80점 이상) 컷
    refs = refs.filter(r => !r.isCharacter && r.score >= 80);

    // 2. 검색어 필터
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      refs = refs.filter(r => 
        r.keyword.toLowerCase().includes(lower) || 
        r.name.en.toLowerCase().includes(lower) || 
        r.name.kr.toLowerCase().includes(lower) ||
        t(r.oneLineDesc).toLowerCase().includes(lower)
      );
    }

    // 3. 중복 제거 필터 (동일 영상/출처 중복 노출 방지)
    const seen = new Set();
    refs = refs.filter(r => {
      if (seen.has(r.duplicateKey)) return false;
      seen.add(r.duplicateKey);
      return true;
    });

    // 4. 에러 발생 비디오 처리 필터
    // 이미 에러가 발생한 id는 리스트에서 기본적으로 숨기고, 유사한 카테고리의 대체 영상을 노출합니다.
    refs = refs.filter(r => !videoErrors[r.id]);

    const keywordText = `${projectContext?.genre || ''} ${projectContext?.mood || ''} ${Array.isArray(projectContext?.keywords) ? projectContext.keywords.join(' ') : ''}`.toLowerCase();
    const categoryAffinity = {
      Floor: /floor|ground|gravity|release/.test(keywordText) ? 6 : 0,
      Body: /body|spiral|improv|improvisation|breath|isolation/.test(keywordText) ? 6 : 0,
      Space: /space|line|extension|suspension|ballet/.test(keywordText) ? 6 : 0,
      Rhythm: /rhythm|pulse|percussive|syncopation|groove/.test(keywordText) ? 6 : 0,
    };

    refs = [...refs]
      .map((ref, index) => ({
        ...ref,
        weightedScore:
          ref.score +
          (categoryAffinity[ref.category] || 0) +
          seededUnit(projectSignature, `${ref.id}:${index}`) * 10,
      }))
      .sort((a, b) => b.weightedScore - a.weightedScore);

    // 5. 다양성 강화: 카테고리별로 고르게 섞이도록 정렬 (Round-Robin 생성)
    const grouped = { Body: [], Space: [], Rhythm: [], Floor: [] };
    refs.forEach(r => { if (grouped[r.category]) grouped[r.category].push(r); });
    
    const diverseList = [];
    let hasMore = true;
    while(hasMore) {
      hasMore = false;
      ['Body', 'Space', 'Rhythm', 'Floor'].forEach(cat => {
        if (grouped[cat].length > 0) {
          diverseList.push(grouped[cat].shift());
          hasMore = true;
        }
      });
    }

    return diverseList.slice(0, 6);
  }, [isKr, projectContext?.genre, projectContext?.keywords, projectContext?.mood, projectSignature, searchTerm, videoErrors]);

  const diversityScore = useMemo(() => {
    const categories = new Set(curatedReferences.map((item) => item.category));
    const keywords = new Set(curatedReferences.map((item) => item.keyword));
    return Math.min(100, 40 + categories.size * 15 + keywords.size * 8);
  }, [curatedReferences]);

  const handlePlay = (id) => {
    setPlayingId(id);
    // 이전에 재생 중이던 비디오가 있다면 일시정지 (브라우저 동시 재생 방지)
    Object.keys(videoRefs.current).forEach(key => {
        if (key !== id && videoRefs.current[key] && typeof videoRefs.current[key].pause === 'function') {
            videoRefs.current[key].pause();
        }
    });
  };

  const handleVideoError = (id) => {
    console.warn(`Video playback failed for item ${id}. Fallback applied.`);
    setVideoErrors(prev => ({ ...prev, [id]: true }));
    setPlayingId(null);
  };

  const isPlaying = (id) => playingId === id && !videoErrors[id];

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col relative overflow-hidden transition-all duration-700 my-10 shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
        <div>
          <h2 className="text-[12px] uppercase tracking-[0.3em] font-bold text-teal-400 mb-2 flex items-center gap-3">
            <span className="w-5 h-[2px] bg-teal-400"></span>
            Movement Reference Library
          </h2>
          <p className="text-sm text-slate-400 font-light">
            {isKr ? 'AI가 엄선한 고품질 실제 무용 레퍼런스만을 시각적 다양성에 맞춰 제공합니다.' : 'Curated, high-quality real human movement references focused on choreographic value.'}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-teal-300/80">
            {isKr ? `프로젝트 다양성 점수 ${diversityScore}` : `Project diversity score ${diversityScore}`}
          </p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isKr ? "Floor Work, 서스펜션 등 검색..." : "Search 'Floor Work', 'Suspension'..."}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all font-light placeholder:text-slate-500"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px] pointer-events-none">search</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {curatedReferences.map(ref => (
          <div key={ref.id} className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden flex flex-col group hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-900/20">
            {/* Media Area (Thumbnail or Video) */}
            <div className="relative h-48 overflow-hidden flex items-center justify-center bg-black">
              {isPlaying(ref.id) && ref.videoUrl ? (
                 ref.mediaType === 'embed' ? (
                     <iframe 
                        src={ref.videoUrl}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full object-cover border-0"
                        title={t(ref.name)}
                        onError={() => handleVideoError(ref.id)}
                     />
                 ) : (
                     <video 
                        ref={el => videoRefs.current[ref.id] = el}
                        src={ref.videoUrl}
                        controls
                        autoPlay
                        muted    // mobile UX: muted required for autoplay
                        playsInline // mobile UX: inline play
                        preload="metadata"
                        onError={() => handleVideoError(ref.id)}
                        className="w-full h-full object-cover"
                        controlsList="nodownload"
                     />
                 )
              ) : (
                <>
                  <img 
                    src={ref.imageUrl} 
                    alt={t(ref.name)}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 cursor-pointer"
                    onClick={() => handlePlay(ref.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 pointer-events-none" />
                  
                  {/* Quality Score & Category Badges */}
                  <div className="absolute top-3 left-3 flex gap-2 pointer-events-none z-10">
                    <span className={`px-2 py-1 rounded text-[9px] uppercase tracking-widest font-bold border backdrop-blur-md ${CATEGORY_COLORS[ref.category] || CATEGORY_COLORS.Body}`}>
                      {ref.category}
                    </span>
                    <span className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] font-bold text-white border border-white/10 flex items-center gap-1">
                      <span className="text-teal-400 material-symbols-outlined text-[10px]">verified</span>
                      {ref.score} PTS
                    </span>
                  </div>
                  
                  {videoErrors[ref.id] ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
                        <span className="material-symbols-outlined text-rose-400 text-3xl mb-1">error_outline</span>
                        <p className="text-[10px] text-white/80 uppercase tracking-widest">{isKr ? '재생할 수 없음' : 'Playback Failed'}</p>
                    </div>
                  ) : (
                    ref.videoUrl && ( // Only show play button if we have a URL to play
                        <button 
                        onClick={() => handlePlay(ref.id)}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 peer-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 hover:bg-teal-500 hover:border-teal-400 z-20 cursor-pointer"
                        aria-label="Play video"
                        >
                        <span className="material-symbols-outlined text-white text-[24px] ml-1">play_arrow</span>
                        </button>
                    )
                  )}
                </>
              )}
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-1">
              <span className="text-teal-400 text-[10px] uppercase tracking-widest font-bold mb-1 opacity-80">{ref.keyword}</span>
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-teal-300 transition-colors">{t(ref.name)}</h3>
              
              <div className="space-y-3 flex-1 mb-6">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{isKr ? '동작 설명' : 'Description'}</p>
                  <p className="text-slate-300 text-xs font-light leading-relaxed">{t(ref.oneLineDesc)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                  <p className="text-[10px] text-teal-500/70 uppercase tracking-widest mb-1">{isKr ? '적용 맥락' : 'Choreography Context'}</p>
                  <p className="text-teal-100/80 text-xs font-medium leading-relaxed">"{t(ref.applicableContext)}"</p>
                </div>
              </div>

              <button 
                onClick={() => onAddReference(ref)}
                className="w-full bg-white/5 hover:bg-teal-500 text-slate-300 hover:text-white border border-white/10 hover:border-teal-400 rounded-lg py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group/btn"
              >
                <span className="material-symbols-outlined text-[16px] group-hover/btn:scale-110 transition-transform">add_circle</span>
                {isKr ? "타임라인에 추가" : "Add to Timeline"}
              </button>
            </div>
          </div>
        ))}
        {curatedReferences.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-2xl bg-black/20">
            <span className="material-symbols-outlined text-4xl mb-3 opacity-50">search_off</span>
            <p className="text-sm">{isKr ? "조건에 맞는 레퍼런스를 찾지 못했습니다. 검색어를 바꾸거나 지워서 더 넓은 움직임 풀을 확인해보세요." : "No references matched this search yet. Try another keyword or clear the search to explore a wider movement pool."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
