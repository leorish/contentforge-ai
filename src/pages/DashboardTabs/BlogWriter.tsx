/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen, Sparkles, RefreshCw, Clipboard, Check, Edit3, ArrowRight,
  TrendingUp, Award, HelpCircle, FileText, Settings, Search, CheckCircle,
  History, Download, X, ArrowLeftRight, Undo, FileDown
} from 'lucide-react';
import { ContentProject } from '../../types';
import DictationButton from '../../components/DictationButton';

export default function BlogWriter() {
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState('1000');
  const [brandVoiceId, setBrandVoiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [brandVoices, setBrandVoices] = useState<any[]>([]);
  const [project, setProject] = useState<ContentProject | null>(null);

  // Editable outcomes
  const [editedArticle, setEditedArticle] = useState('');
  const [editedOutline, setEditedOutline] = useState('');
  const [editedMetaTitle, setEditedMetaTitle] = useState('');
  const [editedMetaDesc, setEditedMetaDesc] = useState('');

  const [activeTab, setActiveTab] = useState<'article' | 'outline' | 'seo'>('article');
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  // Versions history states
  const [blogHistory, setBlogHistory] = useState<ContentProject[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [compareProject, setCompareProject] = useState<ContentProject | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Prefill hook from Keyboard command palette
  useEffect(() => {
    const checkPrefill = () => {
      const stored = localStorage.getItem('command-palette-prefill-blog');
      if (stored) {
        setTopic(stored);
        localStorage.removeItem('command-palette-prefill-blog');
      }
    };

    checkPrefill();
    window.addEventListener('command-palette-prefill', checkPrefill);
    return () => window.removeEventListener('command-palette-prefill', checkPrefill);
  }, []);

  // Fetch Voice Profiles and load blog configurations drafts list
  useEffect(() => {
    fetch('/api/settings/brand-voice')
      .then(r => r.json())
      .then(data => {
        setBrandVoices(data);
        if (data.length > 0) setBrandVoiceId(data[0].id);
      })
      .catch(e => console.error(e));

    // Load drafts history
    const saved = localStorage.getItem('blog-history-drafts');
    if (saved) {
      try {
        setBlogHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed loading configuration drafts histories", e);
      }
    }
  }, []);

  const handleComposeBlog = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, wordCount, brandVoiceId })
      });
      const data = await response.json();
      if (data.success && data.project) {
        setProject(data.project);
        setEditedArticle(data.project.content.blog_article || '');
        setEditedOutline(data.project.content.blog_outline || '');
        setEditedMetaTitle(data.project.content.seoMeta?.title || '');
        setEditedMetaDesc(data.project.content.seoMeta?.description || '');

        // Persist drafts history (max 15 items)
        setBlogHistory(prev => {
          const filtered = prev.filter(p => p.topic.toLowerCase() !== topic.toLowerCase());
          const updated = [data.project, ...filtered].slice(0, 15);
          localStorage.setItem('blog-history-drafts', JSON.stringify(updated));
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

  const getActiveContentValue = () => {
    if (activeTab === 'outline') return editedOutline;
    if (activeTab === 'seo') {
      return `SEO Meta Details:\nTitle: ${editedMetaTitle}\nDescription: ${editedMetaDesc}\nInternal Link cues:\n${project?.content.seoMeta?.internalLinks?.join(', ') || ''}`;
    }
    return editedArticle;
  };

  const getHistoricalContentValue = (proj: ContentProject) => {
    if (activeTab === 'outline') return proj.content.blog_outline || '';
    if (activeTab === 'seo') {
      return `SEO Meta Details:\nTitle: ${proj.content.seoMeta?.title || ''}\nDescription: ${proj.content.seoMeta?.description || ''}\nInternal link cues:\n${proj.content.seoMeta?.internalLinks?.join(', ') || ''}`;
    }
    return proj.content.blog_article || '';
  };

  const handleRevertToHistory = (histProj: ContentProject) => {
    setTopic(histProj.topic);
    setProject(histProj);
    setEditedArticle(histProj.content.blog_article || '');
    setEditedOutline(histProj.content.blog_outline || '');
    setEditedMetaTitle(histProj.content.seoMeta?.title || '');
    setEditedMetaDesc(histProj.content.seoMeta?.description || '');
  };

  const handleExportCopy = (format: 'pdf' | 'markdown' | 'text') => {
    const textVal = getActiveContentValue();
    const cleanTopic = topic.trim() || 'untitled-pillar';
    const filename = `contentforge-blog-${cleanTopic.replace(/\s+/g, '-').toLowerCase()}`;

    setExportDropdownOpen(false);

    if (format === 'text') {
      const blob = new Blob([textVal], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'markdown') {
      const hashtagsStr = project?.content.hashtags ? '\n\nTags: ' + project.content.hashtags.map(t => `#${t}`).join(' ') : '';
      const mdTpl = `# ${cleanTopic}\n\n*SEO Blog Pillar Generated via ContentForge AI on ${new Date().toLocaleDateString()}*\nWord Count target: **${wordCount}**\n\n${textVal}${hashtagsStr}`;
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
              <title>${cleanTopic} - blog pillar summary export</title>
              <style>
                body {
                  font-family: -apple-system, sans-serif;
                  color: #1f2937;
                  padding: 40px;
                  max-width: 800px;
                  margin: 0 auto;
                  line-height: 1.6;
                }
                .brand {
                  color: #10b981;
                  font-size: 11px;
                  font-weight: bold;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                }
                .article-header {
                  border-bottom: 2px solid #e5e7eb;
                  padding-bottom: 20px;
                  margin-bottom: 25px;
                }
                .title {
                  font-size: 26px;
                  font-weight: 850;
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
                  color: #374151;
                  background: #fdfdfd;
                  padding: 10px 0;
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
              <div class="brand">ContentForge AI SEO Blog Publisher</div>
              <div class="article-header">
                <h1 class="title">${cleanTopic}</h1>
                <div class="meta">Word limit: 1000+ words | Compiled Date: ${new Date().toLocaleDateString()}</div>
              </div>
              <div class="content">${textVal.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
              <div class="footer">Exported from ContentForge Workspace.</div>
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
    <div id="blog-writer-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in relative">
      
      {/* Blog Configuration Panel */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Advanced SEO Blog Constructor</h3>
            </div>

            {/* Versions History trigger */}
            <button
              id="btn-blog-history"
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-xs text-zinc-350 cursor-pointer select-none"
            >
              <History className="w-3.5 h-3.5 text-zinc-550" />
              <span>History ({blogHistory.length})</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider block">Target Title or Target Keyword</label>
            <div className="flex gap-2">
              <input
                id="blog-topic-input"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Guide to Mastering Python and Django"
                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
              />
              <DictationButton
                onTranscript={(text) => setTopic(prev => prev ? prev + ' ' + text : text)}
                placeholder="Dictate article topic or keyword"
              />
            </div>

            {/* Clickable preset keywords */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-zinc-500 self-center mr-0.5">Presets:</span>
              {['Django Mastering', 'Quiet Luxury Guide', 'React Hooks Advanced', 'SaaS Funnel Strategies'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTopic(tag)}
                  className="text-[10px] bg-zinc-900 hover:bg-zinc-850 hover:text-white border border-zinc-800 rounded px-2 py-0.5 text-zinc-400 font-medium transition-all cursor-pointer active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Word Count option */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider">Word Count</label>
              <select
                id="blog-word-count-select"
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3.5 py-3 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="500">500 (Short Play)</option>
                <option value="1000">1000 (Standard Blog)</option>
                <option value="2050">2000 (Detailed Pillar)</option>
                <option value="3000">3000+ (Comprehensive Essay)</option>
              </select>
            </div>

            {/* brand profile */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider">Brand Voice Alignment</label>
              <select
                id="blog-brand-select"
                value={brandVoiceId}
                onChange={(e) => setBrandVoiceId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3.5 py-3 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="">Default Clean SaaS Voice</option>
                {brandVoices.map((bv) => (
                  <option key={bv.id} value={bv.id}>{bv.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            id="blog-submit-btn"
            onClick={handleComposeBlog}
            disabled={loading || !topic.trim()}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:from-zinc-900 disabled:to-zinc-900 text-white disabled:text-zinc-600 rounded-lg text-sm font-semibold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                <span>Indexing & Writing Blog via Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                <span>Write SEO Long-Form Article</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time SEO Score Calculator Gauge Visualizer */}
        {project && !loading && (
          <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">Real-time SEO Score</span>
              <Award className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full border-4 border-zinc-800 flex items-center justify-center">
                <span className="text-base font-bold text-white font-mono">{project.content.seoMeta?.score || 85}</span>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-400">Excellent Ranking Intent</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">High semantic relevance on search indexes.</p>
              </div>
            </div>

            {/* Keyword insights suggestions list */}
            {project.content.seoMeta?.suggestions && (
              <div className="space-y-2 pt-3 border-t border-zinc-900">
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Unlocking optimization suggestions:</span>
                <ul className="space-y-1.5 text-[11px] font-sans text-zinc-400">
                  {project.content.seoMeta.suggestions.map((sug, sIdx) => (
                    <li key={sIdx} className="flex gap-2 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 block shrink-0"></span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Blog writing workspace */}
      <div className="xl:col-span-8">
        {!project && !loading && (
          <div className="bg-zinc-950/20 border border-dashed border-zinc-900 rounded-xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="w-12 h-12 bg-zinc-900 rounded-full border border-zinc-850 flex items-center justify-center text-zinc-500 mb-4 animate-pulse">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-300">Blog Sandbox Room</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
              Launch a full keyword investigation. Define topics, choose targets, and Gemini outputs structural headers and rich pillar content sections instantly.
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-6 space-y-6 h-full min-h-[400px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-48 h-5 bg-zinc-800 rounded-full animate-pulse" />
              <div className="space-y-3 pt-4">
                <div className="w-full h-10 bg-zinc-850/50 rounded-lg animate-pulse" />
                <div className="w-4/5 h-4 bg-zinc-800/40 rounded-full animate-pulse" />
                <div className="w-11/12 h-4 bg-zinc-800/40 rounded-full animate-pulse" />
                <div className="w-full h-24 bg-zinc-800/20 rounded-lg animate-pulse" />
              </div>
            </div>
            <p className="text-center text-[11px] font-mono text-emerald-400/80 animate-pulse tracking-wide italic">
              "Mapping structural semantic indexes and generating comprehensive outlines..."
            </p>
          </div>
        )}

        {project && !loading && (
          <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl overflow-hidden shadow-md h-full flex flex-col justify-between min-h-[450px]">
            {/* Headers */}
            <div className="flex border-b border-zinc-900 bg-zinc-950/80 px-4 pt-4 gap-2 justify-between items-center">
              <div className="flex gap-1">
                {[
                  { id: 'article', label: 'Article Pillar Body', icon: FileText },
                  { id: 'outline', label: 'Blog Outline Structure', icon: Settings },
                  { id: 'seo', label: 'Meta Tags & FAQ suggestions', icon: Search }
                ].map((t) => {
                  const isSelected = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-900 text-white border-t border-x border-zinc-850'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <t.icon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Export Trigger Group */}
              <div className="relative pr-4 pb-1.5">
                <button
                  id="btn-export-blog-dropdown"
                  type="button"
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] text-zinc-300 font-semibold cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Export ({activeTab.toUpperCase()})</span>
                </button>

                {exportDropdownOpen && (
                  <div className="absolute right-4 top-9 z-40 w-40 bg-zinc-950 border border-zinc-800 p-1.5 rounded-lg shadow-xl space-y-1 font-mono text-[11px] animate-fade-in text-zinc-300">
                    <button
                      onClick={() => handleExportCopy('pdf')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white rounded text-left cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5 text-rose-500" /> Save as PDF
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
                  </div>
                )}
              </div>
            </div>

            {/* Content box */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              {activeTab === 'article' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider font-bold">
                    <Edit3 className="w-3 h-3 text-zinc-500" /> Markdown Output (Fully Editable)
                  </span>
                  <textarea
                    id="blog-body-editor"
                    value={editedArticle}
                    onChange={(e) => setEditedArticle(e.target.value)}
                    className="w-full h-80 bg-zinc-950/60 border border-zinc-900 focus:border-emerald-500/50 rounded-xl p-4 text-xs font-sans text-zinc-200 leading-relaxed font-normal whitespace-pre-wrap select-text resize-none focus:outline-none"
                  />
                </div>
              )}

              {activeTab === 'outline' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider font-bold">
                    Structural Content Blocks Outline
                  </span>
                  <textarea
                    id="blog-outline-editor"
                    value={editedOutline}
                    onChange={(e) => setEditedOutline(e.target.value)}
                    className="w-full h-80 bg-zinc-950/60 border border-zinc-900 focus:border-emerald-500/50 rounded-xl p-4 text-xs font-mono text-zinc-200 leading-relaxed font-normal whitespace-pre-wrap select-text resize-none focus:outline-none"
                  />
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4 h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pr-2">
                  {/* Meta tag edits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Meta Title</span>
                      <input
                        id="blog-meta-title-input"
                        type="text"
                        value={editedMetaTitle}
                        onChange={(e) => setEditedMetaTitle(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500/40 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Meta Description</span>
                      <input
                        id="blog-meta-desc-input"
                        type="text"
                        value={editedMetaDesc}
                        onChange={(e) => setEditedMetaDesc(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500/40 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Internal links suggestions details */}
                  {project.content.seoMeta?.internalLinks && (
                    <div className="p-3.5 bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
                      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block mb-2">Calculated internal Link suggestions:</span>
                      <div className="flex flex-wrap gap-2">
                        {project.content.seoMeta.internalLinks.map((il, ilIdx) => (
                          <span key={ilIdx} className="text-[11px] font-mono bg-zinc-900 text-indigo-300 px-3 py-1 rounded-lg border border-zinc-800">
                            {il}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQ suggestions detailed blocks */}
                  {project.content.seoMeta?.faqs && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-zinc-450 font-bold uppercase tracking-wider block">Generated FAQ Blocks:</span>
                      {project.content.seoMeta.faqs.map((faq, fIdx) => (
                        <div key={fIdx} className="p-3 bg-zinc-950/30 border border-zinc-900 rounded-lg space-y-1">
                          <p className="text-xs font-semibold text-zinc-200">Q: {faq.q}</p>
                          <p className="text-xs text-zinc-400 pl-4">A: {faq.a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Copy action footer */}
              <div className="pt-4 border-t border-zinc-900 flex justify-between items-center bg-zinc-950/40 px-6 py-4 rounded-b-xl">
                <span className="text-[11px] text-zinc-500 font-sans">
                  Ready to copy markdown blocks. Format tags remain fully intact.
                </span>
                <button
                  id="btn-copy-blog"
                  onClick={() => handleCopy(activeTab === 'article' ? editedArticle : (activeTab === 'outline' ? editedOutline : JSON.stringify({ title: editedMetaTitle, desc: editedMetaDesc }, null, 2)), activeTab)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 rounded-lg text-xs font-medium text-white transition-colors border border-zinc-800 cursor-pointer"
                >
                  {copiedStatus === activeTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied to clipboard</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy Current View</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RECENT GENERATIONS DRAWER (Sidebar Overlay) */}
      {isHistoryOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-zinc-950 border-l border-zinc-850 shadow-2xl flex flex-col animate-fade-in font-sans">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Recent Blog Drafts</h3>
            </div>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Entries List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
            {blogHistory.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 border border-zinc-900 border-dashed rounded-xl">
                <History className="w-8 h-8 mx-auto mb-2 text-zinc-700 animate-pulse" />
                <p className="text-xs">No previous blog drafts stored in local cache yet.</p>
              </div>
            ) : (
              blogHistory.map((hist) => (
                <div
                  key={hist.id}
                  className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:border-zinc-800 space-y-3 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 truncate">{hist.topic}</h4>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1">
                      {new Date(hist.generatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleRevertToHistory(hist)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-emerald-600/15 hover:bg-emerald-600 text-[10px] font-bold text-emerald-300 hover:text-white transition-all cursor-pointer"
                    >
                      <Undo className="w-3 h-3" />
                      <span>Revert Back</span>
                    </button>

                    <button
                      onClick={() => setCompareProject(hist)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white border border-zinc-850 transition-all cursor-pointer"
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
            <p className="text-[9px] font-mono text-zinc-500 italic">
              Recent 15 long-form summaries are preserved in local storage.
            </p>
          </div>
        </div>
      )}

      {/* COMPARING DRAFTS INTERACTIVE DIALOG MODAL */}
      {compareProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setCompareProject(null)} />

          <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-805 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fade-in font-sans">
            
            {/* Header */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-950 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Compare Blog Draft Version</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Focus: {activeTab.toUpperCase()} layout differences</p>
                </div>
              </div>
              <button
                onClick={() => setCompareProject(null)}
                className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comparison sandbox panes */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-950">
              
              {/* Left sidebar: Active */}
              <div className="space-y-2.5 flex flex-col h-full">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 select-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Sandbox Value
                </span>
                <div className="flex-1 min-h-[300px] p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 text-xs text-zinc-350 leading-relaxed font-sans overflow-y-auto whitespace-pre-wrap select-text">
                  {getActiveContentValue() || <em className="text-zinc-650">No text drafted yet</em>}
                </div>
              </div>

              {/* Right sidebar: Historical */}
              <div className="space-y-2.5 flex flex-col h-full">
                <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1 select-none">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" /> Version: {new Date(compareProject.generatedAt).toLocaleTimeString()}
                </span>
                <div className="flex-1 min-h-[300px] p-4 rounded-xl bg-zinc-900/30 border border-zinc-850/65 text-xs text-zinc-400 leading-relaxed font-sans overflow-y-auto whitespace-pre-wrap select-text">
                  {getHistoricalContentValue(compareProject)}
                </div>
              </div>

            </div>

            {/* Modal footers */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex justify-end gap-3">
              <button
                onClick={() => setCompareProject(null)}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-xs text-zinc-450 font-semibold cursor-pointer"
              >
                Close Compare Panel
              </button>
              <button
                onClick={() => {
                  handleRevertToHistory(compareProject);
                  setCompareProject(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Undo className="w-3.5 h-3.5" /> Revert Back to This Draft
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
