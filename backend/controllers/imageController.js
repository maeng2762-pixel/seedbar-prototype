// using global fetch available in node18+
import { persistArtworkAsset } from '../services/artworkStorageService.js';

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
      return res.status(500).json({ error: "OpenAI API key missing" });
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: basePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DALL-E generation failed:", errorText);
      throw new Error(`Image API error: ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL returned");
    }

    res.json({ imageUrl, promptUsed: basePrompt });
  } catch (error) {
    console.error('Artwork generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
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
