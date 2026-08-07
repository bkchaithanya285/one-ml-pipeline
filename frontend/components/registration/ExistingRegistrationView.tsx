"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Home,
  FileText,
  QrCode,
  CalendarCheck,
  ShieldCheck,
  Lock,
  LogOut,
  Edit3,
  X,
  AlertTriangle,
} from "lucide-react";
import { Registration, AttendanceSession } from "@/types";
import { subscribeAttendanceSessions, updateStudentSelfRegistration } from "@/lib/firebase/firestore";
import { signOutStudent } from "@/lib/firebase/auth";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

interface ExistingRegistrationViewProps {
  registration: Registration;
  onHomeClick: () => void;
}

export const ExistingRegistrationView: React.FC<ExistingRegistrationViewProps> = ({
  registration,
  onHomeClick,
}) => {
  const [currentReg, setCurrentReg] = useState<Registration>(registration);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);

  // Self-edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [editForm, setEditForm] = useState({
    name: registration.name || "",
    registerNumber: registration.registerNumber || "",
    phone: registration.phone || "",
    department: registration.department || "CSE",
    year: registration.year || "III Year",
    section: registration.section || "",
    residency: registration.residency || "Day Scholar",
    transactionId: registration.transactionId || "",
  });

  useEffect(() => {
    setCurrentReg(registration);
    setEditForm({
      name: registration.name || "",
      registerNumber: registration.registerNumber || "",
      phone: registration.phone || "",
      department: registration.department || "CSE",
      year: registration.year || "III Year",
      section: registration.section || "",
      residency: registration.residency || "Day Scholar",
      transactionId: registration.transactionId || "",
    });
  }, [registration]);

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

  const handleSaveSelfEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.registerNumber.trim() || !editForm.phone.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const confirmSave = window.confirm(
      "⚠️ FINAL CONFIRMATION:\nYou are editing your details using your ONE-TIME edit allowance.\n\n1. Name must match KLU SIS portal exactly.\n2. Once submitted, NO further edits will be allowed.\n\nProceed to submit?"
    );
    if (!confirmSave) return;

    setIsSubmittingEdit(true);
    const updatedFields = {
      name: editForm.name.toUpperCase().trim(),
      registerNumber: editForm.registerNumber.toUpperCase().trim(),
      phone: editForm.phone.trim(),
      department: editForm.department,
      year: editForm.year,
      section: editForm.section.toUpperCase().trim(),
      residency: editForm.residency,
      transactionId: editForm.transactionId.toUpperCase().trim(),
    };

    const result = await updateStudentSelfRegistration(currentReg.id, updatedFields);
    setIsSubmittingEdit(false);

    if (result.success) {
      alert("✅ Your registration details have been updated and permanently locked!");
      setCurrentReg((prev) => ({
        ...prev,
        ...updatedFields,
        isEdited: true,
        hasEditedOnce: true,
      }));
      setIsEditModalOpen(false);
    } else {
      alert(`Error updating details: ${result.error}`);
    }
  };

  const isApproved = currentReg.paymentStatus === "Approved";
  const isRejected = currentReg.paymentStatus === "Rejected";
  const isLocked = currentReg.hasEditedOnce || currentReg.isEdited;

  const attendancePayload = `CSI-KARE-ATTENDANCE|REG:${currentReg.registerNumber}|NAME:${currentReg.name}|ID:${currentReg.id}`;
  const attendanceQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    attendancePayload
  )}`;

  return (
    <>
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
            <span>{currentReg.paymentStatus}</span>
          </span>
        </div>

        {/* ONE-TIME SELF EDIT NOTICE BANNER */}
        {!isLocked ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs space-y-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <div className="flex items-center justify-between">
              <span className="font-orbitron font-bold flex items-center space-x-2 text-sm text-amber-400">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>FINAL CHANCE TO VERIFY & EDIT DETAILS</span>
              </span>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg font-orbitron font-extrabold text-[11px] uppercase bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_10px_#f59e0b] transition-all cursor-pointer"
              >
                EDIT DETAILS NOW
              </button>
            </div>
            <p className="text-gray-300 font-mono text-[11px] leading-relaxed">
              ⚠️ You can edit your details <strong>ONLY ONCE</strong>. Please verify that your name is written <strong>EXACTLY as per your KLU SIS portal</strong>. Once submitted, your details will be permanently locked.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center justify-center space-x-2 font-mono">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">DETAILS VERIFIED & LOCKED (EDITED ONCE)</span>
          </div>
        )}

        {/* Payment Approval Status Message Banner */}
        {isApproved && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs space-y-1 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <p className="font-bold flex items-center space-x-2 text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Payment Approved & Spot Confirmed 🎉</span>
            </p>
            <p className="text-gray-300 font-mono text-[11px]">
              Your payment proof screenshot & UPI Transaction ID ({currentReg.transactionId}) have been verified by CSI KARE Admins.
            </p>
          </div>
        )}

        {/* HIGHLIGHTED WHATSAPP GROUP CALLOUT FOR REGISTERED STUDENTS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-slate-950 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.25)] relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex-shrink-0">
                <WhatsAppIcon className="w-6 h-6 fill-current text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h4 className="font-orbitron font-extrabold text-sm sm:text-base text-emerald-300">
                  Official Event WhatsApp Group
                </h4>
                <p className="text-xs text-emerald-200/80 font-mono mt-0.5">
                  Join now for live workshop updates, resource links & announcements!
                </p>
              </div>
            </div>
            <a
              href="https://chat.whatsapp.com/EGUP6xrcI83C4ux94fRJls"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-black shadow-[0_0_20px_rgba(16,185,129,0.7)] hover:shadow-[0_0_35px_rgba(16,185,129,1)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer flex-shrink-0"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current text-black" />
              <span>JOIN GROUP NOW</span>
            </a>
          </div>
        </div>

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
                  <span className="font-bold text-cyan-300 text-sm block">{currentReg.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block uppercase font-orbitron">Register Number</span>
                  <span className="font-bold text-white text-sm block">{currentReg.registerNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block uppercase font-orbitron">Department & Section</span>
                  <span className="text-gray-200 block text-xs">
                    {currentReg.department} ({currentReg.year}) • Sec: <strong className="text-cyan-300">{currentReg.section || "N/A"}</strong>
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block uppercase font-orbitron">Residency Status</span>
                  <span className="text-gray-300 block text-xs">{currentReg.residency || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block uppercase font-orbitron">Transaction / UTR ID</span>
                  <span className="font-bold text-amber-300 text-xs block">{currentReg.transactionId || "N/A"}</span>
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
                const isClosed = statusStr === "closed";
                const recordsList = s.records || [];

                const regNoClean = (currentReg.registerNumber || "").toLowerCase().trim();
                const idClean = (currentReg.id || "").toLowerCase().trim();
                const nameClean = (currentReg.name || "").toLowerCase().trim();

                const record = recordsList.find((r) => {
                  const rReg = (r.registerNumber || "").toLowerCase().trim();
                  const rId = (r.regId || "").toLowerCase().trim();
                  const rName = (r.name || "").toLowerCase().trim();

                  return (
                    (regNoClean && rReg && rReg === regNoClean) ||
                    (idClean && rId && rId === idClean) ||
                    (nameClean && rName && rName === nameClean)
                  );
                });

                const isPresent = record !== undefined;

                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-gray-200">{s.sessionName}</div>
                      <div className="text-[10px] text-gray-500">
                        {isClosed ? "🔒 Session Closed" : "🟢 Live Scanning Open"}
                      </div>
                    </div>

                    <div>
                      {isPresent ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-orbitron font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center space-x-1 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>
                            PRESENT (
                            {record?.scannedAt
                              ? new Date(record.scannedAt).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Scanned"}
                            )
                          </span>
                        </span>
                      ) : isClosed ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-orbitron font-bold bg-red-500/20 border border-red-500/40 text-red-400 flex items-center space-x-1 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                          <Lock className="w-3 h-3" />
                          <span>ABSENT</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-orbitron font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center space-x-1 animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>OPEN / PENDING SCAN</span>
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
            <span className="text-gray-400 text-[10px]">{currentReg.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 text-[10px] block font-orbitron uppercase">Email Address</span>
              <span className="text-gray-200 block truncate">{currentReg.email}</span>
            </div>

            <div>
              <span className="text-gray-500 text-[10px] block font-orbitron uppercase">Phone Number</span>
              <span className="text-gray-200 block">{currentReg.phone}</span>
            </div>

            <div>
              <span className="text-gray-500 text-[10px] block font-orbitron uppercase">Department</span>
              <span className="text-gray-200 block">{currentReg.department} ({currentReg.year})</span>
            </div>

            <div>
              <span className="text-gray-500 text-[10px] block font-orbitron uppercase">Registration Time</span>
              <span className="text-gray-200 block">{new Date(currentReg.createdAt).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Payment Proof Preview */}
        {currentReg.paymentScreenshot && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-orbitron font-bold text-gray-400 block uppercase">
              Payment Proof Screenshot
            </span>
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-cyan-500/30 bg-black">
              <Image
                src={currentReg.paymentScreenshot}
                alt="Payment Screenshot"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800">
          {!isLocked && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>EDIT DETAILS (ONE-TIME ONLY)</span>
            </button>
          )}

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
            <span>LOG OUT</span>
          </button>
        </div>
      </motion.div>

      {/* ONE-TIME SELF EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg rounded-3xl bg-slate-950 border-2 border-amber-500/80 p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.4)] my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-extrabold text-lg text-amber-300">
                      EDIT REGISTRATION DETAILS
                    </h3>
                    <p className="text-xs text-amber-400/80 font-mono">
                      ONE-TIME ONLY EDIT ALLOWANCE
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instructions Callout */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs space-y-1 font-mono">
                <p className="font-bold flex items-center space-x-1.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>CRITICAL INSTRUCTIONS:</span>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-300">
                  <li>Verify your <strong>Full Name is written EXACTLY as per your KLU SIS portal</strong>.</li>
                  <li>You can edit your details <strong>ONLY ONCE</strong>.</li>
                  <li>After submitting, your profile will be <strong>PERMANENTLY LOCKED</strong>.</li>
                </ul>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveSelfEdit} className="space-y-4 font-mono text-xs">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-orbitron uppercase text-gray-400 mb-1">
                    Full Name (AS PER KLU SIS PORTAL) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/50 text-white font-bold tracking-wide focus:border-amber-400 focus:outline-none uppercase"
                    placeholder="ENTER FULL NAME AS PER SIS PORTAL"
                  />
                </div>

                {/* Register Number & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-orbitron uppercase text-gray-400 mb-1">
                      Register Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.registerNumber}
                      onChange={(e) => setEditForm({ ...editForm, registerNumber: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-orbitron uppercase text-gray-400 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Department & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-orbitron uppercase text-gray-400 mb-1">
                      Department *
                    </label>
                    <select
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="CSE">CSE</option>
                      <option value="CSE (AI & ML)">CSE (AI & ML)</option>
                      <option value="ECE">ECE</option>
                      <option value="IT">IT</option>
                      <option value="EEE">EEE</option>
                      <option value="MECH">MECH</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="BIO">BIO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-orbitron uppercase text-gray-400 mb-1">
                      Year *
                    </label>
                    <select
                      value={editForm.year}
                      onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="II Year">II Year</option>
                      <option value="III Year">III Year</option>
                      <option value="IV Year">IV Year</option>
                    </select>
                  </div>
                </div>

                {/* Section & Residency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-orbitron uppercase text-gray-400 mb-1">
                      Section *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.section}
                      onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none uppercase"
                      placeholder="e.g. 24S08"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-orbitron uppercase text-gray-400 mb-1">
                      Residency Status *
                    </label>
                    <select
                      value={editForm.residency}
                      onChange={(e) => setEditForm({ ...editForm, residency: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Day Scholar">Day Scholar</option>
                      <option value="Hosteller">Hosteller</option>
                    </select>
                  </div>
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-[10px] font-orbitron uppercase text-gray-400 mb-1">
                    UPI / UTR Transaction ID
                  </label>
                  <input
                    type="text"
                    value={editForm.transactionId}
                    onChange={(e) => setEditForm({ ...editForm, transactionId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none uppercase"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase text-gray-400 hover:text-white bg-slate-900 border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="px-6 py-2.5 rounded-xl font-orbitron font-extrabold text-xs uppercase bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_#f59e0b] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingEdit ? "SAVING & LOCKING..." : "CONFIRM & SAVE DETAILS"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
