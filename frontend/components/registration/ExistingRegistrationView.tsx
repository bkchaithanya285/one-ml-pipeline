"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock, Home, FileText, QrCode, CalendarCheck, ShieldCheck, Lock, LogOut } from "lucide-react";
import { Registration, AttendanceSession } from "@/types";
import { subscribeAttendanceSessions } from "@/lib/firebase/firestore";
import { signOutStudent } from "@/lib/firebase/auth";

interface ExistingRegistrationViewProps {
  registration: Registration;
  onHomeClick: () => void;
}

export const ExistingRegistrationView: React.FC<ExistingRegistrationViewProps> = ({
  registration,
  onHomeClick,
}) => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);

  useEffect(() => {
    const unsub = subscribeAttendanceSessions((list) => {
      setSessions(list);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOutStudent();
    onHomeClick();
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const isApproved = registration.paymentStatus === "Approved";
  const isRejected = registration.paymentStatus === "Rejected";

  const attendancePayload = `CSI-KARE-ATTENDANCE|REG:${registration.registerNumber}|NAME:${registration.name}|ID:${registration.id}`;
  const attendanceQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    attendancePayload
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto rounded-3xl bg-slate-950/95 border border-cyan-500/50 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,243,255,0.25)] text-gray-100 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-orbitron font-extrabold text-xl sm:text-2xl text-cyan-300">
              Registration Portal
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              EXISTING PARTICIPATION RECORD FOUND
            </p>
          </div>
        </div>

        {/* Live Payment Status Badge */}
        <span
          className={`px-3 py-1.5 rounded-full font-orbitron font-bold text-xs uppercase border flex items-center space-x-1.5 ${
            isApproved
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_#10b981]"
              : isRejected
              ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_#ef4444]"
              : "bg-amber-500/20 border-amber-500/50 text-amber-400 animate-pulse shadow-[0_0_15px_#f59e0b]"
          }`}
        >
          {isApproved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : isRejected ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
          <span>{registration.paymentStatus}</span>
        </span>
      </div>

      {/* Payment Approval Status Message Banner */}
      {isApproved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs space-y-1 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <p className="font-bold flex items-center space-x-2 text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Payment Approved & Spot Confirmed 🎉</span>
          </p>
          <p className="text-gray-300 font-mono text-[11px]">
            Your payment proof screenshot & UPI Transaction ID ({registration.transactionId}) have been verified by CSI KARE Admins.
          </p>
        </div>
      )}

      {/* Warning Notice if Rejected */}
      {isRejected && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs space-y-1">
          <p className="font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>Payment Screenshot Rejected by Admin</span>
          </p>
          {registration.rejectionReason && (
            <p className="text-gray-300 font-mono text-[11px]">
              Reason: {registration.rejectionReason}
            </p>
          )}
        </div>
      )}

      {/* DIGITAL ATTENDANCE QR CODE TICKET */}
      {!isRejected && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-left font-mono text-xs space-y-4 shadow-[inset_0_0_15px_rgba(0,243,255,0.1)]">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-[10px] font-orbitron font-bold text-cyan-400 flex items-center space-x-1 uppercase">
              <QrCode className="w-3.5 h-3.5" />
              <span>VENUE ATTENDANCE QR CODE</span>
            </span>
            <span className="text-emerald-400 text-[10px] font-orbitron font-bold uppercase">
              {isApproved ? "VALID TICKET" : "VERIFICATION IN PROGRESS"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-36 h-36 p-2 bg-white rounded-xl flex-shrink-0 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
              <Image
                src={attendanceQrUrl}
                alt="Digital Attendance QR Ticket"
                fill
                className="object-contain p-1"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-500 text-[10px] block uppercase font-orbitron">Full Name</span>
                <span className="font-bold text-cyan-300 text-sm block">{registration.name}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block uppercase font-orbitron">Register Number</span>
                <span className="font-bold text-white text-sm block">{registration.registerNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block uppercase font-orbitron">Transaction / UTR ID</span>
                <span className="font-bold text-amber-300 text-xs block">{registration.transactionId || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-cyan-300/90 leading-relaxed text-center font-sans">
            📍 Show this QR Code at <strong>8th Block Seminar Hall</strong> entrance to record your attendance.
          </div>
        </div>
      )}

      {/* STUDENT ATTENDANCE SESSIONS STATUS CARD */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <span className="text-[10px] font-orbitron font-bold text-cyan-400 flex items-center space-x-1.5 uppercase">
            <CalendarCheck className="w-4 h-4 text-cyan-400" />
            <span>SESSION ATTENDANCE RECORDS</span>
          </span>
          <span className="text-gray-400 text-[10px]">{sessions.length} Event Sessions</span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-center py-4 text-gray-500 text-[11px] font-orbitron">
            NO ATTENDANCE SESSIONS CREATED BY ADMIN YET
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => {
              const statusStr = s.status || "open";
              const recordsList = s.records || [];
              const record = recordsList.find(
                (r) =>
                  r.regId === registration.id ||
                  r.registerNumber.toLowerCase() === registration.registerNumber.toLowerCase()
              );
              const isPresent = record !== undefined;

              return (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-gray-200">{s.sessionName}</div>
                    <div className="text-[10px] text-gray-500">
                      {statusStr === "closed" ? "🔒 Session Closed" : "🟢 Session Open"}
                    </div>
                  </div>

                  <div>
                    {isPresent ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-orbitron font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>PRESENT</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-orbitron font-bold bg-red-500/10 border border-red-500/30 text-red-400 flex items-center space-x-1">
                        {statusStr === "closed" ? <Lock className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{statusStr === "closed" ? "ABSENT (CLOSED)" : "ABSENT"}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Details Summary */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 font-mono text-xs">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <span className="text-[10px] font-orbitron font-bold text-gray-400 uppercase">
            REGISTRATION SUMMARY
          </span>
          <span className="text-gray-400 text-[10px]">{registration.id}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500 text-[10px] block font-orbitron uppercase">Email Address</span>
            <span className="text-gray-200 block truncate">{registration.email}</span>
          </div>

          <div>
            <span className="text-gray-500 text-[10px] block font-orbitron uppercase">Phone Number</span>
            <span className="text-gray-200 block">{registration.phone}</span>
          </div>

          <div>
            <span className="text-gray-500 text-[10px] block font-orbitron uppercase">Department</span>
            <span className="text-gray-200 block">{registration.department} ({registration.year})</span>
          </div>

          <div>
            <span className="text-gray-500 text-[10px] block font-orbitron uppercase">Registration Time</span>
            <span className="text-gray-200 block">{new Date(registration.createdAt).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Payment Proof Preview */}
      {registration.paymentScreenshot && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[10px] font-orbitron font-bold text-gray-400 block uppercase">
            Payment Proof Screenshot
          </span>
          <div className="relative w-full h-40 rounded-xl overflow-hidden border border-cyan-500/30 bg-black">
            <Image
              src={registration.paymentScreenshot}
              alt="Payment Screenshot"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800">
        <button
          onClick={onHomeClick}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(0,243,255,0.6)] hover:scale-105 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to Home</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>LOG OUT / SWITCH ACCOUNT</span>
        </button>
      </div>
    </motion.div>
  );
};
