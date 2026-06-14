/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Share2, Sparkles, RefreshCw, Clipboard, Check, Eye, Smartphone,
  Linkedin, Twitter, Instagram, Facebook, Send, Smile
} from 'lucide-react';

export default function SocialMedia() {
  const [inputText, setInputText] = useState('');
  const [platform, setPlatform] = useState<'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'threads'>('linkedin');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `Refine and optimize this core social copy for ${platform.toUpperCase()}. Focus on writing with a ${tone} tone. Source: "${inputText}"`
        })
      });
      const data = await response.json();
      if (data.success && data.project) {
        // Extract matching platform content
        const content = data.project.content;
        let finalCopy = '';
        if (platform === 'linkedin') finalCopy = content.linkedin || '';
        else if (platform === 'twitter') finalCopy = content.twitter || '';
        else if (platform === 'instagram') finalCopy = content.instagram || '';
        else finalCopy = content.facebook || content.linkedin || '';
        
        setOutput(finalCopy);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="social-optimizer-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
      {/* Input controls */}
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Platform-Specific Optimizer</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider">Raw Text Outline</label>
            <textarea
              id="social-raw-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="E.g., We are launching our Django platform today. It helps developers automate databases and queues. Let us know if you want access."
              className="w-full h-36 bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-650 resize-none focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 font-semibold uppercase">Platform Goal</label>
              <select
                id="social-platform-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="linkedin">LinkedIn Post</option>
                <option value="twitter">X/Twitter Thread</option>
                <option value="instagram">Instagram Caption</option>
                <option value="facebook">Facebook Feed</option>
                <option value="threads">Threads Style</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 font-semibold uppercase">Behavior Tone</label>
              <select
                id="social-tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="Startup">Casual Startup</option>
                <option value="Corporate">Corporate Trust</option>
                <option value="Gen Z">Gen Z Slang / Trendy</option>
                <option value="Luxury">Quiet Luxury / Minimalist</option>
                <option value="Educational">Deep Educational</option>
              </select>
            </div>
          </div>

          <button
            id="social-optimize-btn"
            onClick={handleOptimize}
            disabled={loading || !inputText.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-zinc-900 disabled:to-zinc-900 text-white disabled:text-zinc-650 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
                <span>Calibrating format guidelines...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
                <span>Optimize & Adapt Format</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulator Workspace */}
      <div className="xl:col-span-7 space-y-4">
        {/* Mock phone layout simulator */}
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl overflow-hidden shadow-md flex flex-col justify-between min-h-[380px]">
          <div className="flex border-b border-zinc-900 bg-zinc-950/80 px-4 py-3 items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-blue-400" /> Platform Feed Simulator ({platform})
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
              <span className="text-[10px] font-mono text-zinc-500">Live feeds</span>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-center">
            {!output && !loading && (
              <div className="text-center py-6 flex flex-col items-center">
                <Smile className="w-10 h-10 text-zinc-650 mb-3" />
                <h4 className="text-xs font-bold text-zinc-400">Sandbox Preview Ready</h4>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                  Fill the text draft on the left, activate format goals, and we'll paint the simulated mobile feedback.
                </p>
              </div>
            )}

            {loading && (
              <div className="space-y-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-zinc-800" />
                  <div className="w-24 h-3 bg-zinc-800 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-zinc-850/60 rounded-full" />
                  <div className="w-11/12 h-4 bg-zinc-850/40 rounded-full" />
                </div>
              </div>
            )}

            {output && !loading && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4 relative font-sans text-xs max-w-md mx-auto w-full select-text shadow-inner">
                {/* Simulated profile bar */}
                <div className="flex items-center gap-2.5 border-b border-zinc-800/40 pb-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-950 flex items-center justify-center font-bold text-indigo-300 font-mono text-[10px]">
                    CF
                  </div>
                  <div>
                    <h5 className="font-semibold text-zinc-100 flex items-center gap-1">
                      ContentForge AI <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.2 rounded-full font-mono border border-indigo-500/20">Corp</span>
                    </h5>
                    <p className="text-[9px] text-zinc-500">Just now • Published from dashboard</p>
                  </div>
                </div>

                {/* Main optimized social paragraph */}
                <p className="text-zinc-200 leading-relaxed text-xs whitespace-pre-wrap select-text">{output}</p>

                {/* Interactive metrics bar mock */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-805/60 pt-3">
                  <span>👍 1.2k Likes</span>
                  <span>💬 48 comments • 12 shares</span>
                </div>
              </div>
            )}
          </div>

          {output && !loading && (
            <div className="px-6 py-4.5 bg-zinc-950/80 border-t border-zinc-900/80 flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-500">Perfected character limits applied.</span>
              <button
                id="btn-copy-social"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-white hover:text-zinc-200 rounded-lg text-xs transition-colors border border-zinc-850"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5 text-zinc-500" />}
                <span>{copied ? 'Copied' : 'Copy Optimized Post'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
