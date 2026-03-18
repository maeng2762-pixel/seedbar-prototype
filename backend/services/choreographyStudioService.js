import { llmProvider } from '../providers/llmProvider.js';
import { choreographyProjectModel } from '../models/choreographyProjectModel.js';
import { ensureStageFlow } from './stageFlowService.js';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

function getSectionContent(content, section) {
  const resolvedSection = section === 'formation' ? 'movement' : section;
  if (resolvedSection === 'story') {
    return {
      storyConcept: content?.concept || {},
      narrativeArc: content?.narrative || {},
    };
  }
  if (resolvedSection === 'movement') {
    return {
      choreographyStructure: content?.timing || {},
      movementVocabulary: content?.flow || {},
      formationDesign: content?.flow?.flow_pattern || [],
    };
  }
  if (resolvedSection === 'music') return content?.music || {};
  if (resolvedSection === 'stage') return content?.stage || {};
  if (resolvedSection === 'artist_note') return content?.pamphlet?.choreographerNote || content?.pamphlet || {};
  return {};
}

function mergeSectionContent(content, section, newContent) {
  const resolvedSection = section === 'formation' ? 'movement' : section;
  const next = clone(content);
  if (resolvedSection === 'story') {
    next.concept = newContent?.storyConcept || next.concept;
    next.narrative = { ...(next.narrative || {}), ...(newContent?.narrativeArc || {}) };
  }
  if (resolvedSection === 'movement') {
    next.timing = { ...(next.timing || {}), ...(newContent?.choreographyStructure || {}) };
    next.flow = { ...(next.flow || {}), ...(newContent?.movementVocabulary || {}) };
    if (Array.isArray(newContent?.formationDesign)) {
      next.flow = { ...(next.flow || {}), flow_pattern: newContent.formationDesign };
    }
  }
  if (resolvedSection === 'music') next.music = { ...(next.music || {}), ...(newContent || {}) };
  if (resolvedSection === 'stage') next.stage = { ...(next.stage || {}), ...(newContent || {}) };
  if (resolvedSection === 'artist_note') {
    next.pamphlet = { ...(next.pamphlet || {}), choreographerNote: newContent?.choreographerNote || newContent };
  }
  return next;
}

function buildBeatMarkers(content) {
  const timeline = Array.isArray(content?.timing?.timeline) ? content.timing.timeline : [];
  const emotionLabels = ['Intro', 'Build', 'Drop', 'Outro'];
  if (!timeline.length) return [];
  return timeline.slice(0, 4).map((item, index) => ({
    id: `beat_${index + 1}`,
    time: item?.time || '0:00',
    label: emotionLabels[index] || `Beat ${index + 1}`,
    section: typeof item?.stage === 'object' ? (item.stage.en || item.stage.kr || '') : (item?.stage || ''),
  }));
}

function buildDancerRoles(content, project) {
  const teamSize = Math.max(1, Number(content?.teamSize || content?.seedbarInput?.teamSize || project?.teamSize || 1));
  const presets = ['leader', 'counterpoint', 'support', 'accent', 'anchor', 'orbit'];
  const focusMap = [
    ['explosive jumps', 'sharp direction change'],
    ['slow suspension', 'grounded transitions'],
    ['off-axis tilt', 'recovery phrases'],
    ['spiral reach', 'tempo contrast'],
    ['breath-led initiation', 'weighted fall'],
    ['peripheral sweep', 'traveling cross'],
  ];

  return Array.from({ length: teamSize }, (_, idx) => ({
    dancerId: `D${idx + 1}`,
    role: presets[idx] || 'ensemble',
    movementFocus: focusMap[idx] || ['ensemble timing', 'spatial balance'],
    stageResponsibility: idx === 0 ? 'front stage emphasis' : idx % 2 === 0 ? 'mid stage visual balance' : 'cross-stage momentum',
  }));
}

