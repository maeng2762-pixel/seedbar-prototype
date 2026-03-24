const ASSET_META = {
  lighting: {
    icon: 'highlight',
    label: { en: 'Lighting', kr: '조명' },
    focus: { en: 'Light Atmosphere', kr: '조명 분위기' },
  },
  props: {
    icon: 'chair',
    label: { en: 'Props', kr: '소품' },
    focus: { en: 'Stage Placement', kr: '무대 배치' },
  },
  costume: {
    icon: 'checkroom',
    label: { en: 'Costume', kr: '의상' },
    focus: { en: 'Silhouette & Fabric', kr: '실루엣과 소재' },
  },
};

const REFERENCE_PHOTO_KEYWORDS = {
  lighting: {
    base: ['stage lighting', 'theater spotlight', 'dance performance lighting', 'concert stage light'],
    mood: {
      dark: ['dramatic stage shadow', 'moody theater light'],
      warm: ['warm stage glow', 'amber theater lighting'],
      cold: ['blue stage wash', 'cool tone spotlight'],
      minimal: ['minimal stage lighting', 'single spotlight dance'],
      intense: ['strobe light performance', 'dynamic stage lighting'],
    },
    genre: {
      contemporary: ['contemporary dance lighting', 'modern dance stage'],
      ballet: ['ballet stage lighting', 'classical ballet spotlight'],
      hiphop: ['hip hop concert lighting', 'urban dance stage light'],
      kpop: ['kpop stage lighting', 'idol concert light show'],
    },
  },
  costume: {
    base: ['dance costume', 'performance outfit', 'stage costume design', 'dance wear fashion'],
    mood: {
      dark: ['dark dance costume', 'black stage outfit'],
      warm: ['flowing dance dress', 'warm tone costume'],
      cold: ['white dance costume', 'minimal dance outfit'],
      minimal: ['minimalist dance wear', 'simple stage outfit'],
      intense: ['dramatic dance costume', 'bold stage wear'],
    },
    genre: {
      contemporary: ['contemporary dance costume', 'modern dance outfit'],
      ballet: ['ballet tutu', 'ballet leotard costume'],
      hiphop: ['hip hop dance outfit', 'streetwear dance'],
      kpop: ['kpop stage outfit', 'idol performance costume'],
    },
  },
  props: {
    base: ['stage props', 'theater set design', 'dance stage setup', 'performance set piece'],
    mood: {
      dark: ['dark stage set', 'moody theater props'],
      warm: ['warm stage decor', 'rustic theater set'],
      cold: ['minimalist stage set', 'geometric stage props'],
      minimal: ['empty stage design', 'minimal theater set'],
      intense: ['dramatic stage set', 'elaborate theater props'],
    },
    genre: {
      contemporary: ['contemporary dance stage set', 'modern performance props'],
      ballet: ['ballet stage set', 'classical theater decor'],
      hiphop: ['urban dance set', 'street dance stage'],
      kpop: ['kpop concert stage', 'pop performance set'],
    },
  },
};

const STABLE_REFERENCE_SOURCE = bilingual('Seedbar Curated Performance Reference', 'Seedbar 큐레이션 공연 레퍼런스');

