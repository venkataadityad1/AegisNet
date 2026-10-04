import React, { useState } from 'react';
import { 
  NetworkNode, 
  NetworkLink, 
  AnyLog, 
  AgentWorkflowStage, 
  AgentDecisionLog, 
  IncidentRecord, 
  ThreatScenario 
} from './types/security';
import { INITIAL_NETWORK_NODES, INITIAL_NETWORK_LINKS } from './data/mockTopology';
import { INITIAL_BENIGN_LOGS } from './data/initialLogs';
import { THREAT_SCENARIOS } from './data/threatScenarios';
import { 
  runLogCorrelation, 
  generateVerificationCycles, 
  getAiIncidentNarrative 
} from './services/aiLogCorrelation';

import { TopBar } from './components/TopBar';
import { OverviewHero } from './components/OverviewHero';
import { NetworkTopologyCanvas } from './components/NetworkTopologyCanvas';
import { LangGraphAgentPipeline } from './components/LangGraphAgentPipeline';
import { LogCorrelationMatrix } from './components/LogCorrelationMatrix';
import { LiveIncidentCenter } from './components/LiveIncidentCenter';
import { AttackSimulatorModal } from './components/AttackSimulatorModal';
import { ProjectPaperModal } from './components/ProjectPaperModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'topology' | 'correlation' | 'agent-loop' | 'incidents'>('overview');

  // Network Topology State
  const [nodes, setNodes] = useState<NetworkNode[]>(INITIAL_NETWORK_NODES);
  const [links, setLinks] = useState<NetworkLink[]>(INITIAL_NETWORK_LINKS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Active Attack & Verification Highlighting
  const [activeAttackingNodeId, setActiveAttackingNodeId] = useState<string | null>(null);
  const [verifyingNodeId, setVerifyingNodeId] = useState<string | null>(null);

  // Log Stream & Correlation
  const [logs, setLogs] = useState<AnyLog[]>(INITIAL_BENIGN_LOGS);
  const [correlatedLogIds, setCorrelatedLogIds] = useState<string[]>([]);
  const [activeCorrelationTitle, setActiveCorrelationTitle] = useState<string>('');
  const [correlationConfidence, setCorrelationConfidence] = useState<number>(0);

  // Tri-Agent State Machine
  const [currentStage, setCurrentStage] = useState<AgentWorkflowStage>('idle');
  const [decisionLogs, setDecisionLogs] = useState<AgentDecisionLog[]>([
    {
      id: 'init-dec-01',
      timestamp: '10:20:00',
      agent: 'detection',
      step: 'NOMINAL_MONITORING',
      detail: 'Detection Agent listening on multi-source socket streams (Firewall, PAM, CoreDNS, auditd).',
      status: 'info',
    }
  ]);

  // Incidents Record
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);

  // Modals & Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isAttackModalOpen, setIsAttackModalOpen] = useState<boolean>(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState<boolean>(false);

  // Reset Network Function
  const handleResetNetwork = () => {
    setNodes(INITIAL_NETWORK_NODES);
    setLinks(INITIAL_NETWORK_LINKS);
    setLogs(INITIAL_BENIGN_LOGS);
    setCorrelatedLogIds([]);
    setActiveCorrelationTitle('');
    setCorrelationConfidence(0);
    setActiveAttackingNodeId(null);
    setVerifyingNodeId(null);
    setCurrentStage('idle');
    setDecisionLogs([
      {
        id: `reset-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'detection',
        step: 'SYSTEM_RESET',
        detail: 'Network topology and telemetry queues restored to nominal baseline.',
        status: 'info',
      }
    ]);
  };

  // Toggle Isolation on a Node
  const handleToggleQuarantine = (nodeId: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === nodeId) {
          const willIsolate = !n.isIsolated;
          return {
            ...n,
            isIsolated: willIsolate,
            status: willIsolate ? 'quarantined' : 'nominal',
          };
        }
        return n;
      })
    );

    setLinks((prevLinks) =>
      prevLinks.map((l) => {
        if (l.source === nodeId || l.target === nodeId) {
          return { ...l, isSevered: !l.isSevered };
        }
        return l;
      })
    );

    const targetNode = nodes.find(n => n.id === nodeId);
    const actionDesc = targetNode?.isIsolated 
      ? `Manual override: quarantine released for ${targetNode?.label}` 
      : `Manual override: quarantine enforced on ${targetNode?.label}`;

    setDecisionLogs((prev) => [
      {
        id: `manual-iso-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'response',
        step: 'MANUAL_OVERRIDE',
        detail: actionDesc,
        status: 'action_taken',
      },
      ...prev,
    ]);
  };

  // Rollback Incident Containment
  const handleRollbackIncident = (incidentId: string) => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc) return;

    handleToggleQuarantine(inc.targetNodeId);

    setIncidents((prev) =>
      prev.map((i) => i.id === incidentId ? { ...i, status: 'contained' } : i)
    );
  };

  // Master Orchestration Loop for Threat Simulation
  const executeThreatSimulation = async (scenario: ThreatScenario, simulateEscalation: boolean = false) => {
    setIsSimulating(true);
    const targetNode = nodes.find(n => n.id === scenario.targetNodeId) || nodes[4];
    const timestampStart = new Date().toLocaleTimeString();

    // Stage 1: Telemetry Ingestion (0ms)
    setCurrentStage('telemetry_ingestion');
    setActiveAttackingNodeId(scenario.targetNodeId);
    
    // Ingest scenario logs
    setLogs((prev) => [...scenario.initialLogs, ...prev]);

    setNodes((prev) =>
      prev.map((n) => n.id === scenario.targetNodeId ? { ...n, status: 'probing' } : n)
    );

    setDecisionLogs((prev) => [
      {
        id: `dec-${Date.now()}-1`,
        timestamp: timestampStart,
        agent: 'detection',
        step: 'INGESTING_LOG_STREAMS',
        detail: `New telemetry stream received from ${targetNode.label} (${targetNode.ip}). Processing 4 sink buffers...`,
        status: 'evaluating',
      },
      ...prev,
    ]);

    // Stage 2: Cross-Source Log Correlation (1200ms)
    await new Promise((res) => setTimeout(res, 1200));
    setCurrentStage('cross_log_correlation');
    
    const correlationResult = runLogCorrelation(scenario.initialLogs);
    setCorrelatedLogIds(correlationResult.correlatedLogIds);
    setActiveCorrelationTitle(scenario.name);
    setCorrelationConfidence(correlationResult.confidenceScore);

    setNodes((prev) =>
      prev.map((n) => n.id === scenario.targetNodeId ? { ...n, status: 'compromised' } : n)
    );

    setDecisionLogs((prev) => [
      {
        id: `dec-${Date.now()}-2`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'detection',
        step: 'CROSS_LOG_CORRELATION',
        detail: `Correlated ${scenario.initialLogs.length} events across Firewall, Auth, and Endpoint. Attack vector: ${correlationResult.detectedVector}.`,
        confidenceScore: correlationResult.confidenceScore,
        mitreTechnique: scenario.mitreCode,
        status: 'alert',
      },
      ...prev,
    ]);

    // Stage 3: Autonomous Response Execution (2400ms)
    await new Promise((res) => setTimeout(res, 1200));
    setCurrentStage('containment_dispatched');

    // Isolate node on network topology
    setNodes((prev) =>
      prev.map((n) =>
        n.id === scenario.targetNodeId
          ? {
              ...n,
              isIsolated: true,
              status: 'quarantined',
              lastContainmentAction: 'VLAN 99 Quarantine Applied',
            }
          : n
      )
    );

    // Sever connected links
    setLinks((prev) =>
      prev.map((l) =>
        l.source === scenario.targetNodeId || l.target === scenario.targetNodeId
          ? { ...l, isSevered: true, isCompromised: true }
          : l
      )
    );

    setDecisionLogs((prev) => [
      {
        id: `dec-${Date.now()}-3`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'response',
        step: 'AUTONOMOUS_CONTAINMENT',
        detail: `Automated zero-delay containment executed: Isolated ${targetNode.label} to VLAN 99. Terminated rogue PIDs and shunned C2 egress.`,
        status: 'action_taken',
      },
      ...prev,
    ]);

    // Stage 4: Verification Agent 3-Cycle Audit (3600ms)
    await new Promise((res) => setTimeout(res, 1200));
    setCurrentStage('verification_sampling');
    setVerifyingNodeId(scenario.targetNodeId);

    const verificationCycles = generateVerificationCycles(!simulateEscalation);

    setDecisionLogs((prev) => [
      {
        id: `dec-${Date.now()}-4`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'verification',
        step: 'CYCLE_1_TELEMETRY_SAMPLE',
        detail: `Sample 1: Packet egress dropped to ${verificationCycles[0].packetEgressDelta}. Sockets quiescent.`,
        status: 'evaluating',
      },
      ...prev,
    ]);

    await new Promise((res) => setTimeout(res, 1200));

    // Stage 5: Resolution or Escalation
    if (!simulateEscalation) {
      setCurrentStage('verification_passed');
      setVerifyingNodeId(null);
      setActiveAttackingNodeId(null);

      setNodes((prev) =>
        prev.map((n) =>
          n.id === scenario.targetNodeId ? { ...n, status: 'verified_clean' } : n
        )
      );

      const incident: IncidentRecord = {
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        title: scenario.name,
        threatCategory: scenario.mitreCode,
        severity: scenario.severity,
        mitreId: scenario.mitreCode,
        targetNodeId: scenario.targetNodeId,
        targetNodeLabel: targetNode.label,
        detectionTime: timestampStart,
        containmentTime: new Date().toLocaleTimeString(),
        verifiedTime: new Date().toLocaleTimeString(),
        autonomousLatencySeconds: 2.4,
        humanBaselineMinutes: 228,
        correlatedLogs: scenario.initialLogs,
        containmentActions: scenario.expectedContainment,
        verificationCycles,
        status: 'verified_healed',
        aiSummary: correlationResult.attackChainSummary,
        correlationConfidence: correlationResult.confidenceScore,
      };

      // Retrieve full forensic narrative (calls Gemini if env key present, else rich local engine)
      const narrative = await getAiIncidentNarrative(incident);
      incident.aiSummary = narrative;

      setIncidents((prev) => [incident, ...prev]);

      setDecisionLogs((prev) => [
        {
          id: `dec-${Date.now()}-5`,
          timestamp: new Date().toLocaleTimeString(),
          agent: 'verification',
          step: 'SELF_HEALING_CONFIRMED',
          detail: 'Cycle 3/3 passed: Verification Agent confirmed complete cessation of anomalous traffic. Network integrity nominal.',
          status: 'success',
        },
        ...prev,
      ]);
    } else {
      // Escalation pathway
      setCurrentStage('escalation_required');
      setVerifyingNodeId(null);

      const incident: IncidentRecord = {
        id: `INC-ESC-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `${scenario.name} (Escalated)`,
        threatCategory: scenario.mitreCode,
        severity: 'critical',
        mitreId: scenario.mitreCode,
        targetNodeId: scenario.targetNodeId,
        targetNodeLabel: targetNode.label,
        detectionTime: timestampStart,
        containmentTime: new Date().toLocaleTimeString(),
        autonomousLatencySeconds: 2.1,
        humanBaselineMinutes: 228,
        correlatedLogs: scenario.initialLogs,
        containmentActions: [
          ...scenario.expectedContainment,
          'Autonomous Escalation: Null-Route Subnet Gateway',
          'Dump volatile RAM for forensic analysis'
        ],
        verificationCycles,
        status: 'escalated',
        aiSummary: `Verification Agent caught persistent residual beaconing on secondary virtual interface during Cycle 2. The LangGraph loop rejected benign closure and automatically escalated containment to complete subnet null-routing.`,
        correlationConfidence: correlationResult.confidenceScore,
      };

      setIncidents((prev) => [incident, ...prev]);

      setDecisionLogs((prev) => [
        {
          id: `dec-${Date.now()}-5`,
          timestamp: new Date().toLocaleTimeString(),
          agent: 'verification',
          step: 'ESCALATION_TRIGGERED',
          detail: 'Cycle 2 failed: Residual egress detected (+12.4%). Self-checking loop triggered Escalated Subnet Lockdown.',
          status: 'alert',
        },
        ...prev,
      ]);
    }

    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar adhering to Top Bar Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulation={() => setIsAttackModalOpen(true)}
        onOpenPaper={() => setIsPaperModalOpen(true)}
        onResetNetwork={handleResetNetwork}
        isSimulating={isSimulating}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <OverviewHero
              onOpenSimulation={() => setIsAttackModalOpen(true)}
              onOpenPaper={() => setIsPaperModalOpen(true)}
              resolvedCount={incidents.filter(i => i.status === 'verified_healed').length}
              totalEventsCount={logs.length}
              isSimulating={isSimulating}
            />

            {/* Tri-Agent Pipeline Status */}
            <LangGraphAgentPipeline
              currentStage={currentStage}
              decisionLogs={decisionLogs}
              confidenceScore={correlationConfidence}
              isSimulating={isSimulating}
            />

            {/* Interactive Network Topology */}
            <NetworkTopologyCanvas
              nodes={nodes}
              links={links}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onToggleQuarantine={handleToggleQuarantine}
              activeAttackingNodeId={activeAttackingNodeId}
              verifyingNodeId={verifyingNodeId}
            />

            {/* Cross-Source Log Correlation */}
            <LogCorrelationMatrix
              logs={logs}
              correlatedLogIds={correlatedLogIds}
              activeCorrelationTitle={activeCorrelationTitle}
              correlationConfidence={correlationConfidence}
            />

            {/* Autonomous Incident Audit Trail */}
            <LiveIncidentCenter
              incidents={incidents}
              onRollbackIncident={handleRollbackIncident}
            />
          </div>
        )}

        {/* Tab 2: Full Network Topology View */}
        {activeTab === 'topology' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-100">Enterprise Network Topology & Actuators</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any node to inspect active sockets, MAC tables, and execute manual containment overrides.
                </p>
              </div>
              <button
                onClick={() => setIsAttackModalOpen(true)}
                disabled={isSimulating}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                Launch Threat On Topology
              </button>
            </div>

            <NetworkTopologyCanvas
              nodes={nodes}
              links={links}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onToggleQuarantine={handleToggleQuarantine}
              activeAttackingNodeId={activeAttackingNodeId}
              verifyingNodeId={verifyingNodeId}
            />
          </div>
        )}

        {/* Tab 3: Tri-Agent Loop State Machine */}
        {activeTab === 'agent-loop' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-100">LangGraph Detect-Act-Verify State Machine</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed inspection of the three collaborating agents and autonomous decision engine logs.
                </p>
              </div>
              <button
                onClick={() => setIsAttackModalOpen(true)}
                disabled={isSimulating}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                Trigger State Transition
              </button>
            </div>

            <LangGraphAgentPipeline
              currentStage={currentStage}
              decisionLogs={decisionLogs}
              confidenceScore={correlationConfidence}
              isSimulating={isSimulating}
            />
          </div>
        )}

        {/* Tab 4: Multi-Source Log Correlation */}
        {activeTab === 'correlation' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-100">AI-Based Multi-Source Log Correlation</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fusion of Firewall, Login/Auth, DNS queries, and Host audit events using Random Forest & Autoencoders.
                </p>
              </div>
              <button
                onClick={() => setIsAttackModalOpen(true)}
                disabled={isSimulating}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                Inject Correlated Attack Chain
              </button>
            </div>

            <LogCorrelationMatrix
              logs={logs}
              correlatedLogIds={correlatedLogIds}
              activeCorrelationTitle={activeCorrelationTitle}
              correlationConfidence={correlationConfidence}
            />
          </div>
        )}

        {/* Tab 5: Incident Audit Trail */}
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-100">Autonomous Incident & Containment Audit</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verifiable containment records, sub-second latency telemetry, and forensic dossiers.
                </p>
              </div>
              <button
                onClick={() => setIsAttackModalOpen(true)}
                disabled={isSimulating}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                Simulate Incident
              </button>
            </div>

            <LiveIncidentCenter
              incidents={incidents}
              onRollbackIncident={handleRollbackIncident}
            />
          </div>
        )}
      </main>

      {/* Clean Academic Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-300 font-semibold">Malla Reddy University</span>
            <span>·</span>
            <span>Department of Computer Science & Engineering</span>
            <span>·</span>
            <span>Academic Project by B. Sri Ravi Tej (2411CS040019) & J. Anil (2411CS040069)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaperModalOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              Paper Abstract
            </button>
            <span>·</span>
            <span>LangGraph & Scikit-learn Defense Agent</span>
          </div>
        </div>
      </footer>

      {/* Attack Simulator Test Bench Modal */}
      <AttackSimulatorModal
        isOpen={isAttackModalOpen}
        onClose={() => setIsAttackModalOpen(false)}
        onTriggerScenario={executeThreatSimulation}
        nodes={nodes}
      />

      {/* Research Paper & Abstract Modal */}
      <ProjectPaperModal
        isOpen={isPaperModalOpen}
        onClose={() => setIsPaperModalOpen(false)}
        onLaunchSimulation={() => setIsAttackModalOpen(true)}
      />
    </div>
  );
}
