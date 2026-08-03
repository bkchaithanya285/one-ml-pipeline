"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { QrCode, Upload, Trash2, X, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import { uploadPaymentScreenshot } from "@/lib/cloudinary";

interface QrManagerModalProps {
  currentQrUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQr: (newUrl: string) => void;
}

export const QrManagerModal: React.FC<QrManagerModalProps> = ({
  currentQrUrl,
  isOpen,
  onClose,
  onUpdateQr,
}) => {
  const [newQrInput, setNewQrInput] = useState("");
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadError(null);

      // Instant local preview
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        const res = await uploadPaymentScreenshot(file, `admin-qr-${Date.now()}`);
        if (res.secureUrl) {
          setUploadedPreview(res.secureUrl);
          setNewQrInput(res.secureUrl);
        }
      } catch (err: any) {
        console.warn("Cloudinary upload fallback to data URL", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = () => {
    const targetUrl = newQrInput.trim() || uploadedPreview || currentQrUrl;
    if (targetUrl) {
      onUpdateQr(targetUrl);
      onClose();
    }
  };

  const handleDeleteQr = () => {
    const defaultPlaceholder =
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=csikare@upi&pn=CSI%20KARE&am=100&cu=INR";
    onUpdateQr(defaultPlaceholder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-slate-950 rounded-3xl border border-cyan-500/40 p-6 text-gray-100 shadow-[0_0_50px_rgba(0,243,255,0.2)]"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <h3 className="font-orbitron font-extrabold text-base text-cyan-300">
              UPI QR Code Manager
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-6 space-y-4 text-center">
          {/* Active QR Code Display */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 flex flex-col items-center">
            <span className="text-[10px] font-orbitron text-gray-400 mb-2">
              ACTIVE QR CODE (PREVIEW)
            </span>
            <div className="relative w-40 h-40 p-2 bg-white rounded-xl shadow-lg flex items-center justify-center">
              <Image
                src={uploadedPreview || currentQrUrl}
                alt="Active QR Code"
                fill
                unoptimized
                className="object-contain p-1"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-cyan-400 font-orbitron text-xs flex-col space-y-1">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload New Image */}
          <div className="space-y-2">
            <label className="block p-3 rounded-xl border border-dashed border-cyan-500/40 bg-slate-900/60 hover:bg-slate-900 cursor-pointer text-xs font-orbitron text-cyan-400 flex items-center justify-center space-x-2">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Upload className="w-4 h-4" />}
              <span>{isUploading ? "UPLOADING TO CLOUDINARY..." : "UPLOAD NEW QR IMAGE"}</span>
              <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div className="text-[10px] text-gray-500 uppercase font-orbitron my-1">
              OR ENTER IMAGE URL
            </div>

            <input
              type="url"
              placeholder="https://..."
              value={newQrInput}
              onChange={(e) => setNewQrInput(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-gray-200 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleDeleteQr}
            className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/40 text-xs font-orbitron flex items-center space-x-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-orbitron text-gray-400 bg-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-orbitron font-bold bg-cyan-500 text-black shadow-[0_0_15px_#00f3ff]"
            >
              Update QR Code
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
