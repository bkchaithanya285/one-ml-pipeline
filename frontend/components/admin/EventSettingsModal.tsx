"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save, X, Lock } from "lucide-react";
import { EventSettings } from "@/types";

interface EventSettingsModalProps {
  settings: EventSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<EventSettings>) => void;
}

export const EventSettingsModal: React.FC<EventSettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formState, setFormState] = useState<EventSettings>(settings);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-slate-950 rounded-3xl border border-cyan-500/40 p-6 sm:p-8 text-gray-100 shadow-[0_0_50px_rgba(0,243,255,0.2)] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h3 className="font-orbitron font-extrabold text-lg text-cyan-300">
              Event Configuration Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="my-6 space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Event Name (LOCKED / READ-ONLY) */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-gray-400 font-orbitron flex items-center justify-between">
                <span>Event Name</span>
                <span className="text-[10px] text-amber-400 font-mono flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>PERMANENT / READ-ONLY</span>
                </span>
              </label>
              <input
                type="text"
                disabled
                value={formState.eventName}
                className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-cyan-300 font-bold font-orbitron opacity-90 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-orbitron">Group / Organized By</label>
              <input
                type="text"
                value={formState.group}
                onChange={(e) =>
                  setFormState({ ...formState, group: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-gray-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-orbitron">Event Date</label>
              <input
                type="text"
                value={formState.eventDate}
                onChange={(e) =>
                  setFormState({ ...formState, eventDate: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-gray-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-orbitron">Venue</label>
              <input
                type="text"
                value={formState.venue}
                onChange={(e) =>
                  setFormState({ ...formState, venue: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-gray-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-orbitron">Registration Fee (₹)</label>
              <input
                type="number"
                value={formState.fee}
                onChange={(e) =>
                  setFormState({ ...formState, fee: Number(e.target.value) })
                }
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 font-bold text-cyan-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-orbitron">Official UPI VPA ID</label>
              <input
                type="text"
                placeholder="csikare@upi or 9876543210@ybl"
                value={formState.upiId || ""}
                onChange={(e) =>
                  setFormState({ ...formState, upiId: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold font-mono"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-gray-400 font-orbitron flex items-center justify-between">
                <span>Volunteer 6-Digit Passcode</span>
                <span className="text-[10px] text-cyan-400">Used for URL/attend volunteer scanner access</span>
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="654321"
                value={formState.volunteerPasscode || "654321"}
                onChange={(e) =>
                  setFormState({ ...formState, volunteerPasscode: e.target.value.trim() })
                }
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-extrabold font-mono tracking-widest text-base"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-gray-400 font-orbitron">Maximum Spots</label>
              <input
                type="number"
                value={formState.maxSpots}
                onChange={(e) =>
                  setFormState({ ...formState, maxSpots: Number(e.target.value) })
                }
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-gray-100 font-bold text-cyan-300"
              />
            </div>
          </div>

          {/* Registration Active Toggle */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-orbitron font-bold text-sm text-gray-200 block">
                Registration Status
              </span>
              <span className="text-[10px] text-gray-400">
                Toggle to manually open or close student registrations
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormState({
                  ...formState,
                  registrationEnabled: !formState.registrationEnabled,
                })
              }
              className={`px-4 py-2 rounded-xl font-orbitron font-bold text-xs ${
                formState.registrationEnabled
                  ? "bg-emerald-500 text-black shadow-[0_0_15px_#10b981]"
                  : "bg-red-600 text-white"
              }`}
            >
              {formState.registrationEnabled ? "OPEN" : "CLOSED"}
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-orbitron text-xs text-gray-400 bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs bg-cyan-500 text-black shadow-[0_0_20px_#00f3ff] flex items-center space-x-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