export async function regenerateSectionWithContext({ project, section, context }) {
  const current = clone(project.currentContent);
  const resolvedSection = section === 'formation' ? 'movement' : section;
  const existing = getSectionContent(current, resolvedSection);

  const fallback = () => {
    const ts = new Date().toISOString().slice(11, 16);
    if (resolvedSection === 'story') {
      return {
        storyConcept: {
          artisticPhilosophy: {
            en: `Regenerated story concept (${ts}) with stronger narrative hook and cleaner thematic focus.`,
            kr: `더 강한 서사 훅과 명확한 주제 집중으로 재생성된 스토리 컨셉 (${ts}).`,
          },
          artisticStatement: {
            en: 'The body travels from restraint to rupture through escalating symbolic pressure.',
            kr: '신체는 상징적 압박의 증폭을 통해 억압에서 파열로 이동한다.',
          },
        },
        narrativeArc: {
          intro: { en: 'Compressed opening with hidden instability.', kr: '숨겨진 불안정성을 가진 압축 도입.' },
          development: { en: 'Directional conflict expands across space.', kr: '방향성 충돌이 공간으로 확장된다.' },
          climax: { en: 'Axis break and rebound for high-impact memory.', kr: '강한 잔상을 위한 축 붕괴와 반동.' },
          resolution: { en: 'Breath-centric deceleration with unresolved residue.', kr: '미해결 잔류감을 남기는 호흡 중심 감속.' },
        },
      };
    }

    if (resolvedSection === 'movement') {
      return {
        choreographyStructure: {
          totalDuration: current?.timing?.totalDuration || '03:00',
          timeline: [
            { time: '0:00', stage: { en: 'Intro', kr: '도입' }, action: { en: 'Weighted walk', kr: '무게감 있는 워크' }, description: { en: 'Controlled low center', kr: '통제된 저중심' } },
            { time: '1:10', stage: { en: 'Build', kr: '전개' }, action: { en: 'Spiral shift', kr: '스파이럴 전환' }, description: { en: 'Asymmetric acceleration', kr: '비대칭 가속' } },
            { time: '2:05', stage: { en: 'Climax', kr: '절정' }, action: { en: 'Jump-collapse', kr: '점프-붕괴' }, description: { en: 'Impact contrast', kr: '충격 대비' } },
          ],
        },
        movementVocabulary: {
          flow_pattern: [
            { t: 0, x: 0.2, y: 0.4 },
            { t: 1, x: 0.4, y: 0.6 },
            { t: 2, x: 0.7, y: 0.3 },
          ],
        },
        formationDesign: [
          { name: 'Diagonal Split', note: 'Build contrast through asymmetry' },
          { name: 'Unbalanced Cluster', note: 'Pressure before release' },
        ],
      };
    }

    if (resolvedSection === 'music') {
      return {
        style: 'Textural Counterpoint',
        soundTexture: {
          en: `Regenerated music texture (${ts}): granular cello, restrained industrial pulse, and negative space.`,
          kr: `재생성된 음악 질감 (${ts}): 입자감 첼로, 절제된 인더스트리얼 펄스, 네거티브 스페이스.`,
        },
        acousticRationale: {
          en: 'Supports movement readability while preserving jury-impact tension shifts.',
          kr: '움직임 가독성을 유지하면서 심사 임팩트용 긴장 전환을 지원한다.',
        },
      };
    }

    if (resolvedSection === 'stage') {
      return {
        lighting: 'Side-strip haze + narrow front key for sculpted silhouettes',
        costume: 'Asymmetric monochrome layers with tactile contrast',
        props: 'Minimal object with delayed reveal timing',
      };
    }

    return {
      choreographerNote: {
        en: `Regenerated artist note (${ts}): This piece studies controlled imbalance as a social and anatomical metaphor.`,
        kr: `재생성 아티스트 노트 (${ts}): 이 작품은 통제된 불균형을 사회적/해부학적 은유로 탐구한다.`,
      },
    };
  };

  const system = 'Return JSON only. Regenerate only one choreography section while preserving project context and style continuity. If regenerating movement, include `prompt` in timeline items with `keywords`, `connection`, and `direction`. If regenerating story, include `emotionCurve.energyIntensities` and `lma.body`.';
  const generated = await llmProvider.lowCostJson({
    system,
    user: {
      section,
      projectTitle: project.title,
      existingSection: existing,
      context: {
        plan: context.plan,
        competitionMode: Boolean(current?.isCompetition),
      },
    },
    fallback,
  });

  const normalized = generated?.content ? generated.content : generated;
  const merged = mergeSectionContent(current, resolvedSection, normalized);
  choreographyProjectModel.updateProjectContent(project.id, merged);
  return { section: resolvedSection, content: getSectionContent(merged, resolvedSection), project: merged };
}

