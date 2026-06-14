/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Check, RefreshCw, Layers, ShieldAlert, Sparkles } from 'lucide-react';
import { BrandProfile } from '../../types';

export default function BrandVoice() {
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Form controls
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState<'Professional' | 'Corporate' | 'Gen Z' | 'Startup' | 'Luxury' | 'Educational'>('Startup');
  const [styleDesc, setStyleDesc] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/settings/brand-voice');
      const data = await r.json();
      setProfiles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const keywordArr = keywordsInput.split(',').map(s => s.trim()).filter(Boolean);
      const response = await fetch('/api/settings/brand-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          industry,
          targetAudience: audience,
          tone,
          writingStyle: styleDesc,
          keywords: keywordArr
        })
      });
      const data = await response.json();
      if (data.success && data.profile) {
        setSuccess(true);
        setName('');
        setIndustry('');
        setAudience('');
        setStyleDesc('');
        setKeywordsInput('');
        setProfiles(prev => [...prev, data.profile]);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="brand-voice-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Brand Create Profile */}
      <form onSubmit={handleCreateProfile} className="xl:col-span-5 bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Sliders className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-bold text-white">Create Custom Brand Profile</h3>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-450 uppercase font-bold">Brand Name</label>
          <input
            id="brand-name-input"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Tesla Motors, Velvet Fragrances"
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500 rounded-lg p-2.5 text-xs text-zinc-105 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-450 uppercase font-bold">Target Industry</label>
            <input
              id="brand-industry-input"
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Premium EV Tech"
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-450 uppercase font-bold">Industry Core Tone</label>
            <select
              id="brand-tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="Startup">Startup (Fast & Narrative)</option>
              <option value="Professional">Professional (Engaging, Authority)</option>
              <option value="Corporate">Corporate Trust (Analytical, Formal)</option>
              <option value="Luxury">Luxury (Evocative, Sleek)</option>
              <option value="Gen Z">Gen Z (Bold, Trendy, Emojis)</option>
              <option value="Educational">Educational (In-depth, Explanatory)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-450 uppercase font-bold">Audience Focus</label>
          <input
            id="brand-audience-input"
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g., Tech Investors, 20-30s Luxury Shoppers"
            className="w-full bg-zinc-950 border border-zinc-805 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-450 uppercase font-bold">Keyword tags (Comma lists)</label>
          <input
            id="brand-keywords-input"
            type="text"
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            placeholder="quiet luxury, sustainable cashmere, minimalist"
            className="w-full bg-zinc-950 border border-zinc-855 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-450 uppercase font-bold">Writing style directions</label>
          <textarea
            id="brand-style-textarea"
            value={styleDesc}
            onChange={(e) => setStyleDesc(e.target.value)}
            placeholder="e.g., Short punchy lines in LinkedIn. Use spacing to create breathing room. Do not use generic buzzwords like revolutionary or synergistic."
            className="w-full h-24 bg-zinc-950 border border-zinc-800 focus:border-violet-500 rounded-lg p-2.5 text-xs text-zinc-250 placeholder-zinc-650 resize-none focus:outline-none"
          />
        </div>

        <button
          id="brand-create-btn"
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 text-white rounded-lg text-xs font-semibold shadow transition-all flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>Lock In Brand Voice Engine</span>
        </button>

        {success && (
          <p className="text-[10px] font-mono text-emerald-400 text-center flex items-center justify-center gap-1 animate-pulse">
            <Check className="w-3.5 h-3.5" /> Brand voice registered successfully!
          </p>
        )}
      </form>

      {/* Brand Profiles Active Lists */}
      <div className="xl:col-span-7 space-y-4">
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-5 shadow-sm space-y-4 h-full min-h-[400px]">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3 uppercase tracking-wider font-mono">
            🎛️ Active Brand Profiles ({profiles.length})
          </h4>

          {loading && (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-5 h-5 text-zinc-500 animate-spin" />
            </div>
          )}

          {!loading && profiles.map((p) => (
            <div key={p.id} className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-3 hover:border-zinc-850 transition-colors relative group">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold text-zinc-200 text-xs">{p.name}</h5>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">{p.industry}</p>
                </div>
                <span className="text-[9px] font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  {p.tone}
                </span>
              </div>

              {p.writingStyle && (
                <p className="text-xs text-zinc-400 leading-relaxed italic pr-2 select-text">
                  "{p.writingStyle}"
                </p>
              )}

              <div className="flex flex-wrap gap-1">
                {p.keywords.map((kw, kIdx) => (
                  <span key={kIdx} className="text-[9px] font-mono bg-zinc-950 border border-zinc-850 text-zinc-400 px-2 py-0.5 rounded">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
