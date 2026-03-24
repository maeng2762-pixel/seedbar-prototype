import { llmProvider } from '../providers/llmProvider.js';
import { cacheService, CACHE_TTL } from '../cache/cacheService.js';
import { metricsService } from '../analytics/metricsService.js';
import { buildInternalMusicDirection, resolveExternalTracks } from './musicService.js';
import { ensureStageFlow } from './stageFlowService.js';

function rid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function text(value, fallback = '') {
  if (value == null) return fallback;
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    return text(value.en || value.kr || Object.values(value)[0], fallback);
  }
  return fallback;
}

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function summarizeNarrative(summary) {
  const sections = list(summary?.narrative_sections);
  if (!sections.length) return 'Intro: Establish the world.\nDevelopment: Escalate the physical stakes.\nClimax: Reach maximum kinetic intensity.\nResolution: Release into measured stillness.';
  return sections
    .map((entry, index) => `${index + 1}. ${text(entry?.section, `Section ${index + 1}`)} - ${text(entry?.description, 'Refine the movement logic and transition.')}`)
    .join('\n');
}

function buildPptFallback(summary) {
  const title = text(summary?.title, 'Seedbar Production');
  const subtitle = text(summary?.subtitle, 'Choreography Presentation');
  const oneLine = text(summary?.one_line_summary, 'A choreographic work shaped through tension, rhythm, and spatial design.');
  const dna = text(summary?.choreography_dna, 'Structured, contemporary, and visually disciplined.');
  const emotion = text(summary?.emotion_curve_summary, 'The emotional line builds gradually toward a single high-intensity release.');
  const energy = text(summary?.energy_curve_summary, 'Energy starts contained, expands through the middle, and resolves into focused calm.');
  const stage = text(summary?.stage_map_summary, 'Stage use begins centrally and expands outward as the work progresses.');
  const music = text(summary?.music_selection_reason, 'Music supports the choreographic architecture and clarifies the emotional arc.');
  const lighting = text(summary?.lighting_plan, 'Lighting sharpens the emotional turning points and supports scene readability.');
  const costume = text(summary?.costume_plan, 'Costume design prioritizes silhouette clarity and kinetic response.');
  const narrativeSlides = list(summary?.narrative_sections);

  const slides = [
    {
      slideNumber: 1,
      title,
      coreMessage: subtitle,
      subDescription: [oneLine],
      visualAid: 'Hero image / title card',
      presentationPoint: 'Introduce the work title, artistic identity, and immediate premise.',
    },
    {
      slideNumber: 2,
      title: 'Core Concept',
      coreMessage: text(summary?.artistic_statement, oneLine),
      subDescription: [oneLine, dna],
      visualAid: 'Concept board / key phrase',
      presentationPoint: 'Frame the work in one concise artistic statement.',
    },
    {
      slideNumber: 3,
      title: 'Choreographic DNA',
      coreMessage: dna,
      subDescription: [
        `Emotion Curve: ${emotion}`,
        `Energy Curve: ${energy}`,
      ],
      visualAid: 'Movement texture keywords',
      presentationPoint: 'Explain how physical logic and emotional architecture align.',
    },
    {
      slideNumber: 4,
      title: 'Narrative Flow',
      coreMessage: 'The work progresses through distinct movement states rather than literal plot.',
      subDescription: narrativeSlides.slice(0, 4).map((entry, index) => `${index + 1}. ${text(entry?.section, `Section ${index + 1}`)} - ${text(entry?.description, '')}`),
      visualAid: 'Section timeline',
      presentationPoint: 'Walk through the audience experience section by section.',
    },
    {
      slideNumber: 5,
      title: 'Emotion & Energy',
      coreMessage: emotion,
      subDescription: [energy],
      visualAid: 'Curve graph / tension arc',
      presentationPoint: 'Show where emotional and kinetic pressure peak.',
    },
    {
      slideNumber: 6,
      title: 'Stage Strategy',
      coreMessage: stage,
      subDescription: [text(summary?.stage_manager_notes, 'Technical transitions stay clean, readable, and achievable in rehearsal.')],
      visualAid: 'Stage map / blocking summary',
      presentationPoint: 'Describe the spatial rules that keep the work legible.',
    },
    {
      slideNumber: 7,
      title: 'Music Direction',
      coreMessage: music,
      subDescription: [text(summary?.music_selection_reason, 'Music choices reinforce atmosphere, pace, and audience focus.')],
      visualAid: 'Music mood board',
      presentationPoint: 'Connect the sonic logic to the choreographic intention.',
    },
    {
      slideNumber: 8,
      title: 'Lighting Plan',
      coreMessage: lighting,
      subDescription: list(summary?.lighting_cues).slice(0, 3).map((cue) => `${text(cue?.cue, 'Cue')} @ ${text(cue?.time, 'TBD')} - ${text(cue?.instruction, 'Transition to the next lighting state.')}`),
      visualAid: 'Lighting cue strip',
      presentationPoint: 'Clarify how light supports rhythm, contrast, and scene definition.',
    },
    {
      slideNumber: 9,
      title: 'Costume & Props',
      coreMessage: costume,
      subDescription: [
        text(summary?.costume_plan, 'Costume emphasizes silhouette and movement response.'),
        text(summary?.props_plan, 'Props are limited and purposeful, supporting clarity rather than clutter.'),
      ],
      visualAid: 'Costume silhouettes / prop references',
      presentationPoint: 'Explain how materials and objects extend the choreography.',
    },
    {
      slideNumber: 10,
      title: 'Production Notes',
      coreMessage: text(summary?.stage_manager_notes, 'Operational planning is built around reliable transitions and clear crew actions.'),
      subDescription: [
        `Stage Notes: ${text(summary?.stage_manager_notes, 'Cue transitions should remain precise and rehearsal-ready.')}`,
        `Technical Summary: ${text(summary?.lighting_plan, lighting)}`,
      ],
      visualAid: 'Production checklist',
      presentationPoint: 'Show that the work is artistically coherent and production-ready.',
    },
    {
      slideNumber: 11,
      title: 'Audience Impact',
      coreMessage: oneLine,
      subDescription: [text(summary?.artistic_statement, 'The work seeks clarity, intensity, and lingering resonance.')],
      visualAid: 'Audience takeaway',
      presentationPoint: 'Summarize the emotional impression and curatorial value.',
    },
    {
      slideNumber: 12,
      title: 'Closing',
      coreMessage: title,
      subDescription: ['Thank you.', 'Open to Q&A and production discussion.'],
      visualAid: 'Closing title card',
      presentationPoint: 'End with a clean recap and invitation to discussion.',
    },
  ];

  return { pptSlides: slides };
}

