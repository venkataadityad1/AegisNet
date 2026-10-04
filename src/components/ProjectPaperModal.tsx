import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, GraduationCap, ShieldCheck, Cpu, GitFork, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProjectPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchSimulation: () => void;
}

export const ProjectPaperModal: React.FC<ProjectPaperModalProps> = ({
  isOpen,
  onClose,
  onLaunchSimulation,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-100">
                    Malla Reddy University Academic Research
                  </h2>
                  <p className="text-xs text-slate-400">
                    Department of Computer Science & Engineering
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

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
              {/* Paper Title */}
              <div className="border-b border-slate-800 pb-5">
                <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1">
                  Project Title
                </div>
                <h1 className="text-xl font-bold text-slate-100">
                  A Self-Healing Autonomous Network Security Agent with AI-Based Log Correlation
                </h1>
                
                {/* Authors */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-200">1. B. Sri Ravi Tej</span>
                    <span>·</span>
                    <span className="font-mono text-cyan-400">2411CS040019</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-200">2. J. Anil</span>
                    <span>·</span>
                    <span className="font-mono text-cyan-400">2411CS040069</span>
                  </div>
                </div>
              </div>

              {/* Research Abstract */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                  Original Abstract
                </h3>
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-lg text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                  <p>
                    Most cybersecurity systems today only detect an attack and then wait for a human to respond, which means a network can stay exposed for minutes or even hours while someone reads the alert and decides what to do. Attacks are also often missed because a single suspicious log entry rarely tells the whole story on its own.
                  </p>
                  <p>
                    To solve this problem, we built a self-healing security agent that not only detects an attack but automatically takes action to contain it and then checks whether the fix actually worked, without waiting for a human to step in. The system also links related events from different logs together, instead of looking at each one alone, so it can catch attacks that unfold in several steps. This means threats like a compromised device or a spreading attack can be stopped within seconds of being detected, greatly reducing the damage an attacker can cause before anyone even notices.
                  </p>
                  <p>
                    The system works using a repeating detect-act-verify loop made of three agents working together:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">Detection Agent:</strong> Constantly watches network traffic and log data using a trained AI model (Random Forest / Autoencoder) and cross-correlates firewall, login, DNS, and device logs.</li>
                    <li><strong className="text-slate-200">Response Agent:</strong> Once a threat is confirmed, automatically takes containment action, such as isolating the affected device from the rest of the network, without waiting for human approval.</li>
                    <li><strong className="text-slate-200">Verification Agent:</strong> Checks whether the action actually solved the problem, confirming suspicious activity has stopped, and if not, triggers a stronger response.</li>
                  </ul>
                  <p>
                    LangGraph manages the detect-act-verify loop between the three agents, and a network control library allows the Response agent to isolate or block a device on a simulated network.
                  </p>
                </div>
              </div>

              {/* Architectural Breakthroughs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 text-cyan-400 font-medium text-xs mb-1">
                    <Cpu className="w-4 h-4" />
                    <span>Multi-Log Correlation</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Combines Firewall, Auth, DNS, and Endpoint logs to catch multi-stage attacks that single SIEM rules miss.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sub-Second Containment</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Replaces manual human response latency (avg. 3.8 hours) with immediate autonomous VLAN isolation (&lt;2s).
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 text-violet-400 font-medium text-xs mb-1">
                    <GitFork className="w-4 h-4" />
                    <span>Self-Checking Verification</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    3-cycle verification verifies the containment worked, automatically escalating if evasive persistence remains.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Guide / Reviewer: <span className="text-slate-300">AD-Coordinator</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onLaunchSimulation();
                  }}
                  className="px-4 py-2 text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Launch Live Simulation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
