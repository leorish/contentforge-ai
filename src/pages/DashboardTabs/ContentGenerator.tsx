/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles, RefreshCw, Send, Edit3, Clipboard, Check,
  Share2, Calendar, Linkedin, Twitter, Instagram, PlaySquare, AlertCircle,
  History, Download, X, ArrowLeftRight, Undo, FileDown, FileText, Eye
} from 'lucide-react';
import { ContentProject } from '../../types';
import DictationButton from '../../components/DictationButton';

export default function ContentGenerator() {
  const [topic, setTopic] = useState('');
  const [brandVoiceId, setBrandVoiceId] = useState('');
  const [brandVoices, setBrandVoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<ContentProject | null>(null);

  // Editable states for output
  const [editedLinkedIn, setEditedLinkedIn] = useState('');
  const [editedInstagram, setEditedInstagram] = useState('');
  const [editedTwitter, setEditedTwitter] = useState('');
  const [editedYoutubeScript, setEditedYoutubeScript] = useState('');

  const [activePreviewTab, setActivePreviewTab] = useState<'linkedin' | 'twitter' | 'instagram' | 'youtube'>('linkedin');
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);

  // Recent Versions history states
  const [generationsHistory, setGenerationsHistory] = useState<ContentProject[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [compareProject, setCompareProject] = useState<ContentProject | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Visual Live Mockup preview modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Command palette prefill listener on mount and event hooks
  useEffect(() => {
    const checkPrefill = () => {
      const stored = localStorage.getItem('command-palette-prefill-generator');
      if (stored) {
        setTopic(stored);
        localStorage.removeItem('command-palette-prefill-generator');
      }
    };

    checkPrefill();
    window.addEventListener('command-palette-prefill', checkPrefill);
    return () => window.removeEventListener('command-palette-prefill', checkPrefill);
  }, []);

  // Fetch brand profiles and load drafts history
  useEffect(() => {
    // Fetch Brand Profiles
    fetch('/api/settings/brand-voice')
      .then(r => r.json())
      .then(data => {
        setBrandVoices(data);
        if (data.length > 0) setBrandVoiceId(data[0].id);
      })
      .catch(e => console.error("Error fetching profiles", e));

    // Load History from localStorage
    const saved = localStorage.getItem('generator-history-drafts');
    if (saved) {
      try {
        setGenerationsHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse configurations history", e);
      }
    }
  }, []);

  // Restore the previous drafting session automatically if the page is refreshed
  useEffect(() => {
    const savedSession = localStorage.getItem('contentforge-auto-save-session-v3');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.topic) setTopic(session.topic);
        if (session.editedLinkedIn) setEditedLinkedIn(session.editedLinkedIn);
        if (session.editedInstagram) setEditedInstagram(session.editedInstagram);
        if (session.editedTwitter) setEditedTwitter(session.editedTwitter);
        if (session.editedYoutubeScript) setEditedYoutubeScript(session.editedYoutubeScript);
        if (session.project) setProject(session.project);
      } catch (err) {
        console.error("Failed to reload auto-saved draft session", err);
      }
    }
  }, []);

  // Continuously write active workspace states into local storage
  useEffect(() => {
    if (topic || editedLinkedIn || editedInstagram || editedTwitter || editedYoutubeScript || project) {
      const session = {
        topic,
        editedLinkedIn,
        editedInstagram,
        editedTwitter,
        editedYoutubeScript,
        project
      };
      localStorage.setItem('contentforge-auto-save-session-v3', JSON.stringify(session));
    }
  }, [topic, editedLinkedIn, editedInstagram, editedTwitter, editedYoutubeScript, project]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setScheduleSuccess(null);
    try {
      const response = await fetch('/api/generate/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, brandVoiceId })
      });
      const data = await response.json();
      if (data.success && data.project) {
        setProject(data.project);
        setEditedLinkedIn(data.project.content.linkedin || '');
        setEditedInstagram(data.project.content.instagram || '');
        setEditedTwitter(data.project.content.twitter || '');
        setEditedYoutubeScript(data.project.content.youtube_script || '');

        // Persist to Generations History (Max 15 items)
        setGenerationsHistory(prev => {
          const filtered = prev.filter(p => p.topic.toLowerCase() !== topic.toLowerCase());
          const updated = [data.project, ...filtered].slice(0, 15);
          localStorage.setItem('generator-history-drafts', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(label);
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  const handleQuickSchedule = async (content: string, platform: string) => {
    try {
      const response = await fetch('/api/scheduler/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Generated ${platform} post from: ${topic}`,
          content,
          platforms: [platform],
          scheduledTime: new Date(Date.now() + 86450000).toISOString(), // ~1 day later
          status: 'Scheduled'
        })
      });
      const resData = await response.json();
      if (resData.success) {
        setScheduleSuccess(`Successfully scheduled to ${platform} calendar board!`);
        setTimeout(() => setScheduleSuccess(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getActiveContentValue = () => {
    if (activePreviewTab === 'linkedin') return editedLinkedIn;
    if (activePreviewTab === 'twitter') return editedTwitter;
    if (activePreviewTab === 'instagram') return editedInstagram;
    return editedYoutubeScript;
  };

  const getHistoricalContentValue = (proj: ContentProject) => {
    if (activePreviewTab === 'linkedin') return proj.content.linkedin || '';
    if (activePreviewTab === 'twitter') return proj.content.twitter || '';
    if (activePreviewTab === 'instagram') return proj.content.instagram || '';
    return proj.content.youtube_script || '';
  };

  const setActiveContentValue = (val: string) => {
    if (activePreviewTab === 'linkedin') setEditedLinkedIn(val);
    else if (activePreviewTab === 'twitter') setEditedTwitter(val);
    else if (activePreviewTab === 'instagram') setEditedInstagram(val);
    else setEditedYoutubeScript(val);
  };

  const getPlatformLabel = () => {
    if (activePreviewTab === 'linkedin') return 'LinkedIn';
    if (activePreviewTab === 'twitter') return 'X/Twitter';
    if (activePreviewTab === 'instagram') return 'Instagram';
    return 'YouTube';
  };

  // Revert back sandbox to any selected historical draft
  const handleRevertToHistory = (histProj: ContentProject) => {
    setTopic(histProj.topic);
    setProject(histProj);
    setEditedLinkedIn(histProj.content.linkedin || '');
    setEditedInstagram(histProj.content.instagram || '');
    setEditedTwitter(histProj.content.twitter || '');
    setEditedYoutubeScript(histProj.content.youtube_script || '');
    setScheduleSuccess(`Restored version from ${new Date(histProj.generatedAt).toLocaleTimeString()}`);
    setTimeout(() => setScheduleSuccess(null), 4000);
  };

  // Export draft copy to PDF, Markdown, Plain Text, or CSV Spreadsheet
  const handleExportCopy = (format: 'pdf' | 'markdown' | 'text' | 'csv') => {
    const activeText = getActiveContentValue();
    const platLabel = getPlatformLabel();
    const cleanTopic = topic.trim() || 'untitled-asset';
    const filename = `contentforge-${platLabel.toLowerCase()}-${cleanTopic.replace(/\s+/g, '-').toLowerCase()}`;

    setExportDropdownOpen(false);

    if (format === 'text') {
      const blob = new Blob([activeText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Build compliant CSV content structure
      const headers = ['Platform', 'Campaign Topic', 'Generated Copy', 'Hashtags'];
      const rows = [
        [
          platLabel,
          cleanTopic,
          activeText.replace(/"/g, '""'), // Escape interior quotes
          project?.content.hashtags ? project.content.hashtags.map(t => `#${t}`).join(' ') : ''
        ]
      ];
      
      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'markdown') {
      const tagsStr = project?.content.hashtags ? '\n\n' + project.content.hashtags.map(t => `#${t}`).join(' ') : '';
      const mdTpl = `# AI Omnichannel Draft: ${cleanTopic}\n\n*Generated via ContentForge AI on ${new Date().toLocaleDateString()}*\nPlatform: **${platLabel}**\n\n---\n\n${activeText}${tagsStr}`;
      const blob = new Blob([mdTpl], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.md`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const pWin = window.open('', '_blank');
      if (pWin) {
        pWin.document.write(`
          <html>
            <head>
              <title>${cleanTopic} [${platLabel} Draft] - ContentForge</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  color: #1f2937;
                  padding: 40px;
                  max-width: 800px;
                  margin: 0 auto;
                  line-height: 1.6;
                }
                .brand {
                  color: #4f46e5;
                  font-size: 11px;
                  font-weight: bold;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                }
                .header {
                  border-bottom: 2px solid #e5e7eb;
                  padding-bottom: 20px;
                  margin-bottom: 25px;
                }
                .title {
                  font-size: 26px;
                  font-weight: 800;
                  color: #111827;
                  margin: 10px 0 5px 0;
                  letter-spacing: -0.02em;
                }
                .meta {
                  font-size: 12px;
                  color: #6b7280;
                }
                .content {
                  white-space: pre-wrap;
                  font-size: 15px;
                  background: #f9fafb;
                  padding: 25px;
                  border-radius: 12px;
                  border: 1px solid #e5e7eb;
                  color: #374151;
                }
                .footer {
                  margin-top: 60px;
                  font-size: 11px;
                  color: #9ca3af;
                  text-align: center;
                  border-top: 1px solid #f3f4f6;
                  padding-top: 20px;
                }
              </style>
            </head>
            <body>
              <div class="brand">ContentForge AI Omnichannel Engine</div>
              <div class="header">
                <h1 class="title">${platLabel} Marketing Post</h1>
                <div class="meta">Topic: <strong>${cleanTopic}</strong> | Date: ${new Date().toLocaleDateString()}</div>
              </div>
              <div class="content">${activeText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
              <div class="footer">Exported from ContentForge Workspace. PDF generated via client layout printout module.</div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                }
              </script>
            </body>
          </html>
        `);
        pWin.document.close();
      }
    }
  };

  return (
    <div id="content-generator-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in relative">
      
      {/* Parameters Panel */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Generate Multi-platform Suite</h3>
            </div>

            {/* History Trigger Button with badges */}
            <button
              id="btn-trigger-history-drawer"
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-xs text-zinc-300 font-semibold cursor-pointer select-none"
            >
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span>History ({generationsHistory.length})</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider block">Campaign Keyword or Core Topic</label>
            <div className="flex gap-2">
              <input
                id="generator-topic-input"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Django Learning, Quiet Luxury, React Hooks"
                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
              />
              <DictationButton
                onTranscript={(text) => setTopic(prev => prev ? prev + ' ' + text : text)}
                placeholder="Dictate topic idea via voice"
              />
            </div>
            
            {/* Clickable suggestion badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-zinc-500 self-center mr-0.5">Presets:</span>
              {['Django Learning', 'Quiet Luxury', 'React Hooks', 'SaaS Growth'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  className="text-[10px] bg-zinc-900 hover:bg-zinc-850 hover:text-white border border-zinc-800 rounded px-2 py-0.5 text-zinc-400 font-medium transition-all cursor-pointer active:scale-95"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Brand voice selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider">Select Brand Voice Engine</label>
            <select
              id="generator-brand-select"
              value={brandVoiceId}
              onChange={(e) => setBrandVoiceId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none transition-colors"
            >
              <option value="">Default Clean SaaS Voice</option>
              {brandVoices.map((bv) => (
                <option key={bv.id} value={bv.id}>{bv.name} ({bv.tone})</option>
              ))}
            </select>
          </div>

          {/* Action Trigger Button */}
          <button
            id="generator-submit-button"
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-zinc-900 disabled:to-zinc-900 text-white disabled:text-zinc-600 rounded-lg text-sm font-semibold transition-all shadow-md shadow-purple-500/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                <span>Crafting Suite via Gemini-3.5...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
                <span>Compose Campaign Assets</span>
              </>
            )}
          </button>
        </div>

        {/* Informative Side Card */}
        <div className="bg-gradient-to-br from-zinc-950/20 to-indigo-950/10 border border-zinc-900/60 rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-mono font-semibold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> How Omnichannel generation behaves
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            ContentForge processes your topic, aligns keywords, injects your chosen Brand voice rules, and instructs Gemini to structure layouts matching LinkedIn paragraphs, Instagram tags, Twitter thread numbers, and Youtube timestamps.
          </p>
        </div>
      </div>

      {/* Generation Output Workdesk */}
      <div className="xl:col-span-5">
        {!project && !loading && (
          <div className="bg-zinc-950/20 border border-dashed border-zinc-900 rounded-xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="w-12 h-12 bg-zinc-900 rounded-full border border-zinc-850 flex items-center justify-center text-zinc-500 mb-4 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-300 font-sans">Workspace Vacant</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed font-sans">
              Define a topic and parameters on the left or search commands in Cmd+K palette to activate copywriting.
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-6 space-y-6 h-full min-h-[400px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex animate-pulse items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800" />
                <div className="w-32 h-4 bg-zinc-800 rounded-full" />
              </div>
              <div className="space-y-3 pt-2">
                <div className="w-full h-8 bg-zinc-800/60 rounded-lg animate-pulse" />
                <div className="w-11/12 h-4 bg-zinc-800/40 rounded-full animate-pulse" />
                <div className="w-4/5 h-4 bg-zinc-800/40 rounded-full animate-pulse" />
                <div className="w-10/12 h-12 bg-zinc-800/30 rounded-lg animate-pulse" />
              </div>
            </div>
            <p className="text-center text-[11px] font-mono text-indigo-400/80 animate-pulse tracking-wide italic">
              "Analyzing topic trends & synthesizing perfect narrative nodes..."
            </p>
          </div>
        )}

        {project && !loading && (
          <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl overflow-hidden shadow-md flex flex-col h-full min-h-[450px]">
            {/* Tab Swappers */}
            <div className="flex border-b border-zinc-900 bg-zinc-950/80 px-4 pt-4 gap-2 justify-between items-center">
              <div className="flex gap-1">
                {[
                  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                  { id: 'twitter', label: 'X/Twitter', icon: Twitter },
                  { id: 'instagram', label: 'Instagram', icon: Instagram },
                  { id: 'youtube', label: 'YouTube Script', icon: PlaySquare },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = activePreviewTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActivePreviewTab(t.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-900 text-white border-t border-x border-zinc-850'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Top Export utility group */}
              <div className="relative pr-4 pb-1.5">
                <button
                  id="btn-export-dropdown-toggle"
                  type="button"
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] text-zinc-300 font-semibold cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Export ({getPlatformLabel()})</span>
                </button>

                {exportDropdownOpen && (
                  <div className="absolute right-4 top-9 z-40 w-40 bg-zinc-950 border border-zinc-800 p-1.5 rounded-lg shadow-xl space-y-1 font-mono text-[11px] animate-fade-in text-zinc-300">
                    <button
                      onClick={() => handleExportCopy('pdf')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white rounded text-left cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5 text-rose-500" /> Save as PDF Document
                    </button>
                    <button
                      onClick={() => handleExportCopy('csv')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white rounded text-left cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-500" /> Save as CSV Spreadsheet
                    </button>
                    <button
                      onClick={() => handleExportCopy('markdown')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white rounded text-left cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" /> Download Markdown
                    </button>
                    <button
                      onClick={() => handleExportCopy('text')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white rounded text-left cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" /> Raw Text (.txt)
                    </button>
                    <div className="pt-1 border-t border-zinc-900 text-center text-[9px] text-zinc-600 block">
                      Press esc to close
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Editable Canvas */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-mono flex items-center gap-1.5 select-none">
                    <Edit3 className="w-3.5 h-3.5 text-zinc-650" /> Output Sandbox (Fully Editable)
                  </span>
                  
                  {/* Quick stats counter */}
                  <span className="text-zinc-500 font-mono">{getActiveContentValue().length} characters</span>
                </div>

                <textarea
                  id={`editor-area-${activePreviewTab}`}
                  value={getActiveContentValue()}
                  onChange={(e) => setActiveContentValue(e.target.value)}
                  className="w-full h-64 bg-zinc-950/60 border border-zinc-900 focus:border-indigo-500/50 focus:outline-none rounded-xl p-4 text-xs font-sans text-zinc-200 leading-relaxed font-normal whitespace-pre-wrap select-text resize-none"
                />
              </div>

              {/* Hashtag List */}
              {project.content.hashtags && project.content.hashtags.length > 0 && (
                <div className="pt-3 border-t border-zinc-900/60">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1.5 font-bold tracking-widest">Extracted Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.content.hashtags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full font-mono border border-indigo-500/15">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status messages & Schedule action footer */}
              <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div>
                  {scheduleSuccess ? (
                    <p className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {scheduleSuccess}
                    </p>
                  ) : (
                    <p className="text-[11px] text-zinc-500 font-sans italic">
                      Verify writing style and layout structures before scheduling tasks.
                    </p>
                  )}
                </div>

                 <div className="flex gap-2">
                  <button
                    id="btn-preview-draft"
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg text-xs font-semibold text-indigo-400 transition-colors border border-indigo-500/20 cursor-pointer active:scale-95"
                    title="Real-time Visual Feed Previews mockup dashboard"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Real-time Preview</span>
                  </button>

                  <button
                    id="btn-copy-draft"
                    onClick={() => handleCopy(getActiveContentValue(), activePreviewTab)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-850 rounded-lg text-xs text-white transition-colors border border-zinc-800 cursor-pointer"
                  >
                    {copiedStatus === activePreviewTab ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy Draft</span>
                      </>
                    )}
                  </button>

                  <button
                    id="btn-schedule-draft"
                    onClick={() => handleQuickSchedule(getActiveContentValue(), getPlatformLabel())}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white transition-all shadow-md shadow-indigo-500/10 active:scale-95 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Queue & Schedule</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights & Performance Feedback Side-Panel */}
      <div className="xl:col-span-3 space-y-6">
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-indigo-500 animate-ping"></span> AI Content Insights
            </h3>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">Real-time</span>
          </div>

          {/* Micro score engine */}
          {(() => {
            const activeDraftBody = getActiveContentValue() || '';
            const charLength = activeDraftBody.length;
            const wordCount = activeDraftBody.split(/\s+/).filter(Boolean).length;
            const hashtagCount = (activeDraftBody.match(/#[a-zA-Z0-9_]+/g) || []).length;
            const tagCount = (activeDraftBody.match(/@[a-zA-Z0-9_]+/g) || []).length;

            let seoGrade = 0;
            if (charLength > 0) {
              seoGrade = Math.min(100, Math.round(
                (Math.min(charLength, 450) / 6) + // up to 75 pts length factor
                (hashtagCount >= 2 ? 15 : hashtagCount * 7) + // hashtags
                (wordCount >= 30 ? 10 : 5) // density
              ));
            }

            let scoreColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
            if (seoGrade >= 75) {
              scoreColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            } else if (seoGrade >= 45) {
              scoreColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
            }

            // Sentiment analysis based on text markers
            let sentimentGrade = "Informative";
            if (activeDraftBody.toLowerCase().includes("scalable") || activeDraftBody.toLowerCase().includes("robust") || activeDraftBody.toLowerCase().includes("architecture")) {
              sentimentGrade = "Authoritative";
            } else if (activeDraftBody.toLowerCase().includes("secret") || activeDraftBody.toLowerCase().includes("reveals") || activeDraftBody.toLowerCase().includes("boost")) {
              sentimentGrade = "Persuasive";
            } else if (activeDraftBody.toLowerCase().includes("congratulations") || activeDraftBody.toLowerCase().includes("transform") || activeDraftBody.toLowerCase().includes("growth")) {
              sentimentGrade = "Inspiring";
            } else if (activeDraftBody.length === 0) {
              sentimentGrade = "N/A";
            }

            const appendKeyword = (kw: string) => {
              const spacing = activeDraftBody ? ' ' : '';
              if (activePreviewTab === 'linkedin') setEditedLinkedIn(prev => prev + spacing + kw);
              else if (activePreviewTab === 'twitter') setEditedTwitter(prev => prev + spacing + kw);
              else if (activePreviewTab === 'instagram') setEditedInstagram(prev => prev + spacing + kw);
              else if (activePreviewTab === 'youtube') setEditedYoutubeScript(prev => prev + spacing + kw);
            };

            return (
              <div className="space-y-4 font-sans">
                {/* Score badge & Title */}
                <div className="flex items-center gap-3">
                  <div className={`text-xl font-bold font-mono px-3 py-2.5 rounded-xl border ${scoreColor}`}>
                    {seoGrade}
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-200">Draft Conversion Grade</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Based on length, tags, and structure rules</p>
                  </div>
                </div>

                {/* Sentiment Label */}
                <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-900 flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium">Estimated Sentiment:</span>
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {sentimentGrade}
                  </span>
                </div>

                {/* Intelligent topic insertion pills */}
                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <h6 className="text-[11px] font-mono font-bold text-zinc-400 tracking-wider uppercase">Hot Trend Suggestions</h6>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">Click to automatically insert optimized industry triggers into your active draft:</p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { word: '#buildinpublic', label: 'Build in Public' },
                      { word: 'High-performance scalability', label: 'Scalability' },
                      { word: '#saasgrowth', label: 'SaaS Growth' },
                      { word: 'Production-ready framework', label: 'Production Ready' },
                      { word: 'Quiet luxury aesthetic', label: 'Quiet Luxury' },
                      { word: 'Actionable blueprints', label: 'Blueprints' }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => appendKeyword(item.word)}
                        className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-850 text-[10px] font-medium transition-all active:scale-95 cursor-pointer"
                        title={`Inject "${item.word}" into active draft workspace`}
                      >
                        + {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checklists indicator */}
                <div className="space-y-2 pt-4 border-t border-zinc-900 font-mono text-[10px]">
                  <h6 className="font-bold text-zinc-400 uppercase tracking-widest">Niche Optimization Check</h6>
                  <ul className="space-y-1.5 text-zinc-500">
                    <li className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${charLength > 40 ? 'bg-emerald-400' : 'bg-zinc-700'}`}></span>
                      Minimum length check: {charLength > 40 ? 'Verified' : 'Too short'}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${hashtagCount > 0 ? 'bg-emerald-400' : 'bg-zinc-700'}`}></span>
                      Hashtags discovered: {hashtagCount} counts
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${charLength > 0 ? 'bg-emerald-400' : 'bg-zinc-700'}`}></span>
                      Vetted brand style rules: Active
                    </li>
                  </ul>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* RECENT GENERATIONS DRAWER (Sidebar Overlay) */}
      {isHistoryOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-zinc-950 border-l border-zinc-850 shadow-2xl flex flex-col animate-fade-in font-sans">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Recent Generations</h3>
            </div>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
            {generationsHistory.length === 0 ? (
              <div className="p-8 text-center text-zinc-550 border border-zinc-900 border-dashed rounded-xl">
                <History className="w-8 h-8 mx-auto mb-2 text-zinc-700 animate-pulse" />
                <p className="text-xs">No previous drafts kept in local cache yet.</p>
              </div>
            ) : (
              generationsHistory.map((hist, histIdx) => (
                <div
                  key={hist.id}
                  className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:border-zinc-800 space-y-3 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-zinc-250 truncate">{hist.topic}</h4>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1">
                      {new Date(hist.generatedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions inside historical item card */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleRevertToHistory(hist)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-indigo-600/15 hover:bg-indigo-600 text-[10px] font-bold text-indigo-300 hover:text-white transition-all cursor-pointer"
                      title="Load this previous campaign drafts suite into workspace"
                    >
                      <Undo className="w-3 h-3" />
                      <span>Revert Back</span>
                    </button>

                    <button
                      onClick={() => setCompareProject(hist)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white border border-zinc-850 transition-all cursor-pointer"
                      title="Compare differences side-by-side"
                    >
                      <ArrowLeftRight className="w-3 h-3 text-cyan-400" />
                      <span>Compare</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-zinc-900 bg-zinc-950 text-center">
            <p className="text-[9px] font-mono text-zinc-550 italic">
              Up to 15 draft generation suites stored offline in browser memory.
            </p>
          </div>
        </div>
      )}

      {/* VISUAL COMPARE MODE DIALOG OVERLAY */}
      {compareProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCompareProject(null)} />

          <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fade-in font-sans">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-950 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Compare Draft Version</h3>
                  <p className="text-[10px] text-zinc-550 font-mono mt-0.5">Focus: {getPlatformLabel()} Copy</p>
                </div>
              </div>
              <button
                onClick={() => setCompareProject(null)}
                className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Side-by-side panels */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-950">
              
              {/* Left Column: Active workspace values */}
              <div className="space-y-2.5 flex flex-col h-full">
                <div className="flex items-center justify-between text-xs font-mono select-none">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Active Sandboxed Copy
                  </span>
                  <span className="text-zinc-600">{getActiveContentValue().length} ch</span>
                </div>
                <div className="flex-1 min-h-[300px] p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 text-xs text-zinc-300 leading-relaxed font-normal select-text whitespace-pre-wrap font-sans overflow-y-auto">
                  {getActiveContentValue() || <em className="text-zinc-650">No text composed</em>}
                </div>
              </div>

              {/* Right Column: Historical comparison item */}
              <div className="space-y-2.5 flex flex-col h-full">
                <div className="flex items-center justify-between text-xs font-mono select-none">
                  <span className="text-indigo-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" /> Version: {new Date(compareProject.generatedAt).toLocaleTimeString()}
                  </span>
                  <span className="text-zinc-500">{getHistoricalContentValue(compareProject).length} ch</span>
                </div>
                <div className="flex-1 min-h-[300px] p-4 rounded-xl bg-zinc-900/30 border border-zinc-850/60 text-xs text-zinc-400 leading-relaxed font-normal select-text whitespace-pre-wrap font-sans overflow-y-auto">
                  {getHistoricalContentValue(compareProject)}
                </div>
              </div>

            </div>

            {/* Compare Modal Actions Footer */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex justify-end gap-3.5">
              <button
                onClick={() => setCompareProject(null)}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold text-zinc-350 cursor-pointer"
              >
                Close Comparison
              </button>
              <button
                onClick={() => {
                  handleRevertToHistory(compareProject);
                  setCompareProject(null);
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Undo className="w-3.5 h-3.5" /> Use This Version Instead
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REAL-TIME VISUAL PLATFORM FEED PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsPreviewModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-[#0F1115] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans animate-fade-in">
            {/* Modal Header */}
            <div className="p-4 bg-[#14171C] border-b border-zinc-900 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B7CFF]" />
                <h3 className="text-sm font-semibold text-white">Visual Live Feedback Previews</h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 hover:bg-zinc-805 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inner Interactive Feed Visualizers */}
            <div className="p-6 bg-[#0E1013] space-y-5">
              <div className="flex justify-center gap-1.5 p-1 bg-zinc-950 rounded-lg border border-zinc-900">
                {[
                  { id: 'linkedin', label: 'LinkedIn' },
                  { id: 'twitter', label: 'X/Twitter' },
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'youtube', label: 'YouTube' }
                ].map((item) => {
                  const isCurrent = activePreviewTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePreviewTab(item.id as any)}
                      className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        isCurrent ? 'bg-zinc-805 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Feed Content Box */}
              <div className="bg-[#12151B] border border-zinc-850 rounded-xl p-4.5 space-y-3.5 shadow-inner">
                {activePreviewTab === 'linkedin' && (
                  <div className="space-y-3 font-sans">
                    {/* LinkedIn Header */}
                    <div className="flex gap-2.5 items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-[#6C5CE7] flex items-center justify-center font-bold text-xs text-white">
                        RG
                      </div>
                      <div className="leading-tight">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-zinc-100">Rishabh Gupta</span>
                          <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-1 rounded">Owner</span>
                        </div>
                        <p className="text-[10px] text-zinc-400">Founder & Enterprise Architect • 1st</p>
                        <p className="text-[9px] text-zinc-500 flex items-center gap-0.5 mt-0.5">
                          Just now • <span className="w-2 h-2 rounded-full inline-block bg-zinc-600" />
                        </p>
                      </div>
                    </div>

                    {/* Post Draft Content */}
                    <div className="text-[11.5px] text-zinc-350 leading-relaxed font-normal whitespace-pre-wrap select-text">
                      {editedLinkedIn || <em className="text-zinc-600 block py-4 text-center">No LinkedIn draft written yet. Write content in the editor first.</em>}
                    </div>

                    {/* Likes & Feedback Bar */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-zinc-900 font-mono text-[9px] text-zinc-500">
                      <span>42 Reactions • 12 Comments</span>
                      <span>1 Repost</span>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'twitter' && (
                  <div className="space-y-3 font-sans">
                    {/* Twitter Header */}
                    <div className="flex gap-2.5 items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-indigo-950 flex items-center justify-center font-bold text-xs text-white">
                        RG
                      </div>
                      <div className="leading-tight">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-zinc-100">Rishabh Gupta</span>
                          <span className="text-[10px] text-zinc-500">@rishabh_gupta</span>
                        </div>
                        <p className="text-[10px] text-zinc-500">SaaS Systems builder • Just now</p>
                      </div>
                    </div>

                    {/* Post Draft Content */}
                    <div className="text-[12px] text-zinc-300 leading-normal font-normal whitespace-pre-wrap select-text">
                      {editedTwitter || <em className="text-zinc-600 block py-4 text-center">No Twitter/X thread written yet. Write content in the editor first.</em>}
                    </div>

                    {/* Likes & Feedback Bar */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-zinc-900 font-mono text-[9px] text-zinc-500">
                      <span>85 Likes</span>
                      <span>28 Reposts</span>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'instagram' && (
                  <div className="space-y-3 font-sans">
                    {/* Instagram Header */}
                    <div className="flex gap-2.5 items-center">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-[#6C5CE7] flex items-center justify-center font-bold text-[10px] text-white">
                        RG
                      </div>
                      <div className="leading-tight">
                        <div className="flex items-center gap-1 font-semibold text-xs text-zinc-150">
                          <span>rishabh_gupta</span>
                          <span className="w-1 h-1 rounded-full bg-blue-400" title="Verified Professional" />
                        </div>
                        <p className="text-[9px] text-zinc-500 font-mono">Singapore</p>
                      </div>
                    </div>

                    {/* Beautiful Simulated Post Frame (Gradient mock content image) */}
                    <div className="aspect-square w-full rounded-lg bg-gradient-to-br from-indigo-950/40 to-purple-950/20 text-[#6C5CE7] border border-zinc-850 flex flex-col items-center justify-center text-center p-6 space-y-2">
                      <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-zinc-400">AUTOMATIC MULTIMEDIA LAYOUT</span>
                      <p className="text-xs text-zinc-200 mt-1 italic font-semibold font-serif">"{topic || 'SaaS Campaign'}"</p>
                    </div>

                    {/* Post Draft Content */}
                    <div className="text-[11.5px] text-zinc-350 leading-relaxed font-normal whitespace-pre-wrap select-text">
                      <strong className="text-zinc-150 mr-1.5 font-bold">rishabh_gupta</strong>
                      {editedInstagram || <span className="text-zinc-600">No Instagram caption generated yet.</span>}
                    </div>
                  </div>
                )}

                {activePreviewTab === 'youtube' && (
                  <div className="space-y-3 font-sans">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-10 h-10 rounded-full bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 flex items-center justify-center font-mono font-bold text-xs text-[#8B7CFF]">
                        YT
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-100 font-sans">Rishabh Gupta Strategy</span>
                        <p className="text-[9px] text-zinc-500 font-mono">Video Narrator Script Block</p>
                      </div>
                    </div>

                    {/* Post Draft Content */}
                    <div className="text-[11.5px] text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap select-text bg-[#07090C] p-3.5 rounded-lg border border-zinc-900">
                      {editedYoutubeScript || <em className="text-zinc-600 block py-4 text-center">No video script written yet.</em>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Close actions */}
            <div className="p-4 border-t border-zinc-900 bg-[#14171C] flex justify-end">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-350 cursor-pointer transition-colors"
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
