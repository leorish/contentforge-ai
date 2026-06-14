/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Share2,
  Hash,
  Video,
  Calendar,
  Clock,
  RefreshCw,
  Mail,
  Sliders,
  Users,
  BarChart3,
  CreditCard,
  ShieldAlert,
  ChevronRight,
  LogOut,
  Atom,
  HelpCircle,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userEmail: string;
  userRole: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, userEmail, userRole, isOpen, onToggle }: SidebarProps) {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme-preference');
    return (stored as 'system' | 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (t: 'system' | 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      if (t === 'light') {
        root.classList.add('light');
      } else if (t === 'dark') {
        root.classList.add('dark');
      } else {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isSystemDark) {
          root.classList.add('dark');
        } else {
          root.classList.add('light');
        }
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme-preference', theme);

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.add('light');
        }
      };
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

  const menuGroups = [
    {
      title: "Core AI Suite",
      items: [
        { id: 'generator', label: 'AI Content Suite', icon: Sparkles, color: 'text-purple-400' },
        { id: 'blog', label: 'SEO Blog Writer', icon: BookOpen, color: 'text-emerald-400' },
        { id: 'social', label: 'Social Optimizer', icon: Share2, color: 'text-blue-400' },
        { id: 'hashtags', label: 'Hashtag Genius', icon: Hash, color: 'text-pink-400' },
        { id: 'video', label: 'Video Script AI', icon: Video, color: 'text-rose-400' },
      ]
    },
    {
      title: "Strategy & Distribution",
      items: [
        { id: 'calendar', label: '30-Day Planner', icon: Calendar, color: 'text-emerald-400' },
        { id: 'scheduler', label: 'Queue & Scheduler', icon: Clock, color: 'text-amber-400' },
        { id: 'repurpose', label: 'Multi-Repurposer', icon: RefreshCw, color: 'text-teal-400' },
        { id: 'email', label: 'AI Email Marketing', icon: Mail, color: 'text-indigo-400' },
      ]
    },
    {
      title: "Workspace & Growth",
      items: [
        { id: 'brand', label: 'Brand Voice Setup', icon: Sliders, color: 'text-violet-400' },
        { id: 'team', label: 'Team Collaboration', icon: Users, color: 'text-sky-400' },
        { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3, color: 'text-cyan-400' },
      ]
    },
    {
      title: "Platform Desk",
      items: [
        { id: 'billing', label: 'Pricing Plan', icon: CreditCard, color: 'text-yellow-400' },
        { id: 'admin', label: 'System Admin Panel', icon: ShieldAlert, color: 'text-orange-400' },
      ]
    }
  ];

  return (
    <aside
      id="cf-sidebar"
      className={`w-80 bg-zinc-950 border-r border-zinc-800/60 p-5 flex flex-col h-screen fixed top-0 left-0 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent transition-all duration-305 z-45 ${
        isOpen ? 'translate-x-0 opacity-100 pr-5' : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Platform Branding & Toggle Close Button */}
      <div className="flex items-center justify-between py-4 px-1 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/10">
            <Atom className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-1.5">
              ContentForge <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono font-medium">AI</span>
            </h1>
            <p className="text-[10px] text-zinc-405 tracking-wider font-mono uppercase mt-0.5">SaaS Content Hub</p>
          </div>
        </div>

        {/* Nest dynamic rotating chevron toggle close icon */}
        <button
          id="btn-sidebar-inner-close"
          onClick={onToggle}
          className="p-1.5 hover:bg-zinc-150 dark:hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer flex items-center justify-center mr-0.5"
          title="Collapse Sidebar"
        >
          <ChevronLeft 
            className="w-4 h-4 transition-transform duration-300"
            style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
          />
        </button>
      </div>

      {/* Menu Groups */}
      <div className="flex-1 space-y-6">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            <h3 className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-widest px-3">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      id={`sidebar-item-${item.id}`}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-900/30 text-white border-l-2 border-indigo-500 shadow-sm'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-zinc-400 group-hover:text-white transition-colors'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100'}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Theme Selection Settings */}
      <div className="pt-4 border-t border-zinc-800/40 mt-4 px-1">
        <h4 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Interface Theme
        </h4>
        <div className="grid grid-cols-3 gap-1 bg-zinc-900/40 border border-zinc-800/60 p-1 rounded-lg">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as any)}
                id={`btn-theme-${item.id}`}
                className={`flex flex-col items-center justify-center py-2.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 text-indigo-400 border border-zinc-700/60 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 mb-1" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Area Footer Info */}
      <div className="pt-4 border-t border-zinc-800/80 mt-6 bg-zinc-950/20 rounded-xl px-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-800/40 flex items-center justify-center font-bold text-indigo-300 uppercase shadow-inner">
            {userEmail ? userEmail.slice(0, 2) : 'CF'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-zinc-100 truncate">{userEmail || 'developer@gmail.com'}</p>
            <p className="text-[10px] text-indigo-400 font-mono capitalize mt-0.5">{userRole || 'Owner'}</p>
          </div>
        </div>
        <button
          id="sidebar-logout-button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/15"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </aside>
  );
}
