import React from 'react';
import { motion } from 'motion/react';
import { 
  AgentRole, 
  AgentWorkflowStage, 
  AgentDecisionLog 
} from '../types/security';
import { 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  AlertOctagon, 
  ArrowRight, 
  Terminal, 
  Zap, 
  GitBranch,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface LangGraphAgentPipelineProps {
  currentStage: AgentWorkflowStage;
  decisionLogs: AgentDecisionLog[];
  confidenceScore: number;
  isSimulating: boolean;
  onManualTriggerStage?: (stage: AgentWorkflowStage) => void;
}

export const LangGraphAgentPipeline: React.FC<LangGraphAgentPipelineProps> = ({
  currentStage,
  decisionLogs,
  confidenceScore,
  isSimulating,
}) => {
  const isDetectionActive = ['telemetry_ingestion', 'anomaly_scoring', 'cross_log_correlation'].includes(currentStage);
  const isResponseActive = ['threat_confirmed', 'containment_dispatched', 'network_isolation_active'].includes(currentStage);
  const isVerificationActive = ['verification_sampling', 'verification_passed', 'escalation_required'].includes(currentStage);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      {/* Header & Graph Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              LangGraph Tri-Agent State Machine
            </h2>
          </div>
          {/* Zero-Pill metadata with dot separators */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Framework: LangGraph Core</span>
            <span aria-hidden="true">·</span>
            <span>Architecture: Detect-Act-Verify Cyclic Loop</span>
            <span aria-hidden="true">·</span>
            <span>Threshold: &ge; 85% Confidence</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Current Phase:</span>
          <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
            isSimulating
              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 animate-pulse'
              : 'border-slate-700 bg-slate-900 text-slate-400'
          }`}>
            {currentStage.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Visual Tri-Agent Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {/* Agent 1: Detection Agent */}
        <div className={`p-4 rounded-xl border transition-all duration-300 relative ${
          isDetectionActive
            ? 'bg-cyan-950/20 border-cyan-500/70 shadow-lg shadow-cyan-950/40'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                isDetectionActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}>
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">1. Detection Agent</h3>
                <span className="text-[10px] text-slate-400 font-mono">Random Forest & Autoencoder</span>
              </div>
            </div>
            {isDetectionActive && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Monitors 4 log sources (Firewall, Auth, DNS, Endpoint). Correlates multi-source events into attack sequences.
          </p>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Model Invariants:</span>
              <span className="text-slate-200">RF-92 / AE-Loss &lt; 0.08</span>
            </div>
            <div className="flex justify-between">
              <span>Correlation Confidence:</span>
              <span className={confidenceScore > 80 ? 'text-cyan-400 font-bold tabular-nums' : 'text-slate-300 tabular-nums'}>
                {confidenceScore ? `${confidenceScore}%` : 'Nominal'}
              </span>
            </div>
          </div>
        </div>

        {/* Agent 2: Response Agent */}
        <div className={`p-4 rounded-xl border transition-all duration-300 relative ${
          isResponseActive
            ? 'bg-amber-950/20 border-amber-500/70 shadow-lg shadow-amber-950/40'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                isResponseActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}>
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">2. Response Agent</h3>
                <span className="text-[10px] text-slate-400 font-mono">Zero-Delay Autonomous Actuator</span>
              </div>
            </div>
            {isResponseActive && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Executes containment automatically. Isolates affected devices onto VLAN 99, drops remote C2 IP sockets, kills malicious PIDs.
          </p>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Action Latency:</span>
              <span className="text-amber-400 font-bold">&lt; 2.4s Autonomous</span>
            </div>
            <div className="flex justify-between">
              <span>Human Approval:</span>
              <span className="text-slate-200">Bypassed (Zero-Delay)</span>
            </div>
          </div>
        </div>

        {/* Agent 3: Verification Agent */}
        <div className={`p-4 rounded-xl border transition-all duration-300 relative ${
          isVerificationActive
            ? 'bg-emerald-950/20 border-emerald-500/70 shadow-lg shadow-emerald-950/40'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                isVerificationActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">3. Verification Agent</h3>
                <span className="text-[10px] text-slate-400 font-mono">Post-Remediation Telemetry Audit</span>
              </div>
            </div>
            {isVerificationActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Audits network traffic over 3 post-containment sample windows. Confirms cessation or escalates to severe containment.
          </p>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Audit Cycles:</span>
              <span className="text-emerald-400 font-bold">3 Passes Active</span>
            </div>
            <div className="flex justify-between">
              <span>Escalation Rule:</span>
              <span className="text-slate-200">Subnet Cutoff if Leakage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Engine Flow Explanation Banner */}
      <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-slate-200">LangGraph Feedback Loop:</strong> If the Verification Agent confirms activity stopped, state resolves to <span className="text-emerald-400 font-mono">VERIFIED_HEALED</span>. If beacon continues, loop routes back to <span className="text-rose-400 font-mono">ESCALATED_CONTAINMENT</span>.
          </span>
        </div>
      </div>

      {/* Live Agent Thought Log Console */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">Autonomous Agent Reasoning & Execution Log</span>
          </div>
          <span className="text-[11px] text-slate-500">Live LangGraph State Output</span>
        </div>

        <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
          {decisionLogs.length === 0 ? (
            <div className="text-slate-600 italic py-4 text-center">
              Agent state machine is idling in nominal telemetry ingestion mode. Click "Simulate Attack" to launch an autonomous containment loop.
            </div>
          ) : (
            decisionLogs.map((log) => {
              const agentColor = 
                log.agent === 'detection' ? 'text-cyan-400' :
                log.agent === 'response' ? 'text-amber-400' : 'text-emerald-400';

              return (
                <div key={log.id} className="flex items-start gap-2.5 text-[11px] leading-relaxed">
                  <span className="text-slate-500 tabular-nums shrink-0">{log.timestamp}</span>
                  <span className={`uppercase font-bold shrink-0 ${agentColor}`}>
                    [{log.agent}]
                  </span>
                  <span className="text-slate-300 flex-1">
                    <strong className="text-slate-100">{log.step}:</strong> {log.detail}
                    {log.mitreTechnique && (
                      <span className="ml-1.5 text-slate-400">({log.mitreTechnique})</span>
                    )}
                  </span>
                  {log.confidenceScore !== undefined && (
                    <span className="text-cyan-400 shrink-0 tabular-nums font-semibold">
                      {log.confidenceScore}% conf
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
