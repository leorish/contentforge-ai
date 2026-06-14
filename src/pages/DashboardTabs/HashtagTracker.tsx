/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Hash, Sparkles, RefreshCw, Clipboard, Check, Trophy, AlertTriangle, HelpCircle } from 'lucide-react';

interface TagMetric {
  tag: string;
  popularity: number;
  competition: number;
}

interface KeywordMetric {
  term: string;
  volume: string;
  competition: string;
}

export default function HashtagTracker() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ trending: TagMetric[]; niche: TagMetric[]; keywords: KeywordMetric[] } | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const handleTrackHashtags = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword })
      });
      const resData = await response.json();
      if (resData.success) {
        setData(resData.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const getCompetitionColor = (score: number) => {
    if (score < 40) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score < 75) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getCompetitionText = (score: number) => {
    if (score < 40) return 'Low';
    if (score < 75) return 'Medium';
    return 'High';
  };

  return (
    <div id="hashtag-tracker-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
      {/* Parameter sidebar */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-pink-400" />
            <h3 className="text-sm font-bold text-white">Hashtag & Keyword Miner</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 font-semibold uppercase">Primary Seed Niche</label>
            <input
              id="hashtag-keyword-input"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., Python Developer, Slow Fashion"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-pink-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none"
            />
          </div>

          <button
            id="hashtag-submit-btn"
            onClick={handleTrackHashtags}
            disabled={loading || !keyword.trim()}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 disabled:from-zinc-900 disabled:to-zinc-900 text-white disabled:text-zinc-650 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-pink-300" />
                <span>Mining competition indexes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-3.5 text-pink-200" />
                <span>Calculate Hashtag Scores</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Workspace output */}
      <div className="xl:col-span-8">
        {!data && !loading && (
          <div className="bg-zinc-950/20 border border-dashed border-zinc-900 rounded-xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
            <Hash className="w-10 h-10 text-zinc-650 mb-4 animate-pulse" />
            <h4 className="text-xs font-bold text-zinc-350">Hashtag Matrix Vacant</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
              Input niche targets above. ContentForge mines search densities, calculated competition ratings, and trending keyword search volume models.
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-6 space-y-6 h-full min-h-[350px] flex flex-col justify-center">
            <div className="space-y-4 animate-pulse">
              <div className="w-32 h-4 bg-zinc-800 rounded-full" />
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full h-12 bg-zinc-850 rounded-lg" />
                <div className="w-full h-12 bg-zinc-850 rounded-lg" />
              </div>
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Trending & Niche column */}
            <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
                <Trophy className="w-4 h-4 text-amber-400" /> Trending & Specialized Tags
              </h4>

              <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
                {[...data.trending, ...data.niche].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg hover:border-zinc-850 transition-colors">
                    <button
                      onClick={() => handleCopyTag(item.tag)}
                      className="text-xs font-mono font-semibold text-indigo-400 hover:text-indigo-300 text-left shrink-0 max-w-[140px] truncate"
                    >
                      {item.tag}
                    </button>
                    
                    <div className="flex items-center gap-3">
                      {/* Popularity bar */}
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block font-mono">Reach: {item.popularity}%</span>
                        <div className="w-14 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${item.popularity}%` }} />
                        </div>
                      </div>

                      {/* Competition indicator */}
                      <span className={`text-[9px] font-mono border px-2 py-0.5 rounded-full ${getCompetitionColor(item.competition)}`}>
                        {getCompetitionText(item.competition)}
                      </span>

                      {/* Copy checker indicator */}
                      <button
                        onClick={() => handleCopyTag(item.tag)}
                        className="p-1 hover:bg-zinc-800 rounded text-zinc-400 transition-colors"
                      >
                        {copiedTag === item.tag ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword planner column */}
            <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3 font-sans">
                💡 High-Intent Target Keywords
              </h4>

              <div className="space-y-3.5 pr-1 font-mono text-xs">
                {data.keywords.map((kw, idx) => (
                  <div key={idx} className="p-3 bg-zinc-950/40 border border-zinc-905 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-zinc-200 font-sans">{kw.term}</span>
                      <span className="text-[10px] text-zinc-500">{kw.volume}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500">Indexed Competition:</span>
                      <span className={`px-2 py-0.2 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-450 ${
                        kw.competition === 'High' ? 'text-red-400' : (kw.competition === 'Medium' ? 'text-amber-400' : 'text-emerald-400')
                      }`}>
                        {kw.competition}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
