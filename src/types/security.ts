/**
 * Types for the Self-Healing Autonomous Network Security Agent
 * Based on research by B. Sri Ravi Tej & J. Anil (Malla Reddy University)
 */

export type LogCategory = 'firewall' | 'auth' | 'dns' | 'endpoint';

export interface BaseLog {
  id: string;
  timestamp: string;
  category: LogCategory;
  sourceIp: string;
  targetHost: string;
  rawMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isAnomaly: boolean;
  correlationId?: string;
}

export interface FirewallLog extends BaseLog {
  category: 'firewall';
  protocol: 'TCP' | 'UDP' | 'ICMP';
  destPort: number;
  action: 'ALLOW' | 'DENY' | 'DROP';
  bytesSent: number;
}

export interface AuthLog extends BaseLog {
  category: 'auth';
  username: string;
  authMethod: 'SSH' | 'Kerberos' | 'PAM' | 'SUDO' | 'RDP';
  authStatus: 'SUCCESS' | 'FAILED' | 'CHALLENGE_TIMEOUT';
  attemptCount: number;
}

export interface DnsLog extends BaseLog {
  category: 'dns';
  queryDomain: string;
  queryType: 'A' | 'AAAA' | 'TXT' | 'CNAME' | 'MX';
  responseCode: 'NOERROR' | 'NXDOMAIN' | 'SERVFAIL';
  entropyScore: number;
}

export interface EndpointLog extends BaseLog {
  category: 'endpoint';
  processName: string;
  pid: number;
  parentProcess: string;
  commandLine: string;
  integrityLevel: 'SYSTEM' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export type AnyLog = FirewallLog | AuthLog | DnsLog | EndpointLog;

export type NodeStatus = 'nominal' | 'probing' | 'compromised' | 'quarantined' | 'verified_clean';

export interface NetworkNode {
  id: string;
  label: string;
  ip: string;
  mac: string;
  subnet: 'DMZ' | 'Corp-LAN' | 'Data-Cluster' | 'Internal-Services';
  role: 'gateway' | 'firewall' | 'web' | 'database' | 'active_directory' | 'workstation' | 'iot_sensor';
  status: NodeStatus;
  x: number;
  y: number;
  os: string;
  activeSockets: number;
  activeThreatCount: number;
  lastContainmentAction?: string;
  isIsolated: boolean;
}

export interface NetworkLink {
  id: string;
  source: string;
  target: string;
  trafficLoad: number; // 0 to 100
  isCompromised: boolean;
  isSevered: boolean;
}

export type AgentRole = 'detection' | 'response' | 'verification';

export type AgentWorkflowStage = 
  | 'idle'
  | 'telemetry_ingestion'
  | 'anomaly_scoring'
  | 'cross_log_correlation'
  | 'threat_confirmed'
  | 'containment_dispatched'
  | 'network_isolation_active'
  | 'verification_sampling'
  | 'verification_passed'
  | 'escalation_required';

export interface AgentDecisionLog {
  id: string;
  timestamp: string;
  agent: AgentRole;
  step: string;
  detail: string;
  confidenceScore?: number;
  mitreTechnique?: string;
  status: 'info' | 'evaluating' | 'action_taken' | 'success' | 'alert';
}

export interface VerificationCycle {
  cycleNumber: number; // 1, 2, 3
  status: 'passed' | 'failed' | 'pending';
  packetEgressDelta: string;
  anomalyScore: number;
  beaconHeartbeatDetected: boolean;
  timestamp: string;
}

export interface IncidentRecord {
  id: string;
  title: string;
  threatCategory: string;
  severity: 'medium' | 'high' | 'critical';
  mitreId: string;
  targetNodeId: string;
  targetNodeLabel: string;
  detectionTime: string;
  containmentTime?: string;
  verifiedTime?: string;
  autonomousLatencySeconds: number;
  humanBaselineMinutes: number; // e.g. 180 min
  correlatedLogs: AnyLog[];
  containmentActions: string[];
  verificationCycles: VerificationCycle[];
  status: 'active' | 'contained' | 'verified_healed' | 'escalated';
  aiSummary: string;
  correlationConfidence: number;
}

export interface ThreatScenario {
  id: string;
  name: string;
  description: string;
  mitreCode: string;
  severity: 'medium' | 'high' | 'critical';
  targetNodeId: string;
  expectedContainment: string[];
  initialLogs: AnyLog[];
  verificationFailureRisk?: boolean;
}
