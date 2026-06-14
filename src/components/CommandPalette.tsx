/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Sparkles, BookOpen, Share2, Hash, Video, Calendar,
  Clock, RefreshCw, Mail, Sliders, Users, BarChart3, CreditCard,
  ShieldAlert, HelpCircle, FileText, ArrowRight, CornerDownLeft
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  onQuickTopicCompose?: (topic: string, isBlog: boolean) => void;
}

interface CommandItem {
  id: string;
  category: 'tools' | 'actions' | 'docs';
  label: string;
  shortcut?: string;
  icon: React.ComponentType<any>;
  action: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  setActiveTab,
  onQuickTopicCompose
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commandItems: CommandItem[] = [
    // Tools
    {
      id: 'generator',
      category: 'tools',
      label: 'Go to AI Content Suite (Multi-platform)',
      icon: Sparkles,
      action: () => { setActiveTab('generator'); onClose(); }
    },
    {
      id: 'blog',
      category: 'tools',
      label: 'Go to SEO Blog Writer & Long-form Article',
      icon: BookOpen,
      action: () => { setActiveTab('blog'); onClose(); }
    },
    {
      id: 'social',
      category: 'tools',
      label: 'Go to AI Social Copy Optimizer',
      icon: Share2,
      action: () => { setActiveTab('social'); onClose(); }
    },
    {
      id: 'hashtags',
      category: 'tools',
      label: 'Go to AI Hashtag & Keyword Genius',
      icon: Hash,
      action: () => { setActiveTab('hashtags'); onClose(); }
    },
    {
      id: 'video',
      category: 'tools',
      label: 'Go to AI Video & Shorts Script Assistant',
      icon: Video,
      action: () => { setActiveTab('video'); onClose(); }
    },
    {
      id: 'calendar',
      category: 'tools',
      label: 'Go to 30-Day Campaign Planner',
      icon: Calendar,
      action: () => { setActiveTab('calendar'); onClose(); }
    },
    {
      id: 'scheduler',
      category: 'tools',
      label: 'Go to Post Dispatch Scheduler & Queue',
      icon: Clock,
      action: () => { setActiveTab('scheduler'); onClose(); }
    },
    {
      id: 'repurpose',
      category: 'tools',
      label: 'Go to AI Media Channel Repurposing Hub',
      icon: RefreshCw,
      action: () => { setActiveTab('repurpose'); onClose(); }
    },
    {
      id: 'email',
      category: 'tools',
      label: 'Go to AI Newsletter Email Marketing',
      icon: Mail,
      action: () => { setActiveTab('email'); onClose(); }
    },
    {
      id: 'brand',
      category: 'tools',
      label: 'Go to AI Brand Voice Profiles Setup',
      icon: Sliders,
      action: () => { setActiveTab('brand'); onClose(); }
    },
    {
      id: 'team',
      category: 'tools',
      label: 'Go to Teammate Collaboration Workspace',
      icon: Users,
      action: () => { setActiveTab('team'); onClose(); }
    },
    {
      id: 'analytics',
      category: 'tools',
      label: 'Go to Engagement & Audit Analytics',
      icon: BarChart3,
      action: () => { setActiveTab('analytics'); onClose(); }
    },
    {
      id: 'billing',
      category: 'tools',
      label: 'Go to Pricing Plans & Upgrade Licenses',
      icon: CreditCard,
      action: () => { setActiveTab('billing'); onClose(); }
    },
    {
      id: 'admin',
      category: 'tools',
      label: 'Go to System Administrator Panel',
      icon: ShieldAlert,
      action: () => { setActiveTab('admin'); onClose(); }
    },

    // Actions
    {
      id: 'action-generator-topic',
      category: 'actions',
      label: 'Quick Action: Compose Campaign Post (Write topic directly above or click to go)',
      shortcut: '⌥C',
      icon: Sparkles,
      action: () => {
        if (searchQuery.trim()) {
          if (onQuickTopicCompose) onQuickTopicCompose(searchQuery, false);
        } else {
          setActiveTab('generator');
        }
        onClose();
      }
    },
    {
      id: 'action-blog-topic',
      category: 'actions',
      label: 'Quick Action: Draft SEO Blog (Write title option directly above or click to go)',
      shortcut: '⌥B',
      icon: BookOpen,
      action: () => {
        if (searchQuery.trim()) {
          if (onQuickTopicCompose) onQuickTopicCompose(searchQuery, true);
        } else {
          setActiveTab('blog');
        }
        onClose();
      }
    },

    // Search Docs
    {
      id: 'doc-brand-voice',
      category: 'docs',
      label: 'Doc: How to align AI outputs with specialized Brand Voices',
      icon: FileText,
      action: () => { alert("Documentation: To align AI content, navigate to Brand Voice Setup, and register guidelines for tone, industries, and stylistic tags."); }
    },
    {
      id: 'doc-export',
      category: 'docs',
      label: 'Doc: Exporting content drafts to Markdown & PDF outputs',
      icon: FileText,
      action: () => { alert("Documentation: Switch tabs, generate contents, and use our new custom 'Export Sandbox Draft' action suite."); }
    },
    {
      id: 'doc-speech',
      category: 'docs',
      label: 'Doc: Using Web Speech API for voice dictations and post drafts',
      icon: FileText,
      action: () => { alert("Documentation: Simply click on the Microphone icon embedded alongside input fields to initiate continuous voice transcription."); }
    }
  ];

