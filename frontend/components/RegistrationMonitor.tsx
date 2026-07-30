"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, ShieldAlert, CheckCircle2 } from "lucide-react";

interface RegistrationMonitorProps {
  spotsLeft: number;
  totalSpots: number;
  approvedCount?: number;
  pendingCount?: number;
  isClosed?: boolean;
}

export const RegistrationMonitor: React.FC<RegistrationMonitorProps> = ({
  spotsLeft,
  totalSpots = 150,
  approvedCount = 0,
  pendingCount = 0,
  isClosed = false,
}) => {
  const remaining = Math.max(0, spotsLeft);
  const isFull = remaining === 0 || isClosed;

  let colorTheme = {
    textClass: "text-cyan-400 text-neon-glow",
    bgClass: "bg-cyan-500",
    borderClass: "border-cyan-500/40",
    shadowClass: "shadow-[0_0_30px_rgba(0,243,255,0.3)]",
    pulse: false,
    label: "AVAILABLE",
  };

  if (isFull) {
    colorTheme = {
      textClass: "text-red-500 text-neon-glow",
      bgClass: "bg-red-600",
      borderClass: "border-red-600",
      shadowClass: "shadow-[0_0_35px_rgba(239,68,68,0.5)]",
      pulse: false,
      label: "CLOSED",
    };
  } else if (remaining < 5) {
    colorTheme = {
      textClass: "text-red-500 animate-pulse text-neon-glow",
      bgClass: "bg-red-500 animate-pulse",
      borderClass: "border-red-500 animate-red-pulse",
      shadowClass: "shadow-[0_0_40px_rgba(239,68,68,0.8)]",
      pulse: true,
      label: "CRITICAL",
    };
  } else if (remaining < 20) {
    colorTheme = {
      textClass: "text-red-400 text-neon-glow",
      bgClass: "bg-red-500",
      borderClass: "border-red-500/50",
      shadowClass: "shadow-[0_0_30px_rgba(239,68,68,0.4)]",
      pulse: false,
      label: "LIMITED",
    };
  } else if (remaining <= 50) {
    colorTheme = {
      textClass: "text-amber-400",
      bgClass: "bg-amber-500",
      borderClass: "border-amber-500/50",
      shadowClass: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
      pulse: false,
      label: "FILLING FAST",
    };
  } else {
    colorTheme = {
      textClass: "text-blue-400 text-blue-glow",
      bgClass: "bg-blue-500",
      borderClass: "border-blue-500/40",
      shadowClass: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
      pulse: false,
      label: "OPEN",
    };
  }

  const filledRatio = Math.min(100, Math.max(0, ((totalSpots - remaining) / totalSpots) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative w-full max-w-xl mx-auto rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-slate-950/80 border ${colorTheme.borderClass} ${colorTheme.shadowClass} overflow-hidden`}
    >
      {/* Holographic Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400">
            <Bot className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-gray-100 tracking-wider">
              🤖 AI REGISTRATION MONITOR
            </h3>
          </div>
        </div>

        <span
          className={`text-[10px] font-orbitron font-bold px-3 py-1 rounded-full border border-current ${colorTheme.textClass}`}
        >
          {colorTheme.label}
        </span>
      </div>

      {/* Main Counter Display */}
      <div className="my-6 text-center">
        {isFull ? (
          <div className="space-y-2">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-flex items-center space-x-2 text-red-500 font-orbitron font-extrabold text-2xl sm:text-3xl tracking-widest text-neon-glow"
            >
              <ShieldAlert className="w-8 h-8" />
              <span>REGISTRATIONS CLOSED</span>
            </motion.div>
            <p className="text-xs text-gray-400 font-mono">
              Maximum capacity of {totalSpots} participants reached.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className={`font-orbitron font-extrabold text-4xl sm:text-6xl tracking-tight ${colorTheme.textClass}`}>
              {remaining} <span className="text-xl sm:text-2xl text-gray-400 font-normal">/ {totalSpots}</span>
            </div>
            <div className="text-xs sm:text-sm font-orbitron font-semibold text-gray-300 tracking-widest uppercase mt-1">
              SPOTS LEFT
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 p-0.5 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${filledRatio}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${colorTheme.bgClass} relative`}
          >
            <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
          <span>{approvedCount + pendingCount} APPLICANTS</span>
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
            <span>MAX CAP: {totalSpots}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};
