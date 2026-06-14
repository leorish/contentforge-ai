/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Video, Sparkles, RefreshCw, Clipboard, Check, Edit3, Film, PlayCircle, Star } from 'lucide-react';

interface VideoData {
  hooks: string[];
  shortsScript: string;
  titles: string[];
  desc: string;
}

export default function VideoAssistant() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VideoData | null>(null);

  // Editable outputs
  const [editedScript, setEditedScript] = useState('');
  const [editedDesc, setEditedDesc] = useState('');

  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const handleGenerateVideoScripts = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setData(resData.data);
        setEditedScript(resData.data.shortsScript || '');
        setEditedDesc(resData.data.desc || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  return (
    <div id="video-assistant-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Parameter input panel */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-rose-450" />
            <h3 className="text-sm font-bold text-white">Viral Script Blueprint</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 font-semibold uppercase">Video Core Concept</label>
            <input
              id="video-concept-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 3 Things I hate about MySQL query plans"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none"
            />
          </div>

          <button
            id="video-submit-btn"
            onClick={handleGenerateVideoScripts}
            disabled={loading || !topic.trim()}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:from-zinc-900 disabled:to-zinc-900 text-white disabled:text-zinc-650 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-rose-300" />
                <span>Scripting action cues...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-rose-200 animate-pulse" />
                <span>Compose Shorts & Reels Scripts</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scripting Workspace results */}
      <div className="xl:col-span-8">
        {!data && !loading && (
          <div className="bg-zinc-950/20 border border-dashed border-zinc-900 rounded-xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
            <Film className="w-10 h-10 text-zinc-650 mb-4 animate-pulse" />
            <h4 className="text-xs font-bold text-zinc-350">Video scripting board empty</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
              Define a high-click topic on the left. Gemini writes viral subject hooks, timestamp audio directions, and target descriptions for Tiktok, Reels, and Shorts.
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-6 space-y-6 h-full min-h-[350px] flex flex-col justify-center">
            <div className="space-y-4 animate-pulse">
              <div className="w-48 h-4 bg-zinc-800 rounded-full" />
              <div className="space-y-2">
                <div className="w-full h-8 bg-zinc-850/60 rounded" />
                <div className="w-11/12 h-4 bg-zinc-850/40 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Hooks & click titles panel */}
            <div className="space-y-6">
              {/* Hooks list */}
              <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-2.5 font-mono uppercase tracking-wider">
                  <Star className="w-4 h-4 text-amber-500 animate-pulse" /> Retention Hook variations
                </h4>
                <div className="space-y-2.5 text-xs">
                  {data.hooks.map((hk, idx) => (
                    <div key={idx} className="p-3 bg-zinc-950/50 border border-zinc-90 w-full rounded-lg relative group">
                      <p className="text-rose-400 font-bold font-mono text-[10px] mb-1">Hook {idx + 1}</p>
                      <p className="text-zinc-200 leading-relaxed font-sans select-text">{hk}</p>
                      <button
                        onClick={() => handleCopyText(hk, `hk-${idx}`)}
                        className="absolute top-2.5 right-2.5 p-1 text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {copiedLabel === `hk-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Click-through titles list */}
              <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-2.5 font-mono uppercase">
                  🎬 YouTube & Reels click Titles
                </h4>
                <div className="space-y-2 text-xs">
                  {data.titles.map((tl, idx) => (
                    <div key={idx} className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-lg flex items-center justify-between group">
                      <span className="font-semibold text-zinc-200">{tl}</span>
                      <button
                        onClick={() => handleCopyText(tl, `tl-${idx}`)}
                        className="text-zinc-500 hover:text-zinc-350 shrink-0 ml-2"
                      >
                        {copiedLabel === `tl-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Script & Description workspace editable */}
            <div className="space-y-6">
              {/* Shorts scripts edit */}
              <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono uppercase">
                    🎥 Script Block
                  </h4>
                  <button
                    onClick={() => handleCopyText(editedScript, 'sc-edit')}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 select-none font-mono"
                  >
                    {copiedLabel === 'sc-edit' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                    <span>{copiedLabel === 'sc-edit' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  id="video-script-editor"
                  value={editedScript}
                  onChange={(e) => setEditedScript(e.target.value)}
                  className="w-full h-80 bg-zinc-950/60 border border-zinc-905 rounded-lg p-3 text-xs font-mono text-zinc-200 leading-relaxed resize-none focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
