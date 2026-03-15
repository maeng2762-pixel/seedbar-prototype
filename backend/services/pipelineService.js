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

  const system = 'Create high-quality but bounded JSON choreography package. Keep section lengths compact.';
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
        lma: { space: 'Direct', weight: 'Strong', time: 'Sudden', flow: 'Bound' },
        emotionCurve: { labels: ['Intro', 'Dev', 'Climax', 'Res'], intensities: [24, 65, 98, 42] },
      },
      timing: {
        totalDuration: input.duration || '3:00',
        timeline: [
          { time: '0:00', stage: { en: 'Intro', kr: '도입' }, action: { en: 'Controlled walk', kr: '제어된 워크' }, description: { en: 'Low center setup', kr: '저중심 세팅' } },
          { time: '1:05', stage: { en: 'Development', kr: '전개' }, action: { en: 'Spiral and rebound', kr: '나선과 반동' }, description: { en: 'Axis displacement', kr: '축 변위' } },
          { time: '2:00', stage: { en: 'Climax', kr: '절정' }, action: { en: 'Jump and collapse', kr: '점프 후 붕괴' }, description: { en: 'Maximum contrast', kr: '대비 극대화' } },
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
        lighting: 'Focused front key + narrow side strip',
        costume: 'Neutral fitted silhouette with asymmetry',
        props: 'Minimal / optional',
      },
      pamphlet: {
        coverTitle: input.selectedConceptTitle || 'Seedbar Piece',
        performanceDesc: 'Structured contemporary competition-ready draft.',
        artisticStatement: { en: 'A compressed but theory-backed choreographic architecture.', kr: '이론 기반의 압축형 안무 구조.' },
        choreographerNote: { en: 'Section-level regeneration enabled for cost control.', kr: '비용 통제를 위해 섹션 단위 재생성만 허용됩니다.' },
        musicCredits: 'Seedbar Music Engine',
        cast: 'TBA',
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
        { time: '0:00', stage: { en: 'Intro', kr: '도입' }, action: { en: 'Reset intro action', kr: '도입 액션 리셋' }, description: { en: 'Section regeneration result', kr: '섹션 재생성 결과' } },
      ],
    },
    stage: {
      lighting: 'Regenerated focused light plot',
      costume: 'Regenerated silhouette notes',
      props: 'Regenerated props recommendation',
    },
  };

  const payload = { section, patch: sectionDataMap[section] || {} };
  cacheService.set(key, payload, 60 * 30);
  return payload;
}