function buildScriptFallback(summary) {
  const title = text(summary?.title, 'Seedbar Production');
  const sections = summarizeNarrative(summary);
  return {
    presentationScript: [
      '[Slide 1]',
      `${title}. ${text(summary?.one_line_summary, 'This project is built as a performance-ready choreography blueprint.')}`,
      '',
      '[Slide 2]',
      text(summary?.artistic_statement, 'The work investigates tension, release, and spatial consequence through the body.'),
      '',
      '[Slide 3]',
      `The choreographic DNA can be summarized as: ${text(summary?.choreography_dna, 'contemporary, structured, and emotionally precise')}.`,
      `Emotionally, ${text(summary?.emotion_curve_summary, 'the work rises toward a high-pressure climax before resolving with restraint')}.`,
      `Energetically, ${text(summary?.energy_curve_summary, 'the pacing opens in control, expands through the center, and settles with intention')}.`,
      '',
      '[Slide 4]',
      sections,
      '',
      '[Slide 5]',
      `The stage strategy is simple but clear: ${text(summary?.stage_map_summary, 'space is used to make emotional distance legible')}.`,
      '',
      '[Slide 6]',
      `Musically, the selection supports the structure because ${text(summary?.music_selection_reason, 'it clarifies atmosphere, rhythm, and scene transition')}.`,
      '',
      '[Slide 7]',
      `From a production perspective, lighting is shaped around ${text(summary?.lighting_plan, 'clean cue readability and emotional contrast')}.`,
      `Costume design focuses on ${text(summary?.costume_plan, 'silhouette and movement response')}.`,
      `Props remain purposeful: ${text(summary?.props_plan, 'kept minimal so the body remains central')}.`,
      '',
      '[Slide 8]',
      `In closing, ${title} is designed not only as an idea, but as a workable production package. Thank you.`,
    ].join('\n'),
  };
}