export async function tuneProjectBySliders({ project, sliders }) {
  const current = clone(project.currentContent);
  const s = {
    intensity: Number(sliders?.intensity ?? 50),
    darkness: Number(sliders?.darkness ?? 50),
    speed: Number(sliders?.speed ?? 50),
    emotion: Number(sliders?.emotion ?? 50),
  };

  const system = `You are an AI Choreography tuning assistant. You will be provided with a choreography project's current JSON data, and tuning sliders (0-100) for Intensity, Darkness, Speed, and Emotion.
Your job is to slightly modify the existing text fields (in both 'en' and 'kr' if they exist) based on these slider values. 
Also, you must return a "tuneSummary" that contains a brief bulleted list of what changed (e.g. "감정 강도가 더 높아졌습니다.", "움직임이 더 날카로워졌습니다").

Please return ONLY a valid JSON object matching this exact structure:
{
  "tuneSummary": { "en": "- Increased emotional intensity\\n- Sharpened movement prompts", "kr": "- 감정 강도가 더 높아졌습니다.\\n- 안무 움직임 지시가 더 날카로워졌습니다." },
  "storyConcept": { ... modified from input },
  "narrativeArc": { ... modified from input },
  "music": { ... modified from input },
  "stage": { ... modified from input },
  "artistNote": { ... modified from input },
  "choreographyStructure": { ... modified from input },
  "movementVocabulary": { ... modified from input },
  "formationDesign": [ ... modified from input ]
}

Keep the core structure identical to the input, just adjust the descriptive text, tone, and adjectives to reflect the new mood sliders. Keep variations subtle but noticeable.`;

  const fallback = () => {
    // If AI fails, use naive adjustment as fallback
    const tone = s.darkness > 70 ? 'heavy and ominous' : s.darkness < 30 ? 'bright and open' : 'balanced tension';
    const tempo = s.speed > 65 ? 'fast accents' : s.speed < 35 ? 'sustained tempo' : 'moderate pacing';
    const dynamics = s.intensity > 70 ? 'explosive dynamic range' : 'controlled dynamic range';
    const krTone = s.darkness > 70 ? '무겁고 불길한' : s.darkness < 30 ? '밝고 열린' : '균형잡힌 긴장감';

    const patched = clone(current);
    patched.narrative = {
      ...(patched.narrative || {}),
      development: {
        en: `Tuned development emphasizes ${dynamics} with ${tempo} under a ${tone} atmosphere.`,
        kr: `${krTone} 분위기에서 ${tempo}와 ${dynamics}를 강조한 전개로 조정되었습니다.`,
      },
    };
    patched.music = {
      ...(patched.music || {}),
      acousticRationale: {
        en: `Sliders applied: intensity ${s.intensity}, darkness ${s.darkness}, speed ${s.speed}, emotion ${s.emotion}.`,
        kr: `슬라이더 적용 결과: 강도 ${s.intensity}, 어둠 ${s.darkness}, 속도 ${s.speed}, 감정 ${s.emotion}에 맞춰 조정되었습니다.`,
      },
      style: `Tuned / ${tone}`,
    };
    return {
      tuneSummary: {
        en: `Tuned to emphasis ${tone} and ${dynamics}.`,
        kr: `${krTone} 강도로 수정되었습니다.`
      },
      storyConcept: patched.concept,
      narrativeArc: patched.narrative,
      music: patched.music,
      stage: patched.stage,
      artistNote: patched.pamphlet,
      choreographyStructure: patched.timing,
      movementVocabulary: patched.flow,
      formationDesign: patched.flow?.flow_pattern || [],
    };
  };

  const inputJson = {
    sliders: s,
    storyConcept: current.concept || {},
    narrativeArc: current.narrative || {},
    music: current.music || {},
    stage: current.stage || {},
    artistNote: current.pamphlet?.choreographerNote || current.pamphlet || {},
    choreographyStructure: current.timing || {},
    movementVocabulary: current.flow || {},
    formationDesign: current.flow?.flow_pattern || []
  };

  const generated = await llmProvider.lowCostJson({
    system,
    user: JSON.stringify(inputJson),
    fallback,
    maxTokens: 3000
  });

  const res = generated?.content ? generated.content : generated;

  const patched = clone(current);
  patched.concept = res.storyConcept || patched.concept;
  patched.narrative = res.narrativeArc || patched.narrative;
  patched.music = res.music || patched.music;
  patched.stage = res.stage || patched.stage;
  
  if (res.artistNote) {
    patched.pamphlet = { 
      ...(patched.pamphlet || {}), 
      choreographerNote: res.artistNote.choreographerNote || res.artistNote 
    };
  }
  
  patched.timing = res.choreographyStructure || patched.timing;
  patched.flow = res.movementVocabulary || patched.flow;
  if (Array.isArray(res.formationDesign)) {
    patched.flow = { ...(patched.flow || {}), flow_pattern: res.formationDesign };
  }

  const beforeSnapshot = {
    narrative: current.narrative?.development,
    music: current.music?.style,
    lighting: current.stage?.lighting
  };

  patched.tuning = { sliders: s, summary: res.tuneSummary || {}, before: beforeSnapshot, updatedAt: new Date().toISOString() };
  choreographyProjectModel.updateProjectContent(project.id, patched);

  return {
    story: getSectionContent(patched, 'story'),
    movement: getSectionContent(patched, 'movement'),
    music: getSectionContent(patched, 'music'),
    stage: getSectionContent(patched, 'stage'),
    artist_note: getSectionContent(patched, 'artist_note'),
    project: patched,
    tuneSummary: res.tuneSummary || {}
  };
}