const CURATED_REFERENCE_LIBRARY = {
  lighting: [
    {
      id: 'lighting_stage_wash',
      imageUrl: '/images/stage_neon_lighting.png',
      thumbnailUrl: '/images/stage_neon_lighting.png',
      thumbnailPosition: '50% 48%',
      detailPosition: '50% 50%',
      sourceUrl: 'https://www.youtube.com/results?search_query=contemporary+dance+stage+lighting',
      tags: ['contemporary', 'stage', 'lighting', 'cool', 'intense', 'wide', 'dramatic'],
      headline: bilingual('Wide wash and haze balance', '와이드 워시와 헤이즈 밸런스'),
      note: bilingual('A real proscenium-scale lighting frame with readable audience focus and layered beams.', '객석 시점에서 집중도가 읽히는 실제 프로시니엄 규모의 조명 프레임입니다.'),
    },
    {
      id: 'lighting_overhead_rig',
      imageUrl: '/images/stage_neon_lighting.png',
      thumbnailUrl: '/images/stage_neon_lighting.png',
      thumbnailPosition: '50% 12%',
      detailPosition: '50% 18%',
      sourceUrl: 'https://www.youtube.com/results?search_query=theater+overhead+lighting+dance',
      tags: ['lighting', 'rig', 'cool', 'precision', 'minimal', 'technical'],
      headline: bilingual('Overhead rig and beam geometry', '오버헤드 리그와 빔 구조'),
      note: bilingual('Useful for reading how color temperature and angle define the vertical body line.', '색온도와 조사각이 신체의 수직 라인을 어떻게 조각하는지 읽기 좋습니다.'),
    },
    {
      id: 'lighting_silhouette_read',
      imageUrl: '/images/stage_neon_lighting.png',
      thumbnailUrl: '/images/stage_neon_lighting.png',
      thumbnailPosition: '50% 68%',
      detailPosition: '50% 58%',
      sourceUrl: 'https://www.youtube.com/results?search_query=dance+performance+silhouette+lighting',
      tags: ['lighting', 'silhouette', 'dark', 'dramatic', 'contemporary', 'contrast'],
      headline: bilingual('Silhouette and backlight read', '실루엣과 백라이트 판독'),
      note: bilingual('Good reference for seeing how haze and backlight keep the body visible without flattening the stage.', '헤이즈와 백라이트가 무대를 납작하게 만들지 않으면서 신체를 드러내는 방식을 참고하기 좋습니다.'),
    },
    {
      id: 'lighting_stage_depth',
      imageUrl: '/images/stage_neon_lighting.png',
      thumbnailUrl: '/images/stage_neon_lighting.png',
      thumbnailPosition: '16% 54%',
      detailPosition: '20% 50%',
      sourceUrl: 'https://www.youtube.com/results?search_query=theater+stage+depth+lighting',
      tags: ['lighting', 'depth', 'space', 'ensemble', 'cold', 'wide'],
      headline: bilingual('Stage depth and edge spill', '무대 깊이와 엣지 스필'),
      note: bilingual('Helps judge how side spill and depth cues separate dancers from the back wall.', '사이드 스필과 원근 단서가 무용수와 후면 벽을 어떻게 분리하는지 보여줍니다.'),
    },
  ],
  costume: [
    {
      id: 'costume_flowing_layers',
      imageUrl: '/images/contemporary_costume_concept.png',
      thumbnailUrl: '/images/contemporary_costume_concept.png',
      thumbnailPosition: '50% 36%',
      detailPosition: '50% 42%',
      sourceUrl: 'https://www.youtube.com/results?search_query=contemporary+dance+costume+rehearsal',
      tags: ['costume', 'contemporary', 'flow', 'minimal', 'elegant', 'silhouette'],
      headline: bilingual('Flowing fabric and silhouette line', '흐르는 소재와 실루엣 라인'),
      note: bilingual('Useful for checking how translucent layers move without reading as costume excess.', '비침이 있는 레이어가 과장된 의상처럼 보이지 않으면서도 어떻게 움직이는지 참고하기 좋습니다.'),
    },
    {
      id: 'costume_rehearsal_practical',
      imageUrl: '/images/contemporary_costume_concept.png',
      thumbnailUrl: '/images/contemporary_costume_concept.png',
      thumbnailPosition: '52% 56%',
      detailPosition: '50% 60%',
      sourceUrl: 'https://www.youtube.com/results?search_query=stage+rehearsal+costume+movement',
      tags: ['costume', 'rehearsal', 'practical', 'movement', 'soft', 'neutral'],
      headline: bilingual('Movement-ready rehearsal styling', '움직임 중심 리허설 스타일링'),
      note: bilingual('A strong reference for balancing beauty with rehearsal durability and repeatable movement.', '미감과 리허설 내구성, 반복 가능한 움직임을 함께 잡는 데 좋은 기준입니다.'),
    },
    {
      id: 'costume_ensemble_stage',
      imageUrl: '/images/stage_neon_lighting.png',
      thumbnailUrl: '/images/stage_neon_lighting.png',
      thumbnailPosition: '50% 60%',
      detailPosition: '50% 58%',
      sourceUrl: 'https://www.youtube.com/results?search_query=ensemble+stage+costume+contemporary+dance',
      tags: ['costume', 'ensemble', 'stage', 'intense', 'contrast', 'performance'],
      headline: bilingual('Stage-ready ensemble contrast', '무대형 앙상블 대비'),
      note: bilingual('Useful for reading costume contrast at audience distance rather than only in close-up.', '클로즈업이 아니라 객석 거리에서 의상 대비가 어떻게 읽히는지 참고할 수 있습니다.'),
    },
    {
      id: 'costume_texture_focus',
      imageUrl: '/images/contemporary_costume_concept.png',
      thumbnailUrl: '/images/contemporary_costume_concept.png',
      thumbnailPosition: '62% 24%',
      detailPosition: '58% 28%',
      sourceUrl: 'https://www.youtube.com/results?search_query=dance+costume+fabric+texture',
      tags: ['costume', 'texture', 'fabric', 'elegant', 'soft', 'artistic'],
      headline: bilingual('Fabric texture under stage light', '무대 조명 아래의 소재 질감'),
      note: bilingual('Shows how fabric weight and sheen can stay refined under practical stage lighting.', '실제 조명 아래에서 소재의 무게와 광택이 어떻게 정돈되어 보이는지 확인할 수 있습니다.'),
    },
  ],
  props: [
    {
      id: 'props_stage_architecture',
      imageUrl: '/images/stage_neon_lighting.png',
      thumbnailUrl: '/images/stage_neon_lighting.png',
      thumbnailPosition: '50% 54%',
      detailPosition: '50% 54%',
      sourceUrl: 'https://www.youtube.com/results?search_query=contemporary+dance+stage+set+design',
      tags: ['props', 'stage', 'architecture', 'contemporary', 'wide', 'ensemble'],
      headline: bilingual('Stage architecture and travel paths', '무대 구조와 이동 경로'),
      note: bilingual('Good for understanding how scenic volume leaves diagonal and frontal pathways open.', '무대 구조가 대각선과 정면 동선을 어떻게 남겨두는지 읽기 좋습니다.'),
    },
    {
      id: 'props_steps_and_levels',
      imageUrl: '/images/stage_neon_lighting.png',
      thumbnailUrl: '/images/stage_neon_lighting.png',
      thumbnailPosition: '50% 78%',
      detailPosition: '50% 74%',
      sourceUrl: 'https://www.youtube.com/results?search_query=theater+stage+levels+stairs+performance',
      tags: ['props', 'levels', 'stairs', 'depth', 'intense', 'spatial'],
      headline: bilingual('Levels, stairs, and object depth', '레벨, 계단, 오브젝트 깊이'),
      note: bilingual('Useful for seeing how raised geometry affects entry, exit, and emphasis points.', '높낮이 구조가 등장, 퇴장, 강조 지점을 어떻게 바꾸는지 참고할 수 있습니다.'),
    },
    {
      id: 'props_negative_space',
      imageUrl: '/images/stage_neon_lighting.png',
      thumbnailUrl: '/images/stage_neon_lighting.png',
      thumbnailPosition: '20% 58%',
      detailPosition: '24% 54%',
      sourceUrl: 'https://www.youtube.com/results?search_query=performance+stage+negative+space+design',
      tags: ['props', 'negative-space', 'minimal', 'quiet', 'balance', 'composition'],
      headline: bilingual('Negative space around objects', '오브젝트 주변의 네거티브 스페이스'),
      note: bilingual('A helpful frame for judging whether objects support focus instead of cluttering the stage.', '오브젝트가 시선을 보조하는지, 무대를 복잡하게 만드는지 판단하기 좋은 프레임입니다.'),
    },
    {
      id: 'props_rehearsal_scale',
      imageUrl: '/images/contemporary_costume_concept.png',
      thumbnailUrl: '/images/contemporary_costume_concept.png',
      thumbnailPosition: '50% 72%',
      detailPosition: '50% 76%',
      sourceUrl: 'https://www.youtube.com/results?search_query=rehearsal+space+object+placement+dance',
      tags: ['props', 'rehearsal', 'scale', 'practical', 'space', 'floor'],
      headline: bilingual('Scale in rehearsal-space context', '리허설 공간에서의 스케일 감'),
      note: bilingual('Useful when you need a more grounded reference for object scale and performer clearance.', '오브젝트 크기와 무용수 여유 공간을 더 현실적으로 판단할 때 도움이 됩니다.'),
    },
  ],
};

