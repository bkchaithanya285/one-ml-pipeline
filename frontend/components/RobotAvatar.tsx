"use client";

import React from "react";
import { motion } from "framer-motion";

interface RobotAvatarProps {
  className?: string;
  variant?: "hero" | "mascot" | "drone" | "scanner";
}

export const RobotAvatar: React.FC<RobotAvatarProps> = ({
  className = "w-64 h-64",
  variant = "mascot",
}) => {
  if (variant === "scanner") {
    return (
      <div className={`relative ${className}`}>
        {/* Futuristic Scanning Hologram */}
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />

        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_20px_rgba(0,243,255,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Scanner Ring */}
          <circle
            cx="100"
            cy="100"
            r="85"
            stroke="#00f3ff"
            strokeWidth="1.5"
            strokeDasharray="10 15"
            className="animate-[spin_12s_linear_infinite]"
          />
          <circle
            cx="100"
            cy="100"
            r="75"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="20 10"
            className="animate-[spin_8s_linear_infinite_reverse]"
          />

          {/* Robot Head Core */}
          <rect
            x="60"
            y="55"
            width="80"
            height="70"
            rx="18"
            fill="url(#robot-grad-1)"
            stroke="#00f3ff"
            strokeWidth="2"
          />

          {/* Visor Screen */}
          <rect
            x="70"
            y="70"
            width="60"
            height="28"
            rx="10"
            fill="#030712"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />

          {/* Glowing Eyes */}
          <g className="animate-pulse">
            <circle cx="85" cy="84" r="6" fill="#00f3ff" className="drop-shadow-[0_0_8px_#00f3ff]" />
            <circle cx="115" cy="84" r="6" fill="#00f3ff" className="drop-shadow-[0_0_8px_#00f3ff]" />
            <circle cx="87" cy="82" r="2" fill="#ffffff" />
            <circle cx="117" cy="82" r="2" fill="#ffffff" />
          </g>

          {/* Mouth Bar / Data Pulse */}
          <rect x="82" y="108" width="36" height="4" rx="2" fill="#00f3ff" opacity="0.8" />

          {/* Antenna */}
          <line x1="100" y1="55" x2="100" y2="35" stroke="#00f3ff" strokeWidth="2" />
          <circle cx="100" cy="30" r="5" fill="#a855f7" className="animate-ping" />
          <circle cx="100" cy="30" r="5" fill="#00f3ff" />

          {/* Gradients */}
          <defs>
            <linearGradient id="robot-grad-1" x1="60" y1="55" x2="140" y2="125" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0f172a" />
              <stop offset="0.5" stopColor="#1e1b4b" />
              <stop offset="1" stopColor="#030712" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (variant === "drone") {
    return (
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`relative ${className}`}
      >
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full drop-shadow-[0_0_18px_rgba(168,85,247,0.5)]"
          fill="none"
        >
          {/* Spherical Drone Body */}
          <circle cx="80" cy="80" r="45" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
          <circle cx="80" cy="80" r="35" fill="#030712" stroke="#00f3ff" strokeWidth="1" />

          {/* Central Eye Lens */}
          <circle
            cx="80"
            cy="80"
            r="14"
            fill="#00f3ff"
            className="drop-shadow-[0_0_12px_#00f3ff] animate-pulse"
          />
          <circle cx="76" cy="76" r="4" fill="#ffffff" />

          {/* Ring Orbits */}
          <ellipse
            cx="80"
            cy="80"
            rx="65"
            ry="25"
            stroke="#00f3ff"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            className="animate-[spin_6s_linear_infinite]"
          />
        </svg>
      </motion.div>
    );
  }

  // DEFAULT MAIN MASCOT ROBOT AVATAR
  return (
    <motion.div
      animate={{ y: [-10, 10, -10] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className={`relative ${className} flex items-center justify-center`}
    >
      {/* Ambient Cyber Light */}
      <div className="absolute w-64 h-64 bg-gradient-to-tr from-cyan-500/30 to-purple-600/30 rounded-full blur-3xl" />

      <svg
        viewBox="0 0 240 240"
        className="w-full h-full drop-shadow-[0_0_30px_rgba(0,243,255,0.4)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floating Cyber Rings */}
        <circle
          cx="120"
          cy="120"
          r="105"
          stroke="#00f3ff"
          strokeWidth="1"
          strokeDasharray="8 12"
          opacity="0.6"
          className="animate-[spin_20s_linear_infinite]"
        />

        {/* Floating Shoulders */}
        <rect x="40" y="140" width="35" height="40" rx="10" fill="#0f172a" stroke="#00f3ff" strokeWidth="1.5" />
        <rect x="165" y="140" width="35" height="40" rx="10" fill="#0f172a" stroke="#00f3ff" strokeWidth="1.5" />

        {/* Main Chest Body */}
        <path
          d="M65 145 C65 125, 175 125, 175 145 L160 210 C160 220, 80 220, 80 210 Z"
          fill="url(#body-grad)"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {/* Chest Arc Reactor Core */}
        <circle cx="120" cy="160" r="14" fill="#030712" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="120" cy="160" r="8" fill="#00f3ff" className="animate-ping" />
        <circle cx="120" cy="160" r="8" fill="#00f3ff" />

        {/* Neck */}
        <rect x="105" y="105" width="30" height="25" rx="4" fill="#1e1b4b" stroke="#00f3ff" strokeWidth="1" />

        {/* Robot Head */}
        <rect
          x="65"
          y="35"
          width="110"
          height="80"
          rx="22"
          fill="url(#head-grad)"
          stroke="#00f3ff"
          strokeWidth="2.5"
        />

        {/* Visor Area */}
        <rect
          x="78"
          y="52"
          width="84"
          height="44"
          rx="14"
          fill="#030712"
          stroke="#a855f7"
          strokeWidth="1.5"
        />

        {/* Animated Cyber Visor Eyes */}
        <motion.g
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <circle cx="98" cy="74" r="8" fill="#00f3ff" className="drop-shadow-[0_0_10px_#00f3ff]" />
          <circle cx="142" cy="74" r="8" fill="#00f3ff" className="drop-shadow-[0_0_10px_#00f3ff]" />
          <circle cx="101" cy="71" r="2.5" fill="#ffffff" />
          <circle cx="145" cy="71" r="2.5" fill="#ffffff" />
        </motion.g>

        {/* Top Antenna Light */}
        <line x1="120" y1="35" x2="120" y2="15" stroke="#a855f7" strokeWidth="2.5" />
        <circle cx="120" cy="12" r="6" fill="#a855f7" className="animate-pulse" />

        {/* Gradients */}
        <defs>
          <linearGradient id="head-grad" x1="65" y1="35" x2="175" y2="115" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0f172a" />
            <stop offset="0.6" stopColor="#1e1b4b" />
            <stop offset="1" stopColor="#030712" />
          </linearGradient>
          <linearGradient id="body-grad" x1="65" y1="130" x2="175" y2="210" gradientUnits="userSpaceOnUse">
            <stop stopColor="#030712" />
            <stop offset="0.5" stopColor="#1e1b4b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
};
