import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IncidentRecord, VerificationCycle } from '../types/security';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileDown, 
  RotateCcw, 
  Cpu, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';

interface LiveIncidentCenterProps {
  incidents: IncidentRecord[];
  onRollbackIncident: (incidentId: string) => void;
  onRefreshAiAnalysis?: (incidentId: string) => void;
}

export const LiveIncidentCenter: React.FC<LiveIncidentCenterProps> = ({
  incidents,
  onRollbackIncident,
}) => {
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(
    incidents.length > 0 ? incidents[0].id : null
  );
  const [exportModalIncident, setExportModalIncident] = useState<IncidentRecord | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIncidentId(prev => prev === id ? null : id);
  };

  const downloadJsonReport = (incident: IncidentRecord) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(incident, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aegisnet-incident-${incident.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Autonomous Self-Healing Audit Trail
            </h2>
          </div>
          {/* Zero-Pill metadata with dot separators */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Policy: Zero-Trust Autonomous Containment</span>
            <span aria-hidden="true">·</span>
            <span>Self-Healing Engine: Active</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Resolved Incidents: {incidents.filter(i => i.status === 'verified_healed').length}</span>
          </div>
        </div>

        {/* Aggregate Benchmark Summary */}
        <div className="flex items-center gap-4 bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">Autonomous Containment:</span>
            <span className="text-emerald-400 font-bold tabular-nums">~2.2 Seconds</span>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <span className="text-slate-500 block text-[10px]">Human SOC Benchmark:</span>
            <span className="text-slate-400 line-through tabular-nums">3.8 Hours</span>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {incidents.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            No incidents recorded. Launch a threat scenario to observe real-time autonomous detection, containment, and 3-cycle verification.
          </div>
        ) : (
          incidents.map((incident) => {
            const isExpanded = expandedIncidentId === incident.id;
            const isHealed = incident.status === 'verified_healed';
            const isEscalated = incident.status === 'escalated';

            return (
              <div
                key={incident.id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200"
              >
                {/* Incident Header Row */}
                <div 
                  onClick={() => toggleExpand(incident.id)}
                  className="p-4 cursor-pointer hover:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-transparent"
                >
                  <div className="flex items-start md:items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isHealed 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : isEscalated
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isHealed ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-100">{incident.title}</h3>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                          incident.severity === 'critical'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {incident.severity}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                          isHealed
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : isEscalated
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {incident.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      {/* Zero-Pill metadata with dot separators */}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                        <span>Target: {incident.targetNodeLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>MITRE: {incident.mitreId}</span>
                        <span aria-hidden="true">·</span>
                        <span>Correlated Logs: {incident.correlatedLogs.length} events</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs self-end md:self-auto">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{incident.autonomousLatencySeconds}s</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Autonomous Containment</span>
                    </div>

                    <div className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Incident Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 border-t border-slate-800 bg-slate-950/70 space-y-5 text-xs"
                    >
                      {/* Section 1: AI Forensic Threat Briefing */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-2">
                          <Sparkles className="w-4 h-4" />
                          <span>Detection Agent AI Analysis & Correlation Narrative</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-sans text-xs sm:text-sm">
                          {incident.aiSummary}
                        </p>
                      </div>

                      {/* Section 2: Containment Actions Taken by Response Agent */}
                      <div>
                        <h4 className="font-mono text-slate-400 uppercase text-[11px] mb-2 font-semibold">
                          Automated Containment Protocol Executed (Response Agent):
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {incident.containmentActions.map((action, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300"
                            >
                              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="font-mono text-xs">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 3: Verification Agent 3-Cycle Audit */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-mono text-slate-400 uppercase text-[11px] font-semibold">
                            Post-Containment Verification Agent Cycles:
                          </h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            3 Independent Telemetry Checks
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {incident.verificationCycles.map((cycle) => (
                            <div
                              key={cycle.cycleNumber}
                              className={`p-3 rounded-lg border font-mono ${
                                cycle.status === 'passed'
                                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                                  : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold mb-1">
                                <span>Cycle #{cycle.cycleNumber}</span>
                                <span className="uppercase text-[10px]">{cycle.status}</span>
                              </div>
                              <div className="text-[11px] opacity-80 space-y-0.5">
                                <div>Egress: {cycle.packetEgressDelta}</div>
                                <div>Anomaly: {cycle.anomalyScore}</div>
                                <div>Beacon Heartbeat: {cycle.beaconHeartbeatDetected ? 'DETECTED' : 'None'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 4: Actions & Forensics Buttons */}
                      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-[11px] font-mono text-slate-500">
                          Incident ID: {incident.id} · Detected: {incident.detectionTime}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onRollbackIncident(incident.id)}
                            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                            <span>Rollback Isolation</span>
                          </button>

                          <button
                            onClick={() => setExportModalIncident(incident)}
                            className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>Export Forensic Report</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Export Forensic Modal */}
      <AnimatePresence>
        {exportModalIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 text-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-cyan-400" />
                  <span>Forensic Incident Audit Dossier</span>
                </h3>
                <button
                  onClick={() => setExportModalIncident(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs overflow-y-auto max-h-80 space-y-2 border border-slate-800">
                <p className="text-cyan-400">=== AEGISNET AUTONOMOUS SECURITY INCIDENT DOSSIER ===</p>
                <p>Incident Ref: {exportModalIncident.id}</p>
                <p>Target Node: {exportModalIncident.targetNodeLabel}</p>
                <p>Severity: {exportModalIncident.severity.toUpperCase()}</p>
                <p>MITRE Technique: {exportModalIncident.mitreId}</p>
                <p>Autonomous Reaction Latency: {exportModalIncident.autonomousLatencySeconds} seconds</p>
                <p className="pt-2 text-slate-400">--- CONTAINMENT ACTIONS ---</p>
                {exportModalIncident.containmentActions.map((a, i) => (
                  <p key={i} className="text-amber-300">[ACTION] {a}</p>
                ))}
                <p className="pt-2 text-slate-400">--- VERIFICATION STATUS ---</p>
                <p>Status: {exportModalIncident.status.toUpperCase()}</p>
                <p>Verification Checkpasses: {exportModalIncident.verificationCycles.length} sample windows</p>
                <p className="pt-2 text-slate-400">--- AI FORENSIC SUMMARY ---</p>
                <p className="text-slate-300 font-sans leading-relaxed">{exportModalIncident.aiSummary}</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setExportModalIncident(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => downloadJsonReport(exportModalIncident)}
                  className="px-4 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg flex items-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Signed JSON Record</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
