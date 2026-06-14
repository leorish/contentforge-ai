/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import {
  TrendingUp, Eye, MousePointer, Activity, Share2, Percent,
  ArrowUpRight, ArrowDownRight, RefreshCw, Layers
} from 'lucide-react';
import { AnalyticsSummary } from '../../types';

export default function AnalyticsOverview() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic state for interactive engagement heatmap
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ row: number, col: number, val: number, label: string } | null>({
    row: 1,
    col: 2,
    val: 95,
    label: "Wednesday at 12:00"
  });

  // Comprehensive campaigns datasets for side-by-side comparison charts
  const mockPostsData = [
    { id: 1, title: "Mastering React Hooks", platform: "LinkedIn", views: 4200, clicks: 120, engagement: 88, ctr: 2.8 },
    { id: 2, title: "SaaS Growth Playbook", platform: "LinkedIn", views: 2800, clicks: 90, engagement: 74, ctr: 3.2 },
    { id: 3, title: "Quiet Luxury Aesthetic Trend", platform: "Instagram", views: 5900, clicks: 210, engagement: 95, ctr: 3.5 },
    { id: 4, title: "Deep Dive into Node 22 Features", platform: "X/Twitter", views: 1800, clicks: 55, engagement: 62, ctr: 3.0 },
    { id: 5, title: "Next-Gen AI Microservices Architecture", platform: "X/Twitter", views: 3300, clicks: 110, engagement: 81, ctr: 3.3 }
  ];

  const [comparePostA, setComparePostA] = useState<number>(1);
  const [comparePostB, setComparePostB] = useState<number>(3);

  const postADetails = mockPostsData.find(p => p.id === comparePostA) || mockPostsData[0];
  const postBDetails = mockPostsData.find(p => p.id === comparePostB) || mockPostsData[1];

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/overview');
      const resData = await response.json();
      setData(resData);
    } catch (e) {
      console.error("Error retrieving analytics dataset", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-zinc-400 font-mono">Retuning analytics channels...</p>
      </div>
    );
  }

  // Active chart based on period selection
  const chartData = period === 'daily' ? data.daily : period === 'weekly' ? data.weekly : data.monthly;
  const xAxisKey = period === 'daily' ? 'date' : period === 'weekly' ? 'week' : 'month';

  const overviewMetrics = [
    { title: "Raw Impressions", val: data.totals.views.toLocaleString(), pct: "+24.5%", up: true, desc: "Total impression load index", icon: Eye, stroke: "indigo" },
    { title: "Direct Clicks", val: data.totals.clicks.toLocaleString(), pct: "+18.2%", up: true, desc: "Action clicks to campaign links", icon: MousePointer, stroke: "emerald" },
    { title: "Social Engagement", val: data.totals.engagement.toLocaleString(), pct: "+31.0%", up: true, desc: "Likes, comments, shares accumulated", icon: Activity, stroke: "purple" },
    { title: "Mean CTR", val: `${data.totals.ctr}%`, pct: "-2.4%", up: false, desc: "Average system click-through rating", icon: Percent, stroke: "amber" }
  ];

  return (
    <div id="analytics-overview-tab" className="space-y-8 animate-fade-in">
      {/* Metric summary bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewMetrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 hover:border-zinc-850 transition-colors shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/0 group-hover:bg-indigo-500/40 transition-colors" />
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">{m.title}</span>
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">{m.val}</span>
                <span className={`text-xs font-semibold flex items-center ${m.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {m.up ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {m.pct}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans mt-2">{m.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Primary Analytics Graph Panel */}
      <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-6 shadow-md relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-zinc-900/60 pb-5">
          <div>
            <h3 className="text-base font-bold text-white">Engagement Frequency & Traffic Flow</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Time-series audit across multi-channel distribution</p>
          </div>
          {/* Period selector */}
          <div className="flex bg-zinc-900/80 p-1 rounded-lg border border-zinc-800/60 font-mono">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                  period === p
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1c1917" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                stroke="#78716c"
                fontSize={10}
                fontFamily="JetBrains Mono"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#78716c"
                fontSize={10}
                fontFamily="JetBrains Mono"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c0a09',
                  borderColor: '#292524',
                  borderRadius: '10px',
                  color: '#f5f5f4',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px'
                }}
                itemStyle={{ color: '#a8a29e' }}
              />
              <Legend verticalAlign="top" height={36} iconSize={10} iconType="circle" />
              <Area
                name="Views (Reach)"
                type="monotone"
                dataKey="views"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
              <Area
                name="Clicks"
                type="monotone"
                dataKey="clicks"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorClicks)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NEW INTERACTIVE ENGAGEMENT HEATMAP */}
      <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-6 shadow-md relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-zinc-900/60 pb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Social Posting Key Performance Heatmap
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Click any day-hour block to view the dynamic Recharts hourly performance flow</p>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
            Optimal Slots Strategy
          </span>
        </div>

        {/* Heatmap interactive sandbox */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Heatmap Grid (7 Columns representing Days of the week) */}
          <div className="xl:col-span-8 space-y-4">
            <div className="grid grid-cols-8 gap-2 text-center text-[10px] font-mono text-zinc-550 uppercase tracking-wider font-bold">
              <span>Slot</span>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <span key={d} className="text-zinc-400">{d}</span>
              ))}
            </div>

            <div className="space-y-2">
              {[
                { label: 'Morning (08:00)', values: [45, 60, 85, 40, 50, 20, 15] },
                { label: 'Noon (12:00)', values: [70, 80, 95, 75, 85, 30, 25] },
                { label: 'Afternoon (15:00)', values: [55, 65, 70, 90, 80, 45, 35] },
                { label: 'Evening (19:00)', values: [90, 85, 99, 95, 92, 60, 65] },
                { label: 'Night (22:00)', values: [30, 50, 40, 35, 65, 75, 80] }
              ].map((row, rIdx) => {
                return (
                  <div key={row.label} className="grid grid-cols-8 gap-2 items-center">
                    <span className="text-[10px] font-mono font-semibold text-zinc-500 text-left truncate pr-1">
                      {row.label.split(' ')[0]}
                    </span>
                    {row.values.map((v, cIdx) => {
                      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                      const isSelected = selectedHeatmapCell?.row === rIdx && selectedHeatmapCell?.col === cIdx;
                      
                      // Calculate Tailwind background color based on density score
                      let cellColor = "bg-zinc-900 text-zinc-650 hover:bg-indigo-950/20";
                      if (v > 90) cellColor = "bg-indigo-600 text-white font-bold hover:bg-indigo-500";
                      else if (v > 75) cellColor = "bg-indigo-500/70 text-indigo-100 hover:bg-indigo-500";
                      else if (v > 50) cellColor = "bg-indigo-500/35 text-indigo-300 hover:bg-indigo-500/50";
                      else if (v > 30) cellColor = "bg-indigo-505/15 text-zinc-400 hover:bg-indigo-500/20";

                      return (
                        <button
                          key={cIdx}
                          onClick={() => setSelectedHeatmapCell({ row: rIdx, col: cIdx, val: v, label: `${days[cIdx]} at ${row.label.split(' ')[1]}` })}
                          className={`h-11 rounded-lg flex flex-col justify-center items-center text-xs font-mono transition-all duration-200 cursor-pointer border ${
                            isSelected 
                              ? 'border-[#8B7CFF] ring-2 ring-[#6C5CE7]/40 scale-102 shadow-md z-10' 
                              : 'border-transparent'
                          } ${cellColor}`}
                          title={`Score: ${v}%`}
                        >
                          <span>{v}%</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-900/50">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-zinc-900 border border-zinc-800" /> &lt;30% (Low Traffic)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500/15" /> 30%-50% (Normal)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500/40" /> 50%-75% (Moderate)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500/80" /> 75%-90% (High)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600" /> &gt;90% (Peak Period)
              </span>
            </div>
          </div>

          {/* Side Recharts line tracker showing optimal curves */}
          <div className="xl:col-span-4 bg-zinc-90 w-full rounded-2xl p-4 border border-zinc-900 bg-zinc-900/20 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">Selected Slot Analysis</span>
              <h4 className="text-sm font-bold text-white mt-1">
                {selectedHeatmapCell ? selectedHeatmapCell.label : 'Wednesday at 12:00'}
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                Weekly traffic density currently indexes at <strong className="text-white font-mono">{selectedHeatmapCell ? selectedHeatmapCell.val : 95}%</strong> capacity.
              </p>
            </div>

            {/* Recharts curve */}
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={[
                    { hour: '08:00', load: (selectedHeatmapCell?.val || 95) * 0.6 },
                    { hour: '12:00', load: (selectedHeatmapCell?.val || 95) * 0.95 },
                    { hour: '15:00', load: (selectedHeatmapCell?.val || 95) * 0.75 },
                    { hour: '19:00', load: (selectedHeatmapCell?.val || 95) * 1.0 },
                    { hour: '22:00', load: (selectedHeatmapCell?.val || 95) * 0.4 }
                  ]}
                  margin={{ top: 5, right: 5, left: -30, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="heatmapGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1c1917" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hour" stroke="#71717a" fontSize={9} axisLine={false} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={9} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0a09',
                      borderColor: '#1f2937',
                      fontSize: '10px'
                    }}
                  />
                  <Area type="monotone" dataKey="load" stroke="#6C5CE7" fill="url(#heatmapGlow)" strokeWidth={2} name="Traffic load" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-900 text-xs text-zinc-500 leading-normal font-sans">
              <strong>Tip:</strong> Schedule automated posts precisely during 12:00 - 15:00 and 19:00 for optimal reach indices.
            </div>
          </div>
        </div>
      </div>

      {/* NEW SIDE-BY-SIDE ANALYTICS COMPARISON VIEW */}
      <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-6 shadow-md relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-zinc-900/60 pb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Omnichannel Campaign Head-to-Head Evaluator
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Compare live performance indicators and reach conversion parameters between two draft templates</p>
          </div>
        </div>

        {/* Comparison interactive selectors */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 hover:text-white uppercase font-bold tracking-wider">Template Alpha</label>
              <select
                value={comparePostA}
                onChange={(e) => setComparePostA(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-xs text-zinc-200 outline-none focus:border-indigo-500/80"
              >
                {mockPostsData.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.platform})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 hover:text-white uppercase font-bold tracking-wider">Template Beta</label>
              <select
                value={comparePostB}
                onChange={(e) => setComparePostB(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-xs text-zinc-200 outline-none focus:border-indigo-500/80"
              >
                {mockPostsData.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.platform})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Recharts Comparison Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
            {/* Chart */}
            <div className="xl:col-span-8 h-80 w-full bg-zinc-900/10 rounded-2xl p-4 border border-zinc-900">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      metric: 'Impressions (views)',
                      [postADetails.title]: postADetails.views,
                      [postBDetails.title]: postBDetails.views
                    },
                    {
                      metric: 'Clicks (actions)',
                      [postADetails.title]: postADetails.clicks * 10,  // Scale up clicks for visualization
                      [postBDetails.title]: postBDetails.clicks * 10
                    },
                    {
                      metric: 'Engagement Score',
                      [postADetails.title]: postADetails.engagement,
                      [postBDetails.title]: postBDetails.engagement
                    },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid stroke="#1c1917" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="metric" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0a09',
                      borderColor: '#1f2937',
                      fontSize: '11px'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconSize={10} iconType="circle" />
                  <Bar dataKey={postADetails.title} fill="#6C5CE7" radius={[6, 6, 0, 0]} />
                  <Bar dataKey={postBDetails.title} fill="#8B7CFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics cards */}
            <div className="xl:col-span-4 space-y-4">
              <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-2">
                <span className="text-[10px] font-mono font-bold text-zinc-550 uppercase">Analysis Outcome</span>
                <p className="text-xs text-zinc-350 leading-relaxed">
                  The primary comparison highlights that <strong className="text-white">"{postADetails.views > postBDetails.views ? postADetails.title : postBDetails.title}"</strong> possesses stronger viral coefficients with over <strong className="text-white">{(Math.abs(postADetails.views - postBDetails.views)).toLocaleString()}</strong> additional impression views!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-xl space-y-1">
                  <span className="text-zinc-550">Alpha CTR</span>
                  <span className="text-indigo-400 font-bold block text-sm">{postADetails.ctr}%</span>
                </div>
                <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-xl space-y-1">
                  <span className="text-zinc-550">Beta CTR</span>
                  <span className="text-indigo-300 font-bold block text-sm">{postBDetails.ctr}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
