"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { User, UserCheck, AlertTriangle, Phone, Building2, Calendar, Lock } from "lucide-react";
import { DepartmentOption, YearOption, ResidencyOption, Registration } from "@/types";
import { checkRegisterNumberExists, getRegistrationByEmailOrUid } from "@/lib/firebase/firestore";
import { signInWithGoogleDomain } from "@/lib/firebase/auth";

const formSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters.")
    .transform((val) => val.toUpperCase()),
  registerNumber: z
    .string()
    .min(8, "Register number must be at least 8 digits/characters.")
    .max(12, "Register number cannot exceed 12 characters."),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number."),
  department: z.enum(
    [
      "CSE",
      "ECE",
      "EEE",
      "MECH",
      "CIVIL",
      "BIO",
    ] as [DepartmentOption, ...DepartmentOption[]],
    { required_error: "Please select your department." }
  ),
  year: z.enum(["II Year", "III Year", "IV Year"] as [YearOption, ...YearOption[]], {
    required_error: "Please select your academic year.",
  }),
  section: z
    .string()
    .min(1, "Please enter your section (e.g. 24S01 or A).")
    .transform((val) => val.toUpperCase()),
  residency: z.enum(["Hosteller", "Day Scholar"] as [ResidencyOption, ...ResidencyOption[]], {
    required_error: "Please select your residency status.",
  }),
});

export type RegistrationFormData = z.infer<typeof formSchema> & {
  email: string;
  uid: string;
};

