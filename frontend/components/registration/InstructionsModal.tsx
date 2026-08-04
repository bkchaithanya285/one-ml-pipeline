"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, ShieldAlert, ArrowRight, X } from "lucide-react";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const instructions = [
    "Enter your name exactly as it appears in the SIS Portal.",
    "The same name will be printed on your participation certificate.",
    "No corrections to the name will be accepted after registration.",
    "Verify your Register Number carefully.",
    "Ensure your phone number is correct.",
    "Use only your official @klu.ac.in email account.",
    "Registration Fee is ₹100.",
    "Upload a clear payment screenshot.",
    "Registration is completed only after successful payment submission.",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-6 bg-black/90 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[82vh] sm:max-h-[88vh] flex flex-col rounded-3xl bg-slate-950/95 border border-cyan-500/40 shadow-[0_0_60px_rgba(0,243,255,0.3)] p-4 sm:p-7 text-gray-100 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-gray-400 hover:text-cyan-400 bg-slate-900 border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex-shrink-0 flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex-shrink-0">
            <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h2 className="font-orbitron font-extrabold text-base sm:text-2xl text-cyan-300">
              📋 Important Instructions
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
              READ CAREFULLY BEFORE PROCEEDING TO REGISTRATION
            </p>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto min-h-0 my-3 pr-1 sm:pr-2 space-y-2.5 custom-scrollbar">
          {instructions.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex items-start space-x-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition-colors"
            >
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] sm:text-xs font-orbitron font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
                {item}
              </p>
            </motion.div>
          ))}

          {/* Warning Box inside scroll area */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2.5 mt-3">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-amber-200 leading-relaxed font-mono">
              Note: Incorrect details or non-@klu.ac.in email addresses will result in automatic rejection of the registration.
            </p>
          </div>
        </div>

        {/* Sticky/Pinned Modal Footer: Checkbox & Proceed Action Buttons */}
        <div className="flex-shrink-0 pt-3 border-t border-slate-800 bg-slate-950 space-y-3">
          <div
            className="flex items-center space-x-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-cyan-500/40 cursor-pointer hover:border-cyan-300 transition-colors"
            onClick={() => setIsChecked(!isChecked)}
          >
            <input
              type="checkbox"
              id="instruction-checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-5 h-5 rounded border-cyan-400 text-cyan-500 focus:ring-cyan-400 bg-slate-950 cursor-pointer flex-shrink-0"
            />
            <label
              htmlFor="instruction-checkbox"
              className="text-xs sm:text-sm text-cyan-300 font-semibold cursor-pointer select-none leading-snug"
            >
              I have read and understood all the instructions.
            </label>
          </div>

          <div className="flex items-center justify-between space-x-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-xl font-orbitron text-xs text-gray-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors flex-shrink-0"
            >
              Cancel
            </button>

            <button
              disabled={!isChecked}
              onClick={onContinue}
              className={`flex-1 sm:flex-initial px-5 sm:px-7 py-3 rounded-xl font-orbitron font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-300 ${
                isChecked
                  ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white shadow-[0_0_30px_rgba(0,243,255,0.7)] hover:scale-[1.02] active:scale-95 cursor-pointer"
                  : "bg-slate-800 text-gray-500 cursor-not-allowed opacity-60"
              }`}
            >
              <span>Continue Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
