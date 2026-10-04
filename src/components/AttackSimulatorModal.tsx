import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThreatScenario, NetworkNode } from '../types/security';
import { THREAT_SCENARIOS } from '../data/threatScenarios';
import { 
  X, 
  Flame, 
  ShieldAlert, 
  Play, 
  Sliders, 
  Radio, 
  AlertTriangle, 
  Terminal,
  Activity,
  Zap
} from 'lucide-react';

interface AttackSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerScenario: (scenario: ThreatScenario, simulateEscalation: boolean) => void;
  nodes: NetworkNode[];
}

export const AttackSimulatorModal: React.FC<AttackSimulatorModalProps> = ({
  isOpen,
  onClose,
  onTriggerScenario,
  nodes,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(THREAT_SCENARIOS[0].id);
  const [simulateEscalation, setSimulateEscalation] = useState<boolean>(false);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Custom scenario state
  const [customTargetNodeId, setCustomTargetNodeId] = useState<string>(nodes[4]?.id || 'node-ws1');
  const [customVector, setCustomVector] = useState<string>('Lateral SMB Port Scan + Pass-the-Hash');
  const [customSeverity, setCustomSeverity] = useState<'medium' | 'high' | 'critical'>('high');

  const selectedScenario = THREAT_SCENARIOS.find(s => s.id === selectedScenarioId) || THREAT_SCENARIOS[0];

  const handleLaunch = () => {
    if (isCustomMode) {
      const targetNode = nodes.find(n => n.id === customTargetNodeId) || nodes[0];
      const customScenario: ThreatScenario = {
        id: `custom-${Date.now()}`,
        name: `Custom Simulation: ${customVector}`,
        description: `Operator injected custom multi-stage vector directed at ${targetNode.label} (${targetNode.ip}).`,
        mitreCode: 'T1046 (Network Service Discovery) -> T1550 (Use Alternate Authentication Material)',
        severity: customSeverity,
        targetNodeId: customTargetNodeId,
        expectedContainment: [
          `Quarantine ${targetNode.label} into Isolation VLAN 99`,
          'Inject dynamic drop rules on Core Firewall',
          'Terminate unauthorized lateral scanning threads'
        ],
        initialLogs: [
          {
            id: `custom-log-1-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            category: 'auth',
            sourceIp: targetNode.ip,
            targetHost: '10.0.0.1',
            rawMessage: `PAM: repeated authentication attempts on administrative principal (severity: ${customSeverity})`,
            severity: customSeverity,
            isAnomaly: true,
            username: 'sys_operator',
            authMethod: 'PAM',
            authStatus: 'FAILED',
            attemptCount: 9,
          },
          {
            id: `custom-log-2-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            category: 'endpoint',
            sourceIp: targetNode.ip,
            targetHost: targetNode.ip,
            rawMessage: `auditd: rogue lateral probe script executed against subnet 10.0.0.0/24`,
            severity: customSeverity,
            isAnomaly: true,
            processName: 'nmap_probe.py',
            pid: 7721,
            parentProcess: 'python3',
            commandLine: 'python3 -c "import socket; ..."',
            integrityLevel: 'HIGH',
          },
          {
            id: `custom-log-3-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            category: 'firewall',
            sourceIp: targetNode.ip,
            targetHost: '198.51.100.89',
            rawMessage: `pfSense: high-rate anomalous egress stream detected on non-standard port 4444`,
            severity: customSeverity,
            isAnomaly: true,
            protocol: 'TCP',
            destPort: 4444,
            action: 'ALLOW',
            bytesSent: 38400,
          },
        ],
      };
      onTriggerScenario(customScenario, simulateEscalation);
    } else {
      onTriggerScenario(selectedScenario, simulateEscalation);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden text-slate-200"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-100">
                    Network Threat Injection Test Bench
                  </h2>
                  <p className="text-xs text-slate-400">
                    Benchmark the 3-Agent Detect-Act-Verify Loop against multi-stage attacks
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="px-6 pt-4 flex items-center gap-2">
              <button
                onClick={() => setIsCustomMode(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  !isCustomMode
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Pre-Configured Kill Chains ({THREAT_SCENARIOS.length})
              </button>
              <button
                onClick={() => setIsCustomMode(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isCustomMode
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Custom Vector Builder
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[65vh] text-xs">
              {!isCustomMode ? (
                <div className="space-y-3">
                  <label className="block text-slate-400 font-mono text-[11px] uppercase tracking-wider font-semibold">
                    Select Multi-Stage Threat Scenario:
                  </label>
                  <div className="space-y-2">
                    {THREAT_SCENARIOS.map((sc) => {
                      const isSelected = selectedScenarioId === sc.id;
                      const targetNode = nodes.find(n => n.id === sc.targetNodeId);

                      return (
                        <div
                          key={sc.id}
                          onClick={() => setSelectedScenarioId(sc.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-rose-950/20 border-rose-500/70 shadow-sm'
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-slate-100 text-xs sm:text-sm">{sc.name}</h4>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                              sc.severity === 'critical'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}>
                              {sc.severity}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed mb-2 font-normal">
                            {sc.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
                            <span>Target: {targetNode?.label || sc.targetNodeId}</span>
                            <span>·</span>
                            <span>MITRE: {sc.mitreCode.split('->')[0]}</span>
                            <span>·</span>
                            <span>Logs: {sc.initialLogs.length} multi-source events</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] uppercase mb-1.5 font-semibold">
                      Victim Target Host:
                    </label>
                    <select
                      value={customTargetNodeId}
                      onChange={(e) => setCustomTargetNodeId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    >
                      {nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.label} ({node.ip}) - Subnet: {node.subnet}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] uppercase mb-1.5 font-semibold">
                      Attack Vector Name:
                    </label>
                    <input
                      type="text"
                      value={customVector}
                      onChange={(e) => setCustomVector(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] uppercase mb-1.5 font-semibold">
                      Severity Rating:
                    </label>
                    <div className="flex gap-3">
                      {(['medium', 'high', 'critical'] as const).map((sev) => (
                        <label key={sev} className="flex items-center gap-2 cursor-pointer font-mono uppercase text-xs">
                          <input
                            type="radio"
                            name="severity"
                            checked={customSeverity === sev}
                            onChange={() => setCustomSeverity(sev)}
                            className="text-cyan-500"
                          />
                          <span className={sev === 'critical' ? 'text-rose-400' : 'text-slate-300'}>{sev}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Stress-Testing Option: Simulate Evasive Malware that triggers Escalation */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="simulateEscalation"
                  checked={simulateEscalation}
                  onChange={(e) => setSimulateEscalation(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="simulateEscalation" className="cursor-pointer text-xs space-y-0.5">
                  <span className="font-bold text-slate-200 block">
                    Stress-Test Verification Agent (Simulate Evasive Persistence)
                  </span>
                  <span className="text-slate-400 text-[11px] leading-relaxed block">
                    Causes the malware to evade initial socket termination. The Verification Agent's 2nd check cycle will catch the residual heartbeat and autonomously trigger an <strong className="text-rose-300">Escalated Subnet Lockdown</strong>.
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-mono">
                Engine: Scikit-learn RF + LangGraph
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLaunch}
                  className="px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-rose-950/30"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Threat Simulation</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
