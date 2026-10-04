import { AnyLog, IncidentRecord, VerificationCycle } from '../types/security';

export interface CorrelationResult {
  confidenceScore: number;
  anomalyScore: number;
  correlatedLogIds: string[];
  attackChainSummary: string;
  detectedVector: string;
  suggestedMitigations: string[];
  aiModelName: string;
  reconstructionLoss: number;
}

/**
 * Simulates the Scikit-learn Random Forest + TensorFlow Autoencoder
 * correlation engine described in the Malla Reddy University paper.
 */
export function runLogCorrelation(logs: AnyLog[]): CorrelationResult {
  const categoriesPresent = new Set(logs.map(l => l.category));
  const hasAuth = categoriesPresent.has('auth');
  const hasFw = categoriesPresent.has('firewall');
  const hasDns = categoriesPresent.has('dns');
  const hasEndpoint = categoriesPresent.has('endpoint');

  const anomalyCount = logs.filter(l => l.isAnomaly).length;
  const multiSourceFactor = categoriesPresent.size >= 3 ? 0.35 : categoriesPresent.size >= 2 ? 0.25 : 0.1;
  const anomalyFactor = Math.min(anomalyCount / Math.max(logs.length, 1), 1.0) * 0.55;
  const rawConfidence = (multiSourceFactor + anomalyFactor + 0.1) * 100;
  const confidenceScore = Math.min(Math.round(rawConfidence * 10) / 10, 99.4);
  const reconstructionLoss = Math.round((0.082 + (anomalyCount * 0.045)) * 1000) / 1000;

  let detectedVector = 'Multi-Vector Correlated Attack Sequence';
  let attackChainSummary = 'Fragmented logs across firewall, authentication, and endpoint indicate coordinated multi-stage intruder activity.';

  if (hasDns && hasEndpoint && !hasAuth) {
    detectedVector = 'Covert DNS Tunneling & Staged Data Exfiltration';
    attackChainSummary = 'Endpoint script spawned high-entropy DNS TXT queries designed to bypass perimeter packet inspection and exfiltrate payload.';
  } else if (hasAuth && hasFw && hasEndpoint) {
    detectedVector = 'Credential Compromise with Lateral C2 Propagation';
    attackChainSummary = 'Auth log brute-force failure followed by sudden privileged shell spawn and high-volume external outbound beaconing.';
  } else if (hasEndpoint && hasFw) {
    detectedVector = 'Ransomware Pre-Execution & Internal Reconnaissance';
    attackChainSummary = 'Local volume shadow copy wipe detected alongside unauthorized lateral port scans targeting database cluster.';
  }

  const suggestedMitigations = [
    'Enforce Instant Dynamic VLAN 99 Quarantine on Target Host',
    'Inject Edge Firewall Drop Rule for Attacking C2 Address',
    'Terminate Rogue Associated PIDs and Kill Open Raw Sockets',
    'Flush DNS Resolver Cache & Invalidate Kerberos Session Tokens'
  ];

  return {
    confidenceScore,
    anomalyScore: Math.min(Math.round((0.72 + (anomalyCount * 0.06)) * 100) / 100, 0.98),
    correlatedLogIds: logs.map(l => l.id),
    attackChainSummary,
    detectedVector,
    suggestedMitigations,
    aiModelName: 'Dual-Engine Random Forest Classifier (RF-92) + TensorFlow Autoencoder (MAE-0.082)',
    reconstructionLoss,
  };
}

/**
 * Executes a simulated 3-cycle post-containment verification check
 * confirming the self-healing resolution.
 */
export function generateVerificationCycles(shouldPass: boolean = true): VerificationCycle[] {
  const now = new Date();
  
  if (shouldPass) {
    return [
      {
        cycleNumber: 1,
        status: 'passed',
        packetEgressDelta: '-98.4% (Dropped from 4.2 MB/s to 0.0 KB/s)',
        anomalyScore: 0.12,
        beaconHeartbeatDetected: false,
        timestamp: new Date(now.getTime() + 600).toLocaleTimeString(),
      },
      {
        cycleNumber: 2,
        status: 'passed',
        packetEgressDelta: '0.0 packets leaked outside isolated VLAN',
        anomalyScore: 0.04,
        beaconHeartbeatDetected: false,
        timestamp: new Date(now.getTime() + 1200).toLocaleTimeString(),
      },
      {
        cycleNumber: 3,
        status: 'passed',
        packetEgressDelta: 'Quarantine boundary intact · Zero persistence telemetry',
        anomalyScore: 0.01,
        beaconHeartbeatDetected: false,
        timestamp: new Date(now.getTime() + 1800).toLocaleTimeString(),
      },
    ];
  }

  // Verification failure simulation (triggers escalation)
  return [
    {
      cycleNumber: 1,
      status: 'passed',
      packetEgressDelta: '-82.1% (Initial socket dropped)',
      anomalyScore: 0.38,
      beaconHeartbeatDetected: false,
      timestamp: new Date(now.getTime() + 600).toLocaleTimeString(),
    },
    {
      cycleNumber: 2,
      status: 'failed',
      packetEgressDelta: '+12.4% Residual egress observed on secondary virtual NIC',
      anomalyScore: 0.79,
      beaconHeartbeatDetected: true,
      timestamp: new Date(now.getTime() + 1200).toLocaleTimeString(),
    },
    {
      cycleNumber: 3,
      status: 'failed',
      packetEgressDelta: 'Evasive secondary persistence payload detected',
      anomalyScore: 0.88,
      beaconHeartbeatDetected: true,
      timestamp: new Date(now.getTime() + 1800).toLocaleTimeString(),
    },
  ];
}

/**
 * Optional Gemini API analysis generator:
 * If user environment has GEMINI_API_KEY, we query Gemini 2.5 Flash for deep threat analysis.
 * Otherwise, returns rich deterministic cybersecurity intelligence.
 */
export async function getAiIncidentNarrative(incident: IncidentRecord): Promise<string> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);

  if (apiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the AI Detection & Response engine of AegisNet, an autonomous cybersecurity system.
Incident Details:
- Title: ${incident.title}
- MITRE ATT&CK: ${incident.mitreId}
- Target: ${incident.targetNodeLabel}
- Autonomous Time to Contain: ${incident.autonomousLatencySeconds} seconds (vs human average 3+ hours)
- Correlated Log Events: ${incident.correlatedLogs.map(l => `[${l.category.toUpperCase()}] ${l.rawMessage}`).join(' ; ')}

Provide a concise, executive-level technical threat intelligence briefing (under 120 words) explaining:
1. How the Detection Agent correlated these seemingly separate logs into a singular multi-stage kill chain.
2. Why a conventional single-log SIEM rule would have failed to catch this.
3. How the autonomous Response and Verification loop self-healed the network without human delay.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (e) {
      console.warn('Gemini API call skipped or fell back to built-in intelligence engine:', e);
    }
  }

  // High-fidelity domain-native forensic narrative:
  return `Multi-source AI log correlation identified a synchronized attack chain targeting ${incident.targetNodeLabel}. Individual logs viewed in isolation appeared as ordinary noise (transient failed auth attempts, routine DNS lookups, and generic TCP sessions). The AegisNet Random Forest & Autoencoder engines detected temporal convergence across 3 disparate log sinks within a 12-second window. Autonomous containment rules (VLAN isolation, socket shunning, and token invalidation) were enacted within ${incident.autonomousLatencySeconds} seconds. The Verification Agent's 3-cycle post-action audit confirmed complete cessation of anomalous traffic, successfully self-healing the host before lateral spread could compromise adjacent infrastructure.`;
}
