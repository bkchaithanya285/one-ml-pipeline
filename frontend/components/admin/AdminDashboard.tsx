"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  PieChart,
  DollarSign,
  TrendingUp,
  Settings,
  QrCode,
  LogOut,
  Power,
  UserCheck,
} from "lucide-react";
import { Registration, EventSettings } from "@/types";
import { RegistrationsTable } from "./RegistrationsTable";
import { EventSettingsModal } from "./EventSettingsModal";
import { QrManagerModal } from "./QrManagerModal";
import { AttendanceScannerModal } from "./AttendanceScannerModal";
import {
  subscribeRegistrations,
  subscribeEventSettings,
  approveRegistration,
  rejectRegistration,
  deleteRegistration,
  deleteAllRegistrations,
  updateEventSettings,
} from "@/lib/firebase/firestore";

interface AdminDashboardProps {
  onSignOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSignOut }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [settings, setSettings] = useState<EventSettings | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  useEffect(() => {
    const unsubRegs = subscribeRegistrations((list) => {
      setRegistrations(list);
    });

    const unsubSettings = subscribeEventSettings((sets) => {
      setSettings(sets);
    });

    return () => {
      unsubRegs();
      unsubSettings();
    };
  }, []);

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-cyan-400 font-orbitron">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>LOADING SECURE ADMIN SYSTEM...</span>
        </div>
      </div>
    );
  }

  // Calculations
  const totalRegistrations = registrations.length;
  const approvedCount = registrations.filter((r) => r.paymentStatus === "Approved").length;
  const pendingCount = registrations.filter((r) => r.paymentStatus === "Pending").length;

  const remainingSpots = Math.max(0, settings.maxSpots - (approvedCount + pendingCount));

  const todayStr = new Date().toISOString().split("T")[0];
  const todaysRegistrations = registrations.filter((r) =>
    r.createdAt.startsWith(todayStr)
  ).length;

  const handleToggleStatus = () => {
    updateEventSettings({
      registrationEnabled: !settings.registrationEnabled,
    });
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 p-4 sm:p-8 font-sans relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Top Command Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,243,255,0.15)]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <h1 className="font-orbitron font-extrabold text-xl sm:text-2xl text-cyan-300 tracking-wider">
                ADMIN CONTROL CENTER
              </h1>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-1">
              CSI KARE • ONE COMPLETE MACHINE LEARNING PIPELINE
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAttendanceOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-orbitron font-bold text-xs flex items-center space-x-2 shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Attendance Sessions</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-orbitron font-bold text-xs flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Event Settings</span>
            </button>

            <button
              onClick={() => setIsQrOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-orbitron font-bold text-xs flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Code</span>
            </button>

            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2.5 rounded-xl font-orbitron font-bold text-xs flex items-center space-x-2 shadow-md cursor-pointer ${
                settings.registrationEnabled
                  ? "bg-emerald-500 text-black shadow-[0_0_15px_#10b981]"
                  : "bg-red-600 text-white"
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{settings.registrationEnabled ? "STATUS: OPEN" : "STATUS: CLOSED"}</span>
            </button>

            <button
              onClick={onSignOut}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
              title="Sign Out Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Premium Holographic Statistic Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,243,255,0.1)] group"
          >
            <div className="flex items-center justify-between text-cyan-400">
              <span className="text-[11px] font-orbitron font-semibold text-gray-400 uppercase">
                👥 Total Registrations
              </span>
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-3 font-orbitron font-extrabold text-3xl text-cyan-300 text-neon-glow">
              {totalRegistrations}
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-1 flex justify-between">
              <span>Approved: {approvedCount}</span>
              <span>Pending: {pendingCount}</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-5 rounded-2xl bg-slate-950/80 border border-blue-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.1)] group"
          >
            <div className="flex items-center justify-between text-blue-400">
              <span className="text-[11px] font-orbitron font-semibold text-gray-400 uppercase">
                📌 Remaining Spots
              </span>
              <PieChart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-3 font-orbitron font-extrabold text-3xl text-blue-400 text-blue-glow">
              {remainingSpots} <span className="text-xs text-gray-500 font-normal">/ {settings.maxSpots}</span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-1">
              Cap: {settings.maxSpots} Participants
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.1)] group"
          >
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-[11px] font-orbitron font-semibold text-gray-400 uppercase">
                📈 Today's Registrations
              </span>
              <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-3 font-orbitron font-extrabold text-3xl text-purple-300 text-purple-glow">
              +{todaysRegistrations}
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-1">
              Live submission rate
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.1)] group"
          >
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[11px] font-orbitron font-semibold text-gray-400 uppercase">
                💰 Fee & Venue
              </span>
              <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-3 font-orbitron font-extrabold text-2xl text-amber-300">
              ₹{settings.fee}
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-1 truncate">
              📍 {settings.venue}
            </div>
          </motion.div>
        </div>

        {/* Main Data Section: Registrations Table */}
        <div className="space-y-4">
          <h2 className="font-orbitron font-extrabold text-lg text-cyan-300 flex items-center space-x-2">
            <span>STUDENT REGISTRATION RECORDS</span>
            <span className="text-xs font-mono text-gray-400">({registrations.length} Total)</span>
          </h2>

          <RegistrationsTable
            registrations={registrations}
            onApprove={approveRegistration}
            onReject={rejectRegistration}
            onDelete={deleteRegistration}
            onDeleteAll={deleteAllRegistrations}
          />
        </div>
      </div>

      <AttendanceScannerModal
        isOpen={isAttendanceOpen}
        registrations={registrations}
        onClose={() => setIsAttendanceOpen(false)}
      />

      <EventSettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={updateEventSettings}
      />

      <QrManagerModal
        currentQrUrl={settings.qrCodeUrl}
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        onUpdateQr={(newUrl) => updateEventSettings({ qrCodeUrl: newUrl })}
      />
    </div>
  );
};
