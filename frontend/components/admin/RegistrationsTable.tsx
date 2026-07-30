"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  ZoomIn,
  ExternalLink,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  X,
  AlertOctagon,
  Hash,
} from "lucide-react";
import { Registration } from "@/types";
import { exportToExcel, exportToCSV } from "@/lib/exportUtils";

interface RegistrationsTableProps {
  registrations: Registration[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
}

export const RegistrationsTable: React.FC<RegistrationsTableProps> = ({
  registrations,
  onApprove,
  onReject,
  onDelete,
  onDeleteAll,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [yearFilter, setYearFilter] = useState<string>("ALL");

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const [rejectingRegId, setRejectingRegId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deletingRegId, setDeletingRegId] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        reg.name.toLowerCase().includes(search) ||
        reg.registerNumber.toLowerCase().includes(search) ||
        (reg.transactionId && reg.transactionId.toLowerCase().includes(search)) ||
        reg.email.toLowerCase().includes(search) ||
        reg.phone.includes(search);

      const matchesStatus =
        statusFilter === "ALL" || reg.paymentStatus === statusFilter;
      const matchesDept =
        deptFilter === "ALL" || reg.department === deptFilter;
      const matchesYear = yearFilter === "ALL" || reg.year === yearFilter;

      return matchesSearch && matchesStatus && matchesDept && matchesYear;
    });
  }, [registrations, searchTerm, statusFilter, deptFilter, yearFilter]);

  const handleConfirmReject = () => {
    if (!rejectingRegId || !rejectReason.trim()) return;
    onReject(rejectingRegId, rejectReason.trim());
    setRejectingRegId(null);
    setRejectReason("");
  };

  const handleConfirmDelete = () => {
    if (!deletingRegId) return;
    onDelete(deletingRegId);
    setDeletingRegId(null);
  };

  const handleConfirmDeleteAll = () => {
    onDeleteAll();
    setShowDeleteAllModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            placeholder="Search by Name, Reg No, Transaction ID, Email, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-gray-200 focus:border-cyan-400 font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-gray-200 font-mono"
          >
            <option value="ALL">Status: All</option>
            <option value="Pending">Status: Pending</option>
            <option value="Approved">Status: Approved</option>
            <option value="Rejected">Status: Rejected</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-gray-200 font-mono"
          >
            <option value="ALL">Dept: All</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
            <option value="BIO">BIO</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-gray-200 font-mono"
          >
            <option value="ALL">Year: All</option>
            <option value="II Year">II Year</option>
            <option value="III Year">III Year</option>
            <option value="IV Year">IV Year</option>
          </select>
        </div>

        {/* Export & Delete All Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportToExcel(filteredRegistrations)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-xs font-orbitron font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => exportToCSV(filteredRegistrations)}
            className="px-3.5 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-400 text-xs font-orbitron font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => setShowDeleteAllModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-400 hover:text-white text-xs font-orbitron font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <Trash2 className="w-4 h-4" />
            <span>DELETE ALL</span>
          </button>
        </div>
      </div>

      {/* Registrations Data Table */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-cyan-300 font-orbitron text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Student Details</th>
                <th className="py-3.5 px-4">Reg No</th>
                <th className="py-3.5 px-4">UPI / UTR Txn ID</th>
                <th className="py-3.5 px-4">Dept / Year</th>
                <th className="py-3.5 px-4">Payment Proof</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted At</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-gray-200">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 font-orbitron">
                    NO REGISTRATION RECORDS FOUND
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg, index) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-cyan-500/5 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-gray-400">{index + 1}</td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-100">{reg.name}</div>
                      <div className="text-[10px] text-gray-400">{reg.email}</div>
                      <div className="text-[10px] text-cyan-400/80">{reg.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-cyan-300">
                      {reg.registerNumber}
                    </td>

                    {/* Transaction ID Column */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-bold text-amber-300 block max-w-[140px] truncate" title={reg.transactionId}>
                        {reg.transactionId || "N/A"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>{reg.department}</div>
                      <div className="text-[10px] text-gray-400">{reg.year}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setPreviewImage(reg.paymentScreenshot)}
                        className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-400 group-hover:scale-105 transition-all flex items-center justify-center bg-slate-900 cursor-pointer"
                      >
                        <Image
                          src={reg.paymentScreenshot}
                          alt="Screenshot Proof"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-cyan-400">
                          <Eye className="w-4 h-4" />
                        </div>
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-orbitron font-bold border ${
                          reg.paymentStatus === "Approved"
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                            : reg.paymentStatus === "Rejected"
                            ? "bg-red-500/10 border-red-500/40 text-red-400"
                            : "bg-amber-500/10 border-amber-500/40 text-amber-400 animate-pulse"
                        }`}
                      >
                        <span>{reg.paymentStatus}</span>
                      </span>
                      {reg.rejectionReason && (
                        <div className="text-[9px] text-red-400 mt-1 max-w-[120px] truncate" title={reg.rejectionReason}>
                          Reason: {reg.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[10px] text-gray-400">
                      {new Date(reg.createdAt).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {reg.paymentStatus !== "Approved" && (
                          <button
                            onClick={() => onApprove(reg.id)}
                            title="Approve Payment"
                            className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {reg.paymentStatus !== "Rejected" && (
                          <button
                            onClick={() => {
                              setRejectingRegId(reg.id);
                              setRejectReason("");
                            }}
                            title="Reject Payment"
                            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeletingRegId(reg.id)}
                          title="Delete Record"
                          className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-3xl w-full max-h-[90vh] bg-slate-950 rounded-3xl border border-cyan-500/40 p-6 flex flex-col items-center"
            >
              <div className="w-full flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
                <span className="font-orbitron font-bold text-sm text-cyan-300">
                  Payment Proof Screenshot
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-2 rounded-lg bg-slate-900 text-cyan-400 hover:text-white border border-slate-700"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <a
                    href={previewImage}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-2 rounded-lg bg-slate-900 text-cyan-400 hover:text-white border border-slate-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      setPreviewImage(null);
                      setIsZoomed(false);
                    }}
                    className="p-2 rounded-lg bg-slate-900 text-gray-400 hover:text-white border border-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative w-full h-[60vh] overflow-auto flex items-center justify-center bg-slate-900 rounded-2xl p-2">
                <img
                  src={previewImage}
                  alt="Payment Proof"
                  className={`object-contain max-h-full transition-transform duration-300 ${
                    isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {rejectingRegId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 rounded-2xl border border-red-500/40 p-6 space-y-4 text-gray-100"
            >
              <div className="flex items-center space-x-2 text-red-400 font-orbitron font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Reject Registration</span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Please provide a mandatory reason for rejecting this payment screenshot.
              </p>
              <textarea
                rows={3}
                placeholder="e.g. Unclear screenshot, incorrect amount paid..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-gray-200 font-sans focus:border-red-400"
              />
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setRejectingRegId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-orbitron text-gray-400 bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  disabled={!rejectReason.trim()}
                  onClick={handleConfirmReject}
                  className="px-5 py-2 rounded-xl text-xs font-orbitron font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Single Record Modal */}
      <AnimatePresence>
        {deletingRegId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 rounded-2xl border border-red-500/40 p-6 space-y-4 text-gray-100"
            >
              <div className="flex items-center space-x-2 text-red-400 font-orbitron font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirm Permanent Deletion</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Are you sure you want to permanently delete this registration record? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setDeletingRegId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-orbitron text-gray-400 bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-xl text-xs font-orbitron font-bold bg-red-600 hover:bg-red-500 text-white"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete ALL Registrations Modal */}
      <AnimatePresence>
        {showDeleteAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-slate-950 rounded-3xl border border-red-600 p-6 space-y-5 text-gray-100 shadow-[0_0_50px_rgba(239,68,68,0.5)]"
            >
              <div className="flex items-center space-x-3 text-red-500 font-orbitron font-extrabold text-base">
                <AlertOctagon className="w-7 h-7 animate-bounce" />
                <span>DELETE ALL REGISTRATIONS</span>
              </div>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs leading-relaxed">
                ⚠️ <strong>WARNING:</strong> Are you sure you want to permanently delete <strong>ALL {registrations.length} student registrations</strong>? This will clear all participant records and reset the registration count. This operation CANNOT be undone.
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowDeleteAllModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-orbitron text-gray-400 bg-slate-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteAll}
                  className="px-6 py-2.5 rounded-xl text-xs font-orbitron font-bold bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.7)] cursor-pointer"
                >
                  PURGE ALL REGISTRATIONS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
