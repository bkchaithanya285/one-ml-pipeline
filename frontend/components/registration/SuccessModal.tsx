"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, Home, QrCode, Hash, Calendar, MapPin } from "lucide-react";
import { RegistrationFormData } from "./RegistrationForm";

interface SuccessModalProps {
  registrationId: string;
  formData: RegistrationFormData;
  onHomeClick: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  registrationId,
  formData,
  onHomeClick,
}) => {
  useEffect(() => {
    // Trigger futuristic confetti burst
    const end = Date.now() + 2 * 1000;
    const colors = ["#00f3ff", "#3b82f6", "#a855f7"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  // Generate Unique Attendance QR Code URL for venue entrance scanning
  const attendancePayload = `CSI-KARE-ATTENDANCE|REG:${formData.registerNumber}|NAME:${formData.fullName}|ID:${registrationId}`;
  const attendanceQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    attendancePayload
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto rounded-3xl bg-slate-950/95 border border-cyan-500/50 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,243,255,0.3)] text-center text-gray-100 relative overflow-hidden"
    >
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Success Icon Badge */}
      <div className="relative inline-flex items-center justify-center p-5 rounded-3xl bg-slate-900 border border-cyan-500/40 text-cyan-400 mb-6 shadow-[0_0_30px_rgba(0,243,255,0.5)]">
        <CheckCircle2 className="w-14 h-14 animate-bounce text-neon-glow" />
        <div className="absolute inset-0 rounded-3xl border border-cyan-400 animate-ping opacity-25" />
      </div>

      <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-cyan-300 tracking-wider">
        🎉 Mission Completed Successfully
      </h2>

      <p className="font-orbitron font-semibold text-sm text-gray-200 mt-2">
        Registration Submitted Successfully.
      </p>

      <div className="my-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 max-w-md mx-auto">
        <span className="font-orbitron font-bold text-xs text-amber-300 block uppercase tracking-wider">
          Payment Verification Pending
        </span>
        <p className="text-xs text-amber-200 mt-1 font-mono">
          Our team will verify your payment screenshot & UPI transaction details shortly.
        </p>
      </div>

      {/* DIGITAL ATTENDANCE QR CODE TICKET CARD */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-left font-mono text-xs space-y-4 max-w-lg mx-auto shadow-[inset_0_0_15px_rgba(0,243,255,0.1)]">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <span className="text-[10px] font-orbitron font-bold text-cyan-400 flex items-center space-x-1">
            <QrCode className="w-3.5 h-3.5" />
            <span>VENUE ATTENDANCE QR TICKET</span>
          </span>
          <span className="text-gray-400 text-[10px]">{registrationId}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Attendance QR Image */}
          <div className="relative w-36 h-36 p-2 bg-white rounded-xl flex-shrink-0 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
            <Image
              src={attendanceQrUrl}
              alt="Digital Attendance QR"
              fill
              className="object-contain p-1"
            />
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-500 text-[10px] block uppercase font-orbitron">Student Name</span>
              <span className="font-bold text-cyan-300 text-sm">{formData.fullName}</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] block uppercase font-orbitron">Register Number</span>
              <span className="font-bold text-white text-sm">{formData.registerNumber}</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] block uppercase font-orbitron">Department</span>
              <span>{formData.department} ({formData.year})</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[10px] text-cyan-300/90 leading-relaxed text-center font-sans">
          📍 Scan this QR Code at <strong>8th Block Seminar Hall</strong> entrance for digital attendance.
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center space-x-4">
        <button
          onClick={onHomeClick}
          className="px-8 py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(0,243,255,0.6)] hover:scale-105 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>
    </motion.div>
  );
};
