"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  IndianRupee,
  Sparkles,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { RobotAvatar } from "@/components/RobotAvatar";
import { RegistrationMonitor } from "@/components/RegistrationMonitor";
import { CountdownTimer } from "@/components/CountdownTimer";
import { HoloCard } from "@/components/HoloCard";
import { InstructionsModal } from "@/components/registration/InstructionsModal";
import { RegistrationForm, RegistrationFormData } from "@/components/registration/RegistrationForm";
import { VerifyDetailsModal } from "@/components/registration/VerifyDetailsModal";
import { PaymentModal } from "@/components/registration/PaymentModal";
import { SuccessModal } from "@/components/registration/SuccessModal";
import { ExistingRegistrationView } from "@/components/registration/ExistingRegistrationView";
import {
  subscribeRegistrations,
  subscribeEventSettings,
  getEventSettings,
  getLocalSettings,
  getRegistrationByEmailOrUid,
  DEFAULT_SETTINGS,
} from "@/lib/firebase/firestore";
import { subscribeAuthState, signInWithGoogleDomain } from "@/lib/firebase/auth";
import { cleanStudentName } from "@/lib/stringUtils";
import { Registration, EventSettings } from "@/types";

type Step = "landing" | "instructions" | "form" | "verify" | "payment" | "success" | "existingRecord";