function buildStageFallback(summary) {
  const timingRows = list(summary?.choreography_timing_table)
    .map((row) => `- ${text(row?.time, 'TBD')} | ${text(row?.action, 'Action refinement in rehearsal')}`)
    .join('\n') || '- 0:00 | Opening image and first cue';

  return {
    stageDirectorDoc: [
      `STAGE DIRECTOR DOCUMENT`,
      `Title: ${text(summary?.title, 'Seedbar Production')}`,
      '',
      `Running Summary`,
      text(summary?.one_line_summary, 'A structured contemporary work with a clear section-by-section progression.'),
      '',
      `Narrative Sections`,
      summarizeNarrative(summary),
      '',
      `Timing Table`,
      timingRows,
      '',
      `Stage Map Summary`,
      text(summary?.stage_map_summary, 'Use the stage map to preserve visual clarity and directional contrast.'),
      '',
      `Stage Manager Notes`,
      text(summary?.stage_manager_notes, 'Confirm spacing, floor condition, and preset before each run.'),
    ].join('\n'),
  };
}

function buildLightingFallback(summary) {
  const cues = list(summary?.lighting_cues)
    .map((cue) => `Cue ${text(cue?.cue, '#')} | ${text(cue?.time, 'TBD')} | ${text(cue?.instruction, 'Transition to the next state')}`)
    .join('\n') || 'Cue 1 | 0:00 | Fade in to opening state';

  return {
    lightingDirectorDoc: [
      'LIGHTING CUE SHEET',
      `Title: ${text(summary?.title, 'Seedbar Production')}`,
      '',
      `Lighting Plan`,
      text(summary?.lighting_plan, 'Lighting should define contrast, direction, and emotional threshold changes.'),
      '',
      `Cue Sheet`,
      cues,
    ].join('\n'),
  };
}

function buildCostumePropFallback(summary) {
  const costumeRows = list(summary?.costume_sheet)
    .map((row) => `- ${text(row?.character, 'Performer')} | ${text(row?.costume, 'Primary costume')} | ${text(row?.notes, 'Check fit and movement range')}`)
    .join('\n') || `- All Performers | ${text(summary?.costume_plan, 'Neutral silhouette')} | Confirm rehearsal and show presets`;
  const propRows = list(summary?.props_sheet)
    .map((row) => `- ${text(row?.prop, 'Prop')} | ${text(row?.scene, 'Scene')} | ${text(row?.notes, 'Preset and clear with crew')}`)
    .join('\n') || `- None specified | All scenes | ${text(summary?.props_plan, 'Props remain minimal and functional.')}`;

  return {
    costumePropDoc: [
      'COSTUME & PROPS SHEET',
      `Title: ${text(summary?.title, 'Seedbar Production')}`,
      '',
      'Costumes',
      costumeRows,
      '',
      'Props',
      propRows,
    ].join('\n'),
  };
}

function buildPamphletFallback(summary) {
  const copy = summary?.pamphlet_copy || {};
  return {
    pamphlet: [
      text(copy.cover, text(summary?.title, 'Seedbar Production')),
      '',
      text(copy.overview, text(summary?.one_line_summary, 'A choreography work shaped through emotional tension and spatial clarity.')),
      '',
      text(summary?.artistic_statement, 'This work explores how the body negotiates distance, rupture, and release.'),
      '',
      `Credits`,
      text(copy.credits, 'Choreography and creative development by Seedbar Studio workflow.'),
    ].join('\n'),
  };
}

export async function generateStep1Draft(input, context) {
  const key = cacheService.buildKey('step1', { userId: context.userId, ...input });
  const cached = cacheService.get(key);
  if (cached) return { ...cached, cacheHit: true };

  const system = 'Generate 2-3 choreography concept options in compact JSON. Keep text concise.';
  const fallback = () => ({
    concepts: [
      { id: rid('concept'), title: 'Fractured Gravity', narrativeDirection: 'isolation to release', movementKeywords: ['fall-recover', 'spiral', 'suspension'] },
      { id: rid('concept'), title: 'Neon Breath', narrativeDirection: 'urban pulse to stillness', movementKeywords: ['pulse', 'staccato walk', 'frozen line'] },
      { id: rid('concept'), title: 'Quiet Collision', narrativeDirection: 'duality and rupture', movementKeywords: ['counterweight', 'off-balance', 'floor drag'] },
    ],
  });

  const result = await metricsService.withTiming('step1_draft', () => llmProvider.lowCostJson({ system, user: input, fallback }));
  const payload = { step: 1, ...result };
  cacheService.set(key, payload, CACHE_TTL.step1Draft);
  return { ...payload, cacheHit: false };
}