function detectMoodCategory(keywords = []) {
  const joined = keywords.join(' ').toLowerCase();
  if (/dark|shadow|noir|mystery|tension|eerie/.test(joined)) return 'dark';
  if (/warm|passionate|fire|energy|vibrant/.test(joined)) return 'warm';
  if (/cold|ice|frost|still|quiet|serene/.test(joined)) return 'cold';
  if (/minimal|subtle|restraint|empty|void/.test(joined)) return 'minimal';
  if (/intense|explosive|fierce|power|strong/.test(joined)) return 'intense';
  return 'minimal';
}

function detectGenreCategory(genre = '') {
  const g = genre.toLowerCase();
  if (/ballet|클래식|발레/.test(g)) return 'ballet';
  if (/hip.?hop|힙합|street|스트릿/.test(g)) return 'hiphop';
  if (/k.?pop|kpop|아이돌/.test(g)) return 'kpop';
  return 'contemporary';
}

function buildReferenceSearchQueries(assetType, genre, moodKeywords) {
  const cfg = REFERENCE_PHOTO_KEYWORDS[assetType] || REFERENCE_PHOTO_KEYWORDS.lighting;
  const moodCat = detectMoodCategory(moodKeywords);
  const genreCat = detectGenreCategory(genre);
  const moodTerms = cfg.mood[moodCat] || cfg.mood.minimal;
  const genreTerms = cfg.genre[genreCat] || cfg.genre.contemporary;
  return [...cfg.base.slice(0, 2), ...genreTerms.slice(0, 1), ...moodTerms.slice(0, 1)];
}

