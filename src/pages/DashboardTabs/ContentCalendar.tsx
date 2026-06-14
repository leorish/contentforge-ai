/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar, Sparkles, RefreshCw, ChevronLeft, ChevronRight, Check,
  Linkedin, Twitter, Instagram, Facebook, Mail, PlaySquare, AlertCircle
} from 'lucide-react';
import { CalendarItem } from '../../types';

export default function ContentCalendar() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('Django & Cloud Security Campaign');
  const [activePlatformFilter, setActivePlatformFilter] = useState<'All' | 'LinkedIn' | 'Instagram' | 'Facebook' | 'X/Twitter' | 'Email'>('All');
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

  // Batch Scheduler States
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>([]);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  // Active month simulation (June 2026 based on current datetime context)
  const daysInMonth = 30; // June is 30 days
  const startDayOffset = 1; // June 1st, 2026 is a Monday (let's say)

  const fetchCalendar = async () => {
    try {
      const response = await fetch('/api/calendar/items');
      const data = await response.json();
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const handleGenerate30Day = async () => {
    setLoading(true);
    setSelectedItem(null);
    try {
      const response = await fetch('/api/generate/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform: activePlatformFilter })
      });
      const data = await response.json();
      if (data.success && data.calendar) {
        setItems(data.calendar);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'LinkedIn': return <Linkedin className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'Instagram': return <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />;
      case 'Facebook': return <Facebook className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'X/Twitter': return <Twitter className="w-3.5 h-3.5 text-zinc-350 shrink-0" />;
      case 'Email': return <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
      default: return <PlaySquare className="w-3.5 h-3.5 text-rose-450 shrink-0" />;
    }
  };

  const getDayItems = (dayNum: number) => {
    const paddedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const targetDateStr = `2026-06-${paddedDay}`;
    return items.filter(item => {
      const matchesDate = item.date === targetDateStr;
      const matchesPlatform = activePlatformFilter === 'All' || item.platform === activePlatformFilter;
      return matchesDate && matchesPlatform;
    });
  };

  return (
    <div id="content-calendar-tab" className="space-y-6 animate-fade-in">
      
      {/* Upper Control Bar */}
      <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" /> Automated campaign Planning Board
          </h3>
          <p className="text-xs text-zinc-400">Generate 30 days of multi-channel postings instantly</p>
        </div>

        {/* Input parameters and generator trigger */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <input
            id="calendar-topic-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Focus topic..."
            className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-200 outline-none w-full sm:w-60 focus:border-emerald-500"
          />

          <button
            id="calendar-generate-btn"
            onClick={handleGenerate30Day}
            disabled={loading}
            className="flex items-center gap-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:from-zinc-900 text-white disabled:text-zinc-550 rounded-lg text-xs font-semibold shadow-inner transition-colors shrink-0"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 animate-pulse mr-1" />}
            <span>{loading ? "Composing 30 Days..." : "Generate 30-Day Calendar Plan"}</span>
          </button>
        </div>
      </div>

      {/* Grid view containing layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid card */}
        <div className="xl:col-span-8 bg-zinc-900/10 border border-zinc-900 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-5 select-none border-b border-zinc-900 pb-4">
            <h4 className="text-sm font-bold font-mono tracking-tight text-zinc-200 flex items-center gap-1.5">
              <span>June 2026</span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-505/10 text-indigo-400 border border-indigo-500/20">Monthly grid</span>
            </h4>

            {/* Platform filter */}
            <div className="flex bg-zinc-950 border border-zinc-850 p-1 rounded-lg text-[10px] font-mono">
              {(['All', 'LinkedIn', 'Instagram', 'Facebook', 'X/Twitter'] as const).map((pf) => (
                <button
                  key={pf}
                  onClick={() => setActivePlatformFilter(pf)}
                  className={`px-2 py-1 rounded transition-colors ${
                    activePlatformFilter === pf ? 'bg-[#6C5CE7] text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {pf}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                setBatchSelectedIds([]);
                setSelectedItem(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-mono font-semibold cursor-pointer transition-all active:scale-95 ${
                isBatchMode
                  ? 'bg-emerald-600/15 border-emerald-500/35 text-emerald-400 font-bold shadow-md shadow-emerald-500/5'
                  : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Select multiple drafts to schedule them simultaneously with optimized posting slots"
            >
              <Check className={`w-3.5 h-3.5 ${isBatchMode ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
              <span>{isBatchMode ? 'Mode: Selection ON' : 'Batch Schedule'}</span>
            </button>
          </div>

          {/* Grid Headers representing weekdays */}
          <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest mb-3 border-b border-zinc-900/40 pb-2">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>

          {/* Calendar grid items */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty boxes for offset days */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="min-h-[85px] bg-zinc-950/20 border border-transparent rounded-lg"></div>
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayItems = getDayItems(dayNum);
              const isToday = dayNum === 12; // simulated today is June 12
              
              const hasItem = dayItems.length > 0;
              const isSelectedInBatch = hasItem && batchSelectedIds.includes(dayItems[0].id);

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => {
                    if (isBatchMode) {
                      if (hasItem) {
                        const targetId = dayItems[0].id;
                        setBatchSelectedIds(prev =>
                          prev.includes(targetId)
                            ? prev.filter(id => id !== targetId)
                            : [...prev, targetId]
                        );
                      }
                    } else {
                      if (hasItem) setSelectedItem(dayItems[0]);
                    }
                  }}
                  className={`min-h-[85px] bg-zinc-950/45 border p-2.5 rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer border-zinc-900 ${
                    isSelectedInBatch 
                      ? 'border-emerald-500/80 bg-emerald-500/5 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/5'
                      : isToday
                        ? 'border-indigo-500 ring-1 ring-indigo-505/30 bg-[#6C5CE7]/5 shadow-sm'
                        : 'hover:border-zinc-800'
                  } ${hasItem ? 'bg-zinc-900/10' : 'hover:bg-zinc-900/10'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[11px] font-mono font-bold ${
                      isSelectedInBatch
                        ? 'text-emerald-400'
                        : isToday 
                          ? 'text-[#8B7CFF]' 
                          : 'text-zinc-400'
                    }`}>{dayNum}</span>
                    
                    {isSelectedInBatch && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-2 ring-emerald-950">
                        <Check className="w-1.5 h-1.5" strokeWidth={5} />
                      </span>
                    )}
                  </div>
                  
                  {/* Channel indicator node */}
                  <div className="space-y-1 mt-2">
                    {dayItems.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-900 truncate max-w-full"
                        title={item.topic}
                      >
                        {getPlatformIcon(item.platform)}
                        <span className="text-[9px] text-zinc-550 truncate max-w-full">{item.platform}</span>
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <span className="text-[9px] text-[#8B7CFF] font-mono block pl-1">+{dayItems.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected day campaign detailed inspector panel */}
        <div className="xl:col-span-4 bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 shadow-md h-full min-h-[300px]">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-900 pb-3">
            🎯 Planning board Inspector
          </h4>

          {selectedItem ? (
            <div className="space-y-5 animate-fade-in text-xs">
              <div className="flex justify-between items-center bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-805">
                <span className="font-mono text-zinc-400 text-xs">Platform Tag:</span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950 text-xs font-semibold text-zinc-200 border border-zinc-800">
                  {getPlatformIcon(selectedItem.platform)}
                  {selectedItem.platform}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider">Scheduled Target Posting Time</span>
                <p className="font-mono text-zinc-200 text-xs bg-zinc-950/40 p-2.5 rounded border border-zinc-900">{selectedItem.postingTime} (June {selectedItem.date.split('-')[2]})</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider">Campaign Content Thesis</span>
                <p className="text-zinc-200 leading-relaxed font-sans bg-zinc-950 p-3 rounded-lg border border-zinc-900 select-text">{selectedItem.topic}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-lg">
                  <span className="text-[9px] font-mono text-zinc-500 block uppercase font-bold mb-1">Target KPI</span>
                  <span className="text-xs font-semibold text-indigo-300">{selectedItem.goal}</span>
                </div>
                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-lg">
                  <span className="text-[9px] font-mono text-zinc-500 block uppercase font-bold mb-1">CTA Call</span>
                  <span className="text-xs font-semibold text-emerald-300 truncate block">{selectedItem.cta}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-8 h-8 text-zinc-650 mb-2 animate-bounce" />
              <p className="text-xs text-zinc-500">Pick any day with generated item cells to inspect the active campaign properties.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Success Notification Toast */}
      {batchSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F1C18] border border-emerald-500/20 text-emerald-400 text-xs px-4 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 animate-fade-in font-sans">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">{batchSuccessMsg}</span>
        </div>
      )}

      {/* Floating Select Action Panel */}
      {isBatchMode && batchSelectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-zinc-950/95 border border-zinc-800 rounded-xl p-3 shadow-2xl flex items-center gap-4 animate-fade-in max-w-sm w-[90%] backdrop-blur-md">
          <div className="flex-1 pl-2">
            <p className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {batchSelectedIds.length} Days Handpicked
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">Simultaneous timezone optimizations</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setBatchSelectedIds([])}
              className="px-2.5 py-1.5 hover:bg-zinc-900 rounded text-[10px] font-mono text-zinc-400 cursor-pointer transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => {
                setBatchSuccessMsg(`Success! Scheduled ${batchSelectedIds.length} campaigns for optimal post slots.`);
                setBatchSelectedIds([]);
                setIsBatchMode(false);
                setTimeout(() => setBatchSuccessMsg(null), 4000);
              }}
              className="px-3.5 py-1.5 bg-[#6C5CE7] hover:bg-[#8B7CFF] rounded-lg text-xs font-bold text-white shadow-md cursor-pointer active:scale-95 transition-all"
            >
              Set Times
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
