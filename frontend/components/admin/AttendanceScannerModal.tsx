"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsQR from "jsqr";
import {
  QrCode,
  Plus,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  X,
  Trash2,
  Lock,
  Unlock,
  Volume2,
  Camera,
  CameraOff,
  UserCheck,
  UserX,
  Download,
} from "lucide-react";
import { Registration, AttendanceSession } from "@/types";
import {
  subscribeAttendanceSessions,
  createAttendanceSession,
  markAttendanceInSession,
  deleteAttendanceSession,
  toggleAttendanceSessionStatus,
} from "@/lib/firebase/firestore";
import { exportAttendanceToExcel } from "@/lib/exportUtils";

interface AttendanceScannerModalProps {
  isOpen: boolean;
  registrations: Registration[];
  onClose: () => void;
}

export const AttendanceScannerModal: React.FC<AttendanceScannerModalProps> = ({
  isOpen,
  registrations,
  onClose,
}) => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [newSessionName, setNewSessionName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Camera & Live Continuous Scanner States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanner Search & Feedback
  const [scanInput, setScanInput] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  } | null>(null);

  // View Filter: "all" | "present" | "absent"
  const [rosterFilter, setRosterFilter] = useState<"all" | "present" | "absent">("present");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScannedCode = useRef<{ code: string; time: number } | null>(null);

  useEffect(() => {
    const unsub = subscribeAttendanceSessions((list) => {
      setSessions(list);
      if (list.length > 0 && !selectedSessionId) {
        setSelectedSessionId(list[0].id);
      }
    });
    return () => unsub();
  }, [selectedSessionId]);

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const currentStatus = currentSession?.status || "open";
  const isSessionClosed = currentStatus === "closed";

  // Audio Beep Feedback Helper
  const playAudioBeep = (type: "success" | "error") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.type = "sine";
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.type = "sawtooth";
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {}
  };

  // Continuous Camera QR Code Frame Processing Loop
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (!isOpen || isSessionClosed || !isCameraActive) return;

      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
          requestAnimationFrame(scanCanvasFrame);
        }
      } catch (err: any) {
        setCameraError("Camera access denied or not available. Use manual QR/Reg No input.");
      }
    };

    const scanCanvasFrame = () => {
      if (!isOpen || isSessionClosed || !isCameraActive) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data) {
            const now = Date.now();
            if (
              !lastScannedCode.current ||
              lastScannedCode.current.code !== code.data ||
              now - lastScannedCode.current.time > 2500
            ) {
              lastScannedCode.current = { code: code.data, time: now };
              handleProcessScan(code.data);
            }
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(scanCanvasFrame);
    };

    if (isOpen && !isSessionClosed && isCameraActive) {
      startCamera();
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, isSessionClosed, isCameraActive, selectedSessionId]);

  if (!isOpen) return null;

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    const created = await createAttendanceSession(newSessionName.trim());
    setSelectedSessionId(created.id);
    setNewSessionName("");
    setShowCreateForm(false);
  };

  const handleToggleSessionStatus = async () => {
    if (!currentSession) return;
    await toggleAttendanceSessionStatus(currentSession.id);
  };

  const handleProcessScan = async (rawCode: string) => {
    if (!currentSession) {
      setFeedback({
        type: "error",
        title: "NO ACTIVE SESSION",
        message: "Please create or select an attendance session first.",
      });
      playAudioBeep("error");
      return;
    }

    if (isSessionClosed) {
      setFeedback({
        type: "error",
        title: "SESSION CLOSED",
        message: `Attendance is locked for '${currentSession.sessionName}'. No further attendance allowed.`,
      });
      playAudioBeep("error");
      setScanInput("");
      return;
    }

    const cleanInput = rawCode.trim();
    if (!cleanInput) return;

    let targetRegNo = cleanInput;
    if (cleanInput.includes("REG:")) {
      const parts = cleanInput.split("|");
      const regPart = parts.find((p) => p.startsWith("REG:"));
      if (regPart) {
        targetRegNo = regPart.replace("REG:", "").trim();
      }
    }

    const student = registrations.find(
      (r) =>
        r.registerNumber.toLowerCase().trim() === targetRegNo.toLowerCase().trim() ||
        r.id.toLowerCase().trim() === targetRegNo.toLowerCase().trim() ||
        r.email.toLowerCase().trim() === targetRegNo.toLowerCase().trim()
    );

    if (!student) {
      setFeedback({
        type: "error",
        title: "UNREGISTERED STUDENT",
        message: `No registration record found for '${targetRegNo}'.`,
      });
      playAudioBeep("error");
      setScanInput("");
      return;
    }

    const res = await markAttendanceInSession(currentSession.id, {
      regId: student.id,
      registerNumber: student.registerNumber,
      name: student.name,
    });

    if (res.success) {
      setFeedback({
        type: "success",
        title: "ATTENDANCE VERIFIED & MARKED PRESENT",
        message: `${student.name} (${student.registerNumber}) • ${student.department}`,
      });
      playAudioBeep("success");
      // Auto-switch filter tab to Present so admin sees newly added student immediately
      setRosterFilter("present");
    } else {
      setFeedback({
        type: "warning",
        title: "DUPLICATE SCAN",
        message: res.message,
      });
      playAudioBeep("error");
    }

    setScanInput("");
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessScan(scanInput);
  };

  const handleDeleteSession = async (id: string) => {
    await deleteAttendanceSession(id);
    if (selectedSessionId === id) {
      setSelectedSessionId(sessions.find((s) => s.id !== id)?.id || "");
    }
  };

  const handleExportAttendanceExcel = () => {
    if (!currentSession) return;
    exportAttendanceToExcel(
      currentSession.sessionName,
      registrations,
      currentSession.records || []
    );
  };

  // Analytics Calculations
  const totalRegistered = registrations.length;
  const sessionRecords = currentSession?.records || [];
  const presentCount = sessionRecords.length;
  const absentCount = Math.max(0, totalRegistered - presentCount);
  const presentPercentage =
    totalRegistered > 0 ? Math.round((presentCount / totalRegistered) * 100) : 0;

  // Build 100% Comprehensive Present Lookup Set (matches on Reg No OR Reg ID)
  const presentKeysSet = new Set<string>();
  sessionRecords.forEach((rec) => {
    if (rec.registerNumber) presentKeysSet.add(rec.registerNumber.toLowerCase().trim());
    if (rec.regId) presentKeysSet.add(rec.regId.toLowerCase().trim());
  });

  const filteredRoster = registrations.filter((reg) => {
    const isPresent =
      presentKeysSet.has(reg.registerNumber.toLowerCase().trim()) ||
      presentKeysSet.has(reg.id.toLowerCase().trim());

    if (rosterFilter === "present") return isPresent;
    if (rosterFilter === "absent") return !isPresent;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[95vh] bg-slate-950 rounded-3xl border border-cyan-500/40 p-5 sm:p-8 text-gray-100 shadow-[0_0_60px_rgba(0,243,255,0.25)] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <QrCode className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-orbitron font-extrabold text-lg sm:text-xl text-cyan-300">
                LIVE CAMERA SCANNER & ATTENDANCE SYSTEM
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                CSI KARE • ONE COMPLETE MACHINE LEARNING PIPELINE
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentSession && (
              <button
                type="button"
                onClick={handleExportAttendanceExcel}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-orbitron font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_#10b981] transition-all cursor-pointer"
                title="Download Attendance Excel Report for this Session"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">EXPORT EXCEL</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto my-4 space-y-5 pr-1">
          {/* SESSION SELECTOR & STATUS BAR */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-orbitron font-bold text-cyan-400 uppercase tracking-wider block">
                    Active Attendance Session
                  </label>
                  {currentSession && (
                    <span
                      className={`text-[9px] font-orbitron font-bold px-2 py-0.5 rounded-full border ${
                        isSessionClosed
                          ? "bg-red-500/20 border-red-500/40 text-red-400"
                          : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 animate-pulse"
                      }`}
                    >
                      {isSessionClosed ? "🔒 SESSION CLOSED" : "🟢 LIVE SCANNING OPEN"}
                    </span>
                  )}
                </div>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-gray-100 focus:border-cyan-400"
                >
                  {sessions.length === 0 ? (
                    <option value="">No Sessions Created</option>
                  ) : (
                    sessions.map((s) => {
                      const statusStr = (s.status || "open").toUpperCase();
                      const recLength = s.records ? s.records.length : 0;
                      return (
                        <option key={s.id} value={s.id}>
                          {s.sessionName} [{statusStr}] ({recLength} Present)
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              <div className="flex items-end space-x-2">
                {currentSession && (
                  <button
                    type="button"
                    onClick={handleToggleSessionStatus}
                    className={`px-4 py-2.5 rounded-xl font-orbitron font-bold text-xs flex items-center space-x-1.5 cursor-pointer ${
                      isSessionClosed
                        ? "bg-emerald-500 text-black shadow-[0_0_15px_#10b981]"
                        : "bg-amber-500 text-black shadow-[0_0_15px_#f59e0b]"
                    }`}
                  >
                    {isSessionClosed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    <span>{isSessionClosed ? "RE-OPEN SESSION" : "CLOSE SESSION"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_#00f3ff] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>NEW SESSION</span>
                </button>

                {currentSession && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(currentSession.id)}
                    className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 transition-colors"
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Create New Session Input */}
            <AnimatePresence>
              {showCreateForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateSession}
                  className="pt-3 border-t border-slate-800 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    required
                    placeholder="Session Title (e.g. Session 1: ML Pipeline Keynote)"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-cyan-500/50 text-xs font-mono text-gray-100"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-orbitron font-bold text-xs"
                  >
                    Create
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* MAIN TWO-COLUMN LAYOUT: LIVE WEBCAM & MANUAL SCANNER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* COLUMN 1: LIVE CONTINUOUS WEBCAM SCANNER */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-cyan-300 font-orbitron font-bold text-xs uppercase">
                  <Camera className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Live Continuous Camera Scanner</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-orbitron text-gray-300 flex items-center space-x-1"
                >
                  {isCameraActive ? <CameraOff className="w-3 h-3 text-red-400" /> : <Camera className="w-3 h-3 text-emerald-400" />}
                  <span>{isCameraActive ? "Pause Camera" : "Start Camera"}</span>
                </button>
              </div>

              {/* Live Video Viewport */}
              <div className="relative w-full h-56 rounded-2xl bg-black overflow-hidden border border-cyan-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.15)]">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${isSessionClosed || !isCameraActive ? "hidden" : ""}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Laser Overlay Animation when active */}
                {!isSessionClosed && isCameraActive && !cameraError && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                    <div className="w-48 h-48 border-2 border-cyan-400/60 rounded-2xl relative shadow-[0_0_30px_rgba(0,243,255,0.3)]">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[bounce_2s_infinite] shadow-[0_0_15px_#00f3ff]" />
                    </div>
                  </div>
                )}

                {/* Session Closed / Camera Disabled State */}
                {(isSessionClosed || !isCameraActive || cameraError) && (
                  <div className="p-6 text-center space-y-2">
                    {isSessionClosed ? (
                      <>
                        <Lock className="w-10 h-10 text-red-400 mx-auto" />
                        <span className="font-orbitron font-bold text-xs text-red-400 block uppercase">
                          SESSION IS CLOSED
                        </span>
                        <p className="text-[10px] text-gray-400 font-mono">
                          Live camera scanning disabled for locked sessions.
                        </p>
                      </>
                    ) : (
                      <>
                        <CameraOff className="w-10 h-10 text-gray-500 mx-auto" />
                        <span className="font-orbitron font-bold text-xs text-gray-300 block">
                          CAMERA OFF
                        </span>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {cameraError || "Click 'Start Camera' to open live webcam stream."}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>Continuously decodes QR codes</span>
                <span className="text-cyan-400">2.5s Cool-Down Protection</span>
              </div>
            </div>

            {/* COLUMN 2: MANUAL BARCODE INPUT & FEEDBACK */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-cyan-300 font-orbitron font-bold text-xs uppercase flex items-center space-x-1.5">
                    <Search className="w-4 h-4" />
                    <span>Barcode / Reg No Search</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono flex items-center space-x-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Audio Chime ON</span>
                  </span>
                </div>

                <form onSubmit={handleScanSubmit} className="mt-4 space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      disabled={isSessionClosed}
                      placeholder={
                        isSessionClosed
                          ? "SESSION IS CLOSED - Attendance locked"
                          : "Type or scan Reg No / QR payload..."
                      }
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      className={`w-full pl-4 pr-24 py-3 rounded-xl border text-xs font-mono transition-all ${
                        isSessionClosed
                          ? "bg-slate-950 border-red-500/40 text-red-400 cursor-not-allowed"
                          : "bg-slate-950 border-cyan-500/50 text-cyan-300 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isSessionClosed}
                      className="absolute right-2 top-1.5 bottom-1.5 px-3.5 rounded-lg bg-cyan-500 text-black font-orbitron font-bold text-[11px] hover:bg-cyan-400 transition-colors disabled:opacity-50"
                    >
                      MARK
                    </button>
                  </div>
                </form>

                {/* Scan Feedback Banner */}
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-xl border flex items-start space-x-3 text-xs ${
                      feedback.type === "success"
                        ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse"
                        : feedback.type === "warning"
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                        : "bg-red-500/15 border-red-500/40 text-red-300"
                    }`}
                  >
                    {feedback.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-orbitron font-bold block text-xs">{feedback.title}</span>
                      <span className="font-mono text-[10px] mt-0.5 block">{feedback.message}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Attendance Analytics Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex justify-around text-center">
                <div>
                  <span className="text-gray-500 text-[10px] block font-orbitron">PRESENT</span>
                  <span className="font-bold text-emerald-400 text-sm">{presentCount}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-orbitron">ABSENT</span>
                  <span className="font-bold text-red-400 text-sm">{absentCount}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-orbitron">RATE</span>
                  <span className="font-bold text-cyan-300 text-sm">{presentPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* SESSION PARTICIPANTS ROSTER TABLE (ALL / PRESENT / ABSENT) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <h3 className="font-orbitron font-bold text-xs text-cyan-300 flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>SESSION PARTICIPANT ROSTER</span>
              </h3>

              {/* Filter Tabs: Present / Absent / All */}
              <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-orbitron font-bold">
                <button
                  type="button"
                  onClick={() => setRosterFilter("present")}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer ${
                    rosterFilter === "present"
                      ? "bg-emerald-500 text-black shadow-[0_0_10px_#10b981]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>PRESENT ({presentCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRosterFilter("absent")}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer ${
                    rosterFilter === "absent"
                      ? "bg-red-600 text-white shadow-[0_0_10px_#ef4444]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>ABSENT ({absentCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRosterFilter("all")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    rosterFilter === "all"
                      ? "bg-cyan-500 text-black shadow-[0_0_10px_#00f3ff]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  ALL ({totalRegistered})
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-cyan-400 font-orbitron text-[10px] uppercase border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">Reg Number</th>
                      <th className="py-2.5 px-4">Dept / Year</th>
                      <th className="py-2.5 px-4 text-right">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-gray-200">
                    {filteredRoster.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500 font-orbitron">
                          NO PARTICIPANTS FOUND FOR THIS FILTER
                        </td>
                      </tr>
                    ) : (
                      filteredRoster.map((student, i) => {
                        const isPresent =
                          presentKeysSet.has(student.registerNumber.toLowerCase().trim()) ||
                          presentKeysSet.has(student.id.toLowerCase().trim());

                        const scanRecord = sessionRecords.find(
                          (r) =>
                            (r.registerNumber &&
                              r.registerNumber.toLowerCase().trim() ===
                                student.registerNumber.toLowerCase().trim()) ||
                            (r.regId && r.regId.toLowerCase().trim() === student.id.toLowerCase().trim())
                        );

                        return (
                          <tr key={student.id} className="hover:bg-cyan-500/5">
                            <td className="py-2.5 px-4 text-gray-400">{i + 1}</td>
                            <td className="py-2.5 px-4 font-bold text-gray-100">{student.name}</td>
                            <td className="py-2.5 px-4 text-cyan-300 font-bold">{student.registerNumber}</td>
                            <td className="py-2.5 px-4 text-gray-400">
                              {student.department} ({student.year})
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              {isPresent ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>
                                    PRESENT (
                                    {scanRecord && scanRecord.scannedAt
                                      ? new Date(scanRecord.scannedAt).toLocaleTimeString("en-IN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "Scanned"}
                                    )
                                  </span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold bg-red-500/10 border border-red-500/30 text-red-400">
                                  <XCircle className="w-3 h-3" />
                                  <span>{isSessionClosed ? "ABSENT (CLOSED)" : "ABSENT"}</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
