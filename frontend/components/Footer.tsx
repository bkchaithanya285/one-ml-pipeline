"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Linkedin, Instagram, Code, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-20 w-full bg-[#030712]/95 border-t border-cyan-500/20 backdrop-blur-xl py-6 px-4 sm:px-6 lg:px-8 mt-10 shadow-[0_-5px_20px_rgba(0,243,255,0.05)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* LEFT: CSI KARE Branding (Compact) */}
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/40 p-0.5 bg-slate-900 shadow-[0_0_10px_rgba(0,243,255,0.2)] flex-shrink-0">
            <Image
              src="/csi-logo.jpg"
              alt="CSI KARE Logo"
              width={40}
              height={40}
              className="object-contain rounded-lg w-full h-full"
            />
          </div>
          <div>
            <span className="font-orbitron font-extrabold text-xs sm:text-sm text-cyan-300 tracking-wider block">
              CSI KARE STUDENT CHAPTER
            </span>
            <span className="text-[10px] text-gray-400 font-mono block">
              CLAIM GROUP 3 • KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION
            </span>
          </div>
        </div>

        {/* CENTER: Made with ❤️ by Web Dev Team CSI KARE */}
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-gray-300 shadow-[inset_0_0_8px_rgba(0,243,255,0.1)]">
            <Code className="w-3 h-3 text-cyan-400" />
            <span>Made with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
            <span>by <strong className="text-cyan-300 font-semibold">Web Dev Team CSI KARE</strong></span>
          </div>
          <p className="text-[9px] text-gray-500 font-mono">
            © {new Date().getFullYear()} CSI KARE. All rights reserved.
          </p>
        </div>

        {/* RIGHT: Social Media Accounts (Instagram & LinkedIn) */}
        <div className="flex items-center space-x-2.5">
          {/* Instagram Link */}
          <a
            href="https://www.instagram.com/csi_kare/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900 border border-pink-500/30 text-pink-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:border-pink-500 shadow-[0_0_12px_rgba(225,48,108,0.2)] transition-all duration-300 hover:scale-105 group cursor-pointer"
            title="Follow CSI KARE on Instagram"
            aria-label="Instagram Account"
          >
            <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </a>

          {/* LinkedIn Link */}
          <a
            href="https://www.linkedin.com/company/csi-kare/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900 border border-blue-500/30 text-blue-400 hover:text-white hover:bg-blue-600 hover:border-blue-400 shadow-[0_0_12px_rgba(10,102,194,0.2)] transition-all duration-300 hover:scale-105 group cursor-pointer"
            title="Follow CSI KARE on LinkedIn"
            aria-label="LinkedIn Account"
          >
            <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </a>
        </div>

      </div>
    </footer>
  );
};
