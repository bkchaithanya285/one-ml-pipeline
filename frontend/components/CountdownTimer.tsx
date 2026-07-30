"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  deadlineIso?: string; // e.g. "2026-08-08T23:59:59"
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  deadlineIso = "2026-08-08T23:59:59",
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const targetDate = new Date(deadlineIso).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadlineIso]);

  return (
    <div className="w-full max-w-xl mx-auto my-8">
      <div className="text-center mb-4 flex items-center justify-center space-x-2">
        <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
        <span className="font-orbitron font-bold text-xs uppercase tracking-widest text-cyan-300">
          Registration Ends In
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "DAYS", value: timeLeft.days },
          { label: "HOURS", value: timeLeft.hours },
          { label: "MINUTES", value: timeLeft.minutes },
          { label: "SECONDS", value: timeLeft.seconds },
        ].map((unit, idx) => (
          <motion.div
            key={unit.label}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/20 backdrop-blur-xl shadow-[0_0_15px_rgba(0,243,255,0.1)] group hover:border-cyan-400/50 transition-colors"
          >
            <span className="font-orbitron font-extrabold text-2xl sm:text-4xl text-cyan-400 text-neon-glow">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-xs font-mono text-gray-400 mt-1 tracking-wider">
              {unit.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
