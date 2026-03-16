import { assertMusicCoreEnv, getMusicEnvStatus } from '../config/musicEnv.js';
import { getMusicRecommendations } from '../services/musicRecommendService.js';

export function getMusicHealthController(_req, res) {
  const env = getMusicEnvStatus();
  return res.json({
    ok: true,
    service: 'seedbar-music-engine',
    env,
    timestamp: new Date().toISOString(),
  });
}

export async function postMusicRecommendController(req, res) {
  const envCheck = assertMusicCoreEnv();
  if (!envCheck.ok) {
    return res.status(503).json({
      ok: false,
      error: 'Required music environment variables are missing.',
      missing: envCheck.missing,
      env: envCheck.status,
    });
  }

  try {
    const body = req.body || {};
    const payload = {
      genre: body.genre || 'Contemporary Dance',
      mood: body.mood || '',
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
      duration: body.duration || '03:00',
      competitionMode: Boolean(body.competitionMode),
      tempo: body.tempo || '',
      emotionCurve: Array.isArray(body.emotionCurve) ? body.emotionCurve : [],
    };

    const result = await getMusicRecommendations(payload, req.context || {});

    return res.json({
      ok: true,
      fingerprint: result.fingerprint,
      competitionMode: result.competitionMode,
      cacheHit: result.cacheHit,
      recommendations: {
        trend: result.recommendations.trend,
        balanced: result.recommendations.balanced,
        counterpoint: result.recommendations.counterpoint,
      },
      strategy: result.strategy,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'Failed to generate music recommendations.',
      message: error.message,
    });
  }
}
