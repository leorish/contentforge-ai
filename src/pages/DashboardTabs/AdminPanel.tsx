/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Settings, Server, RefreshCw, Key, AlertTriangle, CheckSquare, Zap } from 'lucide-react';

export default function AdminPanel() {
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagResults, setDiagResults] = useState<any | null>(null);

  // Security Flags state simulation
  const [rateLimitPolicy, setRateLimitPolicy] = useState('Standard (100 req/min)');
  const [xssHardening, setXssHardening] = useState(true);
  const [csrfPolicy, setCsrfPolicy] = useState(true);

  const startServerDiagnostics = () => {
    setDiagnosticsRunning(true);
    setDiagResults(null);
    setTimeout(() => {
      setDiagnosticsRunning(false);
      setDiagResults({
        apiLatency: '14ms',
        dbConnectivity: 'Active MySQL Pool (4 connections)',
        celeryQueue: '0 tasks pending (Celery-Redis idle)',
        geminiSla: '99.8% Successful request metrics',
        corsStatus: 'Hardened Origin Policies Active'
      });
    }, 2000);
  };

  return (
    <div id="admin-panel-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Policy management side */}
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Shield className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-bold text-white">Security & Environment Policies</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-zinc-900/45 border border-zinc-900 rounded-xl space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">API Rate Limiter Settings</span>
              <div className="flex gap-2">
                {['Standard (100 req/min)', 'Premium Bypassed', 'Hardened IP Shield'].map((pol) => (
                  <button
                    key={pol}
                    onClick={() => setRateLimitPolicy(pol)}
                    className={`text-[9px] px-2 py-1 rounded transition-colors ${
                      rateLimitPolicy === pol ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-zinc-950 text-zinc-500'
                    }`}
                  >
                    {pol.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-zinc-900/45 border border-zinc-900 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-300 font-bold uppercase block">XSS Mitigation Shielding</span>
                <p className="text-[9px] text-zinc-500 font-sans mt-0.5">Filter html elements from rich editor inputs automatically.</p>
              </div>
              <button
                onClick={() => setXssHardening(!xssHardening)}
                className={`px-3 py-1 text-[9px] rounded-full border ${
                  xssHardening ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {xssHardening ? 'Armed' : 'Bypassed'}
              </button>
            </div>

            <div className="p-3 bg-zinc-900/45 border border-zinc-900 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-300 font-bold uppercase block">Double CSRF Cookie Handshake</span>
                <p className="text-[9px] text-zinc-500 font-sans mt-0.5">Inject dynamic csrf token parameters into client sessions.</p>
              </div>
              <button
                onClick={() => setCsrfPolicy(!csrfPolicy)}
                className={`px-3 py-1 text-[9px] rounded-full border ${
                  csrfPolicy ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {csrfPolicy ? 'Enabled' : 'Bypassed'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics log & metrics side */}
      <div className="xl:col-span-7 space-y-6">
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Server className="w-4 h-4 text-emerald-400" /> Server Diagnostics Board
            </h4>

            <button
              onClick={startServerDiagnostics}
              disabled={diagnosticsRunning}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 rounded-lg text-xs font-semibold text-white border border-zinc-800 disabled:opacity-50"
            >
              {diagnosticsRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400 mr-1" /> : <Zap className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{diagnosticsRunning ? 'Diagnosing...' : 'Execute Host Analysis'}</span>
            </button>
          </div>

          {diagnosticsRunning && (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
              <p className="text-xs font-mono text-zinc-500 italic">Querying socket tables, memory metrics, and port 3000 diagnostics...</p>
            </div>
          )}

          {!diagnosticsRunning && !diagResults && (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <CheckSquare className="w-8 h-8 text-zinc-650 mb-3" />
              <p className="text-xs text-zinc-500">Press the diagnostics button to query database states, network metrics, and active processes.</p>
            </div>
          )}

          {!diagnosticsRunning && diagResults && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in font-mono text-xs pt-2">
              <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Internal API Latency</span>
                <span className="text-xs font-semibold text-emerald-400">{diagResults.apiLatency}</span>
              </div>
              <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">MySQL Database Connections</span>
                <span className="text-xs font-semibold text-indigo-300">{diagResults.dbConnectivity}</span>
              </div>
              <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Celery Queue Thread</span>
                <span className="text-xs font-semibold text-zinc-300">{diagResults.celeryQueue}</span>
              </div>
              <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Gemini API Success Ratio</span>
                <span className="text-xs font-semibold text-emerald-400">{diagResults.geminiSla}</span>
              </div>
              <div className="grid-cols-1 md:col-span-2 p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1 w-full">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">App CORS Hardening Policy</span>
                <span className="text-[11px] text-zinc-300 block select-text">{diagResults.corsStatus}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