interface RegistrationFormProps {
  initialGoogleUser?: { email: string; uid: string; displayName?: string } | null;
  onContinue: (data: RegistrationFormData) => void;
  onExistingFound: (record: Registration) => void;
  onCancel: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  initialGoogleUser,
  onContinue,
  onExistingFound,
  onCancel,
}) => {
  const [googleUser, setGoogleUser] = useState<{
    email: string;
    uid: string;
    displayName?: string;
  } | null>(initialGoogleUser || null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [regNumError, setRegNumError] = useState<string | null>(null);
  const [isCheckingRegNum, setIsCheckingRegNum] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  React.useEffect(() => {
    if (initialGoogleUser) {
      setGoogleUser(initialGoogleUser);
    }
  }, [initialGoogleUser]);

  const fullNameValue = watch("fullName") || "";
  const sectionValue = watch("section") || "";

  // Handle Google Sign-In
  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    const { user, error } = await signInWithGoogleDomain();
    setIsAuthenticating(false);

    if (error) {
      setAuthError(error);
      return;
    }

    if (user && user.email) {
      // Check if user already registered
      const existingRecord = await getRegistrationByEmailOrUid(user.email, user.uid);
      if (existingRecord) {
        onExistingFound(existingRecord);
        return;
      }

      setGoogleUser({
        email: user.email,
        uid: user.uid,
        displayName: user.displayName || "",
      });
    }
  };

  // Convert name to BLOCK LETTERS (UPPERCASE) automatically as user types
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uppercaseVal = e.target.value.toUpperCase();
    setValue("fullName", uppercaseVal, { shouldValidate: true });
  };

  // Convert section to BLOCK LETTERS (UPPERCASE) automatically as user types
  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uppercaseVal = e.target.value.toUpperCase();
    setValue("section", uppercaseVal, { shouldValidate: true });
  };

  const onSubmitForm = async (data: z.infer<typeof formSchema>) => {
    if (!googleUser) {
      setAuthError("Google Authentication is required. Please sign in with your @klu.ac.in account.");
      return;
    }

    setIsCheckingRegNum(true);
    setRegNumError(null);

    try {
      const exists = await checkRegisterNumberExists(data.registerNumber);
      if (exists) {
        setRegNumError("This Register Number has already been registered.");
        setIsCheckingRegNum(false);
        return;
      }

      onContinue({
        ...data,
        email: googleUser.email,
        uid: googleUser.uid,
      });
    } catch (e) {
      setRegNumError("Error checking register number. Please try again.");
    } finally {
      setIsCheckingRegNum(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto rounded-3xl bg-slate-950/90 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,243,255,0.15)]"
    >
      <div className="flex items-center space-x-3 pb-6 border-b border-slate-800">
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <UserCheck className="w-7 h-7" />
        </div>
        <div>
          <h2 className="font-orbitron font-extrabold text-xl sm:text-2xl text-cyan-300">
            Student Registration Portal
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            ONE COMPLETE MACHINE LEARNING PIPELINE
          </p>
        </div>
      </div>

      {/* Step 1: Google Authentication Guard */}
      {!googleUser ? (
        <div className="my-8 text-center space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/20 max-w-md mx-auto">
            <Lock className="w-10 h-10 text-cyan-400 mx-auto mb-3 animate-pulse" />
            <h3 className="font-orbitron font-bold text-base text-gray-200">
              Official Email Authentication
            </h3>
            <p className="text-xs text-gray-400 mt-2 font-mono leading-relaxed">
              Please authenticate using your official KLU institutional email address
              (<span className="text-cyan-400 font-semibold">@klu.ac.in</span>).
            </p>

            {authError && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              onClick={handleGoogleAuth}
              disabled={isAuthenticating}
              className="mt-6 w-full py-3 px-4 rounded-xl font-orbitron font-bold text-xs uppercase bg-white text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center space-x-3 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isAuthenticating ? "AUTHENTICATING..." : "SIGN IN WITH GOOGLE"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Step 2: Form Inputs */
        <form onSubmit={handleSubmit(onSubmitForm)} className="my-6 space-y-5">
          {/* Email (Auto-filled & Disabled) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-orbitron font-semibold text-gray-300 uppercase tracking-wider">
              Email Address (Verified Google Account)
            </label>
            <div className="relative">
              <input
                type="email"
                value={googleUser.email}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-cyan-400 font-mono text-sm opacity-90 cursor-not-allowed"
              />
              <span className="absolute right-3 top-3 px-2 py-0.5 text-[10px] font-orbitron bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-full">
                VERIFIED
              </span>
            </div>
          </div>

          {/* Full Name Field (BLOCK LETTERS) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-orbitron font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span>Full Name</span>
              <span className="text-[10px] text-cyan-400 font-mono">AUTO BLOCK LETTERS</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                placeholder="ENTER FULL NAME IN BLOCK LETTERS"
                value={fullNameValue}
                onChange={handleNameChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-gray-100 font-semibold uppercase placeholder-gray-600 text-sm transition-all"
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-400 font-mono mt-1">{errors.fullName.message}</p>
            )}

            {/* MANDATORY WARNING NOTE BELOW NAME FIELD */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed flex items-start space-x-2 mt-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                ⚠️ Enter your name exactly as it appears in the SIS Portal. The same name will be printed on your participation certificate. No corrections will be accepted after registration.
              </span>
            </div>
          </div>

          {/* Register Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-orbitron font-semibold text-gray-300 uppercase tracking-wider">
              Register Number
            </label>
            <input
              type="text"
              placeholder="e.g. 99230041451"
              {...register("registerNumber")}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-gray-100 font-mono text-sm transition-all"
            />
            {errors.registerNumber && (
              <p className="text-xs text-red-400 font-mono mt-1">{errors.registerNumber.message}</p>
            )}
            {regNumError && (
              <p className="text-xs text-red-500 font-mono font-bold mt-1 animate-pulse">
                ⚠️ {regNumError}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-orbitron font-semibold text-gray-300 uppercase tracking-wider">
              Phone Number (10-Digit Mobile)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                {...register("phone")}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-gray-100 font-mono text-sm transition-all"
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-400 font-mono mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Department, Year, Section & Residency Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-orbitron font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Department</span>
              </label>
              <select
                {...register("department")}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-gray-100 font-sans text-sm transition-all"
              >
                <option value="">Select Department</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="BIO">BIO</option>
              </select>
              {errors.department && (
                <p className="text-xs text-red-400 font-mono mt-1">{errors.department.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-orbitron font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Academic Year</span>
              </label>
              <select
                {...register("year")}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-gray-100 font-sans text-sm transition-all"
              >
                <option value="">Select Year</option>
                <option value="II Year">II Year</option>
                <option value="III Year">III Year</option>
                <option value="IV Year">IV Year</option>
              </select>
              {errors.year && (
                <p className="text-xs text-red-400 font-mono mt-1">{errors.year.message}</p>
              )}
            </div>
            
            {/* Section (BLOCK LETTERS) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-orbitron font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                <span>Section</span>
                <span className="text-[10px] text-cyan-400 font-mono">BLOCK LETTERS</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 24S01 or A"
                value={sectionValue}
                onChange={handleSectionChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-gray-100 font-mono uppercase text-sm transition-all"
              />
              {errors.section && (
                <p className="text-xs text-red-400 font-mono mt-1">{errors.section.message}</p>
              )}
            </div>

            {/* Residency Status (Hosteller / Day Scholar) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-orbitron font-semibold text-gray-300 uppercase tracking-wider">
                Residency Status
              </label>
              <select
                {...register("residency")}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-gray-100 font-sans text-sm transition-all"
              >
                <option value="">Select Residency</option>
                <option value="Hosteller">Hosteller</option>
                <option value="Day Scholar">Day Scholar</option>
              </select>
              {errors.residency && (
                <p className="text-xs text-red-400 font-mono mt-1">{errors.residency.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl font-orbitron text-xs text-gray-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValid || isCheckingRegNum}
              className={`px-8 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                isValid && !isCheckingRegNum
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(0,243,255,0.6)] hover:scale-105 active:scale-95 cursor-pointer"
                  : "bg-slate-800 text-gray-500 cursor-not-allowed opacity-60"
              }`}
            >
              {isCheckingRegNum ? "VERIFYING..." : "CONTINUE TO VERIFY →"}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
};
