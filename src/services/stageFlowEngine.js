function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function parseDurationToSec(duration = '03:00') {
  const s = String(duration || '03:00').trim();
  const parts = s.split(':').map((x) => Number(x));
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  return 180;
}

function parseTimeLabelToSec(timeLabel = '0:00') {
  const s = String(timeLabel || '0:00').trim();
  const parts = s.split(':').map((x) => Number(x));
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  return 0;
}

function normalizeDancer(d, idx) {
  return {
    id: d?.id || `D${idx + 1}`,
    x: clamp(Number(d?.x ?? 50), 0, 100),
    y: clamp(Number(d?.y ?? 50), 0, 100),
  };
}

function normalizeStageFlowSegments(stageFlow = [], duration = 150) {
  const sorted = [...stageFlow]
    .map((seg, idx) => ({
      timeStart: Number(seg?.timeStart ?? idx * 10),
      timeEnd: Number(seg?.timeEnd ?? (idx + 1) * 10),
      label: seg?.label || `Section ${idx + 1}`,
      section: seg?.section || seg?.stage || 'section',
      dancers: Array.isArray(seg?.dancers) ? seg.dancers.map(normalizeDancer) : [],
    }))
    .sort((a, b) => a.timeStart - b.timeStart);

  if (!sorted.length) return [];

  const safe = sorted.map((seg, idx) => {
    const nextStart = sorted[idx + 1]?.timeStart;
    const start = clamp(seg.timeStart, 0, duration);
    const endCandidate = Number.isFinite(seg.timeEnd) ? seg.timeEnd : (nextStart ?? duration);
    const end = clamp(Math.max(start + 0.01, endCandidate), 0, duration);
    return { ...seg, timeStart: start, timeEnd: end };
  });

  safe[safe.length - 1].timeEnd = Math.max(safe[safe.length - 1].timeEnd, duration);
  return safe;
}

function formationByTeamSize(teamSize = 5) {
  if (teamSize <= 1) {
    return [
      { label: 'Center solo', pts: [[50, 58]] },
      { label: 'Solo drift', pts: [[56, 45]] },
      { label: 'Solo contraction', pts: [[50, 52]] },
      { label: 'Final stillness', pts: [[50, 60]] },
    ];
  }
  if (teamSize === 2) {
    return [
      { label: 'Mirrored duet', pts: [[38, 60], [62, 60]] },
      { label: 'Left/Right split', pts: [[25, 45], [75, 45]] },
      { label: 'Crossing duet', pts: [[60, 35], [40, 35]] },
      { label: 'Final symmetry', pts: [[42, 58], [58, 58]] },
    ];
  }
  if (teamSize === 3) {
    return [
      { label: 'Triangle opening', pts: [[50, 62], [35, 42], [65, 42]] },
      { label: 'Triangle expansion', pts: [[50, 72], [25, 40], [75, 40]] },
      { label: 'Inverted triangle', pts: [[50, 38], [38, 62], [62, 62]] },
      { label: 'Final convergence', pts: [[50, 56], [42, 64], [58, 64]] },
    ];
  }
  if (teamSize === 4) {
    return [
      { label: 'Square opening', pts: [[35, 62], [65, 62], [35, 38], [65, 38]] },
      { label: 'Diagonal pair', pts: [[25, 66], [45, 50], [55, 50], [75, 34]] },
      { label: 'Center compression', pts: [[42, 58], [58, 58], [46, 42], [54, 42]] },
      { label: 'Final box', pts: [[40, 60], [60, 60], [40, 44], [60, 44]] },
    ];
  }
  if (teamSize === 5) {
    return [
      { label: 'Opening diagonal formation', pts: [[20, 70], [35, 65], [50, 60], [65, 65], [80, 70]] },
      { label: 'Center + wings', pts: [[18, 48], [34, 42], [50, 50], [66, 42], [82, 48]] },
      { label: 'Triangle expansion', pts: [[25, 40], [40, 35], [50, 50], [60, 35], [75, 40]] },
      { label: 'Final convergence', pts: [[38, 58], [46, 52], [50, 48], [54, 52], [62, 58]] },
    ];
  }

  const ring = [];
  for (let i = 0; i < teamSize; i += 1) {
    const a = (i / teamSize) * Math.PI * 2;
    ring.push([50 + Math.cos(a) * 28, 52 + Math.sin(a) * 22]);
  }
  const staggered = [];
  for (let i = 0; i < teamSize; i += 1) {
    const row = i % 2;
    staggered.push([12 + (i / Math.max(1, teamSize - 1)) * 76, row ? 40 : 62]);
  }
  const cluster = [];
  for (let i = 0; i < teamSize; i += 1) {
    const a = (i / teamSize) * Math.PI * 2;
    cluster.push([50 + Math.cos(a) * 12, 52 + Math.sin(a) * 10]);
  }
  const expand = [];
  for (let i = 0; i < teamSize; i += 1) {
    const a = (i / teamSize) * Math.PI * 2;
    expand.push([50 + Math.cos(a) * 34, 52 + Math.sin(a) * 24]);
  }

  return [
    { label: 'Arc opening', pts: ring },
    { label: 'Staggered lines', pts: staggered },
    { label: 'Cluster to expansion', pts: cluster },
    { label: 'Explosive spread', pts: expand },
  ];
}

