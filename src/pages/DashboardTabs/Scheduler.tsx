/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Clock, Plus, Check, Trash, RefreshCw, Layers, CheckCircle2,
  Linkedin, Twitter, Instagram, Facebook, AlertCircle, Link2, ExternalLink
} from 'lucide-react';
import { ScheduledPost } from '../../types';

export default function Scheduler() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'all' | 'Scheduled' | 'Draft' | 'Published'>('all');

  // Channel Connection status simulations
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    LinkedIn: true,
    Facebook: false,
    Instagram: false,
    Twitter: true,
  });

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [chosenPlatforms, setChosenPlatforms] = useState<any[]>(['LinkedIn']);
  const [scheduledTime, setScheduledTime] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  const fetchSchedulerQueue = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scheduler/posts');
      const data = await response.json();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedulerQueue();
  }, []);

  const handleApproveStatus = async (itemId: string, approve: boolean) => {
    try {
      const response = await fetch(`/api/scheduler/approve/${itemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve })
      });
      const data = await response.json();
      if (data.success) {
        // Optimistically update
        setPosts(prev => prev.map(p => p.id === itemId ? { ...p, approvalStatus: approve ? 'Approved' : 'Declined', status: approve ? 'Scheduled' : 'Draft' } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    try {
      const response = await fetch('/api/scheduler/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle || 'Untitled Social Post',
          content: newContent,
          platforms: chosenPlatforms,
          scheduledTime: scheduledTime || new Date(Date.now() + 86400000).toISOString(),
          status: 'Scheduled'
        })
      });
      const data = await response.json();
      if (data.success && data.post) {
        setPosts(prev => [data.post, ...prev]);
        setNewTitle('');
        setNewContent('');
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePlatformConnect = (pName: 'LinkedIn' | 'Facebook' | 'Instagram' | 'Twitter') => {
    setConnectedPlatforms(prev => ({ ...prev, [pName]: !prev[pName] }));
  };

  const getPlatformIcon = (name: string) => {
    switch (name) {
      case 'LinkedIn': return <Linkedin className="w-4 h-4 text-blue-400" />;
      case 'Instagram': return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'Facebook': return <Facebook className="w-4 h-4 text-blue-500" />;
      default: return <Twitter className="w-4 h-4 text-zinc-350" />;
    }
  };

  const filteredPosts = posts.filter(p => activeSegment === 'all' || p.status === activeSegment);

  return (
    <div id="scheduler-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Account connection & New Draft triggers */}
      <div className="xl:col-span-5 space-y-6">
        {/* Connection matrix */}
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
            🔗 Dispatched Accounts Board
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(connectedPlatforms).map(([pName, isConn]) => (
              <div key={pName} className="p-3 bg-zinc-950/60 border border-zinc-90 w-full rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(pName)}
                  <span className="text-xs font-semibold text-zinc-350">{pName}</span>
                </div>
                <button
                  id={`btn-connect-${pName}`}
                  onClick={() => togglePlatformConnect(pName as any)}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                    isConn ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' : 'bg-rose-500/10 text-rose-400 border-rose-500/15 hover:bg-rose-500/20'
                  }`}
                >
                  {isConn ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick custom schedule forms */}
        <form onSubmit={handleCreatePost} className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-zinc-450 uppercase tracking-wider">
            📝 Create Scheduled Post
          </h4>

          <div className="space-y-1">
            <input
              id="schedule-title-input"
              type="text"
              placeholder="Internal title, e.g., Cloud command post"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-650 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <textarea
              id="schedule-content-textarea"
              placeholder="Write your custom caption message here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
              className="w-full h-28 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-650 resize-none focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Platform selector */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-zinc-550 uppercase">Distribution Channels</span>
              <div className="flex flex-wrap gap-1">
                {['LinkedIn', 'Instagram', 'Facebook', 'X/Twitter'].map((ch) => {
                  const isChecked = chosenPlatforms.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChosenPlatforms(prev => isChecked ? prev.filter(c => c !== ch) : [...prev, ch])}
                      className={`text-[9px] font-mono px-2 py-1 rounded border ${
                        isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-950 border-zinc-850 text-zinc-450'
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time option */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-zinc-550 uppercase">Date of Publication</span>
              <input
                id="schedule-time-picker"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-[10px] text-zinc-300 focus:outline-none"
              />
            </div>
          </div>

          <button
            id="scheduler-submit-btn"
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-transform"
          >
            Schedule Dispatch Node
          </button>

          {addSuccess && (
            <p className="text-[10px] font-mono text-emerald-400 text-center flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" /> Successfully queued into Celery Worker list!
            </p>
          )}
        </form>
      </div>

      {/* Main active scheduled queue log */}
      <div className="xl:col-span-7 space-y-4">
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-400" /> Active queues ({filteredPosts.length})
            </h4>

            {/* Filter segments */}
            <div className="flex bg-zinc-900 p-1 rounded-lg text-[10px] font-mono">
              {(['all', 'Scheduled', 'Draft', 'Published'] as const).map((seg) => (
                <button
                  key={seg}
                  onClick={() => setActiveSegment(seg)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeSegment === seg ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {seg}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-6">
              <RefreshCw className="w-5 h-5 text-zinc-500 animate-spin" />
            </div>
          )}

          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center">
              <AlertCircle className="w-7 h-7 text-zinc-650 mb-2" />
              <p className="text-xs text-zinc-500 font-mono">Queue empty for filters selected.</p>
            </div>
          )}

          {!loading && filteredPosts.map((post) => (
            <div key={post.id} className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-3 relative group">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold text-zinc-200 text-xs">{post.title}</h5>
                  <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Target: {new Date(post.scheduledTime).toLocaleString()}</p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2">
                  {post.platforms.map((plat) => (
                    <span key={plat} className="p-1 px-2.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400 flex items-center gap-1">
                      {getPlatformIcon(plat)} {plat}
                    </span>
                  ))}
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                    post.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/2 *' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {post.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <p className="text-zinc-400 line-clamp-3 select-text leading-relaxed text-xs">{post.content}</p>

              {/* Approval controls */}
              {post.approvalStatus === 'Pending' ? (
                <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-lg flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-yellow-300">Awaiting editor approval workflow</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      id={`btn-approve-${post.id}`}
                      onClick={() => handleApproveStatus(post.id, true)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-[10px]"
                    >
                      Approve Post
                    </button>
                    <button
                      id={`btn-decline-${post.id}`}
                      onClick={() => handleApproveStatus(post.id, false)}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-450 border border-zinc-800 rounded font-semibold text-[10px]"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 max-w-fit mt-2 select-none">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="font-mono">Approved by Editor Room • Queue Worker Armed</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
