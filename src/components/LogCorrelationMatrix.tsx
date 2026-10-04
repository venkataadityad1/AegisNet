import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnyLog, LogCategory } from '../types/security';
import { 
  Flame, 
  KeyRound, 
  Globe2, 
  TerminalSquare, 
  Search, 
  Link2, 
  AlertCircle, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';

interface LogCorrelationMatrixProps {
  logs: AnyLog[];
  correlatedLogIds: string[];
  activeCorrelationTitle?: string;
  correlationConfidence?: number;
}

export const LogCorrelationMatrix: React.FC<LogCorrelationMatrixProps> = ({
  logs,
  correlatedLogIds,
  activeCorrelationTitle,
  correlationConfidence,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showIsolationComparison, setShowIsolationComparison] = useState<boolean>(true);

  const getCategoryIcon = (category: LogCategory) => {
    switch (category) {
      case 'firewall': return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'auth': return <KeyRound className="w-3.5 h-3.5 text-blue-400" />;
      case 'dns': return <Globe2 className="w-3.5 h-3.5 text-teal-400" />;
      case 'endpoint': return <TerminalSquare className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedCategory === 'correlated_only') {
      if (!correlatedLogIds.includes(log.id)) return false;
    } else if (selectedCategory !== 'all') {
      if (log.category !== selectedCategory) return false;
    }

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.rawMessage.toLowerCase().includes(q) ||
      log.sourceIp.toLowerCase().includes(q) ||
      log.targetHost.toLowerCase().includes(q) ||
      log.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Cross-Source AI Log Correlation Engine
            </h2>
          </div>
          {/* Zero-Pill metadata with dot separators */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Sinks: Firewall / Auth / DNS / Endpoint</span>
            <span aria-hidden="true">·</span>
            <span>Correlation Window: 18.4s Temporal Delta</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Total Events: {logs.length}</span>
          </div>
        </div>

        {/* Filter Controls (interactive segmented buttons) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs, IPs, commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-56"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            {[
              { id: 'all', label: 'All Sinks' },
              { id: 'correlated_only', label: 'Correlated Chain' },
              { id: 'firewall', label: 'Firewall' },
              { id: 'auth', label: 'Auth' },
              { id: 'dns', label: 'DNS' },
              { id: 'endpoint', label: 'Endpoint' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-slate-800 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Correlated Chain Active Banner */}
      {correlatedLogIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Link2 className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100">{activeCorrelationTitle || 'Active Attack Chain Correlated'}</span>
                <span className="text-[11px] font-mono text-cyan-400 font-bold tabular-nums">
                  {correlationConfidence ? `${correlationConfidence}% Confidence` : '96.2% Confidence'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Stitched {correlatedLogIds.length} fragmented events across {
                  new Set(logs.filter(l => correlatedLogIds.includes(l.id)).map(l => l.category)).size
                } independent log sources into a single coordinated attack sequence.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowIsolationComparison(!showIsolationComparison)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-colors whitespace-nowrap"
          >
            {showIsolationComparison ? 'Hide Single-Log Contrast' : 'Show Single-Log Contrast'}
          </button>
        </motion.div>
      )}

      {/* Single-Log vs Multi-Log AI Contrast Panel (Directly demonstrates abstract's thesis) */}
      <AnimatePresence>
        {showIsolationComparison && correlatedLogIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs overflow-hidden"
          >
            <div className="space-y-2 border-r-0 md:border-r border-slate-800 md:pr-4">
              <div className="flex items-center gap-2 text-rose-400 font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>Single-Log SIEM Perspective (Traditional)</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                A failed password attempt is logged as routine user typo. A DNS query to a new domain is classified as normal browser lookup. Outbound HTTPS traffic on port 443 looks standard. In isolation, <strong className="text-rose-300">zero alert thresholds are triggered</strong>. The attack persists unmitigated for hours.
              </p>
            </div>

            <div className="space-y-2 md:pl-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>AegisNet AI Correlation Engine (Malla Reddy Research)</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                By training a Random Forest & Autoencoder on temporal graph correlation, the Detection Agent connects the failed login with the sudden privileged process execution and DNS beaconing within seconds. The threat is immediately flagged as <strong className="text-emerald-300">Multi-Stage Compromise</strong> and routed to the Response Agent.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Feed Table */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Source</th>
                <th className="py-2.5 px-3 font-semibold">Host / IP</th>
                <th className="py-2.5 px-3 font-semibold">Telemetry Payload & Parameters</th>
                <th className="py-2.5 px-3 font-semibold text-right">Chain Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic font-sans text-xs">
                    No log records match current query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isCorrelated = correlatedLogIds.includes(log.id);

                  return (
                    <tr
                      key={log.id}
                      className={`transition-colors ${
                        isCorrelated
                          ? 'bg-cyan-950/20 hover:bg-cyan-950/30'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-400 tabular-nums whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 capitalize text-slate-300">
                          {getCategoryIcon(log.category)}
                          <span>{log.category}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                        {log.sourceIp}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-xl truncate" title={log.rawMessage}>
                        <span className={log.isAnomaly ? 'text-amber-200' : 'text-slate-300'}>
                          {log.rawMessage}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {isCorrelated ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                            <Link2 className="w-3 h-3" />
                            <span>Linked Attack Chain</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">Independent</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
