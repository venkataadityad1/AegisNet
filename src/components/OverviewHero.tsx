import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Play, 
  FileText,
  Activity,
  Layers
} from 'lucide-react';
import { IncidentRecord } from '../types/security';

interface OverviewHeroProps {
  onOpenSimulation: () => void;
  onOpenPaper: () => void;
  resolvedCount: number;
  totalEventsCount: number;
  isSimulating: boolean;
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({
  onOpenSimulation,
  onOpenPaper,
  resolvedCount,
  totalEventsCount,
  isSimulating,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Header Box */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
            <span>Malla Reddy University Academic Research</span>
            <span aria-hidden="true">·</span>
            <span>B. Sri Ravi Tej (2411CS040019)</span>
            <span aria-hidden="true">·</span>
            <span>J. Anil (2411CS040069)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 text-balance leading-tight">
            Self-Healing Autonomous Network Security Agent with AI-Based Log Correlation
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed text-balance">
            Conventional SIEMs leave networks exposed for hours while human analysts review alerts. AegisNet executes an autonomous 3-agent <strong className="text-slate-200">Detect-Act-Verify</strong> loop powered by LangGraph, correlating fragmented firewall, auth, DNS, and endpoint logs into unified attack sequences with instant network containment.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSimulation}
              disabled={isSimulating}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/50 ${
                isSimulating
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-cyan-500/25'
              }`}
            >
              <Play className={`w-4 h-4 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Autonomous Defense Active...' : 'Launch Attack Simulation'}</span>
            </button>

            <button
              onClick={onOpenPaper}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>View Research Abstract</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Grid Flare */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-6 hidden lg:block opacity-20 pointer-events-none">
          <ShieldCheck className="w-56 h-56 text-cyan-400" />
        </div>
      </div>

      {/* 4 Quantitative KPI Metric Cards (Claim-to-Proof Adjacency) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Autonomous Containment</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
            &lt; 2.4s
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Replaces the 3.8-hour human response window with zero-delay automated device isolation.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Log Sinks Correlated</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
            4 Sinks
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Simultaneous real-time fusion of Firewall, Auth, DNS, and Host Device logs.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Self-Checking Verification</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
            3 Cycles
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Post-action telemetry sampling confirms packet cessation before declaring resolved.
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>AI ML Architecture</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            RF + LangGraph
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Scikit-learn Random Forest + Autoencoder model orchestrating tri-agent states.
          </p>
        </div>
      </div>
    </div>
  );
};