export function buildFullChoreographyPackage(project, plan) {
  const c = clone(project.currentContent);
  const stageFlow = ensureStageFlow({
    stageFlow: c?.stageFlow,
    flowPattern: c?.flow?.flow_pattern || [],
    timeline: c?.timing?.timeline || [],
    teamSize: Number(c?.teamSize || c?.seedbarInput?.teamSize || 1),
    durationLabel: c?.timing?.totalDuration || c?.seedbarInput?.duration || '03:00',
  });
  const base = {
    title: c?.titles?.scientific?.en || c?.pamphlet?.coverTitle || project.title,
    teamSize: Number(c?.teamSize || c?.seedbarInput?.teamSize || 1),
    storyConcept: c?.concept || {},
    narrativeArc: c?.narrative || {},
    choreographyStructure: c?.timing || {},
    movementVocabulary: c?.flow || {},
    formationDesign: c?.flow?.flow_pattern || [],
    stageFlow,
    musicDirection: c?.music || {},
    stageDesign: c?.stage || {},
    lightingSuggestions: c?.stage?.lighting || '',
    costumeSuggestions: c?.stage?.costume || '',
    artistNote: c?.pamphlet?.choreographerNote || c?.pamphlet || {},
  };

  if (plan === 'studio') {
    base.competitionStrategy = {
      en: 'Open with kinetic ambiguity, reveal motif at 0:15, reserve contrast peak for final third.',
      kr: '운동학적 모호성으로 시작하고 0:15에 모티프를 드러낸 뒤, 대비 피크를 마지막 1/3에 배치한다.',
    };
    base.judgeImpactNotes = {
      en: 'Prioritize clarity of intent, contrast architecture, and breath timing in transitions.',
      kr: '의도 명확성, 대비 구조, 전환부 호흡 타이밍을 최우선으로 한다.',
    };
    base.opening15SecondStrategy = {
      en: 'Stillness (3s) -> micro-impulse (4s) -> directional break (8s) for immediate attention capture.',
      kr: '정지(3초) -> 미세 충동(4초) -> 방향 이탈(8초)로 초반 주목도를 확보한다.',
    };
  }

  return base;
}

