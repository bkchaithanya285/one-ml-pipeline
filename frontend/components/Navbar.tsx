"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Menu, X, LogOut } from "lucide-react";
import { signOutStudent, subscribeAuthState } from "@/lib/firebase/auth";

interface NavbarProps {
  onRegisterClick: () => void;
  isLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRegisterClick, isLoggedIn: propIsLoggedIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authStateLoggedIn, setAuthStateLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const localEmail = typeof window !== "undefined" ? localStorage.getItem("csi_kare_student_email") : null;
      setAuthStateLoggedIn(!!localEmail);
    };

    checkSession();

    const unsub = subscribeAuthState((user) => {
      if (user) {
        setAuthStateLoggedIn(true);
      } else {
        checkSession();
      }
    });

    return () => unsub();
  }, []);

  const loggedIn = propIsLoggedIn !== undefined ? propIsLoggedIn : authStateLoggedIn;

  const handleLogout = async () => {
    await signOutStudent();
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#030712]/90 border-b border-cyan-500/30 shadow-[0_4px_30px_rgba(0,243,255,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        {/* LEFT: CSI KARE Logo & Chapter Branding */}
        <Link href="/" className="flex items-center space-x-3.5 group">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-cyan-500/50 p-1 bg-slate-900 shadow-[0_0_25px_rgba(0,243,255,0.3)] group-hover:border-cyan-400 group-hover:shadow-[0_0_35px_#00f3ff] group-hover:scale-105 transition-all duration-300">
            <Image
              src="/csi-logo.jpg"
              alt="CSI KARE Logo"
              width={64}
              height={64}
              className="object-contain rounded-xl w-full h-full"
            />
          </div>
          <div>
            <span className="font-orbitron font-black text-base sm:text-lg lg:text-xl text-cyan-300 tracking-wider block group-hover:text-white transition-colors drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
              CSI KARE
            </span>
            <span className="text-xs sm:text-sm text-gray-300 font-mono font-bold tracking-wider block">
              STUDENT CHAPTER
            </span>
          </div>
        </Link>

        {/* CENTER: Event Title */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-900/60 border border-cyan-500/30 px-5 py-2 rounded-full backdrop-blur-md shadow-[inset_0_0_12px_rgba(0,243,255,0.15)]">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-orbitron font-extrabold text-xs lg:text-sm bg-gradient-to-r from-cyan-300 via-white to-blue-400 bg-clip-text text-transparent tracking-wider">
            ONE COMPLETE MACHINE LEARNING PIPELINE
          </span>
        </div>

        {/* RIGHT: Glowing Register & Conditional Logout Buttons */}
        <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={onRegisterClick}
            className="relative group px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(0,243,255,0.5)] hover:shadow-[0_0_35px_rgba(0,243,255,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <span>PORTAL / TICKET</span>
              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
            </span>
          </button>

          {loggedIn && (
            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Log Out & Switch Google Account"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">LOG OUT</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center space-x-2">
          <button
            onClick={onRegisterClick}
            className="px-3 py-1.5 text-xs font-orbitron font-bold rounded-lg bg-cyan-500 text-black shadow-[0_0_15px_#00f3ff]"
          >
            TICKET
          </button>

          {loggedIn && (
            <button
              onClick={handleLogout}
              className="p-2 text-red-400 rounded-lg bg-red-500/20 border border-red-500/40"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-cyan-400 hover:text-white rounded-lg bg-slate-900/80 border border-cyan-500/30"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-[#030712]/95 border-b border-cyan-500/30 backdrop-blur-2xl px-4 pt-4 pb-6 space-y-4"
          >
            <div className="text-center py-2 border-b border-slate-800">
              <span className="font-orbitron font-bold text-xs text-cyan-400 block tracking-widest">
                ONE COMPLETE MACHINE LEARNING PIPELINE
              </span>
              <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                📍 8th Block Seminar Hall • Aug 5th
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRegisterClick();
                }}
                className="w-full py-3 rounded-xl font-orbitron font-bold text-xs uppercase bg-cyan-500 text-black text-center block shadow-[0_0_20px_#00f3ff]"
              >
                ACCESS REGISTRATION / TICKET
              </button>

              {loggedIn && (
                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl font-orbitron font-bold text-xs uppercase bg-red-500/20 text-red-400 border border-red-500/40 text-center flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>LOG OUT / SWITCH GOOGLE ACCOUNT</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
