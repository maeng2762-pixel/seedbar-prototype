// using global fetch available in node18+
import { persistArtworkAsset } from '../services/artworkStorageService.js';

const IMAGE_REQUEST_TIMEOUT_MS = Number(process.env.IMAGE_GENERATION_TIMEOUT_MS || 50000);

function sanitizePromptFragment(value = '') {
  return String(value || '')
    .replace(/\b(sensual|erotic|revealing|revealed|seductive|provocative|lingerie|underwear|bikini|cleavage|nude|naked|fetish)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const generateArtworkImage = async (req, res) => {
  try {
    const { title, genre, mood, concept, emotion, style } = req.body;
    const safeTitle = sanitizePromptFragment(title || 'Untitled');
    const safeGenre = sanitizePromptFragment(genre || 'Contemporary Dance');
    const safeMood = sanitizePromptFragment(mood || 'Artistic');
    const safeConcept = sanitizePromptFragment(concept || '');
    const safeEmotion = sanitizePromptFragment(emotion || '');
    const safeStyle = sanitizePromptFragment(style || 'High-end performance poster style');

    // Construct the prompt carefully to prioritize cinematic stage lighting, abstract performance art, and strong safety guidance.
    const basePrompt = `Professional stage photography or refined performance poster artwork for a contemporary dance project titled "${safeTitle}".
Genre: ${safeGenre}. Mood: ${safeMood}.
Concept: ${safeConcept}. Emotion curve: ${safeEmotion}.
Style direction: ${safeStyle}.
CRITICAL REQUIREMENTS:
- Make it look like a real stage performance still, rehearsal still, festival poster visual, or high-end artistic production photo.
- Prioritize contemporary dance costume, rehearsal wear, stage wardrobe, wide-shot or mid-shot composition, dramatic lighting, performance atmosphere.
- Keep the image suitable for a public pamphlet, poster, jury submission, or production booklet.
- DO NOT INCLUDE ANY TEXT, TYPOGRAPHY, OR LOGOS IN THE IMAGE.
- DO NOT create sexualized imagery, erotic posing, lingerie styling, swimsuit styling, exposed intimate body parts, fetish styling, or unnecessary chest/hip/body close-ups.
- Avoid low-quality 3D renders, cartoon, meme, toy-like appearances, distorted anatomy, or voyeuristic framing.
- Human figures should be elegant, performance-focused, and realistically styled for stage presentation.`;

    // We can call OpenAI DALL-E 3 directly using the stored OPENAI_API_KEY
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        ok: false,
        code: 'image_provider_unconfigured',
        error: 'Image generation server is not configured.',
        detail: 'OPENAI_API_KEY is missing.',
        retryable: true,
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), IMAGE_REQUEST_TIMEOUT_MS);
    let response;
    try {
      response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: basePrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error?.name === 'AbortError') {
        return res.status(504).json({
          ok: false,
          code: 'image_generation_timeout',
          error: 'Image generation timed out.',
          retryable: true,
        });
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      let providerError = {};
      try {
        providerError = await response.json();
      } catch {
        providerError = { raw: await response.text() };
      }
      console.error('DALL-E generation failed:', providerError);
      const providerMessage = providerError?.error?.message || providerError?.raw || response.statusText;
      return res.status(response.status >= 500 ? 502 : response.status).json({
        ok: false,
        code: response.status === 401 ? 'image_provider_auth_failed' : 'image_provider_request_failed',
        error: 'Image generation server could not create a visual.',
        detail: providerMessage,
        retryable: response.status >= 500 || response.status === 429,
      });
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return res.status(502).json({
        ok: false,
        code: 'image_provider_empty',
        error: 'Image generation did not return a valid image URL.',
        retryable: true,
      });
    }

    res.json({ ok: true, imageUrl, promptUsed: basePrompt });
  } catch (error) {
    console.error('Artwork generation error:', error);
    res.status(500).json({
      ok: false,
      code: 'image_generation_failed',
      error: error.message || 'Failed to generate image',
      retryable: true,
    });
  }
};

export const persistArtworkImage = async (req, res) => {
  try {
    const imageUrl = String(req.body?.imageUrl || '').trim();
    if (!imageUrl) {
      return res.status(400).json({ ok: false, error: 'imageUrl is required.' });
    }

    const asset = await persistArtworkAsset({
      imageUrl,
      projectId: req.body?.projectId || 'draft',
      userId: req.context?.userId || 'guest',
    });

    return res.json({
      ok: true,
      asset,
    });
  } catch (error) {
    console.error('Artwork persistence error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to persist representative artwork.',
    });
  }
};
