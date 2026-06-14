/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RefreshCw, Sparkles, Clipboard, Check, Edit3, Repeat } from 'lucide-react';

export default function Repurposer() {
  const [blogText, setBlogText] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'linkedin' | 'twitter' | 'instagram' | 'newsletter'>('linkedin');
  const [copied, setCopied] = useState(false);

  // Editable fields
  const [edLinkedIn, setEdLinkedIn] = useState('');
  const [edTwitter, setEdTwitter] = useState('');
  const [edInstagram, setEdInstagram] = useState('');
  const [edNewsletter, setEdNewsletter] = useState('');

  const handleRepurpose = async () => {
    if (!blogText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogPost: blogText })
      });
      const data = await response.json();
      if (data.success && data.data) {
        setOutput(data.data);
        setEdLinkedIn(data.data.linkedin || '');
        setEdTwitter(data.data.twitter || '');
        setEdInstagram(data.data.instagram || '');
        setEdNewsletter(data.data.newsletter || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getActiveText = () => {
    if (activeTab === 'linkedin') return edLinkedIn;
    if (activeTab === 'twitter') return edTwitter;
    if (activeTab === 'instagram') return edInstagram;
    return edNewsletter;
  };

  const setActiveText = (val: string) => {
    if (activeTab === 'linkedin') setEdLinkedIn(val);
    else if (activeTab === 'twitter') setEdTwitter(val);
    else if (activeTab === 'instagram') setEdInstagram(val);
    else setEdNewsletter(val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="repurposing-hub-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
      {/* Blog Input Side panel */}
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Repeat className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Full Blog Multi-Repurposer</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 font-semibold uppercase">Paste Original Source Blog</label>
            <textarea
              id="repurpose-source-input"
              value={blogText}
              onChange={(e) => setBlogText(e.target.value)}
              placeholder="Paste entire blog article here to convert to social handles..."
              className="w-full h-80 bg-zinc-950 border border-zinc-800 focus:border-teal-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-650 resize-none font-sans focus:outline-none"
            />
          </div>

          <button
            id="repurpose-submit-btn"
            onClick={handleRepurpose}
            disabled={loading || !blogText.trim()}
            className="w-full py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 disabled:from-zinc-900 text-white disabled:text-zinc-650 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-teal-300" />
                <span>Converting article formats...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-200 animate-pulse" />
                <span>Repurpose One-Click Social Suite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Repurposed outputs */}
      <div className="xl:col-span-7">
        {!output && !loading && (
          <div className="bg-zinc-950/20 border border-dashed border-zinc-900 rounded-xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
            <Repeat className="w-10 h-10 text-zinc-650 mb-4 animate-pulse" />
            <h4 className="text-xs font-bold text-zinc-350">Repurposing room dormant</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
              Paste long text drafts on the left to extract summaries, LinkedIn bullets, educational newsletter newsletters, and Twitter threads in under 5 seconds.
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-6 space-y-6 h-full min-h-[350px] flex flex-col justify-center animate-pulse">
            <div className="w-32 h-4 bg-zinc-800 rounded-full" />
            <div className="w-full h-12 bg-zinc-850 rounded-lg" />
          </div>
        )}

        {output && !loading && (
          <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl overflow-hidden shadow-md flex flex-col h-full min-h-[380px] justify-between">
            {/* Headers */}
            <div className="flex border-b border-zinc-900 bg-zinc-950/80 px-4 pt-4 gap-2">
              {[
                { id: 'linkedin', label: 'LinkedIn Post' },
                { id: 'twitter', label: 'Twitter Thread' },
                { id: 'instagram', label: 'Instagram Post' },
                { id: 'newsletter', label: 'Email Newsletter' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all ${
                    activeTab === t.id
                      ? 'bg-zinc-900 text-white border-t border-x border-zinc-850'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Editing canvas */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 uppercase font-bold tracking-wider">
                  <Edit3 className="w-3 h-3 text-zinc-500" /> Repurposed copy sandbox (Fully Editable)
                </span>
                <textarea
                  id={`repurpose-edit-${activeTab}`}
                  value={getActiveText()}
                  onChange={(e) => setActiveText(e.target.value)}
                  className="w-full h-64 bg-zinc-950/60 border border-zinc-900 focus:border-teal-500/50 rounded-lg p-3 text-xs text-zinc-200 leading-relaxed font-sans resize-none focus:outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-zinc-900 flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-550 uppercase">Ready for distribution channels</span>
                <button
                  id="repurpose-copy-btn"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 rounded-lg text-xs font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5 text-zinc-500" />}
                  <span>{copied ? 'Copied to clipboard' : 'Copy View'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
