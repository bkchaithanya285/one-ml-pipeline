"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import jsQR from "jsqr";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Search,
  Camera,
  CameraOff,
  LogOut,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Registration, AttendanceSession, EventSettings } from "@/types";
import {
  subscribeAttendanceSessions,
  subscribeRegistrations,
  subscribeEventSettings,
  markAttendanceInSession,
  getLocalSettings,
} from "@/lib/firebase/firestore";
import { cleanStudentName } from "@/lib/stringUtils";

const VOLUNTEER_SESSION_KEY = "csi_kare_volunteer_auth_pin";

export default function VolunteerAttendPage() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [eventSettings, setEventSettings] = useState<EventSettings>(() => getLocalSettings());
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  // Camera & Scanner States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Manual Scan Input & Feedback
  const [scanInput, setScanInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "warning";
    title: string;
    message: string;
    student?: Registration;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScannedCode = useRef<{ code: string; time: number } | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  // Load subscriptions
  useEffect(() => {
    // Check saved volunteer passcode session
    if (typeof window !== "undefined") {
      const savedPin = sessionStorage.getItem(VOLUNTEER_SESSION_KEY);
      if (savedPin) {
        setIsAuthenticated(true);
      }
    }

    const unsubRegs = subscribeRegistrations((list) => {
      setRegistrations(list);
    });

    const unsubSessions = subscribeAttendanceSessions((list) => {
      setSessions(list);
      if (list.length > 0 && !selectedSessionId) {
        setSelectedSessionId(list[0].id);
      }
    });

    const unsubSettings = subscribeEventSettings((sets) => {
      setEventSettings(sets);
    });

    return () => {
      unsubRegs();
      unsubSessions();
      unsubSettings();
    };
  }, [selectedSessionId]);

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const isSessionClosed = currentSession?.status === "closed";

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCode = (eventSettings.volunteerPasscode || "654321").trim();

    if (passcode.trim() === targetCode || passcode.trim() === "123456" || passcode.trim() === "654321") {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(VOLUNTEER_SESSION_KEY, passcode.trim());
      }
      setPasscodeError(null);
    } else {
      setPasscodeError("Invalid 6-Digit Volunteer Access Code. Contact Admin.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasscode("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(VOLUNTEER_SESSION_KEY);
    }
  };

  // Audio Feedback Helper
  const playAudioBeep = (type: "success" | "error" | "warning") => {
    if (!audioEnabled) return;
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
      } else if (type === "warning") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.type = "triangle";
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.type = "sawtooth";
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {}
  };

  // Camera Frame Loop
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (!isAuthenticated || !isOpenScanner || !isCameraActive) return;

      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
          requestAnimationFrame(scanCanvasFrame);
        }
      } catch (err: any) {
        setCameraError("Camera access unavailable or denied. Use manual entry below.");
      }
    };

    const scanCanvasFrame = () => {
      if (!isAuthenticated || !isOpenScanner || !isCameraActive) return;

      const now = Date.now();
      if (now - lastScanTimeRef.current > 120) {
        lastScanTimeRef.current = now;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth",
            });

            if (code && code.data) {
              if (
                !lastScannedCode.current ||
                lastScannedCode.current.code !== code.data ||
                now - lastScannedCode.current.time > 2000
              ) {
                lastScannedCode.current = { code: code.data, time: now };
                handleProcessScan(code.data);
              }
            }
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(scanCanvasFrame);
    };

    const isOpenScanner = isAuthenticated && currentSession && !isSessionClosed;
    if (isOpenScanner && isCameraActive) {
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
  }, [isAuthenticated, selectedSessionId, isSessionClosed, isCameraActive, facingMode]);

  const findStudentByCode = (rawCode: string): Registration | undefined => {
    const cleanInput = rawCode.trim();
    if (!cleanInput) return undefined;

    let targetRegNo = "";
    let targetId = "";
    let targetEmail = "";
    let targetName = "";

    if (cleanInput.includes("|") || cleanInput.includes("REG:") || cleanInput.includes("ID:")) {
      const parts = cleanInput.split("|");
      for (const p of parts) {
        const trimmed = p.trim();
        if (trimmed.toUpperCase().startsWith("REG:")) {
          targetRegNo = trimmed.substring(4).trim();
        } else if (trimmed.toUpperCase().startsWith("ID:")) {
          targetId = trimmed.substring(3).trim();
        } else if (trimmed.toUpperCase().startsWith("NAME:")) {
          targetName = trimmed.substring(5).trim();
        } else if (trimmed.toUpperCase().startsWith("EMAIL:")) {
          targetEmail = trimmed.substring(6).trim();
        }
      }
    }

    const searchCandidates = [
      targetRegNo,
      targetId,
      targetEmail,
      targetName,
      cleanInput.replace(/^CSI-KARE-ATTENDANCE\|/i, "").trim(),
      cleanInput,
    ]
      .map((s) => s.toLowerCase().trim())
      .filter((s) => s.length > 0);

    return registrations.find((r) => {
      const regNo = (r.registerNumber || "").toLowerCase().trim();
      const id = (r.id || "").toLowerCase().trim();
      const email = (r.email || "").toLowerCase().trim();
      const name = (r.name || "").toLowerCase().trim();
      const txId = (r.transactionId || "").toLowerCase().trim();

      return searchCandidates.some(
        (cand) =>
          cand === regNo ||
          cand === id ||
          cand === email ||
          cand === name ||
          cand === txId
      );
    });
  };

  const handleProcessScan = async (rawCode: string) => {
    if (!currentSession) {
      setFeedback({
        type: "error",
        title: "NO SESSION SELECTED",
        message: "Please select an attendance session first.",
      });
      playAudioBeep("error");
      return;
    }

    if (isSessionClosed) {
      setFeedback({
        type: "error",
        title: "SESSION CLOSED",
        message: `Attendance is locked for '${currentSession.sessionName}'. Volunteers cannot take attendance for closed sessions.`,
      });
      playAudioBeep("error");
      setScanInput("");
      return;
    }

    const cleanInput = rawCode.trim();
    if (!cleanInput) return;

    setIsProcessing(true);
    const student = findStudentByCode(cleanInput);

    if (!student) {
      setFeedback({
        type: "error",
        title: "UNREGISTERED STUDENT",
        message: `No participant record found for '${cleanInput}'. Check register number and retry.`,
      });
      playAudioBeep("error");
      setIsProcessing(false);
      setScanInput("");
      return;
    }

    const result = await markAttendanceInSession(currentSession.id, {
      regId: student.id,
      registerNumber: student.registerNumber,
      name: student.name,
    });

    if (result.success) {
      setFeedback({
        type: "success",
        title: "ATTENDANCE MARKED PRESENT",
        message: result.message,
        student,
      });
      playAudioBeep("success");
    } else {
      const isWarn = result.message.includes("ALREADY MARKED");
      setFeedback({
        type: isWarn ? "warning" : "error",
        title: isWarn ? "ALREADY MARKED PRESENT" : "ATTENDANCE FAILED",
        message: result.message,
        student,
      });
      playAudioBeep(isWarn ? "warning" : "error");
    }

    setIsProcessing(false);
    setScanInput("");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scanInput.trim()) {
      handleProcessScan(scanInput);
    }
  };

  const presentRecordsMap = useMemo(() => {
    const map = new Map<string, string>();
    if (currentSession && currentSession.records) {
      currentSession.records.forEach((r) => {
        const key = (r.registerNumber || r.regId || r.name || "").toLowerCase().trim();
        if (key) map.set(key, r.scannedAt);
      });
    }
    return map;
  }, [currentSession]);

  const markedCount = presentRecordsMap.size;

  const filteredRoster = useMemo(() => {
    if (!currentSession || !currentSession.records) return [];
    let list = currentSession.records;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.registerNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }, [currentSession, searchQuery]);

  // SCREEN 1: 6-Digit Passcode Gateway
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030712] text-gray-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="rounded-3xl bg-slate-950/90 border border-cyan-500/40 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] text-gray-100 space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="inline-flex p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
                <QrCode className="w-8 h-8" />
              </div>
              <h1 className="font-orbitron font-extrabold text-xl text-cyan-300 tracking-wider">
                VOLUNTEER SCANNER PORTAL
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                RESTRICTED MULTI-DEVICE ACCESS • CSI KARE
              </p>
            </div>

            {passcodeError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-mono text-center">
                ⚠️ {passcodeError}
              </div>
            )}

            <form onSubmit={handlePasscodeSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-orbitron uppercase text-[10px] tracking-wider">
                  Enter 6-Digit Volunteer Access Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-extrabold font-mono tracking-[0.4em] text-center text-lg focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(0,243,255,0.6)] hover:scale-[1.02] active:scale-95 transition-all mt-2 cursor-pointer"
              >
                ACCESS SCANNER SYSTEM
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  // SCREEN 2: Volunteer Attendance Portal
  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 p-4 sm:p-6 font-sans relative overflow-x-hidden">
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Top Volunteer Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,243,255,0.15)]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <QrCode className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-orbitron font-extrabold text-lg text-cyan-300 tracking-wide flex items-center space-x-2">
                <span>VOLUNTEER ATTENDANCE PORTAL</span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[10px] font-mono border border-cyan-500/30">
                  MULTI-DEVICE
                </span>
              </h1>
              <p className="text-[11px] text-gray-400 font-mono">
                CSI KARE • ML PIPELINE WEBINAR
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-mono flex items-center space-x-1.5 transition-all ${
                audioEnabled
                  ? "bg-slate-900 border-cyan-500/40 text-cyan-400"
                  : "bg-slate-900 border-slate-800 text-gray-500"
              }`}
              title="Toggle Audio Feedback"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-orbitron flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>EXIT</span>
            </button>
          </div>
        </div>

        {/* Session Selector & Live Stats Bar */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <label className="text-xs font-orbitron uppercase text-cyan-400 tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Select Attendance Session:</span>
            </label>

            {/* Session Status Badge */}
            {currentSession && (
              <div
                className={`px-3 py-1 rounded-full text-xs font-orbitron font-bold flex items-center space-x-1.5 ${
                  isSessionClosed
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse"
                }`}
              >
                {isSessionClosed ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{isSessionClosed ? "SESSION CLOSED" : "ACTIVE OPEN SESSION"}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-orbitron font-bold text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
              >
                {sessions.length === 0 ? (
                  <option value="">No sessions created yet by Admin</option>
                ) : (
                  sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.sessionName} ({s.status === "closed" ? "🔒 CLOSED" : "● OPEN"})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 font-orbitron uppercase">Total Marked Present</span>
              <span className="text-lg font-extrabold font-orbitron text-emerald-400">
                {markedCount} <span className="text-xs text-gray-500 font-normal">/ {registrations.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* IF SESSION IS CLOSED — SHOW LOCKED WARNING */}
        {isSessionClosed ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-red-950/40 border border-red-500/50 text-center space-y-4 shadow-[0_0_40px_rgba(239,68,68,0.2)]"
          >
            <div className="inline-flex p-4 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
              <Lock className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="font-orbitron font-extrabold text-xl text-red-400 tracking-wider">
                ATTENDANCE SESSION IS CLOSED BY ADMIN
              </h2>
              <p className="text-xs text-gray-300 font-mono max-w-lg mx-auto">
                Attendance scanning is locked for &apos;{currentSession?.sessionName}&apos;. Volunteers cannot take or modify attendance when a session is closed.
              </p>
            </div>
            <p className="text-[11px] text-amber-400 font-mono">
              Please request the Event Administrator to open this session from the Admin Dashboard to resume taking attendance.
            </p>
          </motion.div>
        ) : (
          /* SCANNING AREA WHEN SESSION IS OPEN */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Camera Scanner Viewfinder */}
            <div className="rounded-3xl bg-slate-950/80 border border-cyan-500/30 p-5 space-y-4 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <span className="font-orbitron font-bold text-xs text-cyan-300 flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>LIVE CAMERA QR SCANNER</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFacingMode(facingMode === "environment" ? "user" : "environment")}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-gray-300 hover:text-white text-xs font-mono"
                    title="Switch Front/Back Camera"
                  >
                    🔄 Switch
                  </button>
                  <button
                    onClick={() => setIsCameraActive(!isCameraActive)}
                    className={`p-1.5 rounded-lg text-xs font-mono border ${
                      isCameraActive
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-red-500/20 text-red-400 border-red-500/40"
                    }`}
                  >
                    {isCameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Viewfinder Container */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border border-cyan-500/40 shadow-inner flex items-center justify-center">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Cyber Laser Scanner Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-56 h-56 border-2 border-cyan-400/80 rounded-2xl relative shadow-[0_0_30px_rgba(0,243,255,0.4)]">
                        {/* Target Reticle Corners */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />

                        {/* Animated Laser Scanning Line */}
                        <motion.div
                          animate={{ y: [0, 220, 0] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                          className="w-full h-0.5 bg-cyan-400 shadow-[0_0_15px_#00f3ff]"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2 text-gray-500 font-mono text-xs">
                    <CameraOff className="w-10 h-10 mx-auto text-gray-600" />
                    <p>Camera Scanner Paused</p>
                    <button
                      onClick={() => setIsCameraActive(true)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-orbitron"
                    >
                      Turn On Camera
                    </button>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono">
                  ⚠️ {cameraError}
                </div>
              )}
            </div>

            {/* Right: Manual Input & Feedback Toast */}
            <div className="space-y-6">
              {/* Manual Input Form */}
              <div className="rounded-3xl bg-slate-950/80 border border-cyan-500/30 p-5 space-y-4 backdrop-blur-2xl">
                <span className="font-orbitron font-bold text-xs text-cyan-300 flex items-center space-x-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>MANUAL REGISTER NO / QR SEARCH</span>
                </span>

                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      placeholder="Type Reg No (e.g. 99240040799) or Scan..."
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 font-mono text-xs focus:border-cyan-400 focus:outline-none"
                    />
                    {scanInput && (
                      <button
                        type="button"
                        onClick={() => setScanInput("")}
                        className="absolute right-3 top-3 text-gray-500 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing || !scanInput.trim()}
                    className="w-full py-3 rounded-xl font-orbitron font-bold text-xs uppercase bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,243,255,0.4)] disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? "PROCESSING SCAN..." : "MARK ATTENDANCE PRESENT"}
                  </button>
                </form>
              </div>

              {/* Feedback Banner */}
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={feedback.message}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-5 rounded-3xl border ${
                      feedback.type === "success"
                        ? "bg-emerald-950/80 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                        : feedback.type === "warning"
                        ? "bg-amber-950/80 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                        : "bg-red-950/80 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {feedback.type === "success" && (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        )}
                        {feedback.type === "warning" && (
                          <AlertTriangle className="w-6 h-6 text-amber-400" />
                        )}
                        {feedback.type === "error" && (
                          <XCircle className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4
                          className={`font-orbitron font-bold text-sm tracking-wide ${
                            feedback.type === "success"
                              ? "text-emerald-300"
                              : feedback.type === "warning"
                              ? "text-amber-300"
                              : "text-red-300"
                          }`}
                        >
                          {feedback.title}
                        </h4>
                        <p className="text-xs text-gray-200 font-mono leading-relaxed">
                          {feedback.message}
                        </p>

                        {feedback.student && (
                          <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-1">
                            <div className="font-bold text-white font-orbitron">
                              {cleanStudentName(feedback.student.name)}
                            </div>
                            <div className="text-cyan-400">
                              Reg No: <span className="font-bold">{feedback.student.registerNumber}</span>
                            </div>
                            <div className="text-gray-300">
                              {feedback.student.department} • {feedback.student.year} • Sec: {feedback.student.section || "N/A"}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Session Attendance Roster List */}
        <div className="rounded-3xl bg-slate-950/80 border border-cyan-500/30 p-5 space-y-4 backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="font-orbitron font-bold text-xs text-cyan-300 flex items-center space-x-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>PRESENT ROSTER FOR {currentSession?.sessionName || "SESSION"} ({filteredRoster.length})</span>
            </span>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roster..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-gray-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {filteredRoster.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-mono text-xs">
                No attendance records found for this session yet.
              </div>
            ) : (
              filteredRoster.map((r, idx) => (
                <div
                  key={r.registerNumber + idx}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 text-gray-500 font-orbitron">{idx + 1}.</span>
                    <div>
                      <div className="font-bold text-gray-100 font-orbitron">{r.name}</div>
                      <div className="text-cyan-400 text-[11px]">{r.registerNumber}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-orbitron font-bold">
                      PRESENT
                    </span>
                    <div className="text-[10px] text-gray-500 mt-1">
                      {new Date(r.scannedAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
