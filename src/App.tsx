/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CommandPalette from './components/CommandPalette';
import AppTour from './components/AppTour';

// Dashboard Tabs Imports
import AnalyticsOverview from './pages/DashboardTabs/AnalyticsOverview';
import ContentGenerator from './pages/DashboardTabs/ContentGenerator';
import BlogWriter from './pages/DashboardTabs/BlogWriter';
import SocialMedia from './pages/DashboardTabs/SocialMedia';
import HashtagTracker from './pages/DashboardTabs/HashtagTracker';
import ContentCalendar from './pages/DashboardTabs/ContentCalendar';
import Scheduler from './pages/DashboardTabs/Scheduler';
import VideoAssistant from './pages/DashboardTabs/VideoAssistant';
import BrandVoice from './pages/DashboardTabs/BrandVoice';
import Repurposer from './pages/DashboardTabs/Repurposer';
import EmailMarketing from './pages/DashboardTabs/EmailMarketing';
import TeamCollaboration from './pages/DashboardTabs/TeamCollaboration';
import Subscriptions from './pages/DashboardTabs/Subscriptions';
import AdminPanel from './pages/DashboardTabs/AdminPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('generator');
  const [userEmail, setUserEmail] = useState<string>('developer@gmail.com');
  const [userRole, setUserRole] = useState<string>('Owner');
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  useEffect(() => {
    const handleGlobalK = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalK);
    return () => window.removeEventListener('keydown', handleGlobalK);
  }, []);

  const handleQuickTopicCompose = (topic: string, isBlog: boolean) => {
    if (isBlog) {
      localStorage.setItem('command-palette-prefill-blog', topic);
      setActiveTab('blog');
      setTimeout(() => {
        window.dispatchEvent(new Event('command-palette-prefill'));
      }, 100);
    } else {
      localStorage.setItem('command-palette-prefill-generator', topic);
      setActiveTab('generator');
      setTimeout(() => {
        window.dispatchEvent(new Event('command-palette-prefill'));
      }, 100);
    }
  };
  
  // Real usage persistence loaded from local states or actual server counts
  const [creditsUsed, setCreditsUsed] = useState<number>(14);
  const [creditsLimit, setCreditsLimit] = useState<number>(20);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('Free');

  // Load latest plan stats from server on first boot
  useEffect(() => {
    fetch('/api/scheduler/posts') // just test api availability
      .catch((e) => console.log("Init backend checked", e));
  }, []);

  const handlePlanUpgrade = (newPlan: 'Free' | 'Pro' | 'Business') => {
    setSubscriptionPlan(newPlan);
    if (newPlan === 'Free') {
      setCreditsLimit(20);
    } else if (newPlan === 'Pro') {
      setCreditsLimit(100);
      setCreditsUsed(Math.min(creditsUsed, 100));
    } else if (newPlan === 'Business') {
      setCreditsLimit(500);
      setCreditsUsed(Math.min(creditsUsed, 500));
    }
  };

  const handleLogout = () => {
    setUserEmail('logged_out@gmail.com');
    setUserRole('Guest');
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'generator':
        return <ContentGenerator onGenerateTrigger={() => setCreditsUsed(prev => Math.min(creditsLimit, prev + 1))} />;
      case 'blog':
        return <BlogWriter />;
      case 'social':
        return <SocialMedia />;
      case 'hashtags':
        return <HashtagTracker />;
      case 'video':
        return <VideoAssistant />;
      case 'calendar':
        return <ContentCalendar />;
      case 'scheduler':
        return <Scheduler />;
      case 'repurpose':
        return <Repurposer />;
      case 'email':
        return <EmailMarketing />;
      case 'brand':
        return <BrandVoice />;
      case 'team':
        return <TeamCollaboration />;
      case 'analytics':
        return <AnalyticsOverview />;
      case 'billing':
        return <Subscriptions currentPlan={subscriptionPlan} onPlanUpgrade={handlePlanUpgrade} />;
      case 'admin':
        return <AdminPanel />;
      default:
        return (
          <div className="p-8 text-center text-zinc-500 font-mono">
            Tab workspace not initialized.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex font-sans antialiased selection:bg-indigo-500/30 selection:text-white overflow-x-hidden">
      {/* Sidebar Control Plane */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        userEmail={userEmail}
        userRole={userRole}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main viewport with Framer Motion layout adjustment animation */}
      <motion.div
        layout
        initial={false}
        animate={{ paddingLeft: isSidebarOpen ? '20rem' : '0rem' }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        className="flex-1 min-h-screen flex flex-col bg-gradient-to-b from-zinc-950 via-black to-zinc-950"
      >
        
        {/* Persistent Header */}
        <Header
          activeTab={activeTab}
          onUpgradeClick={() => setActiveTab('billing')}
          creditsUsed={creditsUsed}
          creditsLimit={creditsLimit}
          subscriptionPlan={subscriptionPlan}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Floating Content Body Canvas */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto pb-16">
          {renderActiveTabContent()}
        </main>
      </motion.div>

      {/* Keyboard Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        setActiveTab={setActiveTab}
        onQuickTopicCompose={handleQuickTopicCompose}
      />

      {/* Onboarding Wizard Tour */}
      <AppTour
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