export async function generateProjectVariations({ project, count = 3 }) {
  const current = clone(project.currentContent);
  const baseTitle = current?.pamphlet?.coverTitle || project.title || 'Untitled';
  const variations = [];

  for (let index = 0; index < count; index += 1) {
    const suffix = String.fromCharCode(65 + index);
    const next = clone(current);
    next.projectStatus = index === count - 1 ? 'in_progress' : (current?.projectStatus || 'draft');
    next.variationLabel = `Version ${suffix}`;
    next.narrative = {
      ...(next.narrative || {}),
      development: {
        en: `Variation ${suffix}: shifts the dramatic weight toward ${['contained tension', 'explosive release', 'breath-driven suspension'][index] || 'contrast'}.`,
        kr: `버전 ${suffix}: ${['응축된 긴장', '폭발적 해방', '호흡 중심 정지'][index] || '대비'} 쪽으로 극적 무게를 이동시킵니다.`,
      },
    };
    next.music = {
      ...(next.music || {}),
      style: `${next.music?.style || 'Counterpoint'} / Variation ${suffix}`,
    };
    next.pamphlet = {
      ...(next.pamphlet || {}),
      coverTitle: `${baseTitle} ${suffix}`,
    };

    const version = choreographyProjectModel.createVersion(project.id, next, `Version ${suffix}`);
    variations.push(version);
  }

  return variations;
}

export function buildStudioMeta(project) {
  const content = clone(project.currentContent);
  return {
    beatMarkers: buildBeatMarkers(content),
    dancerRoles: buildDancerRoles(content, project),
    projectStatus: project.status || content?.projectStatus || 'draft',
    lastEdited: project.updatedAt,
  };
}

// ─── Fast Rewrite: minimal prompt, section-only AI call ───
export async function rewriteSectionFast({ project, section, context }) {
  const current = clone(project.currentContent);
  const resolvedSection = section === 'formation' ? 'movement' : section;
  const existing = getSectionContent(current, resolvedSection);

  // Minimal system prompt for speed
  const system = `Rewrite ONLY the "${resolvedSection}" section. Return JSON. Be concise. Keep style continuity with project "${project.title}".`;

  const generated = await llmProvider.lowCostJson({
    system,
    user: {
      task: 'rewrite',
      section: resolvedSection,
      current: existing,
      projectTitle: project.title,
      competitionMode: Boolean(current?.isCompetition),
    },
    fallback: () => {
      // Instant fallback: modify existing text slightly
      const ts = new Date().toISOString().slice(11, 16);
      return addRewriteMarker(existing, resolvedSection, ts);
    },
  });

  const normalized = generated?.content ? generated.content : generated;
  const merged = mergeSectionContent(current, resolvedSection, normalized);
  choreographyProjectModel.updateProjectContent(project.id, merged);
  return { section: resolvedSection, content: getSectionContent(merged, resolvedSection), project: merged };
}

function addRewriteMarker(existing, section, ts) {
  if (section === 'story') {
    return {
      storyConcept: {
        ...existing?.storyConcept,
        artisticPhilosophy: {
          en: `[Rewritten ${ts}] ${existing?.storyConcept?.artisticPhilosophy?.en || 'Refined narrative with sharper thematic focus.'}`,
          kr: `[${ts} 재작성] ${existing?.storyConcept?.artisticPhilosophy?.kr || '더 뾰족한 주제 집중으로 정제된 서사.'}`,
        },
      },
      narrativeArc: existing?.narrativeArc || {},
    };
  }
  if (section === 'movement') {
    return {
      choreographyStructure: existing?.choreographyStructure || {},
      movementVocabulary: existing?.movementVocabulary || {},
      formationDesign: existing?.formationDesign || [],
    };
  }
  if (section === 'music') return { ...existing, style: `Rewrite (${ts}) / ${existing?.style || 'Counterpoint'}` };
  return existing;
}

