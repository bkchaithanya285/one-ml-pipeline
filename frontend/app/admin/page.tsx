"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Mail, ArrowLeft } from "lucide-react";
import { signInAdmin, isLocalAdminSession, signOutAdmin } from "@/lib/firebase/auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Footer } from "@/components/Footer";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check session
    const active = isLocalAdminSession();
    setIsAuthenticated(active);
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    const { success, error } = await signInAdmin(email.trim(), password);
    setIsSubmitting(false);

    if (success) {
      setIsAuthenticated(true);
    } else {
      setLoginError(error || "Invalid Admin credentials.");
    }
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-cyan-400 font-orbitron text-xs">
        INITIALIZING SECURITY CHECKS...
      </div>
    );
  }

  if (isAuthenticated) {
    return <AdminDashboard onSignOut={handleSignOut} />;
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-orbitron text-gray-400 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Landing Page</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="rounded-3xl bg-slate-950/90 border border-cyan-500/40 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] text-gray-100 space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="font-orbitron font-extrabold text-xl text-cyan-300 tracking-wider">
              ADMINISTRATOR LOGIN
            </h1>
            <p className="text-xs text-gray-400 font-mono">
              RESTRICTED ACCESS PORTAL • CSI KARE
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-mono text-center">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="block text-gray-400 font-orbitron uppercase text-[10px]">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-gray-400 font-orbitron uppercase text-[10px]">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(0,243,255,0.6)] hover:scale-[1.02] active:scale-95 transition-all mt-4 cursor-pointer"
            >
              {isSubmitting ? "AUTHENTICATING..." : "AUTHENTICATE ADMIN LOGIN"}
            </button>
          </form>


        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full">
        <Footer />
      </div>
    </div>
  );
}
