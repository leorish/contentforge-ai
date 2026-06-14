/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Calendar, Bell, Shield, Zap, RefreshCw, Menu, ChevronRight } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onUpgradeClick: () => void;
  creditsUsed: number;
  creditsLimit: number;
  subscriptionPlan: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({
  activeTab,
  onUpgradeClick,
  creditsUsed,
  creditsLimit,
  subscriptionPlan,
  isSidebarOpen,
  onToggleSidebar
}: HeaderProps) {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'generator': return 'Content Forge AI Engine';
      case 'blog': return 'SEO Content Suite & Long form Writer';
      case 'social': return 'AI Social Media Optimizer';
      case 'hashtags': return 'AI Hashtag & Keyword Genius';
      case 'video': return 'AI Video Assistant & Scripts';
      case 'calendar': return 'Interactive Campaign Planner';
      case 'scheduler': return 'Bulk Dispatch Queue & Scheduler';
      case 'repurpose': return 'AI Multi-Channel Repurposing Hub';
      case 'email': return 'AI Email Marketing Hub';
      case 'brand': return 'AI Brand Voice Center';
      case 'team': return 'Teammate Collaboration Room';
      case 'analytics': return 'Performance & Engagement Analytics';
      case 'billing': return 'Subscription & Licenses';
      case 'admin': return 'Global Control Center';
      default: return 'SaaS Portal';
    }
  };

  const percentUsed = Math.min(100, Math.round((creditsUsed / creditsLimit) * 100));

  return (
    <header id="cf-header" className="backdrop-blur-md bg-zinc-950/80 border-b border-zinc-900/90 h-20 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: Toggle sidebar + Title */}
      <div className="flex items-center gap-4">
        {/* Sidebar Trigger Icon Button */}
        <button
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          className="p-2 bg-zinc-900/10 hover:bg-zinc-905/20 dark:bg-zinc-900/70 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-805 hover:border-zinc-300 dark:hover:border-zinc-700/80 rounded-lg text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center mr-1"
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <ChevronRight 
            className="w-4 h-4 transition-transform duration-300 text-indigo-500"
            style={{ transform: isSidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {/* Dynamic Section Title */}
        <div>
          <h2 className="text-md sm:text-lg font-bold font-sans tracking-tight text-white flex items-center gap-2">
            {getTabTitle(activeTab)}
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">Enterprise Content Control Plane</p>
        </div>
      </div>

      {/* Right System Indicators */}
      <div className="flex items-center gap-6">
        {/* Credits usage meter */}
        <div className="hidden md:flex flex-col gap-1.5 text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[11px] font-mono text-zinc-400">AI Tokens Usage:</span>
            <span className="text-xs font-bold font-mono text-indigo-400">
              {creditsUsed} <span className="text-zinc-600">/</span> {creditsLimit}
            </span>
          </div>
          <div className="w-40 h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-800/30">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed > 80
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>

        {/* Current Plan Indicator Badge */}
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3.5 py-1 text-xs">
          <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="font-mono text-indigo-300 font-semibold">{subscriptionPlan} License</span>
        </div>

        {/* Upgrade Invitation Action */}
        {subscriptionPlan !== 'Business' && (
          <button
            id="header-upgrade-cta"
            onClick={onUpgradeClick}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all duration-200 shadow-md shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-95"
          >
            Upgrade Plan
          </button>
        )}

        {/* Decorative Notification Ring */}
        <div className="relative p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 cursor-pointer transition-colors group">
          <Bell className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border border-zinc-900"></span>
        </div>
      </div>
    </header>
  );
}