export function generateSeedStageFlow({ teamSize = 5, duration = 150, timeline = [] }) {
  const templates = formationByTeamSize(Math.max(1, Number(teamSize || 1)));
  const sectionNames = timeline.length
    ? timeline.map((x) => (typeof x?.stage === 'object' ? (x.stage.en || x.stage.kr) : x?.stage || x?.part || '')).filter(Boolean)
    : ['Intro', 'Development', 'Climax', 'Ending'];

  const count = Math.max(2, templates.length);
  const chunk = duration / count;

  return templates.map((tpl, idx) => {
    const dancers = tpl.pts.map((pt, dIdx) => ({ id: `D${dIdx + 1}`, x: pt[0], y: pt[1] }));
    return {
      timeStart: Number((idx * chunk).toFixed(2)),
      timeEnd: Number(((idx + 1) * chunk).toFixed(2)),
      label: tpl.label,
      section: sectionNames[idx] || sectionNames[sectionNames.length - 1] || `Section ${idx + 1}`,
      dancers,
    };
  });
}

export function flowPatternToStageFlow({ flowPattern = [], timeline = [], duration = 150, teamSize = 5 }) {
  if (!Array.isArray(flowPattern) || flowPattern.length < 2) {
    return generateSeedStageFlow({ teamSize, duration, timeline });
  }

  const timesFromTimeline = Array.isArray(timeline)
    ? timeline.map((t) => parseTimeLabelToSec(t?.time || '0:00'))
    : [];

  const useTimelineTimes = timesFromTimeline.length === flowPattern.length;

  const segments = flowPattern.map((node, idx) => {
    const defaultStart = (idx / Math.max(1, flowPattern.length - 1)) * duration;
    const start = useTimelineTimes ? timesFromTimeline[idx] : defaultStart;
    const nextStart = useTimelineTimes
      ? (timesFromTimeline[idx + 1] ?? duration)
      : (((idx + 1) / Math.max(1, flowPattern.length - 1)) * duration);

    const dancers = Array.isArray(node?.dancers)
      ? node.dancers.map((d, dIdx) => normalizeDancer({ ...d, id: d?.id ? `D${String(d.id).replace(/\D/g, '') || dIdx + 1}` : `D${dIdx + 1}` }, dIdx))
      : [];

    return {
      timeStart: start,
      timeEnd: Math.max(start + 0.01, nextStart),
      label: node?.formation || node?.label || `Formation ${idx + 1}`,
      section: node?.stage || node?.part || `Section ${idx + 1}`,
      dancers,
    };
  });

  const normalized = normalizeStageFlowSegments(segments, duration);
  if (!normalized.length || normalized.some((seg) => !seg.dancers?.length)) {
    return generateSeedStageFlow({ teamSize, duration, timeline });
  }

  return normalized;
}

export function ensureStageFlow({ stageFlow, flowPattern, timeline, teamSize = 5, durationLabel = '03:00' }) {
  const duration = parseDurationToSec(durationLabel);
  if (Array.isArray(stageFlow) && stageFlow.length >= 2) {
    return normalizeStageFlowSegments(stageFlow, duration);
  }
  return flowPatternToStageFlow({ flowPattern, timeline, duration, teamSize });
}

export function getSegmentByTime(stageFlow = [], currentTime = 0) {
  if (!stageFlow.length) return null;
  const t = Number(currentTime || 0);
  for (let i = 0; i < stageFlow.length; i += 1) {
    const s = stageFlow[i];
    if (t >= s.timeStart && t <= s.timeEnd) return { segment: s, index: i };
  }
  return { segment: stageFlow[stageFlow.length - 1], index: stageFlow.length - 1 };
}

export function interpolateAtTime(stageFlow = [], currentTime = 0) {
  if (!stageFlow.length) return { dancers: [], label: '', section: '', segmentIndex: 0 };

  const hit = getSegmentByTime(stageFlow, currentTime);
  const segment = hit.segment;
  const idx = hit.index;
  const next = stageFlow[Math.min(idx + 1, stageFlow.length - 1)] || segment;

  const span = Math.max(0.001, segment.timeEnd - segment.timeStart);
  const local = clamp((currentTime - segment.timeStart) / span, 0, 1);

  const nextById = new Map((next.dancers || []).map((d) => [d.id, d]));
  const dancers = (segment.dancers || []).map((d, i) => {
    const nd = nextById.get(d.id) || next.dancers?.[i] || d;
    return {
      id: d.id,
      x: d.x + (nd.x - d.x) * local,
      y: d.y + (nd.y - d.y) * local,
    };
  });

  return {
    dancers,
    label: segment.label,
    section: segment.section,
    segmentIndex: idx,
  };
}
