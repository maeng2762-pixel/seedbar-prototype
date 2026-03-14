function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function parseDurationToSec(duration = '03:00') {
  const p = String(duration || '03:00').split(':').map((x) => Number(x));
  if (p.length === 2) return (p[0] || 0) * 60 + (p[1] || 0);
  if (p.length === 3) return (p[0] || 0) * 3600 + (p[1] || 0) * 60 + (p[2] || 0);
  return 180;
}

function parseTimeToSec(time = '0:00') {
  const p = String(time || '0:00').split(':').map((x) => Number(x));
  if (p.length === 2) return (p[0] || 0) * 60 + (p[1] || 0);
  if (p.length === 3) return (p[0] || 0) * 3600 + (p[1] || 0) * 60 + (p[2] || 0);
  return 0;
}

function seedPoints(teamSize = 5) {
  const n = Math.max(1, Number(teamSize || 1));
  if (n === 1) return [[[50, 60]], [[52, 46]], [[50, 52]], [[50, 60]]];
  if (n === 2) return [[[38, 60], [62, 60]], [[25, 45], [75, 45]], [[60, 35], [40, 35]], [[42, 58], [58, 58]]];
  if (n === 3) return [[[50, 62], [35, 42], [65, 42]], [[50, 72], [25, 40], [75, 40]], [[50, 38], [38, 62], [62, 62]], [[50, 56], [42, 64], [58, 64]]];
  if (n === 4) return [[[35, 62], [65, 62], [35, 38], [65, 38]], [[25, 66], [45, 50], [55, 50], [75, 34]], [[42, 58], [58, 58], [46, 42], [54, 42]], [[40, 60], [60, 60], [40, 44], [60, 44]]];
  if (n === 5) return [[[20, 70], [35, 65], [50, 60], [65, 65], [80, 70]], [[18, 48], [34, 42], [50, 50], [66, 42], [82, 48]], [[25, 40], [40, 35], [50, 50], [60, 35], [75, 40]], [[38, 58], [46, 52], [50, 48], [54, 52], [62, 58]]];

  const mk = (radiusX, radiusY) => {
    const pts = [];
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2;
      pts.push([50 + Math.cos(a) * radiusX, 52 + Math.sin(a) * radiusY]);
    }
    return pts;
  };
  return [mk(28, 22), mk(20, 15), mk(12, 8), mk(34, 24)];
}

export function generateSeedStageFlow({ teamSize = 5, timeline = [], durationLabel = '03:00' }) {
  const duration = parseDurationToSec(durationLabel);
  const pts = seedPoints(teamSize);
  const labels = ['Opening diagonal formation', 'Expansion crossing', 'Climax compression', 'Final convergence'];
  const sections = timeline.length
    ? timeline.map((x) => (typeof x?.stage === 'object' ? (x.stage.en || x.stage.kr) : x?.stage || x?.part || '')).filter(Boolean)
    : ['Intro', 'Development', 'Climax', 'Ending'];

  const chunk = duration / pts.length;

  return pts.map((arr, idx) => ({
    timeStart: Number((idx * chunk).toFixed(2)),
    timeEnd: Number(((idx + 1) * chunk).toFixed(2)),
    label: labels[idx] || `Section ${idx + 1}`,
    section: sections[idx] || sections[sections.length - 1] || `Section ${idx + 1}`,
    dancers: arr.map((p, i) => ({ id: `D${i + 1}`, x: clamp(p[0], 0, 100), y: clamp(p[1], 0, 100) })),
  }));
}

export function flowPatternToStageFlow({ flowPattern = [], timeline = [], durationLabel = '03:00', teamSize = 5 }) {
  if (!Array.isArray(flowPattern) || flowPattern.length < 2) {
    return generateSeedStageFlow({ teamSize, timeline, durationLabel });
  }

  const duration = parseDurationToSec(durationLabel);
  const times = timeline.map((t) => parseTimeToSec(t?.time || '0:00'));
  const useTimes = times.length === flowPattern.length;

  return flowPattern.map((node, idx) => {
    const timeStart = useTimes ? times[idx] : (idx / Math.max(1, flowPattern.length - 1)) * duration;
    const timeEnd = useTimes ? (times[idx + 1] ?? duration) : ((idx + 1) / Math.max(1, flowPattern.length - 1)) * duration;
    return {
      timeStart: Number(timeStart.toFixed(2)),
      timeEnd: Number(Math.max(timeStart + 0.01, timeEnd).toFixed(2)),
      label: node?.formation || node?.label || `Formation ${idx + 1}`,
      section: node?.stage || node?.part || `Section ${idx + 1}`,
      dancers: (node?.dancers || []).map((d, i) => ({ id: `D${i + 1}`, x: clamp(Number(d.x || 50), 0, 100), y: clamp(Number(d.y || 50), 0, 100) })),
    };
  });
}

export function ensureStageFlow({ stageFlow, flowPattern, timeline = [], teamSize = 5, durationLabel = '03:00' }) {
  if (Array.isArray(stageFlow) && stageFlow.length >= 2) return stageFlow;
  return flowPatternToStageFlow({ flowPattern, timeline, durationLabel, teamSize });
}
