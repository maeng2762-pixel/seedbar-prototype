function has(value) {
  return Boolean(value && String(value).trim());
}

export function getMusicEnvStatus() {
  const status = {
    openai: has(process.env.OPENAI_API_KEY),
    spotifyClientId: has(process.env.SPOTIFY_CLIENT_ID),
    spotifyClientSecret: has(process.env.SPOTIFY_CLIENT_SECRET),
    youtubeApiKey: has(process.env.YOUTUBE_API_KEY),
  };

  return {
    ...status,
    spotifyReady: status.spotifyClientId && status.spotifyClientSecret,
    youtubeReady: status.youtubeApiKey,
    openaiReady: status.openai,
    ready: status.openai && status.spotifyClientId && status.spotifyClientSecret,
  };
}

export function assertMusicCoreEnv() {
  const s = getMusicEnvStatus();
  const missing = [];
  if (!s.openai) missing.push('OPENAI_API_KEY');
  if (!s.spotifyClientId) missing.push('SPOTIFY_CLIENT_ID');
  if (!s.spotifyClientSecret) missing.push('SPOTIFY_CLIENT_SECRET');
  return {
    ok: missing.length === 0,
    missing,
    status: s,
  };
}