function buildReferenceSearchUrl(assetType, query) {
  const prefix = assetType === 'lighting'
    ? 'stage lighting dance performance'
    : assetType === 'props'
      ? 'stage props set design performance'
      : 'dance costume performance';
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${prefix} ${query}`)}`;
}

function buildReferenceFallbackUrl(assetType, index, title, query) {
  const accent = assetType === 'lighting'
    ? ['#5EEAD4', '#312E81']
    : assetType === 'props'
      ? ['#A78BFA', '#312E81']
      : ['#F472B6', '#3F1D2E'];
  const label = escapeSvgText(ASSET_META[assetType]?.label?.en || 'Visual');
  const safeTitle = escapeSvgText(cleanText(title).slice(0, 48) || 'Seedbar');
  const safeQuery = escapeSvgText(cleanText(query).slice(0, 52) || 'Performance reference');

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent[0]}"/>
          <stop offset="100%" stop-color="${accent[1]}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)"/>
      <rect x="90" y="90" width="1020" height="620" rx="28" fill="rgba(7,10,19,0.45)" stroke="rgba(255,255,255,0.16)"/>
      <text x="120" y="180" fill="#E2E8F0" font-family="Arial, sans-serif" font-size="30" letter-spacing="6">${label.toUpperCase()}</text>
      <text x="120" y="280" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="68" font-weight="700">${safeTitle}</text>
      <text x="120" y="360" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="34">${safeQuery}</text>
      <text x="120" y="620" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="24">Fallback visual ${index + 1}</text>
      <text x="120" y="665" fill="#94A3B8" font-family="Arial, sans-serif" font-size="22">Seedbar will keep the reference panel visible even if the external image fails.</text>
    </svg>
  `)}`;
}

