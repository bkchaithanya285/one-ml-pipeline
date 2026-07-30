"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface HoloCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  accentColor?: "cyan" | "blue" | "purple" | "amber";
}

export const HoloCard: React.FC<HoloCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  accentColor = "cyan",
}) => {
  const colorMap = {
    cyan: "border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.15)] hover:shadow-[0_0_30px_rgba(0,243,255,0.35)] hover:border-cyan-400",
    blue: "border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.35)] hover:border-blue-400",
    purple: "border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:border-purple-400",
    amber: "border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:border-amber-400",
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`relative p-6 rounded-2xl bg-slate-950/70 backdrop-blur-2xl border ${colorMap[accentColor]} transition-all duration-300 group overflow-hidden`}
    >
      {/* Corner Holographic Accent Lines */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-current opacity-40 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-current opacity-40 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start space-x-4 relative z-10">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-current group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-7 h-7 animate-pulse" />
        </div>

        <div className="flex-1">
          <span className="text-xs font-orbitron font-semibold text-gray-400 tracking-wider block uppercase">
            {title}
          </span>
          <h4 className="font-orbitron font-extrabold text-xl sm:text-2xl text-gray-100 mt-1">
            {value}
          </h4>
          {subtext && (
            <p className="text-xs font-mono text-gray-400 mt-1">{subtext}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