export async function generateStep2Expansion(input, context, options = {}) {
  const key = cacheService.buildKey('step2', {
    userId: context.userId,
    selectedConceptId: input.selectedConceptId,
    theoryMode: input.theoryMode,
    competitionMode: input.competitionMode,
    section: 'full',
  });
  const cached = cacheService.get(key);
  if (cached) return { ...cached, cacheHit: true };

  const system = 'Create high-quality but bounded JSON choreography package. Include `lma.body` (body part usage), `emotionCurve.energyIntensities` (energy curve intensities), and `prompt` inside each timeline item (containing `keywords`, `connection`, `direction`). Keep section lengths compact. CRITICAL: Prevent uniform and repetitive movement styles (like generic contemporary or hip-hop). Generate sharp, culturally/conceptually diverse and genre-specific movement patterns that explicitly reflect the user\'s input genre, artistic philosophy, and theme. For the `pamphlet` object, MUST generate ALL text fields (`coverTitle`, `performanceDesc`, `artisticStatement`, `choreographerNote`, `musicCredits`, `cast`) as bilingual objects: { "en": "English text", "kr": "Korean text" }.';
  const fallback = async () => {
    const direction = await buildInternalMusicDirection(input, input.competitionMode);
    const external = await resolveExternalTracks(direction, options.allowExternalMusic);
    return {
      titles: { scientific: { en: input.selectedConceptTitle || 'Untitled Study', kr: '무제 연구' } },
      concept: {
        artisticPhilosophy: { en: 'Body writes tension through contrast and release.', kr: '신체는 대비와 해소를 통해 긴장을 기록한다.' },
        artisticStatement: { en: 'A structured contemporary score balancing precision and rupture.', kr: '정밀함과 파열을 균형시키는 구조적 컨템포러리 스코어.' },
      },
      narrative: {
        intro: { en: 'Contained kinetic seed.', kr: '응축된 운동의 씨앗.' },
        development: { en: 'Escalating directional conflict.', kr: '방향성 충돌의 증폭.' },
        climax: { en: 'Explosive release with controlled axis break.', kr: '통제된 축 붕괴와 폭발적 해방.' },
        resolution: { en: 'Breath-led stillness.', kr: '호흡 주도의 정지.' },
        lma: { space: 'Direct', weight: 'Strong', time: 'Sudden', flow: 'Bound', body: { en: 'Spine initiated motion\nFragmented upper body articulation', kr: '척추 주도 움직임\n분절된 상체 관절 활용' } },
        emotionCurve: { labels: ['Intro', 'Dev', 'Climax', 'Res'], intensities: [24, 65, 98, 42], energyIntensities: [20, 50, 100, 30] },
      },
      timing: {
        totalDuration: input.duration || '3:00',
        timeline: [
          { time: '0:00', stage: { en: 'Intro', kr: '도입' }, action: { en: 'Controlled walk', kr: '제어된 워크' }, description: { en: 'Low center setup', kr: '저중심 세팅' }, prompt: { keywords: { en: 'Grounding, Setup', kr: '접지, 세팅' }, connection: { en: 'Breath to heel', kr: '호흡에서 발뒤꿈치로' }, direction: { en: 'Forward travel', kr: '앞으로 이동' } } },
          { time: '1:05', stage: { en: 'Development', kr: '전개' }, action: { en: 'Spiral and rebound', kr: '나선과 반동' }, description: { en: 'Axis displacement', kr: '축 변위' }, prompt: { keywords: { en: 'Spiral, Shift', kr: '나선, 전환' }, connection: { en: 'Torso to arm', kr: '몸통에서 팔로' }, direction: { en: 'Off-axis tilt', kr: '축 이탈 기울기' } } },
          { time: '2:00', stage: { en: 'Climax', kr: '절정' }, action: { en: 'Jump and collapse', kr: '점프 후 붕괴' }, description: { en: 'Maximum contrast', kr: '대비 극대화' }, prompt: { keywords: { en: 'Explosive, Release', kr: '폭발, 해방' }, connection: { en: 'Full body rupture', kr: '전신 파열' }, direction: { en: 'Vertical drop', kr: '수직 낙하' } } },
        ],
      },
      flow: { flow_pattern: [] },
      music: {
        style: input.competitionMode ? 'Competition Strategic' : 'Contemporary Textural',
        soundTexture: { en: 'Cinematic tension with breathable negative space', kr: '호흡 가능한 네거티브 스페이스의 시네마틱 텐션' },
        referenceArtists: external.trend.slice(0, 2).map((x) => x.artist).join(', '),
        music_recommendations: [],
        providerRecommendations: {
          trend: external.trend.slice(0, 1).map((x) => ({ ...x, tierTag: { en: '🏆 Trend-Aware', kr: '🏆 트렌드 반영' } })),
          differentiated: external.differentiated.slice(0, 1).map((x) => ({ ...x, tierTag: { en: '⚡ Differentiated', kr: '⚡ 차별화' } })),
        },
        acousticRationale: { en: 'Internal direction first, external API only on narrowed candidates.', kr: '내부 방향성 확정 후 외부 API를 제한 호출합니다.' },
      },
      stage: {
        lighting: { en: 'Focused front key with cold color temperature (6000K), narrow side strip, dynamic intensity shifting during climax.', kr: '단위별 밝기 변화, 전면 키라이트(차가운 색온도), 좁은 측면 스트립 조명. 절정 부근에서 동적 강도 변화.' },
        costume: { en: 'Neutral fitted silhouette, asymmetric layering with lightweight fabric responding to motion.', kr: '중립적 실루엣, 비대칭 레이어드, 움직임의 잔상을 극대화하는 가벼운 소재.' },
        props: { en: 'A single modular block placed downstage right, used as an anchor point in Section 2.', kr: '보수적 형태의 모듈형 블록 1개, 무대 우측 하단 배치(섹션 2 활용).' },
        stageObjects: { en: 'Minimalistic taped grid on the floor delineating isolated zones.', kr: '고립된 구역을 설정하기 위해 무대 바닥 마스킹 테이프로 그리드 구성.' },
        spatialUse: { en: 'Start tightly in center, gradually pushing outwards to all corners, ending near the audience.', kr: '무대 중앙에서 타이트하게 시작하여 사방으로 확장하고 관객과 가까운 위치에서 종료.' },
        visualMoodPerScene: { en: 'Intro: Sterile & cold. Dev: Distorted shadows. Climax: High contrast strobes. Res: Fading ember.', kr: '도입: 무균 상태의 차가움. 전개: 왜곡된 그림자 확장. 절정: 짙은 대비의 스트로브. 결말: 희미한 불씨.' }
      },
      pamphlet: {
        coverTitle: { en: input.selectedConceptTitle || 'Seedbar Piece', kr: input.selectedConceptTitle || '시드바 피스' },
        performanceDesc: { en: 'Structured contemporary competition-ready draft.', kr: '구조적이고 완성도 높은 컨템포러리 초안.' },
        artisticStatement: { en: 'A compressed but theory-backed choreographic architecture.', kr: '이론 기반의 압축형 안무 구조.' },
        choreographerNote: { en: 'Section-level regeneration enabled for cost control.', kr: '비용 통제를 위해 섹션 단위 재생성만 허용됩니다.' },
        musicCredits: { en: 'Seedbar Music Engine', kr: '시드바 뮤직 엔진' },
        cast: { en: 'TBA', kr: '미정' },
      },
      isCompetition: Boolean(input.competitionMode),
      chanceOperation: { enabled: true },
      teamSize: Number(input.dancersCount || input.teamSize || 1),
    };
  };

  const packageData = await metricsService.withTiming('step2_expand', () => llmProvider.highCostJson({ system, user: input, fallback }));
  const teamSize = Number(input?.dancersCount || input?.teamSize || packageData?.teamSize || 1);
  const timeline = packageData?.timing?.timeline || [];
  const flowPattern = packageData?.flow?.flow_pattern || [];
  const durationLabel = packageData?.timing?.totalDuration || input?.duration || '03:00';
  const stageFlow = ensureStageFlow({
    stageFlow: packageData?.stageFlow,
    flowPattern,
    timeline,
    teamSize,
    durationLabel,
  });
  packageData.teamSize = teamSize;
  packageData.stageFlow = stageFlow;

  const payload = { step: 2, data: packageData };
  cacheService.set(key, payload, CACHE_TTL.step2Expand);
  cacheService.set(cacheService.buildKey('export:payload', { userId: context.userId, projectId: input.projectId || rid('project') }), payload, CACHE_TTL.exportPayload);
  return { ...payload, cacheHit: false };
}

