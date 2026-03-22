import { llmProvider } from '../providers/llmProvider.js';
import { cacheService, CACHE_TTL } from '../cache/cacheService.js';
import { metricsService } from '../analytics/metricsService.js';
import { buildInternalMusicDirection, resolveExternalTracks } from './musicService.js';
import { ensureStageFlow } from './stageFlowService.js';

function rid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
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
  const isKr = language === 'KR';

  let langInstruction = "Ensure all outputs are highly professional and written in strictly elegant English.";
  if (isKr) {
    langInstruction = "모든 결과물은 극도로 전문적이고 세련된 한국어로 작성되어야 합니다. 발표용으로 완벽한 문장과 실무진이 바로 이해할 수 있는 명확한 지시어를 사용하세요.";
  }

  const system = `You are an elite choreographer and art director creating a professional presentation and production package.
Based on the provided choreography blueprint, generate a highly polished and detailed output.
${langInstruction}
Missing information should be proactively generated and filled in with professional standards.

Output JSON Format Requirements:
- pptSlides: Array of 12 objects. Each object MUST contain EXACTLY these keys:
  {
    "slideNumber": integer (1-12),
    "title": "Slide Title",
    "coreMessage": "One impactful sentence summarizing the slide's main takeaway.",
    "subDescription": ["Bullet point 1", "Bullet point 2", "Optional bullet 3"],
    "visualAid": "Description of the visual to display (e.g. 'Emotion curve chart peaking at 2:00', 'Stage map with center focus')",
    "presentationPoint": "A distinct note for the presenter emphasizing the nuance or artistic intent of this slide."
  }
  Please structure the storyline of the 12 slides exactly as follows:
  1. Title Page (Project Name, Date, Choreographer)
  2. Core Concept & Artistic Philosophy
  3. Form & Structure (Movement Logic & Duality)
  4. Overall Narrative Flow (Intro -> Development -> Climax -> Resolution)
  5. Emotion & Energy Curve (Dynamics mapping)
  6. Stage Utilization Strategy (Zones, paths)
  7. Section 1 (Intro): Setting the Scene & Primary Action
  8. Section 2 (Development): Conflict & Build-up
  9. Section 3 (Climax): Peak Contrast & Rupture
  10. Section 4 (Resolution): Ending & Breath
  11. Production Elements: Lighting, Music Texture, Costumes
  12. Artistic Statement Summary (Q&A / Closing)

- presentationScript: String containing a full presentation script. Use markers like "[Slide 1]" ensuring tone is highly engaging, narrative-driven, and perfectly matched to the slides. Avoid simply reading the bullets; expand on the "presentationPoint" and "coreMessage".
- stageDirectorDoc: String. Scene Breakdown, Cue Points, Setting changes, and specific instructions for the stage manager (e.g., floor type, entry/exit points, prop placement).
- lightingDirectorDoc: String. Detailed lighting plot sequence, color palettes, intensity changes, and mood cues.
- costumePropDoc: String. Detailed table format summarizing costumes (silhouettes, fabrics, colors, relation to movement) and props (type, timing, usage, stage location).
`;
  
  const user = JSON.stringify({
    options,
    blueprint: draftData
  });
  
  const fallback = () => ({
    pptSlides: [
      { slideNumber: 1, title: draftData?.titles?.scientific?.en || draftData?.titles?.scientific?.kr || "Project Title", content: "Auto-generated cover", designNotes: "Minimalistic logo" },
      { slideNumber: 2, title: "Artistic Statement", content: draftData?.concept?.artisticStatement?.en || draftData?.concept?.artisticStatement?.kr || "Artistic statement...", designNotes: "Dark background" }
    ],
    presentationScript: "[Slide 1]\nHello, this is the project...\n\n[Slide 2]\nThe core concept is...",
    stageDirectorDoc: "Stage Requirements\n1. Floor: Marley\n2. Cues: ...",
    lightingDirectorDoc: "Lighting Cues\n1. Intro: Spotlight...",
    costumePropDoc: "Costume & Props\n1. Costume: Minimal fits\n2. Props: 1 Chair..."
  });

  const packageData = await metricsService.withTiming('export_package_gen', () => llmProvider.highCostJson({ system, user, fallback }));
  return packageData;
}
