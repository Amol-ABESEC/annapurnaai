import { Recipe, YouTubeVideoRecommendation } from '../types';

// In-memory cache so switching between recipes and back doesn't re-fetch
// the same dish repeatedly during a single session.
const memoryCache = new Map<string, YouTubeVideoRecommendation[]>();

interface YouTubeSearchApiVideo {
  id: string;
  title: string;
  channelName: string;
  publishedTime: string;
  thumbnailUrl: string;
  duration: string;
  views: string;
  youtubeUrl: string;
}

interface YouTubeSearchApiResponse {
  configured: boolean;
  videos: YouTubeSearchApiVideo[];
}

/**
 * Fetches real video recommendations for a recipe from our /api/youtube-search
 * serverless endpoint, which calls the actual YouTube Data API v3.
 *
 * Returns an empty array (never fabricated data) if:
 * - the YOUTUBE_API_KEY isn't configured on the server yet, or
 * - the request fails for any reason (network, quota, etc.)
 *
 * Callers should treat an empty array as "show a plain YouTube search link
 * instead", not as an error to surface to the user.
 */
export async function fetchYouTubeRecommendationsForRecipe(recipe: Recipe): Promise<YouTubeVideoRecommendation[]> {
  const cacheKey = recipe.title.trim().toLowerCase();
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`/api/youtube-search?q=${encodeURIComponent(recipe.title)}`);
    if (!response.ok) {
      console.info('YouTube search API unavailable, falling back to search links only.');
      return [];
    }

    const data: YouTubeSearchApiResponse = await response.json();
    if (!data.configured || data.videos.length === 0) {
      return [];
    }

    const recommendations: YouTubeVideoRecommendation[] = data.videos.map((video) => ({
      id: video.id,
      title: video.title,
      channelName: video.channelName,
      duration: video.duration,
      views: video.views,
      publishedTime: video.publishedTime,
      youtubeUrl: video.youtubeUrl,
      embedVideoId: video.id,
      thumbnailUrl: video.thumbnailUrl,
      chefStyle: '',
      highlights: [],
    }));

    memoryCache.set(cacheKey, recommendations);
    return recommendations;
  } catch (err) {
    console.info('YouTube search request failed, falling back to search links only:', err);
    return [];
  }
}

export function getGeneralYouTubeSearchUrl(recipeTitle: string): string {
  const query = encodeURIComponent(`${recipeTitle} step by step cooking video tutorial`);
  return `https://www.youtube.com/results?search_query=${query}`;
}
