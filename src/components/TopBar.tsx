import React from 'react';
import { Shield, Play, FileText, RotateCcw } from 'lucide-react';

interface TopBarProps {
  activeTab: 'overview' | 'topology' | 'correlation' | 'agent-loop' | 'incidents';
  setActiveTab: (tab: 'overview' | 'topology' | 'correlation' | 'agent-loop' | 'incidents') => void;
  onOpenSimulation: () => void;
  onOpenPaper: () => void;
  onResetNetwork: () => void;
  isSimulating: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSimulation,
  onOpenPaper,
  onResetNetwork,
  isSimulating,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a 
          href="#overview" 
          onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
          className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2 hover:text-cyan-400 transition-colors"
        >
          <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>AegisNet Defense</span>
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('overview')}
            className={`transition-colors hover:text-slate-100 ${
              activeTab === 'overview' ? 'text-cyan-400 border-b-2 border-cyan-400 py-4' : 'py-4'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('topology')}
            className={`transition-colors hover:text-slate-100 ${
              activeTab === 'topology' ? 'text-cyan-400 border-b-2 border-cyan-400 py-4' : 'py-4'
            }`}
          >
            Network Topology
          </button>
          <button
            onClick={() => setActiveTab('agent-loop')}
            className={`transition-colors hover:text-slate-100 ${
              activeTab === 'agent-loop' ? 'text-cyan-400 border-b-2 border-cyan-400 py-4' : 'py-4'
            }`}
          >
            Tri-Agent Loop
          </button>
          <button
            onClick={() => setActiveTab('correlation')}
            className={`transition-colors hover:text-slate-100 ${
              activeTab === 'correlation' ? 'text-cyan-400 border-b-2 border-cyan-400 py-4' : 'py-4'
            }`}
          >
            Log Correlation
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`transition-colors hover:text-slate-100 ${
              activeTab === 'incidents' ? 'text-cyan-400 border-b-2 border-cyan-400 py-4' : 'py-4'
            }`}
          >
            Incident Audit
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPaper}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            title="Read Malla Reddy University Research Abstract"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Research Abstract</span>
          </button>

          <button
            onClick={onResetNetwork}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-lg transition-colors"
            title="Reset Network State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm whitespace-nowrap ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold hover:shadow-cyan-500/20'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Loop Active...' : 'Simulate Attack'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
