import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  NetworkNode, 
  NetworkLink 
} from '../types/security';
import { 
  Server, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Laptop, 
  Database, 
  Radio, 
  Globe, 
  Lock, 
  Unlock, 
  Cpu, 
  Info, 
  AlertTriangle,
  Activity
} from 'lucide-react';

interface NetworkTopologyCanvasProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onToggleQuarantine: (nodeId: string) => void;
  activeAttackingNodeId: string | null;
  verifyingNodeId: string | null;
}

export const NetworkTopologyCanvas: React.FC<NetworkTopologyCanvasProps> = ({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  onToggleQuarantine,
  activeAttackingNodeId,
  verifyingNodeId,
}) => {
  const [activeFilterSubnet, setActiveFilterSubnet] = useState<string>('all');
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const getNodeIcon = (role: NetworkNode['role'], status: NetworkNode['status']) => {
    const iconClass = "w-5 h-5";
    if (status === 'compromised') return <ShieldAlert className={`${iconClass} text-rose-400`} />;
    if (status === 'quarantined') return <Lock className={`${iconClass} text-amber-400`} />;
    if (status === 'verified_clean') return <ShieldCheck className={`${iconClass} text-emerald-400`} />;

    switch (role) {
      case 'gateway': return <Globe className={`${iconClass} text-cyan-400`} />;
      case 'firewall': return <Shield className={`${iconClass} text-indigo-400`} />;
      case 'web': return <Server className={`${iconClass} text-blue-400`} />;
      case 'database': return <Database className={`${iconClass} text-emerald-400`} />;
      case 'active_directory': return <Cpu className={`${iconClass} text-purple-400`} />;
      case 'workstation': return <Laptop className={`${iconClass} text-slate-300`} />;
      case 'iot_sensor': return <Radio className={`${iconClass} text-teal-400`} />;
      default: return <Server className={`${iconClass} text-slate-400`} />;
    }
  };

  const getSubnetBadgeColor = (subnet: NetworkNode['subnet']) => {
    switch (subnet) {
      case 'DMZ': return 'border-blue-500/40 text-blue-400';
      case 'Corp-LAN': return 'border-cyan-500/40 text-cyan-400';
      case 'Data-Cluster': return 'border-emerald-500/40 text-emerald-400';
      case 'Internal-Services': return 'border-purple-500/40 text-purple-400';
    }
  };

  return (
    <div className="relative w-full rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
      {/* Topology Toolbar */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">Interactive Simulated Topology</span>
          </div>
          <span className="text-slate-600 text-xs">|</span>
          <span className="text-xs text-slate-400">
            {nodes.filter(n => n.status === 'nominal').length} Nominal ·{' '}
            <span className="text-rose-400">{nodes.filter(n => n.status === 'compromised').length} Infiltrated</span> ·{' '}
            <span className="text-amber-400">{nodes.filter(n => n.isIsolated).length} Quarantined</span>
          </span>
        </div>

        {/* Subnet Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
          {['all', 'DMZ', 'Corp-LAN', 'Data-Cluster'].map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveFilterSubnet(sub)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeFilterSubnet === sub
                  ? 'bg-slate-800 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sub === 'all' ? 'All Subnets' : sub}
            </button>
          ))}
        </div>
      </div>

      {/* Main SVG Visualization Container */}
      <div className="relative w-full h-[580px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden">
        {/* Subnet Boundary Zones in background */}
        <div className="absolute top-4 left-6 text-slate-600 text-[11px] font-mono pointer-events-none uppercase tracking-wider">
          DMZ Perimeter (VLAN 10)
        </div>
        <div className="absolute top-64 left-6 text-slate-600 text-[11px] font-mono pointer-events-none uppercase tracking-wider">
          Internal Corporate LAN (VLAN 20)
        </div>
        <div className="absolute bottom-4 right-6 text-slate-600 text-[11px] font-mono pointer-events-none uppercase tracking-wider">
          Secure Database Vault (VLAN 50)
        </div>

        <svg 
          viewBox="0 0 900 600" 
          className="w-full h-full select-none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="linkGradNormal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="linkGradCompromised" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.4" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Links between Nodes */}
          {links.map((link) => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            if (!sourceNode || !targetNode) return null;

            const isSevered = link.isSevered || sourceNode.isIsolated || targetNode.isIsolated;
            const isThreatLink = link.isCompromised || sourceNode.status === 'compromised' || targetNode.status === 'compromised';

            // Subnet filter visibility
            const isDimmed = activeFilterSubnet !== 'all' && 
                             sourceNode.subnet !== activeFilterSubnet && 
                             targetNode.subnet !== activeFilterSubnet;

            return (
              <g key={link.id} className={isDimmed ? 'opacity-20 transition-opacity' : 'transition-opacity'}>
                {/* Main Link Line */}
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={isSevered ? '#475569' : isThreatLink ? '#f43f5e' : '#334155'}
                  strokeWidth={isThreatLink ? 2.5 : isSevered ? 1.5 : 1.8}
                  strokeDasharray={isSevered ? '4 4' : 'none'}
                  strokeOpacity={isSevered ? 0.4 : 0.8}
                />

                {/* Animated Packet Pulses if not severed */}
                {!isSevered && (
                  <circle r={isThreatLink ? 3.5 : 2.5} fill={isThreatLink ? '#fb7185' : '#38bdf8'}>
                    <animateMotion
                      path={`M${sourceNode.x},${sourceNode.y} L${targetNode.x},${targetNode.y}`}
                      dur={isThreatLink ? '1.2s' : '3.5s'}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Severed Indicator Icon */}
                {isSevered && (
                  <g transform={`translate(${(sourceNode.x + targetNode.x)/2 - 8}, ${(sourceNode.y + targetNode.y)/2 - 8})`}>
                    <rect width="16" height="16" rx="3" fill="#1e293b" stroke="#f43f5e" strokeWidth="1" />
                    <line x1="4" y1="4" x2="12" y2="12" stroke="#f43f5e" strokeWidth="1.5" />
                  </g>
                )}
              </g>
            );
          })}

          {/* Node Render Group */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isAttacking = activeAttackingNodeId === node.id || node.status === 'compromised';
            const isVerifying = verifyingNodeId === node.id;
            const isQuarantined = node.isIsolated;
            const isDimmed = activeFilterSubnet !== 'all' && node.subnet !== activeFilterSubnet;

            return (
              <g 
                key={node.id} 
                className={`cursor-pointer transition-opacity ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                onClick={() => onSelectNode(isSelected ? null : node.id)}
              >
                {/* Quarantine Laser Barrier Shield */}
                {isQuarantined && (
                  <g>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="42"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      className="animate-spin"
                      style={{ animationDuration: '8s', transformOrigin: `${node.x}px ${node.y}px` }}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="48"
                      fill="rgba(245, 158, 11, 0.08)"
                      stroke="#f59e0b"
                      strokeWidth="1"
                      strokeOpacity="0.6"
                    />
                  </g>
                )}

                {/* Threat Ripple Pulse */}
                {isAttacking && !isQuarantined && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="34"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="r"
                      values="26;50;26"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0;0.8"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Verification Sonar Radar Sweep */}
                {isVerifying && (
                  <g>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="40"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                    />
                    <line
                      x1={node.x}
                      y1={node.y}
                      x2={node.x + 38}
                      y2={node.y}
                      stroke="#06b6d4"
                      strokeWidth="2"
                      className="animate-spin"
                      style={{ animationDuration: '1.4s', transformOrigin: `${node.x}px ${node.y}px` }}
                    />
                  </g>
                )}

                {/* Node Outer Selection Ring */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="30"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Main Node Disc */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="24"
                  fill={
                    isAttacking && !isQuarantined
                      ? '#4c0519'
                      : isQuarantined
                      ? '#312e81'
                      : isSelected
                      ? '#1e293b'
                      : '#0f172a'
                  }
                  stroke={
                    isAttacking && !isQuarantined
                      ? '#f43f5e'
                      : isQuarantined
                      ? '#fbbf24'
                      : node.status === 'verified_clean'
                      ? '#10b981'
                      : isSelected
                      ? '#38bdf8'
                      : '#334155'
                  }
                  strokeWidth={isAttacking || isQuarantined || isSelected ? 2.5 : 1.5}
                  filter={isAttacking ? 'url(#glow)' : undefined}
                />

                {/* Embedded HTML Icon */}
                <foreignObject
                  x={node.x - 12}
                  y={node.y - 12}
                  width="24"
                  height="24"
                  className="pointer-events-none"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {getNodeIcon(node.role, node.status)}
                  </div>
                </foreignObject>

                {/* Node Label & IP */}
                <text
                  x={node.x}
                  y={node.y + 36}
                  textAnchor="middle"
                  className="fill-slate-200 text-[11px] font-medium"
                >
                  {node.label}
                </text>
                <text
                  x={node.x}
                  y={node.y + 49}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[10px]"
                >
                  {node.ip}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-400 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span>Nominal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Infiltrated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Quarantined</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Verified Clean</span>
          </div>
        </div>
      </div>

      {/* Node Inspector Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-5 border-t border-slate-800 bg-slate-900/95"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-slate-100">{selectedNode.label}</h3>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getSubnetBadgeColor(selectedNode.subnet)}`}>
                    {selectedNode.subnet}
                  </span>
                  <span className={`text-[11px] font-mono ${
                    selectedNode.isIsolated ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {selectedNode.isIsolated ? 'VLAN 99 Isolated' : 'Routed Active'}
                  </span>
                </div>
                
                {/* Zero-Pill metadata with dot separators */}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>IP: {selectedNode.ip}</span>
                  <span aria-hidden="true">·</span>
                  <span>MAC: {selectedNode.mac}</span>
                  <span aria-hidden="true">·</span>
                  <span>OS: {selectedNode.os}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">Sockets: {selectedNode.activeSockets}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => onToggleQuarantine(selectedNode.id)}
                  className={`flex-1 md:flex-initial px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    selectedNode.isIsolated
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  }`}
                >
                  {selectedNode.isIsolated ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Release Quarantine</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Execute Emergency Quarantine</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => onSelectNode(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Simulated Live Socket & IPTables Inspector */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <div>
                <span className="text-slate-500 block mb-1">Active Sockets & Listeners:</span>
                <p className="text-slate-300">
                  {selectedNode.role === 'web' && 'tcp 0 0.0.0.0:80 (LISTEN) · tcp 0 0.0.0.0:443 (LISTEN)'}
                  {selectedNode.role === 'database' && 'tcp 0 0.0.0.0:5432 (LISTEN) · pgsql master stream [OK]'}
                  {selectedNode.role === 'firewall' && 'pfSense pfctl nat/rdr: 1204 active states · Drop rate: 0.02%'}
                  {selectedNode.role === 'active_directory' && 'tcp 0 0.0.0.0:88 (Kerberos) · tcp 0 0.0.0.0:389 (LDAP)'}
                  {selectedNode.role === 'workstation' && (
                    selectedNode.isIsolated 
                      ? 'ALL SOCKETS SEVERED · INTERFACE eth0 DOWN · VLAN 99 QUARANTINE' 
                      : 'tcp 0 10.0.3.88:51280 (ESTABLISHED) · PID 4912'
                  )}
                  {selectedNode.role === 'gateway' && 'BGP Autonomous System AS65001 · 2 upstream transit links nominal'}
                  {selectedNode.role === 'iot_sensor' && 'udp 0 0.0.0.0:1883 (MQTT telemetry) · Rate: 1.2 msg/sec'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Dynamic Autonomous Security Rule:</span>
                <p className={selectedNode.isIsolated ? 'text-amber-400' : 'text-slate-400'}>
                  {selectedNode.isIsolated
                    ? 'iptables -I FORWARD -m mac --mac-source ' + selectedNode.mac + ' -j DROP'
                    : 'PASS IN/OUT on subnet interface (Stateful Inspection Enabled)'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