  // Filter commands
  const filteredItems = commandItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);

      // Prevent document scroll when modal is active
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Blurred overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Command Palette Card container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[480px] animate-fade-in"
      >
        {/* Search Input Area */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-900 bg-zinc-950">
          <Search className="w-5 h-5 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a tool name, command (e.g., 'blog'), or write direct topics to generate..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none py-1 file:hidden selection:bg-indigo-500/40"
          />
          <kbd className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 shrink-0 select-none uppercase shadow-sm">
            esc
          </kbd>
        </div>

        {/* Command Options List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[360px] scrollbar-thin scrollbar-thumb-zinc-800">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs text-zinc-500">No tools, actions, or search documentation match your term.</p>
            </div>
          ) : (
            <>
              {/* Categorize Items dynamically inside lists */}
              {['tools', 'actions', 'docs'].map((cat) => {
                const catItems = filteredItems.filter(item => item.category === cat);
                if (catItems.length === 0) return null;

                // Index offset finder to map global index
                return (
                  <div key={cat} className="space-y-1">
                    <h5 className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 px-3 py-1.5 select-none">
                      {cat === 'tools' ? 'Workspaces & Modules' : cat === 'actions' ? 'Quick Workspace Generators' : 'Product Guide Documents'}
                    </h5>
                    <div className="space-y-0.5">
                      {catItems.map((item) => {
                        const Icon = item.icon;
                        const itemGlobalIndex = filteredItems.findIndex(f => f.id === item.id);
                        const isChosen = selectedIndex === itemGlobalIndex;

                        return (
                          <button
                            key={item.id}
                            onClick={item.action}
                            onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer group ${
                              isChosen
                                ? 'bg-indigo-600 text-white'
                                : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-3.5 h-3.5 shrink-0 ${isChosen ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {item.shortcut && (
                                <span className={`text-[10px] font-mono px-1 py-0.5 rounded ${isChosen ? 'bg-indigo-700 text-indigo-200' : 'bg-zinc-900 text-zinc-500'}`}>
                                  {item.shortcut}
                                </span>
                              )}
                              {isChosen && (
                                <CornerDownLeft className="w-3 h-3 text-white/70 animate-pulse" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer Palette Helpers */}
        <div className="bg-zinc-950/80 border-t border-zinc-900 p-2.5 px-4 flex justify-between items-center text-[10px] font-mono text-zinc-500 select-none">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="bg-zinc-900 border border-zinc-800 rounded px-1">↑↓</span> Move
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-zinc-900 border border-zinc-800 rounded px-1">⏎</span> Trigger action
            </span>
          </div>
          <div>
            <span>Press <span className="bg-zinc-900 border border-zinc-800 rounded px-1">⌘K</span> to toggle palette anywhere</span>
          </div>
        </div>
      </div>
    </div>
  );
}