function escapeSvgText(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function scoreReferenceEntry(entry, { genre, moodKeywords, narrative, stageText, queryTerms }) {
  const bucket = `${genre} ${moodKeywords.join(' ')} ${narrative} ${stageText} ${queryTerms.join(' ')}`.toLowerCase();
  return (entry.tags || []).reduce((score, tag) => (
    bucket.includes(String(tag).toLowerCase()) ? score + 1 : score
  ), 0);
}

export function buildReferencePhotos({ assetType, projectContent = {}, revision = 0 } = {}) {
  const safeAssetType = ASSET_META[assetType] ? assetType : 'lighting';
  const genre = getProjectGenre(projectContent);
  const moodKeywords = getMoodKeywords(projectContent);
  const queries = buildReferenceSearchQueries(safeAssetType, genre, moodKeywords);
  const seed = hashString(queries.join('::') + revision);
  const rand = mulberry32(seed);

  const assetLabels = {
    lighting: { en: 'Stage Lighting Reference', kr: '무대 조명 참고 사진' },
    costume: { en: 'Costume & Silhouette Reference', kr: '의상 & 실루엣 참고 사진' },
    props: { en: 'Stage Props & Set Reference', kr: '무대 소품 & 세트 참고 사진' },
  };

  const descriptions = {
    lighting: [
      bilingual('Color temperature and haze atmosphere reference', '색온도와 헤이즈 분위기 레퍼런스'),
      bilingual('Spotlight angle and shadow depth reference', '스포트라이트 각도와 그림자 깊이 참고'),
      bilingual('Overall stage wash and ambiance reference', '전체 무대 워시 및 분위기 참고'),
      bilingual('Backlight silhouette and rim light reference', '역광 실루엣 및 림 라이트 참고'),
    ],
    costume: [
      bilingual('Fabric texture and silhouette line reference', '소재 질감과 실루엣 라인 참고'),
      bilingual('Movement-ready layering and flow reference', '움직임을 고려한 레이어링 참고'),
      bilingual('Color palette and material contrast reference', '컬러 팔레트 및 소재 대비 참고'),
      bilingual('Stage-ready costume construction reference', '무대 적용 가능한 의상 구조 참고'),
    ],
    props: [
      bilingual('Stage object placement and spacing reference', '무대 오브젝트 배치와 간격 참고'),
      bilingual('Set design composition and depth reference', '세트 디자인 구도와 깊이 참고'),
      bilingual('Material finish and surface treatment reference', '소재 마감과 표면 처리 참고'),
      bilingual('Performer pathway and negative space reference', '동선 및 네거티브 스페이스 참고'),
    ],
  };

  const descs = descriptions[safeAssetType] || descriptions.lighting;
  const title = getProjectTitle(projectContent);
  const narrative = getNarrativeFocus(projectContent);
  const stageText = getStageText(projectContent, safeAssetType);
  const library = CURATED_REFERENCE_LIBRARY[safeAssetType] || CURATED_REFERENCE_LIBRARY.lighting;

  const rankedLibrary = [...library]
    .map((entry) => ({
      ...entry,
      score: scoreReferenceEntry(entry, {
        genre,
        moodKeywords,
        narrative,
        stageText,
        queryTerms: queries,
      }),
      tieBreaker: rand(),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return right.tieBreaker - left.tieBreaker;
    });

  const picked = rankedLibrary.slice(0, Math.max(3, Math.min(4, rankedLibrary.length)));

  return picked.map((entry, index) => {
    const query = queries[index % queries.length] || queries[0] || entry.headline?.en || 'stage reference';
    const fallbackUrl = buildReferenceFallbackUrl(safeAssetType, index, title, query);

    return {
      id: `ref_${safeAssetType}_${entry.id}_${index}`,
      assetType: safeAssetType,
      query,
      imageUrl: entry.detailImageUrl || entry.imageUrl,
      thumbnailUrl: entry.thumbnailUrl || entry.imageUrl,
      detailImageUrl: entry.detailImageUrl || entry.imageUrl,
      fallbackImageUrls: [entry.imageUrl, entry.thumbnailUrl].filter(Boolean),
      fallbackCoverUrl: fallbackUrl,
      thumbnailObjectPosition: entry.thumbnailPosition || '50% 50%',
      detailObjectPosition: entry.detailPosition || entry.thumbnailPosition || '50% 50%',
      searchUrl: buildReferenceSearchUrl(safeAssetType, query),
      sourceUrl: entry.sourceUrl || buildReferenceSearchUrl(safeAssetType, query),
      collectionUrl: entry.collectionUrl || null,
      categoryLabel: assetLabels[safeAssetType] || assetLabels.lighting,
      description: descs[index % descs.length],
      note: entry.note,
      headline: entry.headline,
      source: STABLE_REFERENCE_SOURCE,
      sourceLabel: STABLE_REFERENCE_SOURCE,
    };
  });
}

const PALETTE_POOLS = {
  lighting: [
    { name: 'Frost Indigo', hex: '#7784FF' },
    { name: 'Cold Haze', hex: '#9ED8FF' },
    { name: 'Amber Edge', hex: '#F4B35E' },
    { name: 'Sodium Rose', hex: '#F087B8' },
    { name: 'Smoke Cyan', hex: '#4FC9C8' },
    { name: 'Shadow Slate', hex: '#49546B' },
  ],
  props: [
    { name: 'Burnished Steel', hex: '#8B93A5' },
    { name: 'Rust Silk', hex: '#BB6C52' },
    { name: 'Concrete White', hex: '#DADDE2' },
    { name: 'Noir Fabric', hex: '#3B4050' },
    { name: 'Deep Moss', hex: '#55756A' },
    { name: 'Muted Gold', hex: '#BC9862' },
  ],
  costume: [
    { name: 'Chalk White', hex: '#E9E8E3' },
    { name: 'Carbon Black', hex: '#1F2430' },
    { name: 'Dust Lavender', hex: '#B5A9D6' },
    { name: 'Petrol Blue', hex: '#3D6C7B' },
    { name: 'Wine Plum', hex: '#7E4158' },
    { name: 'Silver Mesh', hex: '#B8C2D1' },
  ],
};

function bilingual(en, kr) {
  return { en, kr };
}

function getLocalized(value, language = 'EN') {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (language === 'KR') return value.kr || value.en || '';
    return value.en || value.kr || '';
  }
  return String(value);
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function hashString(input) {
  let hash = 2166136261;
  const text = String(input || '');
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function pickUnique(rand, items, count) {
  const pool = [...items];
  const results = [];
  while (pool.length && results.length < count) {
    const index = Math.floor(rand() * pool.length);
    results.push(pool.splice(index, 1)[0]);
  }
  return results;
}

function normalizeKeywords(value) {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map(cleanText).filter(Boolean);
  return [];
}

function getProjectTitle(content = {}) {
  return cleanText(
    content?.pamphlet?.coverTitle
    || getLocalized(content?.titles?.scientific)
    || content?.projectName
    || 'Untitled Project'
  );
}

function getProjectGenre(content = {}) {
  return cleanText(content?.seedbarInput?.genre || content?.genre || 'Contemporary Dance');
}

function getMoodKeywords(content = {}) {
  const keywords = normalizeKeywords(content?.seedbarInput?.keywords || content?.moodKeywords || content?.mood);
  if (keywords.length) return keywords;
  const concept = cleanText(getLocalized(content?.concept?.artisticPhilosophy));
  return concept ? concept.split(/[,.]/).map(cleanText).filter(Boolean).slice(0, 3) : ['immersive', 'kinetic'];
}

function getNarrativeFocus(content = {}) {
  return cleanText(
    getLocalized(content?.concept?.artisticStatement)
    || getLocalized(content?.narrative?.development)
    || getLocalized(content?.narrative?.intro)
    || 'A precise yet emotional stage language.'
  );
}

function getStageText(content = {}, assetType) {
  return cleanText(getLocalized(content?.stage?.[assetType]));
}

function buildSeedString(content, assetType, revision) {
  return [
    getProjectTitle(content),
    getProjectGenre(content),
    getMoodKeywords(content).join('|'),
    getNarrativeFocus(content),
    getStageText(content, 'lighting'),
    getStageText(content, 'props'),
    getStageText(content, 'costume'),
    assetType,
    revision,
  ].join('::');
}

function buildSceneMoments(content = {}, palette = []) {
  const timeline = Array.isArray(content?.timing?.timeline) ? content.timing.timeline : [];
  const labels = timeline.length
    ? timeline.slice(0, 3).map((item, index) => cleanText(item?.label || item?.section || item?.title || `Section ${index + 1}`))
    : ['Opening', 'Development', 'Climax'];

  return labels.map((label, index) => ({
    id: `moment_${index + 1}`,
    label: bilingual(label, label),
    cue: index === 0
      ? bilingual(`Set the spatial tone with ${palette[0]?.name || 'cool wash'} and restrained motion.`, `${palette[0]?.name || '차가운 워시'}로 무대의 첫 인상을 정리하고 움직임을 절제합니다.`)
      : index === 1
        ? bilingual(`Open the depth of field and reveal material texture without losing performer focus.`, '무대의 깊이를 열고 재질의 질감을 드러내되 무용수 집중도는 유지합니다.')
        : bilingual(`Land the image with a stronger silhouette read and a memorable final frame.`, '더 강한 실루엣 판독과 선명한 최종 프레임으로 이미지를 마무리합니다.'),
  }));
}

function buildLightBeams(rand, palette, emphasis = 1) {
  return Array.from({ length: 3 }, (_, index) => ({
    id: `beam_${index + 1}`,
    x: 18 + index * 28 + Math.round(rand() * 8 - 4),
    width: 20 + Math.round(rand() * 12),
    opacity: clamp(0.18 + rand() * 0.18 + emphasis * 0.06, 0.18, 0.52),
    skew: Math.round(rand() * 20 - 10),
    color: palette[index % palette.length]?.hex || '#ffffff',
  }));
}

function buildPropLayout(rand, palette) {
  const types = ['platform', 'frame', 'fabric', 'block'];
  return Array.from({ length: 3 }, (_, index) => ({
    id: `prop_${index + 1}`,
    type: types[index % types.length],
    x: 16 + index * 24 + Math.round(rand() * 6),
    y: 58 + Math.round(rand() * 18),
    width: 12 + Math.round(rand() * 10),
    height: 8 + Math.round(rand() * 12),
    rotation: Math.round(rand() * 16 - 8),
    color: palette[index % palette.length]?.hex || '#aaaaaa',
  }));
}

function buildSilhouetteLayers(rand, palette) {
  return Array.from({ length: 3 }, (_, index) => ({
    id: `layer_${index + 1}`,
    width: 26 + index * 8 + Math.round(rand() * 3),
    height: 44 + index * 6 + Math.round(rand() * 6),
    offsetX: Math.round(rand() * 8 - 4),
    offsetY: index * 4,
    rotation: Math.round(rand() * 12 - 6),
    opacity: clamp(0.24 + index * 0.14, 0.24, 0.68),
    color: palette[index % palette.length]?.hex || '#dddddd',
  }));
}

function buildPlacementNotes(assetType, title, genre) {
  if (assetType === 'lighting') {
    return [
      bilingual('Front key remains clean so facial focus stays readable in a real theater.', '실제 극장에서 얼굴 포커스가 무너지지 않도록 전면 키라이트는 깨끗하게 유지합니다.'),
      bilingual('Side haze is added only enough to reveal body contour and negative space.', '측면 헤이즈는 신체 윤곽과 여백이 보일 만큼만 얹습니다.'),
      bilingual(`The look supports ${genre} phrasing without turning the stage into a concert set.`, `${genre} 안무 호흡을 살리되 무대가 콘서트 세트처럼 보이지 않게 제어합니다.`),
    ];
  }

  if (assetType === 'props') {
    return [
      bilingual(`Props are staged as functional anchors for ${title}, not decorative clutter.`, `${title}의 소품은 장식이 아니라 기능적 앵커로 배치합니다.`),
      bilingual('Each object leaves enough travel space for transitions and diagonal runs.', '전환과 대각선 동선을 위해 각 오브젝트 사이에 충분한 이동 폭을 둡니다.'),
      bilingual('Heights stay low-to-mid so the composition reads like a production still, not a game level.', '높이는 낮음-중간 레벨에 머물러 실제 공연 스틸처럼 읽히게 하고 게임 맵처럼 보이지 않게 합니다.'),
    ];
  }

  return [
    bilingual('The silhouette is built to read from the audience, not only in close-up.', '실루엣은 클로즈업보다 객석 시점에서 먼저 읽히도록 설계합니다.'),
    bilingual('Fabric contrast comes from light response and weight, avoiding costume-drama excess.', '소재 대비는 빛 반응과 무게감에서 만들고 과장된 코스튬 드라마는 피합니다.'),
    bilingual(`The look remains stage-practical for ${genre} movement and repeated rehearsals.`, `${genre} 움직임과 반복 리허설을 감당할 수 있는 실무형 의상 톤을 유지합니다.`),
  ];
}

function buildMaterialNotes(assetType, palette) {
  if (assetType === 'lighting') {
    return [
      bilingual(`Base wash: ${palette[0]?.name || 'Cold wash'}`, `기본 워시: ${palette[0]?.name || '차가운 워시'}`),
      bilingual(`Accent beam: ${palette[1]?.name || 'Focused edge light'}`, `포인트 빔: ${palette[1]?.name || '집중 엣지 라이트'}`),
      bilingual(`Haze response: ${palette[2]?.name || 'Soft atmosphere'}`, `헤이즈 반응: ${palette[2]?.name || '부드러운 대기층'}`),
    ];
  }

  if (assetType === 'props') {
    return [
      bilingual(`Primary finish: ${palette[0]?.name || 'Matte finish'}`, `주요 마감: ${palette[0]?.name || '매트 마감'}`),
      bilingual(`Secondary texture: ${palette[1]?.name || 'Textile wrap'}`, `보조 텍스처: ${palette[1]?.name || '패브릭 랩'}`),
      bilingual(`Highlight edge: ${palette[2]?.name || 'Controlled metallic edge'}`, `하이라이트 엣지: ${palette[2]?.name || '절제된 금속 엣지'}`),
    ];
  }

  return [
    bilingual(`Outer shell: ${palette[0]?.name || 'Structured weave'}`, `외곽 쉘: ${palette[0]?.name || '구조적 위브'}`),
    bilingual(`Underlayer: ${palette[1]?.name || 'Soft stretch jersey'}`, `언더레이어: ${palette[1]?.name || '유연한 저지'}`),
    bilingual(`Reflective accent: ${palette[2]?.name || 'Mesh sheen'}`, `반사 포인트: ${palette[2]?.name || '메시 광택'}`),
  ];
}

function buildSummary(assetType, title, genre, narrative, palette) {
  if (assetType === 'lighting') {
    return bilingual(
      `${title} uses a proscenium-ready lighting atmosphere built from ${palette[0]?.name || 'cool wash'} and ${palette[1]?.name || 'angled sidelight'} to frame ${genre.toLowerCase()} movement with cinematic clarity.`,
      `${title}의 조명은 ${palette[0]?.name || '차가운 워시'}와 ${palette[1]?.name || '사이드 라이트'}를 기반으로, ${genre} 움직임을 시네마틱하게 선명하게 보이도록 설계되었습니다.`,
    );
  }

  if (assetType === 'props') {
    return bilingual(
      `${title} stages props as minimal but believable anchors, allowing the choreography to keep its realism while sharpening the narrative of ${narrative.toLowerCase()}.`,
      `${title}의 소품은 최소하지만 설득력 있는 무대 앵커로 배치되어, ${narrative}의 서사를 더 선명하게 만들면서도 안무의 현실감을 유지합니다.`,
    );
  }

  return bilingual(
    `${title} shapes costume as a performance-ready silhouette: tactile, audience-readable, and tuned to the emotional contour of ${narrative.toLowerCase()}.`,
    `${title}의 의상은 관객 시점에서 읽히는 실루엣과 촉감이 느껴지는 소재를 중심으로, ${narrative}의 감정 곡선에 맞춰 설계되었습니다.`,
  );
}

function buildPrompt(assetType, title, genre, moodKeywords, stageText, narrative) {
  const keywords = moodKeywords.join(', ');
  if (assetType === 'lighting') {
    return bilingual(
      `Realistic theater lighting preview for "${title}", ${genre}, mood ${keywords}. Emphasize stage haze, believable front key, sculpted sidelight, cinematic but production-ready atmosphere. Reference stage note: ${stageText || narrative}.`,
      `"${title}"용 현실적인 극장 조명 프리뷰. 장르 ${genre}, 무드 ${keywords}. 헤이즈, 읽기 좋은 전면 키라이트, 조형적인 사이드라이트, 실제 제작 가능한 시네마틱 분위기를 강조합니다. 참고 메모: ${stageText || narrative}.`,
    );
  }
  if (assetType === 'props') {
    return bilingual(
      `Realistic stage props visualization for "${title}", ${genre}, mood ${keywords}. Show grounded object placement, clear performer pathways, production-still realism. Reference stage note: ${stageText || narrative}.`,
      `"${title}"용 현실적인 무대 소품 시각화. 장르 ${genre}, 무드 ${keywords}. 안정적인 오브젝트 배치, 분명한 동선, 실제 공연 스틸 같은 현실감을 보여줍니다. 참고 메모: ${stageText || narrative}.`,
    );
  }
  return bilingual(
    `Realistic stage costume concept for "${title}", ${genre}, mood ${keywords}. Show silhouette clarity, tactile fabric response, and movement-ready layering. Reference stage note: ${stageText || narrative}.`,
    `"${title}"용 현실적인 공연 의상 콘셉트. 장르 ${genre}, 무드 ${keywords}. 명확한 실루엣, 촉감이 느껴지는 소재 반응, 움직임을 견디는 레이어링을 보여줍니다. 참고 메모: ${stageText || narrative}.`,
  );
}

export function getStageAssetMeta(assetType) {
  return ASSET_META[assetType] || ASSET_META.lighting;
}

export function getSavedStageVisualization(content = {}, assetType) {
  return content?.visualizations3d?.[assetType] || null;
}

export function buildStageVisualization({ assetType, projectContent = {}, revision = 0 } = {}) {
  const safeAssetType = ASSET_META[assetType] ? assetType : 'lighting';
  const seed = hashString(buildSeedString(projectContent, safeAssetType, revision));
  const rand = mulberry32(seed);

  const title = getProjectTitle(projectContent);
  const genre = getProjectGenre(projectContent);
  const moodKeywords = getMoodKeywords(projectContent);
  const narrative = getNarrativeFocus(projectContent);
  const stageText = getStageText(projectContent, safeAssetType);
  const palette = pickUnique(rand, PALETTE_POOLS[safeAssetType], 3);
  const emphasis = safeAssetType === 'lighting' ? 1 : safeAssetType === 'props' ? 0.72 : 0.84;

  return {
    id: `viz_${safeAssetType}_${seed.toString(16)}`,
    assetType: safeAssetType,
    revision,
    generatedAt: new Date().toISOString(),
    title: bilingual(`${title} ${getStageAssetMeta(safeAssetType).label.en} Visual`, `${title} ${getStageAssetMeta(safeAssetType).label.kr} 비주얼`),
    focusTitle: getStageAssetMeta(safeAssetType).focus,
    summary: buildSummary(safeAssetType, title, genre, narrative, palette),
    prompt: buildPrompt(safeAssetType, title, genre, moodKeywords, stageText, narrative),
    realismNote: bilingual(
      'Built to resemble a production reference frame: practical, atmospheric, and stage-ready.',
      '실제 공연 레퍼런스 프레임처럼 보이도록, 실무적이고 분위기 있으며 무대 적용 가능한 방향으로 구성했습니다.',
    ),
    palette,
    sceneMoments: buildSceneMoments(projectContent, palette),
    placementNotes: buildPlacementNotes(safeAssetType, title, genre),
    materialNotes: buildMaterialNotes(safeAssetType, palette),
    lightBeams: buildLightBeams(rand, palette, emphasis),
    propLayout: buildPropLayout(rand, palette),
    silhouetteLayers: buildSilhouetteLayers(rand, palette),
    projectAnchors: [
      bilingual(`Genre: ${genre}`, `장르: ${genre}`),
      bilingual(`Mood Keywords: ${moodKeywords.join(', ')}`, `무드 키워드: ${moodKeywords.join(', ')}`),
      bilingual(`Narrative Cue: ${narrative}`, `서사 단서: ${narrative}`),
      bilingual(`Stage Note: ${stageText || 'Derived from current choreography stage description.'}`, `무대 메모: ${stageText || '현재 안무설계도의 무대 설명을 기반으로 도출.'}`),
    ],
    referencePhotos: buildReferencePhotos({ assetType: safeAssetType, projectContent, revision }),
  };
}
