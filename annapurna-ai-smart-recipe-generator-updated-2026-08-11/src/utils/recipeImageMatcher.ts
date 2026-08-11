import { RECIPE_IMAGE_PATHS } from '../data/recipeImageManifest';

type ImageEntry = {
  path: string;
  key: string;
  tokens: Set<string>;
};

const STOP_WORDS = new Set([
  'and',
  'aur',
  'chi',
  'for',
  'from',
  'in',
  'ka',
  'ki',
  'na',
  'of',
  'style',
  'the',
  'with',
]);

const normalizeDishText = (value: string): string => {
  const filename = decodeURIComponent(value.split('/').pop() || value);

  return filename
    .replace(/\.(jpe?g|png|webp)$/i, '')
    .replace(/^\d+\./, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/\b(recipe|recipes|video|original|edited|short format|long format)\b/gi, ' ')
    .replace(/[^a-z0-9]+/gi, ' ')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

const tokenizeDishText = (value: string): string[] =>
  normalizeDishText(value)
    .split(' ')
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

const imageEntries: ImageEntry[] = RECIPE_IMAGE_PATHS.map((path) => {
  const key = normalizeDishText(path);
  return {
    path,
    key,
    tokens: new Set(tokenizeDishText(path)),
  };
});

const imageByKey = new Map<string, string>();
for (const entry of imageEntries) {
  if (!imageByKey.has(entry.key)) {
    imageByKey.set(entry.key, entry.path);
  }
}

const matchCache = new Map<string, string | null>();

export function findRecipeImageForDish(title: string, sourceUrl?: string): string | null {
  const candidates = [sourceUrl, title].filter(Boolean) as string[];
  const cacheKey = candidates.join('|');
  if (matchCache.has(cacheKey)) return matchCache.get(cacheKey) || null;

  for (const candidate of candidates) {
    const exactMatch = imageByKey.get(normalizeDishText(candidate));
    if (exactMatch) {
      matchCache.set(cacheKey, exactMatch);
      return exactMatch;
    }
  }

  const titleTokens = new Set(tokenizeDishText(title));
  if (titleTokens.size === 0) {
    matchCache.set(cacheKey, null);
    return null;
  }

  let bestMatch: ImageEntry | null = null;
  let bestScore = 0;

  for (const entry of imageEntries) {
    let overlap = 0;
    titleTokens.forEach((token) => {
      if (entry.tokens.has(token)) overlap += 1;
    });

    if (overlap === 0) continue;

    const coverage = overlap / titleTokens.size;
    const precision = overlap / entry.tokens.size;
    const score = coverage * 0.7 + precision * 0.3;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  const matchedPath = bestMatch && bestScore >= 0.62 ? bestMatch.path : null;
  matchCache.set(cacheKey, matchedPath);
  return matchedPath;
}
