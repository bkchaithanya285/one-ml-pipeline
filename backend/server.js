const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vercel Frontend and localhost
app.use(cors({ origin: "*" }));
app.use(express.json());

// In-Memory Database Store with Fallback Demo Records
let eventSettings = {
  eventName: "ONE COMPLETE MACHINE LEARNING PIPELINE",
  organizedBy: "Computer Society of India (CSI) KARE Student Chapter",
  group: "CLAIM GROUP 3",
  tagline: "Join us for our Machine Learning Webinar!",
  eventDate: "Sunday, 9 August 2026",
  eventTime: "10:00 AM IST",
  venue: "8th Block Seminar Hall",
  fee: 100,
  maxSpots: 150,
  deadline: "2026-08-08T23:59:59",
  registrationEnabled: true,
  qrCodeUrl:
    "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=csikare@upi&pn=CSI%20KARE%20STUDENT%20CHAPTER&am=100&cu=INR",
};

// Initial Mock Registrations (103 records so remaining spots = 47 out of 150)
let registrations = Array.from({ length: 103 }).map((_, i) => ({
  id: `reg-${1000 + i}`,
  uid: `user-${1000 + i}`,
  name: `STUDENT DEMO ${i + 1}`,
  email: `9923004${1000 + i}@klu.ac.in`,
  registerNumber: `9923004${1000 + i}`,
  phone: `98765${String(10000 + i).slice(0, 5)}`,
  department: i % 3 === 0 ? "CSE (AI & ML)" : i % 2 === 0 ? "CSE" : "ECE",
  year: i % 2 === 0 ? "III Year" : "II Year",
  transactionId: `UPI${428000000000 + i}`,
  paymentScreenshot:
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80",
  cloudinaryPublicId: `claim-group-3/payment-screenshots/9923004${1000 + i}`,
  paymentStatus: i % 4 === 0 ? "Pending" : "Approved",
  registrationStatus: "Registered",
  createdAt: new Date(Date.now() - (103 - i) * 3600000).toISOString(),
}));

// ==========================================
// ROUTES
// ==========================================

// 1. Health Check (Render Deployment Monitor)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ONLINE",
    server: "CSI KARE Machine Learning Pipeline Backend REST API",
    timestamp: new Date().toISOString(),
  });
});

// 2. Cloudinary SHA-1 Signature Generation
app.post("/api/cloudinary/sign", (req, res) => {
  try {
    const { registerNumber } = req.body;
    if (!registerNumber) {
      return res.status(400).json({ error: "Register Number is required." });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "dmst2wexn";
    const apiKey = process.env.CLOUDINARY_API_KEY || "922133823258997";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "yMevYZk0VlecuTw1eR9ddhy05dY";

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "claim-group-3/payment-screenshots";
    const publicId = `claim-group-3/payment-screenshots/${registerNumber}`;
    const overwrite = "true";

    const stringToSign = `folder=${folder}&overwrite=${overwrite}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

    res.json({
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder,
      publicId,
      overwrite,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate Cloudinary signature." });
  }
});

// 3. Get All Registrations
app.get("/api/registrations", (req, res) => {
  res.json({ registrations });
});

// 4. Create New Registration
app.post("/api/registrations", (req, res) => {
  try {
    const {
      uid,
      name,
      email,
      registerNumber,
      phone,
      department,
      year,
      transactionId,
      paymentScreenshot,
      cloudinaryPublicId,
    } = req.body;

    if (!name || !registerNumber || !email || !phone || !department || !year || !transactionId) {
      return res.status(400).json({ error: "All registration fields and Transaction ID are required." });
    }

    // Check duplicate register number
    const regExists = registrations.some(
      (r) =>
        r.registerNumber.toLowerCase() === registerNumber.trim().toLowerCase() &&
        r.registrationStatus !== "Cancelled"
    );
    if (regExists) {
      return res
        .status(409)
        .json({ error: "This Register Number has already been registered." });
    }

    // Check duplicate email
    const emailExists = registrations.some(
      (r) =>
        r.email.toLowerCase() === email.trim().toLowerCase() &&
        r.registrationStatus !== "Cancelled"
    );
    if (emailExists) {
      return res
        .status(409)
        .json({ error: "Your Email account has already registered for this event." });
    }

    const newRecord = {
      id: `reg-${Date.now()}`,
      uid: uid || `uid-${Date.now()}`,
      name: name.toUpperCase(),
      email: email.trim(),
      registerNumber: registerNumber.trim(),
      phone: phone.trim(),
      department,
      year,
      transactionId: transactionId.trim().toUpperCase(),
      paymentScreenshot: paymentScreenshot || "",
      cloudinaryPublicId:
        cloudinaryPublicId || `claim-group-3/payment-screenshots/${registerNumber}`,
      paymentStatus: "Pending",
      registrationStatus: "Registered",
      createdAt: new Date().toISOString(),
    };

    registrations.unshift(newRecord);

    res.status(201).json({ success: true, registrationId: newRecord.id, record: newRecord });
  } catch (err) {
    res.status(500).json({ error: "Failed to create registration." });
  }
});

// 5. Update Registration Status (Approve / Reject)
app.put("/api/registrations/:id/status", (req, res) => {
  const { id } = req.params;
  const { paymentStatus, rejectionReason } = req.body;

  const target = registrations.find((r) => r.id === id);
  if (!target) {
    return res.status(404).json({ error: "Registration record not found." });
  }

  target.paymentStatus = paymentStatus;
  if (rejectionReason) target.rejectionReason = rejectionReason;

  res.json({ success: true, record: target });
});

// 6. Delete Registration Permanently
app.delete("/api/registrations/:id", (req, res) => {
  const { id } = req.params;
  registrations = registrations.filter((r) => r.id !== id);
  res.json({ success: true, deletedId: id });
});

// 7. Delete ALL Registrations Permanently
app.delete("/api/registrations", (req, res) => {
  registrations = [];
  res.json({ success: true, message: "All registrations deleted successfully." });
});

// 8. Get Event Settings
app.get("/api/settings", (req, res) => {
  res.json({ settings: eventSettings });
});

// 9. Update Event Settings
app.put("/api/settings", (req, res) => {
  eventSettings = { ...eventSettings, ...req.body };
  res.json({ success: true, settings: eventSettings });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 CSI KARE REST API Server running on port ${PORT}`);
});
