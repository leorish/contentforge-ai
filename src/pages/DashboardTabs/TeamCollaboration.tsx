/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, Send, CheckCircle2, MessageSquare, Plus, RefreshCw, Star, Shield } from 'lucide-react';
import { TeamMember, Comment } from '../../types';

export default function TeamCollaboration() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  // Form controls
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Owner' | 'Admin' | 'Editor' | 'Writer'>('Writer');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [commentText, setCommentText] = useState('');

  const fetchTeamAndComments = async () => {
    setLoading(true);
    try {
      const mRes = await fetch('/api/team/members');
      const mData = await mRes.json();
      setMembers(mData);

      const cRes = await fetch('/api/team/comments');
      const cData = await cRes.json();
      setComments(cData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAndComments();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: inviteName, email: inviteEmail, role: inviteRole })
      });
      const data = await response.json();
      if (data.success && data.member) {
        setMembers(prev => [...prev, data.member]);
        setInviteName('');
        setInviteEmail('');
        setInviteSuccess(true);
        setTimeout(() => setInviteSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const response = await fetch('/api/team/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText, postId: 'post-1' })
      });
      const data = await response.json();
      if (data.success && data.comment) {
        setComments(prev => [...prev, data.comment]);
        setCommentText('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="team-collaboration-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Invite member form & active team list */}
      <div className="xl:col-span-6 space-y-6">
        
        {/* Form */}
        <form onSubmit={handleInvite} className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm">
          <h4 className="text-xs font-mono font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Plus className="w-4 h-4 text-sky-400" /> Invite Core Teammate
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <input
              id="team-invite-name"
              type="text"
              required
              placeholder="Name, e.g., Sarah Jenkins"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-200 outline-none w-full focus:border-sky-500"
            />
            <input
              id="team-invite-email"
              type="email"
              required
              placeholder="sarah@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-200 outline-none w-full focus:border-sky-500"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Privilege Role:</span>
              <select
                id="team-invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-850 p-1.5 rounded text-xs text-zinc-300 outline-none"
              >
                <option value="Admin">Admin (Full Control)</option>
                <option value="Editor">Editor (Approves Dispatches)</option>
                <option value="Writer">Writer (Composes drafts)</option>
              </select>
            </div>

            <button
              id="team-invite-submit"
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-505 rounded-lg text-xs font-semibold text-white shadow"
            >
              Invite Teammate
            </button>
          </div>

          {inviteSuccess && (
            <p className="text-[10px] font-mono text-emerald-400 text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Invite dispatched to mailbox!
            </p>
          )}
        </form>

        {/* Members list */}
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm min-h-[250px]">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-3">
            👥 Active Organization Teammates
          </h4>

          {loading && (
            <div className="flex justify-center">
              <RefreshCw className="w-5 h-5 text-zinc-500 animate-spin" />
            </div>
          )}

          {!loading && members.map((m) => (
            <div key={m.id} className="flex justify-between items-center p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-950 flex items-center justify-center text-xs font-bold text-sky-450 uppercase">
                  {m.fullName.slice(0, 2)}
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-zinc-200">{m.fullName}</h5>
                  <p className="text-[10px] font-mono text-zinc-500">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono bg-zinc-900 text-zinc-400 px-2.5 py-0.5 rounded border border-zinc-800">
                  {m.role}
                </span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                  m.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-850 text-zinc-550'
                }`}>
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cooperation Comments stream */}
      <div className="xl:col-span-6 bg-zinc-950/45 border border-zinc-905 rounded-xl p-5 flex flex-col justify-between min-h-[400px]">
        <div>
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-3 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-sky-400 animate-pulse" /> Teammate Campaign Feed
          </h4>

          <div className="space-y-3 pt-4 max-h-[350px] overflow-y-auto pr-1">
            {comments.map((cm) => (
              <div key={cm.id} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1 my-2">
                <div className="flex justify-between items-baseline font-mono text-[10px]">
                  <span className="font-semibold text-zinc-200">{cm.authorName} ({cm.authorRole})</span>
                  <span className="text-zinc-500">{new Date(cm.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-zinc-350 select-text font-sans leading-relaxed text-xs pl-2 border-l border-sky-500/15">{cm.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Comment */}
        <form onSubmit={handlePostComment} className="flex gap-2.5 mt-4 border-t border-zinc-900 pt-3">
          <input
            id="team-comment-input"
            type="text"
            required
            placeholder="Type comment to team..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-650 outline-none"
          />
          <button
            id="team-comment-submit"
            type="submit"
            className="p-2.5 bg-sky-600 hover:bg-sky-505 rounded-lg text-white"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
