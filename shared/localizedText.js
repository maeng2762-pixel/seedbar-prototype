export function getLocalizedText(value, language = 'EN', fallback = '') {
  if (value == null || value === false) return fallback;

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => getLocalizedText(item, language, ''))
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : fallback;
  }

  if (typeof value === 'object') {
    const langKey = String(language || 'EN').toUpperCase() === 'KR' ? 'kr' : 'en';
    const altKey = langKey === 'kr' ? 'en' : 'kr';

    const localizedValue = value?.[langKey];
    const alternateValue = value?.[altKey];

    if (localizedValue != null && localizedValue !== '') {
      return getLocalizedText(localizedValue, language, fallback);
    }
    if (alternateValue != null && alternateValue !== '') {
      return getLocalizedText(alternateValue, language, fallback);
    }

    for (const key of ['text', 'label', 'title', 'value', 'name']) {
      if (value?.[key] != null && value[key] !== '') {
        return getLocalizedText(value[key], language, fallback);
      }
    }

    return fallback;
  }

  return fallback;
}

export function normalizeRenderableText(value, language = 'EN', fallback = '') {
  return getLocalizedText(value, language, fallback);
}

export function normalizePamphletForRender(pamphlet = {}, language = 'EN') {
  return {
    theme: typeof pamphlet?.theme === 'string' ? pamphlet.theme : 'minimal',
    coverTitle: normalizeRenderableText(pamphlet?.coverTitle, language, ''),
    performanceDesc: normalizeRenderableText(pamphlet?.performanceDesc, language, ''),
    choreographerName: normalizeRenderableText(pamphlet?.choreographerName, language, ''),
    artisticStatement: normalizeRenderableText(pamphlet?.artisticStatement, language, ''),
    choreographerNote: normalizeRenderableText(pamphlet?.choreographerNote, language, ''),
    musicCredits: normalizeRenderableText(pamphlet?.musicCredits, language, ''),
    cast: normalizeRenderableText(pamphlet?.cast, language, ''),
    staffCredits: normalizeRenderableText(pamphlet?.staffCredits, language, ''),
    coverImageUrl: normalizeRenderableText(pamphlet?.coverImageUrl, language, ''),
  };
}
