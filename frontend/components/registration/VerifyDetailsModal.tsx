"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { RegistrationFormData } from "./RegistrationForm";

interface VerifyDetailsModalProps {
  data: RegistrationFormData;
  onEdit: () => void;
  onProceedToPayment: () => void;
}

export const VerifyDetailsModal: React.FC<VerifyDetailsModalProps> = ({
  data,
  onEdit,
  onProceedToPayment,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto rounded-3xl bg-slate-950/90 border border-cyan-500/40 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] text-gray-100"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 pb-6 border-b border-slate-800">
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <Search className="w-7 h-7" />
        </div>
        <div>
          <h2 className="font-orbitron font-extrabold text-xl sm:text-2xl text-cyan-300">
            🔍 Verify Your Details
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            CONFIRM ALL PARTICIPANT INFORMATION BEFORE PAYMENT
          </p>
        </div>
      </div>

      {/* Holographic Verification Summary Card */}
      <div className="my-6 p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-4 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,243,255,0.05)]">
        <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500/20 text-cyan-400 font-orbitron text-[10px] rounded-bl-xl border-b border-l border-cyan-500/40">
          DATA CONFIRMATION
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-gray-400 text-[10px] font-orbitron uppercase block">Full Name</span>
            <span className="text-sm font-bold text-cyan-300 block tracking-wide">{data.fullName}</span>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 text-[10px] font-orbitron uppercase block">Register Number</span>
            <span className="text-sm font-bold text-white block">{data.registerNumber}</span>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 text-[10px] font-orbitron uppercase block">Email Address</span>
            <span className="text-sm text-gray-200 block truncate">{data.email}</span>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 text-[10px] font-orbitron uppercase block">Phone Number</span>
            <span className="text-sm text-gray-200 block">{data.phone}</span>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 text-[10px] font-orbitron uppercase block">Department & Year</span>
            <span className="text-sm text-gray-200 block">{data.department} ({data.year})</span>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 text-[10px] font-orbitron uppercase block">Section</span>
            <span className="text-sm font-bold text-cyan-300 block">{data.section}</span>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 text-[10px] font-orbitron uppercase block">Residency Status</span>
            <span className="text-sm text-gray-200 block">{data.residency}</span>
          </div>

          <div className="sm:col-span-2 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-gray-400 text-xs font-orbitron uppercase">Registration Fee</span>
            <span className="font-orbitron font-extrabold text-xl text-cyan-400 text-neon-glow">
              ₹100
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Warning */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 mb-6">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200 leading-relaxed font-sans">
          ⚠️ Please verify all your details carefully. Once you proceed to payment, your personal details cannot be modified. The same name entered above will be printed on the participation certificate.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onEdit}
          className="px-6 py-3 rounded-xl font-orbitron font-semibold text-xs text-cyan-400 hover:text-white bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Edit Details</span>
        </button>

        <button
          onClick={onProceedToPayment}
          className="px-7 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(0,243,255,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <span>Proceed to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
