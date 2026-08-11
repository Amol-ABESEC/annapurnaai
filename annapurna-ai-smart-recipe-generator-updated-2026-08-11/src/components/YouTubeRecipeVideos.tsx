import React, { useEffect, useState } from 'react';
import { Play, ExternalLink, Youtube, Clock, Eye, Sparkles, CheckCircle2, X, Loader2 } from 'lucide-react';
import { Recipe, YouTubeVideoRecommendation } from '../types';
import { fetchYouTubeRecommendationsForRecipe, getGeneralYouTubeSearchUrl } from '../utils/youtubeVideoRecommendations';

interface YouTubeRecipeVideosProps {
  recipe: Recipe;
  compact?: boolean;
}

export const YouTubeRecipeVideos: React.FC<YouTubeRecipeVideosProps> = ({
  recipe,
  compact = false,
}) => {
  const [recommendations, setRecommendations] = useState<YouTubeVideoRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');

  const searchAllUrl = getGeneralYouTubeSearchUrl(recipe.title);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setActiveEmbedId(null);

    fetchYouTubeRecommendationsForRecipe(recipe).then((videos) => {
      if (!cancelled) {
        setRecommendations(videos);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [recipe.id, recipe.title]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-center shrink-0 shadow-inner">
            <Youtube className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <span>YouTube Cooking Recommendations</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold uppercase tracking-wider">
                Video Guides
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Curated masterclasses, quick home versions & chef tips for <b>{recipe.title}</b>
            </p>
          </div>
        </div>

        <a
          href={searchAllUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer hover:text-white self-start sm:self-auto shrink-0"
        >
          <span>Search More on YouTube</span>
          <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
        </a>
      </div>

      {/* Embedded Video Player Modal Overlay */}
      {activeEmbedId && (
        <div className="bg-slate-900 rounded-2xl border border-rose-500/40 p-3 relative space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Now Playing: {activeVideoTitle}
            </span>
            <button
              onClick={() => setActiveEmbedId(null)}
              className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Player</span>
            </button>
          </div>

          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeEmbedId}?autoplay=1&rel=0`}
              title={activeVideoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Fetching real videos for {recipe.title}...</span>
        </div>
      )}

      {/* Honest Empty State — never show fabricated cards */}
      {!isLoading && recommendations.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <a
            href={searchAllUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg hover:shadow-rose-500/20"
          >
            <Youtube className="w-4 h-4" />
            <span>Search Video Guide on YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      {!isLoading && recommendations.length > 0 && (
      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-2'} gap-3`}>
        {recommendations.map((video) => (
          <div
            key={video.id}
            className="group bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/40 rounded-xl p-3 transition-all duration-200 flex flex-col justify-between space-y-2.5 shadow-md"
          >
            {/* Thumbnail Box */}
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80 group-hover:shadow-lg transition-all">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-slate-950/90 border border-slate-700/80 text-slate-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                <Clock className="w-3 h-3 text-rose-400" />
                <span>{video.duration}</span>
              </div>

              {/* Chef Style Tag (only shown if we actually have one) */}
              {video.chefStyle && (
                <div className="absolute top-2 left-2 bg-rose-950/90 border border-rose-500/40 text-rose-300 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-md">
                  {video.chefStyle}
                </div>
              )}

              {/* Center Play Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                <div className="w-11 h-11 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl border border-rose-400/50">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Video Info Details */}
            <div className="space-y-1.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 font-medium">
                  <span className="font-extrabold text-emerald-300 flex items-center gap-1">
                    <span>{video.channelName}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Eye className="w-3 h-3 text-slate-400" />
                    {video.views}
                  </span>
                </div>

                <h5 className="font-bold text-xs text-slate-100 group-hover:text-rose-300 transition-colors line-clamp-2 mt-0.5 leading-snug">
                  {video.title}
                </h5>
              </div>

              {/* Key Highlights Badges */}
              {video.highlights && video.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {video.highlights.slice(0, 2).map((highlight, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md"
                    >
                      ✨ {highlight}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {video.embedVideoId ? (
                  <button
                    onClick={() => {
                      setActiveEmbedId(video.embedVideoId || null);
                      setActiveVideoTitle(video.title);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Here</span>
                  </button>
                ) : null}

                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1 border border-slate-700 transition-all cursor-pointer ${
                    video.embedVideoId ? '' : 'w-full'
                  }`}
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
