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
  };
}