export async function regenerateSection(input, context, section) {
  const key = cacheService.buildKey('step2:section', { userId: context.userId, section, selectedConceptId: input.selectedConceptId });
  const cached = cacheService.get(key);
  if (cached) return cached;

  const sectionDataMap = {
    concept: { artisticPhilosophy: { en: 'Regenerated concept block.', kr: '재생성된 컨셉 블록.' } },
    narrative: {
      intro: { en: 'Reframed intro for stronger hook.', kr: '훅 강화를 위한 도입 재구성.' },
      development: { en: 'Sharper kinetic progression.', kr: '더 선명한 운동 전개.' },
      climax: { en: 'Higher contrast release.', kr: '더 강한 대비 해소.' },
      resolution: { en: 'Compressed ending.', kr: '압축된 엔딩.' },
    },
    music: {
      acousticRationale: { en: 'Regenerated music strategy with constrained API usage.', kr: '제한된 API 사용으로 재생성된 음악 전략.' },
    },
    timing: {
      timeline: [
        { time: '0:00', stage: { en: 'Intro', kr: '도입' }, action: { en: 'Reset intro action', kr: '도입 액션 리셋' }, description: { en: 'Section regeneration result', kr: '섹션 재생성 결과' }, prompt: { keywords: { en: 'Reset, Stillness', kr: '리셋, 정지' }, connection: { en: 'Core to ground', kr: '코어에서 바닥으로' }, direction: { en: 'Inward focus', kr: '내적 집중' } } },
      ],
    },
    stage: {
      lighting: { en: 'Regenerated focused light plot', kr: '재생성된 조명 플롯' },
      costume: { en: 'Regenerated silhouette notes', kr: '재생성된 의상 실루엣' },
      props: { en: 'Regenerated props recommendation', kr: '재생성된 소품 추천' },
      stageObjects: { en: 'Regenerated stage layout', kr: '재생성된 무대 오브젝트' },
      spatialUse: { en: 'Regenerated spatial choreography', kr: '재생성된 무대 동선' },
      visualMoodPerScene: { en: 'Regenerated mood board', kr: '재생성된 시각 분위기 보드' }
    },
  };

  const payload = { section, patch: sectionDataMap[section] || {} };
  cacheService.set(key, payload, 60 * 30);
  return payload;
}

