"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Lock,
  Hash,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { RegistrationFormData } from "./RegistrationForm";
import { uploadPaymentScreenshot } from "@/lib/cloudinary";
import { createRegistration } from "@/lib/firebase/firestore";

interface PaymentModalProps {
  formData: RegistrationFormData;
  qrCodeUrl: string;
  fee?: number;
  upiId?: string;
  onBack: () => void;
  onSuccess: (registrationId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  formData,
  qrCodeUrl,
  fee = 100,
  upiId = "csikare@upi",
  onBack,
  onSuccess,
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showUpiInstructions, setShowUpiInstructions] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cloudinaryResult, setCloudinaryResult] = useState<{
    secureUrl: string;
    publicId: string;
  } | null>(null);

  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size exceeds maximum limit of 10 MB.");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError("Invalid file type. Only JPG, JPEG, and PNG images are allowed.");
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await uploadPaymentScreenshot(
        file,
        formData.registerNumber,
        (percent) => {
          setUploadProgress(percent);
        }
      );

      setCloudinaryResult(res);
    } catch (err: any) {
      setUploadError(err.message || "Upload Failed. Please try again.");
      setCloudinaryResult(null);
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid =
    cloudinaryResult !== null &&
    transactionId.trim().length >= 6 &&
    !isUploading &&
    !isSubmittingRecord;

  const handleFinalSubmit = async () => {
    if (!transactionId.trim()) {
      setUploadError("Please enter your UPI Transaction ID / UTR Number.");
      return;
    }

    if (!cloudinaryResult) {
      setUploadError("Please upload your payment screenshot before completing registration.");
      return;
    }

    setIsSubmittingRecord(true);

    try {
      const regId = await createRegistration({
        uid: formData.uid,
        name: formData.fullName,
        email: formData.email,
        registerNumber: formData.registerNumber,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
        section: formData.section,
        residency: formData.residency,
        transactionId: transactionId.trim().toUpperCase(),
        paymentScreenshot: cloudinaryResult.secureUrl,
        cloudinaryPublicId: cloudinaryResult.publicId,
        paymentStatus: "Pending",
        registrationStatus: "Registered",
        createdAt: new Date().toISOString(),
      });

      onSuccess(regId);
    } catch (err) {
      setUploadError("Failed to record registration in database. Please try again.");
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto rounded-3xl bg-slate-950/90 border border-cyan-500/40 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] text-gray-100"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 pb-6 border-b border-slate-800">
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <QrCode className="w-7 h-7" />
        </div>
        <div>
          <h2 className="font-orbitron font-extrabold text-xl sm:text-2xl text-cyan-300">
            Payment Interface
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            REGISTRATION FEE: ₹{fee} • UPI TRANSFER
          </p>
        </div>
      </div>

      {showUpiInstructions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-cyan-950/90 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-emerald-100 font-sans space-y-2"
        >
          <div className="flex items-center space-x-2 text-emerald-300 font-orbitron font-extrabold text-xs sm:text-sm uppercase tracking-wider">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-spin flex-shrink-0" />
            <span>PAYMENT INSTRUCTION & NEXT STEPS</span>
          </div>
          <div className="text-xs space-y-1.5 font-mono text-gray-200">
            <div className="flex items-start space-x-2">
              <span className="font-bold text-emerald-400">Step 1:</span>
              <span>Complete payment of <strong className="text-amber-300 font-bold">₹{fee}</strong> in your UPI app (GPay / PhonePe / Paytm / BHIM).</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-emerald-400">Step 2:</span>
              <span>Copy the <strong className="text-cyan-300 font-bold">12-Digit UTR / Transaction Ref No</strong> from your payment summary and paste it in the UTR field below.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-emerald-400">Step 3:</span>
              <span>Take a screenshot of the payment receipt and upload it in the upload area below to finalize registration.</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* Left Column: QR Code Card */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,243,255,0.1)] group hover:border-cyan-400 transition-colors text-center">
          <span className="text-[10px] font-orbitron font-bold text-cyan-400 tracking-widest uppercase mb-3">
            SCAN QR TO PAY ₹{fee}
          </span>

          <div className="relative w-48 h-48 p-3 rounded-xl bg-white shadow-[0_0_25px_rgba(0,243,255,0.4)] group-hover:scale-105 transition-transform duration-300">
            <Image
              src={qrCodeUrl}
              alt="UPI Payment QR Code"
              fill
              unoptimized
              className="object-contain p-2"
            />
          </div>

          {/* Interactive Pay via UPI App & Copy UPI ID Buttons */}
          {(() => {
            const activeUpiId = qrCodeUrl.match(/pa=([^&]+)/)?.[1]
              ? decodeURIComponent(qrCodeUrl.match(/pa=([^&]+)/)![1])
              : (upiId || "csikare@upi");
            const upiDeepLink = `upi://pay?pa=${encodeURIComponent(activeUpiId)}&pn=${encodeURIComponent("CSI KARE STUDENT CHAPTER")}&am=${fee}&cu=INR&tn=${encodeURIComponent("CSI KARE ML Workshop")}`;

            const handleCopyUpi = () => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(activeUpiId);
                setCopiedUpi(true);
                setTimeout(() => setCopiedUpi(false), 2000);
              }
            };

            return (
              <div className="w-full mt-4 space-y-2.5">
                <a
                  href={upiDeepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowUpiInstructions(true)}
                  className="w-full py-3.5 px-4 rounded-xl font-orbitron font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.7)] hover:shadow-[0_0_40px_rgba(16,185,129,1)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer border-2 border-emerald-300"
                >
                  <ExternalLink className="w-4 h-4 text-black flex-shrink-0" />
                  <span>PAY USING UPI APP (GPay / PhonePe / Paytm)</span>
                </a>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center space-x-1.5 text-gray-300 truncate">
                    <span className="text-[10px] text-gray-500 uppercase font-orbitron">UPI ID:</span>
                    <span className="font-bold text-amber-300 truncate">{activeUpiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black font-orbitron text-[10px] font-bold border border-cyan-500/40 transition-colors flex items-center space-x-1 flex-shrink-0 cursor-pointer"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? "COPIED!" : "COPY ID"}</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Column: Transaction ID & Screenshot Upload Area */}
        <div className="flex flex-col justify-between space-y-4">
          {/* MANDATORY TRANSACTION ID FIELD */}
          <div className="space-y-1.5">
            <label className="block text-xs font-orbitron font-semibold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Hash className="w-4 h-4 text-cyan-400" />
              <span>UPI Transaction / UTR Ref No</span>
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 428190312456"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-gray-100 font-mono text-xs focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 uppercase"
            />
            <p className="text-[10px] text-gray-400 font-mono">
              Enter the 12-digit UTR / Transaction reference number from your UPI app.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-orbitron font-bold text-xs text-gray-200 uppercase tracking-wider">
              Upload Payment Screenshot *
            </h3>
            <p className="text-[10px] text-gray-400 font-mono">
              Accepted Formats: JPG, JPEG, PNG (Max: 10 MB)
            </p>
          </div>

          {!selectedFile ? (
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-cyan-500/40 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 hover:border-cyan-400 cursor-pointer transition-all group">
              <Upload className="w-8 h-8 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-orbitron font-bold text-xs text-cyan-300">
                CHOOSE PAYMENT SCREENSHOT
              </span>
              <span className="text-[10px] text-gray-400 mt-1">
                Click to browse file
              </span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-3">
                {filePreview && (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-cyan-500/40 flex-shrink-0">
                    <Image
                      src={filePreview}
                      alt="Payment Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-bold text-gray-200 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                    <span>UPLOADING TO CLOUDINARY...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {cloudinaryResult && !isUploading && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Upload Successful!</span>
                  </div>
                  <label className="text-[10px] font-orbitron hover:underline cursor-pointer">
                    Change
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Upload Failed</p>
                    <p className="text-[10px] mt-0.5">{uploadError}</p>
                    <label className="mt-2 inline-flex items-center space-x-1 text-[10px] font-orbitron text-cyan-300 hover:underline cursor-pointer">
                      <RefreshCw className="w-3 h-3" />
                      <span>Try Again</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}


        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl font-orbitron text-xs text-gray-400 hover:text-white bg-slate-900 border border-slate-800 flex items-center space-x-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handleFinalSubmit}
          disabled={!isFormValid}
          className={`px-8 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
            isFormValid
              ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-[0_0_30px_rgba(0,243,255,0.7)] hover:scale-105 active:scale-95 cursor-pointer"
              : "bg-slate-800 text-gray-500 cursor-not-allowed opacity-60"
          }`}
        >
          {isSubmittingRecord ? "SUBMITTING MISSION..." : "COMPLETE REGISTRATION 🎉"}
        </button>
      </div>
    </motion.div>
  );
};