// ─── Title Generation Pipeline ───
const TITLE_SEEDS = {
  abstract: ['Gravity', 'Axis', 'Fracture', 'Silence', 'Pulse', 'Void', 'Threshold', 'Horizon', 'Cipher', 'Remnant', 'Fragment', 'Eclipse', 'Drift', 'Reflex', 'Archive'],
  emotion: ['Ash', 'Bloom', 'Storm', 'Ember', 'Stillness', 'Hunger', 'Tremor', 'Solace', 'Rupture', 'Echo', 'Breath', 'Weight', 'Fever', 'Haze', 'Lull'],
  movement: ['Spiral', 'Collapse', 'Suspension', 'Rebound', 'Shift', 'Descent', 'Orbit', 'Tension', 'Release', 'Undulation', 'Impact', 'Glide', 'Fold', 'Surge', 'Pivot'],
  prepositions: ['of', 'in', 'between', 'beyond', 'beneath', 'against', 'through', 'within'],
  modifiers: ['Absolute', 'Silent', 'Fractured', 'Inverted', 'Residual', 'Peripheral', 'Radiant', 'Displaced', 'Latent', 'Primal'],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBaseTitle(inputOptions = {}) {
  const structures = [
    // "Modifier + Abstract" → "Absolute Zero", "Silent Gravity"
    () => `${pickRandom(TITLE_SEEDS.modifiers)} ${pickRandom(TITLE_SEEDS.abstract)}`,
    // "Emotion + Prep + Abstract" → "Ash of Silence", "Echo in Void"
    () => `${pickRandom(TITLE_SEEDS.emotion)} ${pickRandom(TITLE_SEEDS.prepositions)} ${pickRandom(TITLE_SEEDS.abstract)}`,
    // "Movement + Emotion" → "Spiral Hunger", "Collapse Bloom"
    () => `${pickRandom(TITLE_SEEDS.movement)} ${pickRandom(TITLE_SEEDS.emotion)}`,
    // "Abstract: Movement" → "Threshold: Descent", "Cipher: Shift"
    () => `${pickRandom(TITLE_SEEDS.abstract)}: ${pickRandom(TITLE_SEEDS.movement)}`,
    // "Modifier + Movement + Prep + Emotion" → "Fractured Orbit of Stillness"
    () => `${pickRandom(TITLE_SEEDS.modifiers)} ${pickRandom(TITLE_SEEDS.movement)} ${pickRandom(TITLE_SEEDS.prepositions)} ${pickRandom(TITLE_SEEDS.emotion)}`,
  ];

  return pickRandom(structures)();
}

function simpleSimilarity(a, b) {
  const wa = (a || '').toLowerCase().split(/\s+/);
  const wb = (b || '').toLowerCase().split(/\s+/);
  const setA = new Set(wa);
  const intersection = wb.filter((w) => setA.has(w)).length;
  return intersection / Math.max(wa.length, wb.length, 1);
}

function mutateTitle(title) {
  const mutations = [
    (t) => `${t} — ${pickRandom(TITLE_SEEDS.emotion)}`,
    (t) => `${t}: ${pickRandom(TITLE_SEEDS.movement)}`,
    (t) => `${pickRandom(TITLE_SEEDS.modifiers)} ${t}`,
    (t) => {
      const words = t.split(' ');
      if (words.length <= 1) return `${t} ${pickRandom(TITLE_SEEDS.abstract)}`;
      words[Math.floor(Math.random() * words.length)] = pickRandom(TITLE_SEEDS.abstract);
      return words.join(' ');
    },
  ];
  return pickRandom(mutations)(title);
}

export async function generateUniqueTitle({ genre, mood, theme, existingTitles = [] }) {
  // Step 1: Try AI first
  let title = null;
  try {
    const aiResult = await llmProvider.lowCostJson({
      system: 'Generate a unique, artistic, and abstract choreography project title. Return JSON: { "title": "..." }. The title should be 2-4 words, poetic, and NOT include generic words like "dance", "choreography", "performance". Think abstract art exhibition names.',
      user: { genre, mood, theme },
      fallback: () => ({ title: generateBaseTitle({ genre, mood, theme }) }),
    });
    title = aiResult?.title || aiResult?.content?.title || null;
  } catch {
    // Fallback to algorithmic generation
  }

  // Step 2: If AI failed or returned nothing, use algorithmic generation
  if (!title) title = generateBaseTitle({ genre, mood, theme });

  // Step 3: Uniqueness check
  const MAX_ATTEMPTS = 5;
  let attempts = 0;
  while (attempts < MAX_ATTEMPTS) {
    const isTooSimilar = existingTitles.some((existing) => simpleSimilarity(title, existing) > 0.7);
    if (!isTooSimilar) break;
    title = mutateTitle(title);
    attempts++;
  }

  return title;
}
