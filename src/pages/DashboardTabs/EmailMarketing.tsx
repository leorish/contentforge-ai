/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Sparkles, RefreshCw, Clipboard, Check, Edit3, Heart } from 'lucide-react';

interface EmailData {
  subjects: string[];
  body: string;
}

export default function EmailMarketing() {
  const [campaignType, setCampaignType] = useState('welcome');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EmailData | null>(null);

  // Editable body text
  const [editedBody, setEditedBody] = useState('');
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const handleGenerateEmail = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignType, topic })
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setData(resData.data);
        setEditedBody(resData.data.body || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  return (
    <div id="email-marketing-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
      {/* Parameter inputs */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Mail className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-sans">Campaign Composer</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 font-semibold uppercase">Campaign category</label>
            <select
              id="email-campaign-select"
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="welcome">Welcome Onboarding Flow</option>
              <option value="sales">Sales & Discount Drive</option>
              <option value="launch">Feature Launch Broadcast</option>
              <option value="newsletter">Weekly Educational Digest</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 font-semibold uppercase">Campaign Keywords or Objectives</label>
            <input
              id="email-objective-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 30% discount on Pro plans this weekend"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-650 focus:outline-none"
            />
          </div>

          <button
            id="email-submit-btn"
            onClick={handleGenerateEmail}
            disabled={loading || !topic.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-505 disabled:from-zinc-900 text-white disabled:text-zinc-650 rounded-lg text-xs font-semibold shadow flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                <span>Designing letter template...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
                <span>Generate Campaign Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Copy sandbox workspace outputs */}
      <div className="xl:col-span-8">
        {!data && !loading && (
          <div className="bg-zinc-950/20 border border-dashed border-zinc-900 rounded-xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
            <Mail className="w-10 h-10 text-zinc-650 mb-4 animate-pulse" />
            <h4 className="text-xs font-bold text-zinc-350">Email workspace calm</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
              Activate target segments above. Gemini designs double subject lines and professional onboarding, conversion, and promotion bodies in seconds.
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-6 h-full min-h-[350px] flex flex-col justify-center animate-pulse">
            <div className="w-40 h-4 bg-zinc-800 rounded-full" />
            <div className="w-full h-12 bg-zinc-850 rounded-lg mt-3" />
          </div>
        )}

        {data && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Subject lines variations */}
            <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-3 h-full min-h-[320px]">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-2.5 font-mono uppercase">
                🏷️ High-CTR Subject line Variations
              </h4>
              <div className="space-y-3 pt-2 text-xs">
                {data.subjects.map((sj, idx) => (
                  <div key={idx} className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between group relative">
                    <span className="text-zinc-200 leading-relaxed font-sans font-semibold select-text">{sj}</span>
                    <button
                      onClick={() => handleCopy(sj, `sj-${idx}`)}
                      className="text-zinc-500 hover:text-zinc-300 ml-2"
                    >
                      {copiedLabel === `sj-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <Clipboard className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Email letters text editable */}
            <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-3 shadow-sm">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono uppercase">
                  ✉️ Custom Letter Template Body
                </h4>
                <button
                  onClick={() => handleCopy(editedBody, 'body-edit')}
                  className="text-indigo-400 text-xs font-mono select-none"
                >
                  {copiedLabel === 'body-edit' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                  <span>{copiedLabel === 'body-edit' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <textarea
                id="email-body-editor"
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="w-full h-72 bg-zinc-950/60 border border-zinc-900 rounded-lg p-3 text-xs leading-relaxed font-sans text-zinc-200 resize-none focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
