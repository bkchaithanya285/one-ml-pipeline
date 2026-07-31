"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Edit, User, Phone, Building2, Calendar, Hash, Mail } from "lucide-react";
import { Registration, DepartmentOption, YearOption, ResidencyOption, PaymentStatus } from "@/types";

interface EditRegistrationModalProps {
  registration: Registration;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Registration>) => Promise<void>;
}

export const EditRegistrationModal: React.FC<EditRegistrationModalProps> = ({
  registration,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(registration.name || "");
  const [registerNumber, setRegisterNumber] = useState(registration.registerNumber || "");
  const [email, setEmail] = useState(registration.email || "");
  const [phone, setPhone] = useState(registration.phone || "");
  const [department, setDepartment] = useState<string>(registration.department || "CSE");
  const [year, setYear] = useState<string>(registration.year || "III Year");
  const [section, setSection] = useState(registration.section || "");
  const [residency, setResidency] = useState<string>(registration.residency || "Hosteller");
  const [transactionId, setTransactionId] = useState(registration.transactionId || "");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(registration.paymentStatus || "Pending");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(registration.id, {
        name: name.trim().toUpperCase(),
        registerNumber: registerNumber.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department,
        year,
        section: section.trim().toUpperCase(),
        residency,
        transactionId: transactionId.trim().toUpperCase(),
        paymentStatus,
      });
      onClose();
    } catch (err) {
      alert("Failed to update registration details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-slate-950 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,243,255,0.2)] text-gray-100 relative my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg text-cyan-300">
                  Edit Student Registration
                </h3>
                <p className="text-[11px] text-gray-400 font-mono">
                  ID: {registration.id} • {registration.registerNumber}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-gray-400 font-orbitron uppercase text-[10px]">
                  Full Name (Block Letters)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 font-bold uppercase focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Register Number */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-orbitron uppercase text-[10px]">
                  Register Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    required
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-orbitron uppercase text-[10px]">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-gray-400 font-orbitron uppercase text-[10px]">
                  Email Address (@klu.ac.in)
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

              {/* Department */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-orbitron uppercase text-[10px]">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 focus:border-cyan-400"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="BIO">BIO</option>
                </select>
              </div>

              {/* Academic Year */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-orbitron uppercase text-[10px]">
                  Academic Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 focus:border-cyan-400"
                >
                  <option value="II Year">II Year</option>
                  <option value="III Year">III Year</option>
                  <option value="IV Year">IV Year</option>
                </select>
              </div>

              {/* Section */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-orbitron uppercase text-[10px]">
                  Section (Block Letters)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24S01 or A"
                  value={section}
                  onChange={(e) => setSection(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 font-bold uppercase focus:border-cyan-400"
                />
              </div>

              {/* Residency Status */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-orbitron uppercase text-[10px]">
                  Residency Status
                </label>
                <select
                  value={residency}
                  onChange={(e) => setResidency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 focus:border-cyan-400"
                >
                  <option value="Hosteller">Hosteller</option>
                  <option value="Day Scholar">Day Scholar</option>
                </select>
              </div>

              {/* UPI Transaction ID */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-orbitron uppercase text-[10px]">
                  UPI / UTR Transaction ID
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold focus:border-cyan-400"
                />
              </div>

              {/* Payment Status */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-orbitron uppercase text-[10px]">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 focus:border-cyan-400"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:scale-105 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "SAVING..." : "SAVE CHANGES"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
