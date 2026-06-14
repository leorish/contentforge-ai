/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BarChart2, Calendar, ThumbsUp, ArrowRight, ArrowLeft, X, CheckCircle } from 'lucide-react';

interface AppTourProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface TourStep {
  tab: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  spotlightText: string;
}

export default function AppTour({ activeTab, setActiveTab }: AppTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps: TourStep[] = [
    {
      tab: 'generator',
      title: 'AI Omnichannel Content Generator',
      description: 'Generate production-ready posts for LinkedIn, X/Twitter, Instagram, and YouTube. Craft from voice input, apply brand voices, explore real-time keywords, and export directly as PDF, Markdown, or CSV.',
      icon: Sparkles,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      spotlightText: "Compose multi-channel drafts and inspect AI-driven Insights instantly as you type."
    },
    {
      tab: 'calendar',
      title: 'Automated 30-Day Content Calendar',
      description: 'Map out campaigns across a clean visual calendar. Use the new Batch Scheduling features to queue multiple articles and schedule posts for optimal times in a single unified action.',
      icon: Calendar,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      spotlightText: "Generate month-long roadmaps and synchronize post streams with zero friction."
    },
    {
      tab: 'analytics',
      title: 'Advanced Analytics & Multi-Post Comparison',
      description: 'Analyze total view counts and direct clicks. Highlight prime publication slots with our interactive weekly post engagement heatmap, and evaluate content via the side-by-side performance comparison tool.',
      icon: BarChart2,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      spotlightText: "Unlock granular heatmaps and side-by-side post statistics."
    }
  ];

  useEffect(() => {
    // Check if the user has completed the tour
    const completed = localStorage.getItem('contentforge-tour-completed-v3');
    if (!completed) {
      // Small timeout for natural entry
      const timer = setTimeout(() => {
        setIsOpen(true);
        setActiveTab(tourSteps[0].tab);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // React on step change to switch active tabs in layout dynamically
  useEffect(() => {
    if (isOpen) {
      setActiveTab(tourSteps[currentStep].tab);
    }
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('contentforge-tour-completed-v3', 'true');
    setIsOpen(false);
    setCurrentStep(0);
  };

  const triggerRestartTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  useEffect(() => {
    // Listen for custom trigger to replay the tour
    const handleReplay = () => {
      triggerRestartTour();
    };
    window.addEventListener('trigger-app-tour', handleReplay);
    return () => window.removeEventListener('trigger-app-tour', handleReplay);
  }, []);

  if (!isOpen) {
    // Hidden, but we render a tiny re-take tour floating pill in the bottom right corner
    return (
      <button
        id="btn-restart-app-tour"
        onClick={triggerRestartTour}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-zinc-900 text-[#6C5CE7] dark:text-[#8B7CFF] font-semibold text-xs rounded-full border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-850 shadow-lg cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group font-sans"
        title="Launch onboarding walkthrough tour"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7] dark:text-[#8B7CFF] group-hover:animate-pulse" />
        <span>Take Platform Tour</span>
      </button>
    );
  }

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop filter overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleComplete}
          className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md z-45"
        />

        {/* Modal Window */}
        <motion.div
          id="app-tour-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl shadow-2xl z-50 overflow-hidden font-sans text-zinc-800 dark:text-zinc-100"
        >
          {/* Progress bar tracking line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-900">
            <motion.div
              className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#8B7CFF]"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-6 pt-8 space-y-6">
            {/* Header section */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${step.color} flex items-center justify-center`}>
                  <StepIcon className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C5CE7] dark:text-[#8B7CFF]">
                    Step {currentStep + 1} of {tourSteps.length}
                  </span>
                  <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white leading-tight mt-0.5">
                    {step.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={handleComplete}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-zinc-650 dark:hover:text-white transition-colors cursor-pointer"
                title="Dismiss onboarding tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description Text node */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-900/60 p-4.5 rounded-2xl">
              <p className="text-sm text-zinc-600 dark:text-zinc-350 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Target spotlight dynamic feature callout */}
            <div className="border border-[#6C5CE7]/20 bg-[#6C5CE7]/5 dark:bg-[#6C5CE7]/10 p-3.5 rounded-xl flex items-start gap-2.5">
              <span className="text-[11px] font-mono font-bold bg-[#6C5CE7] text-white px-1.5 py-0.5 rounded leading-none shrink-0 mt-0.5 shadow-sm">
                Spotlight
              </span>
              <p className="text-xs text-[#6C5CE7] dark:text-[#8B7CFF] font-medium leading-normal">
                {step.spotlightText}
              </p>
            </div>

            {/* Footer containing navigation actions */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-150 dark:border-zinc-900">
              <div className="flex items-center gap-1.5">
                {tourSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentStep === idx ? 'w-5 bg-[#6C5CE7]' : 'w-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-350'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-200 flex items-center justify-center cursor-pointer font-bold text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B7CFF] hover:from-[#5C4CE7] hover:to-[#7B6CFF] text-white font-bold text-xs flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md shadow-[#6C5CE7]/15 hover:shadow-[#6C5CE7]/20"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    <>
                      <span>Understand!</span>
                      <CheckCircle className="w-3.5 h-3.5 ml-1.5 text-white" />
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-white" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