const LOCAL_STORAGE_STUDENT_EMAIL = "csi_kare_student_email";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("landing");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [eventSettings, setEventSettings] = useState<EventSettings>(() => getLocalSettings());

  const [formData, setFormData] = useState<RegistrationFormData | null>(null);
  const [createdRegId, setCreatedRegId] = useState<string>("");
  const [existingRecord, setExistingRecord] = useState<Registration | null>(null);
  const [googleAuthUser, setGoogleAuthUser] = useState<{
    email: string;
    uid: string;
    displayName?: string;
  } | null>(null);

  useEffect(() => {
    const unsubRegs = subscribeRegistrations((list) => {
      setRegistrations(list);
      setExistingRecord((prev) => {
        if (!prev) return null;
        const freshRecord = list.find(
          (r) =>
            r.id === prev.id ||
            r.email.toLowerCase() === prev.email.toLowerCase()
        );
        if (!freshRecord) {
          if (typeof window !== "undefined") {
            localStorage.removeItem(LOCAL_STORAGE_STUDENT_EMAIL);
          }
          setCurrentStep((step) => (step === "existingRecord" ? "landing" : step));
          return null;
        }
        return freshRecord;
      });
    });

    const unsubSettings = subscribeEventSettings((sets) => {
      setEventSettings(sets);
    });

    // Fetch initial event settings immediately on mount from Admin configuration
    getEventSettings().then((sets) => {
      if (sets) setEventSettings(sets);
    });

    // Asynchronously restore session without blocking landing page render
    const checkUserSession = async (userEmail?: string, userUid?: string, userDisplayName?: string) => {
      const emailToCheck =
        userEmail || (typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_STUDENT_EMAIL) || "" : "");

      if (emailToCheck) {
        const record = await getRegistrationByEmailOrUid(emailToCheck, userUid || "");
        if (record) {
          setExistingRecord(record);
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_STUDENT_EMAIL, record.email);
          }
          setCurrentStep("existingRecord");
        } else {
          setExistingRecord(null);
          if (userEmail && userUid) {
            setGoogleAuthUser({
              email: userEmail,
              uid: userUid,
              displayName: cleanStudentName(userDisplayName || ""),
            });
            // Direct instant redirection to instructions after Google sign-in
            setCurrentStep("instructions");
          } else if (typeof window !== "undefined") {
            const hasDraft = localStorage.getItem("csi_kare_registration_draft_v1");
            const savedStep = localStorage.getItem("csi_kare_current_step");
            if (hasDraft || savedStep === "form" || savedStep === "instructions") {
              setCurrentStep("form");
            }
          }
        }
      }
    };

    // Check localStorage immediately on mount
    if (typeof window !== "undefined") {
      const localEmail = localStorage.getItem(LOCAL_STORAGE_STUDENT_EMAIL);
      if (localEmail) {
        checkUserSession(localEmail);
      }
    }

    // Firebase auth listener
    const unsubAuth = subscribeAuthState((user) => {
      if (user && user.email) {
        checkUserSession(user.email, user.uid, user.displayName || "");
      }
    });

    return () => {
      unsubRegs();
      unsubSettings();
      unsubAuth();
    };
  }, []);

  const approvedCount = registrations.filter((r) => r.paymentStatus === "Approved").length;
  const pendingCount = registrations.filter((r) => r.paymentStatus === "Pending").length;
  const approvedAndPendingCount = approvedCount + pendingCount;

  const spotsLeft = Math.max(
    0,
    eventSettings.maxSpots - approvedAndPendingCount
  );

  const isRegistrationClosed =
    !eventSettings.registrationEnabled || spotsLeft === 0;

  const handleStartRegistrationFlow = async () => {
    if (existingRecord) {
      setCurrentStep("existingRecord");
      return;
    }

    if (googleAuthUser) {
      const record = await getRegistrationByEmailOrUid(googleAuthUser.email, googleAuthUser.uid);
      if (record) {
        setExistingRecord(record);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_STUDENT_EMAIL, record.email);
        }
        setCurrentStep("existingRecord");
        return;
      }
      if (isRegistrationClosed) {
        alert(`Registrations are closed. No existing registration found for account ${googleAuthUser.email}.`);
        return;
      }
      setCurrentStep("instructions");
      return;
    }

    const { user, error } = await signInWithGoogleDomain();
    if (error) {
      alert(error);
      return;
    }

    if (user && user.email) {
      const authUser = {
        email: user.email,
        uid: user.uid,
        displayName: cleanStudentName(user.displayName || ""),
      };
      setGoogleAuthUser(authUser);

      const record = await getRegistrationByEmailOrUid(user.email, user.uid);
      if (record) {
        setExistingRecord(record);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_STUDENT_EMAIL, record.email);
        }
        setCurrentStep("existingRecord");
        return;
      }

      if (isRegistrationClosed) {
        alert(`Registrations are closed. No existing registration was found for Google account (${user.email}).`);
        return;
      }

      // Direct instant redirection to instructions/form
      setCurrentStep("instructions");
    }
  };

  const titleWords = ["ONE", "COMPLETE", "MACHINE", "LEARNING", "PIPELINE"];

  return (
    <main className="min-h-screen bg-[#030712] text-gray-100 relative overflow-hidden font-sans">
      <ParticleBackground />

      <Navbar
        isLoggedIn={!!existingRecord}
        onRegisterClick={handleStartRegistrationFlow}
      />

      <div className="relative z-10 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 0: LANDING PAGE & HERO */}
          {currentStep === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-16"
            >
              {/* HERO SECTION */}
              <section className="relative flex flex-col lg:flex-row items-center justify-between gap-12 pt-6">
                <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center space-x-4 px-6 py-3.5 rounded-3xl bg-slate-950/90 border-2 border-cyan-400 shadow-[0_0_40px_rgba(0,243,255,0.4)] backdrop-blur-xl group hover:border-cyan-300 transition-all duration-300"
                  >
                    <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-cyan-400 p-1 bg-slate-900 flex-shrink-0 shadow-[0_0_25px_rgba(0,243,255,0.5)]">
                      <Image
                        src="/csi-logo.jpg"
                        alt="CSI KARE Logo"
                        width={96}
                        height={96}
                        className="object-contain rounded-xl w-full h-full"
                      />
                    </div>
                    <div className="text-left">
                      <span className="font-orbitron font-black text-base sm:text-xl lg:text-2xl text-cyan-300 tracking-widest uppercase block drop-shadow-[0_0_15px_rgba(0,243,255,0.6)]">
                        {eventSettings.group} • CSI KARE
                      </span>
                      <span className="text-xs sm:text-sm text-gray-200 font-mono font-bold block mt-0.5">
                        COMPUTER SOCIETY OF INDIA STUDENT CHAPTER
                      </span>
                    </div>
                  </motion.div>

                  <div className="font-orbitron font-black text-4xl sm:text-6xl lg:text-7xl leading-tight tracking-tight">
                    {titleWords.map((word, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                          delay: 0.2 + idx * 0.1,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        className={`inline-block mr-3 ${
                          idx >= 2
                            ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,243,255,0.5)]"
                            : "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        }`}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-base sm:text-xl text-gray-300 font-sans font-medium tracking-wide flex items-center justify-center lg:justify-start space-x-2"
                  >
                    <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
                    <span>{eventSettings.tagline}</span>
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-xs sm:text-sm text-gray-400 font-mono"
                  >
                    Organized by{" "}
                    <span className="text-cyan-400 font-semibold">
                      {eventSettings.organizedBy}
                    </span>
                  </motion.p>
                </div>

                <div className="relative w-full max-w-md flex justify-center items-center">
                  <RobotAvatar variant="mascot" className="w-72 h-80 sm:w-96 sm:h-96" />
                  <div className="absolute -top-6 -right-4 w-28 h-28">
                    <RobotAvatar variant="drone" />
                  </div>
                  <div className="absolute -bottom-4 -left-6 w-24 h-24 hidden sm:block">
                    <RobotAvatar variant="scanner" />
                  </div>
                </div>
              </section>

              {/* EVENT DETAILS HOLOCARDS SECTION */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <HoloCard
                  title="📅 Date"
                  value={eventSettings.eventDate}
                  subtext={eventSettings.eventTime}
                  icon={Calendar}
                  accentColor="cyan"
                />
                <HoloCard
                  title="📍 Venue"
                  value={eventSettings.venue}
                  subtext="KARE Campus • Main Block"
                  icon={MapPin}
                  accentColor="blue"
                />
                <HoloCard
                  title="💰 Registration Fee"
                  value={`₹${eventSettings.fee}`}
                  subtext="Includes Participation Certificate"
                  icon={IndianRupee}
                  accentColor="purple"
                />
              </section>

              {/* AI REGISTRATION MONITOR SECTION */}
              <section className="space-y-6 text-center">
                <RegistrationMonitor
                  spotsLeft={spotsLeft}
                  totalSpots={eventSettings.maxSpots}
                  approvedCount={approvedCount}
                  pendingCount={pendingCount}
                  isClosed={isRegistrationClosed}
                />

                <div className="pt-2">
                  <button
                    onClick={handleStartRegistrationFlow}
                    className="relative group inline-flex items-center space-x-3 px-10 py-5 rounded-2xl font-orbitron font-extrabold text-sm sm:text-base tracking-widest uppercase transition-all duration-300 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-[0_0_40px_rgba(0,243,255,0.7)] hover:shadow-[0_0_60px_rgba(0,243,255,1)] hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span className="absolute inset-0 rounded-2xl bg-cyan-400 opacity-25 group-hover:opacity-40 animate-pulse" />
                    <span className="relative z-10 flex items-center space-x-3">
                      <span>
                        {existingRecord
                          ? "VIEW MY REGISTRATION / TICKET"
                          : isRegistrationClosed
                          ? "LOGIN TO VIEW TICKET"
                          : "REGISTER NOW"}
                      </span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </section>

              <section>
                <CountdownTimer deadlineIso={eventSettings.deadline} />
              </section>
            </motion.div>
          )}

          {/* STEP 1: INSTRUCTIONS */}
          {currentStep === "instructions" && (
            <InstructionsModal
              key="instructions"
              isOpen={true}
              onClose={() => setCurrentStep("landing")}
              onContinue={() => setCurrentStep("form")}
            />
          )}

          {/* STEP 2: REGISTRATION FORM */}
          {currentStep === "form" && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <RegistrationForm
                initialGoogleUser={googleAuthUser}
                onCancel={() => setCurrentStep("landing")}
                onContinue={(data) => {
                  setFormData(data);
                  setCurrentStep("verify");
                }}
                onExistingFound={(record) => {
                  setExistingRecord(record);
                  if (typeof window !== "undefined") {
                    localStorage.setItem(LOCAL_STORAGE_STUDENT_EMAIL, record.email);
                  }
                  setCurrentStep("existingRecord");
                }}
              />
            </motion.div>
          )}

          {/* STEP 3: VERIFY DETAILS */}
          {currentStep === "verify" && formData && (
            <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <VerifyDetailsModal
                data={formData}
                onEdit={() => setCurrentStep("form")}
                onProceedToPayment={() => setCurrentStep("payment")}
              />
            </motion.div>
          )}

          {/* STEP 4: PAYMENT */}
          {currentStep === "payment" && formData && (
            <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PaymentModal
                formData={formData}
                qrCodeUrl={eventSettings.qrCodeUrl}
                fee={eventSettings.fee}
                upiId={eventSettings.upiId || "csikare@upi"}
                onBack={() => setCurrentStep("verify")}
                onSuccess={(regId) => {
                  setCreatedRegId(regId);
                  if (typeof window !== "undefined") {
                    localStorage.setItem(LOCAL_STORAGE_STUDENT_EMAIL, formData.email);
                  }
                  setCurrentStep("success");
                }}
              />
            </motion.div>
          )}

          {/* STEP 5: SUCCESS */}
          {currentStep === "success" && formData && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SuccessModal
                registrationId={createdRegId || "REG-CONFIRMED"}
                formData={formData}
                onHomeClick={() => {
                  setCurrentStep("landing");
                  setFormData(null);
                }}
              />
            </motion.div>
          )}

          {/* STEP 6: EXISTING REGISTRATION FOUND */}
          {currentStep === "existingRecord" && existingRecord && (
            <motion.div key="existingRecord" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ExistingRegistrationView
                registration={existingRecord}
                onHomeClick={() => {
                  setCurrentStep("landing");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {currentStep === "landing" && <Footer />}
    </main>
  );
}