export async function generateExportPackage(draftData, options, context) {
  const language = options?.language || 'EN';
  const exportType = options?.exportType || 'full';
  const isKr = language === 'KR';

  let langInstruction = "Ensure all outputs are highly professional and written in strictly elegant English.";
  if (isKr) {
    langInstruction = "모든 텍스트는 대한민국 무용계에서 실제 사용되는 전문적이고 세련된 실무 한국어로 작성하세요. 문서의 실질적인 디테일을 추가하며, 명확하고 실행 가능한 지시어를 사용하세요.";
  }

  // 1. Create a project hash to cache results and avoid duplicate billing
  const projectHash = cacheService.buildKey('export:hash', { draftData, language });
  
  // 2. Canonical Project Summary (High Cost, High Reasoning)
  const canonicalKey = `export:canonical:${projectHash}`;
  let canonicalSummary = cacheService.get(canonicalKey);
  
  const docsToRender = {
    ppt: true,
    script: exportType === 'ppt_script' || exportType === 'full',
    stage: exportType === 'full',
    lighting: exportType === 'full',
    costumeProp: exportType === 'full',
    pamphlet: exportType === 'full',
  };

  const finalPackage = {};
  
  if (!canonicalSummary) {
    const canonicalSystem = `You are an elite choreographer and art director.
Create a "Canonical Project Summary" in JSON.
${langInstruction}
Do NOT use placeholder text like "Project Zero" or "Untitled". ALWAYS extract and logically infer from the blueprint.
If blueprint information is sparse, creatively deduce a complete, highly professional summary.

JSON Schema Requirements:
{
  "title": "",
  "subtitle": "",
  "one_line_summary": "",
  "artistic_statement": "",
  "choreography_dna": "",
  "narrative_sections": [{"section": "", "description": ""}],
  "emotion_curve_summary": "",
  "energy_curve_summary": "",
  "choreography_timing_table": [{"time": "", "action": ""}],
  "stage_map_summary": "",
  "music_selection_reason": "",
  "lighting_plan": "",
  "costume_plan": "",
  "props_plan": "",
  "stage_manager_notes": "",
  "lighting_cues": [{"cue": "", "time": "", "instruction": ""}],
  "costume_sheet": [{"character": "", "costume": "", "notes": ""}],
  "props_sheet": [{"prop": "", "scene": "", "notes": ""}],
  "pamphlet_copy": {"cover": "", "overview": "", "credits": ""}
}`;

    const canonicalFallback = () => ({
      title: draftData?.titles?.scientific?.en || draftData?.titles?.scientific?.kr || "Auto-Generated Project",
      subtitle: "A Choreographic Study",
      one_line_summary: "Movement research and composition.",
      artistic_statement: "Exploring spatial tension and release.",
      choreography_dna: "Contemporary, structured.",
      narrative_sections: [{section: "Intro", description: "Establishment"}],
      emotion_curve_summary: "Rising to climax.",
      energy_curve_summary: "Low to high.",
      choreography_timing_table: [{time: "0:00", action: "Start"}],
      stage_map_summary: "Center focus.",
      music_selection_reason: "Matches mood.",
      lighting_plan: "Dramatic.",
      costume_plan: "Minimal.",
      props_plan: "None.",
      stage_manager_notes: "Check floor.",
      lighting_cues: [{cue: "1", time: "0:00", instruction: "Blackout"}],
      costume_sheet: [{character: "All", costume: "Black", notes: "Fitted"}],
      props_sheet: [{prop: "None", scene: "All", notes: ""}],
      pamphlet_copy: {cover: "Title", overview: "Overview", credits: "TBA"}
    });

    canonicalSummary = await metricsService.withTiming('export_canonical_gen', () => llmProvider.highCostJson({ 
      system: canonicalSystem, 
      user: JSON.stringify(draftData), 
      fallback: canonicalFallback 
    }));
    cacheService.set(canonicalKey, canonicalSummary, 60 * 60 * 24); // Cache for 24 hours
  }

  // 3. Render Documents Using Concurrent Low-Cost Models
  const renderPromises = [];

  if (docsToRender.ppt) {
    const pptKey = `export:ppt:${projectHash}`;
    let pptContent = cacheService.get(pptKey);
    if (pptContent) {
      finalPackage.pptSlides = pptContent.pptSlides;
    } else {
      const pptSystem = `Render a 12-slide Pitch/Presentation Deck in JSON based ONLY on the canonical summary.
${langInstruction}
Output Format: { "pptSlides": [ { "slideNumber": 1, "title": "...", "coreMessage": "...", "subDescription": ["...", "..."], "visualAid": "...", "presentationPoint": "..." } ] }
1. Title Page (Project Name, Date, Choreographer)
2. Core Concept & Artistic Philosophy
3. Form & Structure (Movement Logic & DNA)
4. Overall Narrative Flow
5. Emotion & Energy Curve
6. Stage Utilization Strategy
7. Section 1 (Intro)
8. Section 2 (Development)
9. Section 3 (Climax)
10. Section 4 (Resolution)
11. Production Elements (Lighting/Music/Costumes)
12. Artistic Statement Summary (Q&A / Closing)`;
      const fallback = () => buildPptFallback(canonicalSummary);
      renderPromises.push(
        metricsService.withTiming('export_render_ppt', () => llmProvider.lowCostJson({ system: pptSystem, user: JSON.stringify(canonicalSummary), fallback }))
          .then(data => {
            cacheService.set(pptKey, data, 60 * 60 * 24);
            finalPackage.pptSlides = data.pptSlides;
          })
      );
    }
  }

  if (docsToRender.script) {
    const scriptKey = `export:script:${projectHash}`;
    let scriptContent = cacheService.get(scriptKey);
    if (scriptContent) {
      finalPackage.presentationScript = scriptContent.presentationScript;
    } else {
      const scriptSystem = `Render a presentation script in JSON: { "presentationScript": "full string matching slides..." }.
${langInstruction}
Expand upon the slides naturally as spoken word. Include [Slide X] markers. It must be a complete script, ready to read. Do not just list bullet points, explain them.`;
      const fallback = () => buildScriptFallback(canonicalSummary);
      // Note: In real life, script depends on PPT, but since PPT is deterministic from Canonical Summary, we can feed it the summary directly.
      renderPromises.push(
        metricsService.withTiming('export_render_script', () => llmProvider.lowCostJson({ system: scriptSystem, user: JSON.stringify(canonicalSummary), fallback }))
          .then(data => {
            cacheService.set(scriptKey, data, 60 * 60 * 24);
            finalPackage.presentationScript = data.presentationScript;
          })
      );
    }
  }

  if (docsToRender.stage) {
    const stageKey = `export:stage:${projectHash}`;
    let stageContent = cacheService.get(stageKey);
    if (stageContent) {
      finalPackage.stageDirectorDoc = stageContent.stageDirectorDoc;
    } else {
      const stageSystem = `Render a stage director document in JSON: { "stageDirectorDoc": "full string document..." }.
${langInstruction}
Focus on clear tables, running times, cast, scene breakdowns, cues, and actionable instructions. No flowery artistic text, just hard facts for the stage crew.`;
      const fallback = () => buildStageFallback(canonicalSummary);
      renderPromises.push(
        metricsService.withTiming('export_render_stage', () => llmProvider.lowCostJson({ system: stageSystem, user: JSON.stringify(canonicalSummary), fallback }))
          .then(data => {
            cacheService.set(stageKey, data, 60 * 60 * 24);
            finalPackage.stageDirectorDoc = data.stageDirectorDoc;
          })
      );
    }
  }

  if (docsToRender.lighting) {
    const lightingKey = `export:lighting:${projectHash}`;
    let lightingContent = cacheService.get(lightingKey);
    if (lightingContent) {
      finalPackage.lightingDirectorDoc = lightingContent.lightingDirectorDoc;
    } else {
      const lightingSystem = `Render a lighting cue sheet in JSON: { "lightingDirectorDoc": "full text cue sheet..." }.
${langInstruction}
Format as a tabular cue sheet string. Cue #, trigger point, intention, brightness, color, transition style, special effects. Highly functional.`;
      const fallback = () => buildLightingFallback(canonicalSummary);
      renderPromises.push(
        metricsService.withTiming('export_render_lighting', () => llmProvider.lowCostJson({ system: lightingSystem, user: JSON.stringify(canonicalSummary), fallback }))
          .then(data => {
            cacheService.set(lightingKey, data, 60 * 60 * 24);
            finalPackage.lightingDirectorDoc = data.lightingDirectorDoc;
          })
      );
    }
  }

  if (docsToRender.costumeProp) {
    const costumeKey = `export:costume:${projectHash}`;
    let costumeContent = cacheService.get(costumeKey);
    if (costumeContent) {
      finalPackage.costumePropDoc = costumeContent.costumePropDoc;
    } else {
      const costumeSystem = `Render a costume and props sheet in JSON: { "costumePropDoc": "full text document..." }.
${langInstruction}
Provide a detailed breakdown of costumes (silhouette, fabric, color, wearing order) and props (name, scene, timing, position, notes). Keep them distinctly separated in a tabulated text format.`;
      const fallback = () => buildCostumePropFallback(canonicalSummary);
      renderPromises.push(
        metricsService.withTiming('export_render_costume', () => llmProvider.lowCostJson({ system: costumeSystem, user: JSON.stringify(canonicalSummary), fallback }))
          .then(data => {
            cacheService.set(costumeKey, data, 60 * 60 * 24);
            finalPackage.costumePropDoc = data.costumePropDoc;
          })
      );
    }
  }

  if (docsToRender.pamphlet) {
    const pamphletKey = `export:pamphlet:${projectHash}`;
    let pamphletContent = cacheService.get(pamphletKey);
    if (pamphletContent) {
      finalPackage.pamphlet = pamphletContent.pamphlet;
    } else {
      const pamphletSystem = `Render a Pamphlet in JSON: { "pamphlet": "full text pamphlet..." }.
${langInstruction}
Write elegant, public-facing copy. Include: Title, 1-line summary, Artistic Intent, Choreographer Note, and Credits. Keep sentences refined and engaging. Suitable for a beautiful PDF program guide.`;
      const fallback = () => buildPamphletFallback(canonicalSummary);
      renderPromises.push(
        metricsService.withTiming('export_render_pamphlet', () => llmProvider.lowCostJson({ system: pamphletSystem, user: JSON.stringify(canonicalSummary), fallback }))
          .then(data => {
            cacheService.set(pamphletKey, data, 60 * 60 * 24);
            finalPackage.pamphlet = data.pamphlet;
          })
      );
    }
  }

  // Wait for all missing renders to finish
  await Promise.all(renderPromises);

  return finalPackage;
}
