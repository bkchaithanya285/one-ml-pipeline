"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full rounded-3xl bg-slate-950/90 border border-cyan-500/30 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] space-y-6"
      >
        <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <Bot className="w-12 h-12 animate-bounce" />
        </div>

        <h1 className="font-orbitron font-extrabold text-5xl text-cyan-300 text-neon-glow">
          404
        </h1>

        <div className="space-y-1">
          <h2 className="font-orbitron font-bold text-sm text-gray-200 tracking-wider">
            QUANTUM VECTOR OUT OF BOUNDS
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            The requested neural endpoint does not exist in this pipeline.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(0,243,255,0.5)] hover:scale-105 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>RETURN TO MAIN PORTAL</span>
        </Link>
      </motion.div>
    </div>
  );
}
