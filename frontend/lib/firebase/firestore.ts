import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./config";
import { Registration, EventSettings, AttendanceSession, AttendanceRecord } from "@/types";

import { CLEAN_ALL_REGISTRATIONS } from "@/lib/cleanRegistrationsData";

// Default Initial Event Settings as specified in requirements
export const DEFAULT_SETTINGS: EventSettings = {
  eventName: "ONE COMPLETE MACHINE LEARNING PIPELINE",
  organizedBy: "Computer Society of India (CSI) KARE Student Chapter",
  group: "CLAIM GROUP 3",
  tagline: "Join us for our Machine Learning Webinar!",
  eventDate: "Sunday, 9 August 2026",
  eventTime: "10:00 AM IST",
  venue: "8th Block Seminar Hall",
  fee: 100,
  maxSpots: 300,
  deadline: "2026-08-07T12:00:00.000Z",
  registrationEnabled: false,
  qrCodeUrl:
    "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=csikare@upi&pn=CSI%20KARE%20STUDENT%20CHAPTER&am=100&cu=INR",
  upiId: "csikare@upi",
  volunteerPasscode: "654321",
};

// Initial Registrations (279 clean records including 17 new offline registrants)
const INITIAL_MOCK_REGISTRATIONS: Registration[] = CLEAN_ALL_REGISTRATIONS;

// Initial Attendance Sessions
const INITIAL_MOCK_SESSIONS: AttendanceSession[] = [];

const LOCAL_STORAGE_KEY_REGS = "csi_kare_registrations_v3";
const LOCAL_STORAGE_KEY_SETTINGS = "csi_kare_settings_v3";
const LOCAL_STORAGE_KEY_SESSIONS = "csi_kare_sessions_v3";

function getLocalRegistrations(): Registration[] {
  if (typeof window === "undefined") return INITIAL_MOCK_REGISTRATIONS;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_REGS);
    if (!data) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY_REGS,
        JSON.stringify(INITIAL_MOCK_REGISTRATIONS)
      );
      return INITIAL_MOCK_REGISTRATIONS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_MOCK_REGISTRATIONS;
  }
}

function saveLocalRegistrations(regs: Registration[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_REGS, JSON.stringify(regs));
  } catch (e) {
    console.error("Local storage save error", e);
  }
}

export function getLocalSettings(): EventSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
    if (!data) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY_SETTINGS,
        JSON.stringify(DEFAULT_SETTINGS)
      );
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

function saveLocalSettings(settings: EventSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("csi_kare_settings_updated", { detail: settings }));
  } catch (e) {
    console.error("Local storage save settings error", e);
  }
}

function getLocalSessions(): AttendanceSession[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_SESSIONS);
    if (!data) {
      return [];
    }
    const parsed: AttendanceSession[] = JSON.parse(data);
    const cleaned = parsed.filter(
      (s) => s.id !== "session-1" && s.sessionName !== "Morning Keynote & ML Fundamentals"
    );
    if (cleaned.length !== parsed.length) {
      saveLocalSessions(cleaned);
    }
    return cleaned;
  } catch (e) {
    return [];
  }
}

function saveLocalSessions(sessions: AttendanceSession[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    window.dispatchEvent(new CustomEvent("csi_kare_sessions_updated", { detail: sessions }));
  } catch (e) {
    console.error("Local storage save sessions error", e);
  }
}

/**
 * Fetch Event Settings from Firestore or local fallback
 */
export async function getEventSettings(): Promise<EventSettings> {
  try {
    const docRef = doc(db, "settings", "event");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...snap.data() } as EventSettings;
    } else {
      await setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (err) {
    return getLocalSettings();
  }
}

/**
 * Update Event Settings
 */
export async function updateEventSettings(
  settings: Partial<EventSettings>
): Promise<void> {
  const current = getLocalSettings();
  const updated = { ...current, ...settings };
  saveLocalSettings(updated);

  try {
    const docRef = doc(db, "settings", "event");
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    console.error("Firestore settings update error:", err);
  }
}

/**
 * Listen to Event Settings live
 */
export function subscribeEventSettings(
  callback: (settings: EventSettings) => void
) {
  // Synchronously fire local settings first to eliminate initial UI flickering
  callback(getLocalSettings());

  const handleCustomUpdate = (e: any) => {
    if (e.detail) {
      callback(e.detail);
    } else {
      callback(getLocalSettings());
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("csi_kare_settings_updated", handleCustomUpdate);
  }

  try {
    const docRef = doc(db, "settings", "event");
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const merged = { ...DEFAULT_SETTINGS, ...snap.data() } as EventSettings;
          saveLocalSettings(merged);
          callback(merged);
        } else {
          callback(getLocalSettings());
        }
      },
      () => {
        callback(getLocalSettings());
      }
    );

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("csi_kare_settings_updated", handleCustomUpdate);
      }
      unsub();
    };
  } catch (e) {
    callback(getLocalSettings());
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("csi_kare_settings_updated", handleCustomUpdate);
      }
    };
  }
}

/**
 * Fetch all registrations
 */
export async function getAllRegistrations(): Promise<Registration[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "registrations"));
    const list: Registration[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Registration;
      list.push({ ...data, id: docSnap.id });
    });
    return list;
  } catch (err) {
    return getLocalRegistrations();
  }
}

/**
 * Subscribe to all registrations live
 */
export function subscribeRegistrations(
  callback: (regs: Registration[]) => void
) {
  try {
    const colRef = collection(db, "registrations");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Registration[] = [];
        const existingIds = new Set<string>();
        const existingRegNos = new Set<string>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Registration;
          list.push({ ...data, id: docSnap.id });
          existingIds.add(docSnap.id);
          if (data.registerNumber) {
            existingRegNos.add(String(data.registerNumber).trim().toLowerCase());
          }
        });

        // Fallback merge for any items from CLEAN_ALL_REGISTRATIONS not yet in snapshot
        CLEAN_ALL_REGISTRATIONS.forEach((cleanItem) => {
          const regNo = String(cleanItem.registerNumber).trim().toLowerCase();
          if (!existingIds.has(cleanItem.id) && !existingRegNos.has(regNo)) {
            list.push(cleanItem);
          }
        });

        saveLocalRegistrations(list);
        callback(list);
      },
      (error) => {
        console.error("subscribeRegistrations Firestore error:", error);
        callback(getLocalRegistrations());
      }
    );
  } catch (e) {
    callback(getLocalRegistrations());
    return () => {};
  }
}

/**
 * Get registration record by email or UID
 */
export async function getRegistrationByEmailOrUid(
  email: string,
  uid: string
): Promise<Registration | null> {
  const cleanEmail = email ? email.trim().toLowerCase() : "";
  try {
    if (cleanEmail) {
      const qEmail = query(
        collection(db, "registrations"),
        where("email", "==", email)
      );
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        const docSnap = snapEmail.docs[0];
        const data = docSnap.data() as Registration;
        if (data.registrationStatus !== "Cancelled") {
          return { ...data, id: docSnap.id };
        }
      }

      // Also try lowercased email match in case stored email differed in case
      const querySnapshot = await getDocs(collection(db, "registrations"));
      let matchedDoc: Registration | null = null;
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Registration;
        if (
          data.email &&
          data.email.trim().toLowerCase() === cleanEmail &&
          data.registrationStatus !== "Cancelled"
        ) {
          matchedDoc = { ...data, id: docSnap.id };
        }
      });
      if (matchedDoc) return matchedDoc;
    }

    if (uid) {
      const qUid = query(
        collection(db, "registrations"),
        where("uid", "==", uid)
      );
      const snapUid = await getDocs(qUid);
      if (!snapUid.empty) {
        const docSnap = snapUid.docs[0];
        const data = docSnap.data() as Registration;
        if (data.registrationStatus !== "Cancelled") {
          return { ...data, id: docSnap.id };
        }
      }
    }

    // Firestore was queried successfully and returned no document.
    // Check if the record exists in local cache AND is not a deleted or mock record.
    const localRegs = getLocalRegistrations();
    const localMatch = localRegs.find(
      (r) =>
        ((cleanEmail && r.email.toLowerCase() === cleanEmail) || (uid && r.uid === uid)) &&
        r.registrationStatus !== "Cancelled"
    );

    // If local match is found but doesn't exist in Firestore, return null (was deleted)
    return null;
  } catch (e) {
    // Offline fallback
    const localRegs = getLocalRegistrations();
    const match = localRegs.find(
      (r) =>
        ((cleanEmail && r.email.toLowerCase() === cleanEmail) || (uid && r.uid === uid)) &&
        r.registrationStatus !== "Cancelled"
    );
    return match || null;
  }
}

/**
 * Check if a Register Number is already registered
 */
export async function checkRegisterNumberExists(
  registerNumber: string
): Promise<boolean> {
  const cleanRegNo = registerNumber.trim();
  try {
    const q = query(
      collection(db, "registrations"),
      where("registerNumber", "==", cleanRegNo)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) return true;
    return false;
  } catch (err) {
    const localRegs = getLocalRegistrations();
    return localRegs.some(
      (r) =>
        r.registerNumber.toLowerCase() === cleanRegNo.toLowerCase() &&
        r.registrationStatus !== "Cancelled"
    );
  }
}

/**
 * Check if Email or UID is already registered
 */
export async function checkEmailOrUidExists(
  email: string,
  uid: string
): Promise<boolean> {
  const record = await getRegistrationByEmailOrUid(email, uid);
  return record !== null;
}

/**
 * Create a new registration
 */
export async function createRegistration(
  data: Omit<Registration, "id">
): Promise<string> {
  const docId = `reg-${Date.now()}`;
  const newRecord: Registration = {
    id: docId,
    ...data,
  };

  try {
    const docRef = doc(db, "registrations", docId);
    await setDoc(docRef, newRecord);
  } catch (err) {}

  const localRegs = getLocalRegistrations();
  localRegs.unshift(newRecord);
  saveLocalRegistrations(localRegs);

  return docId;
}

/**
 * Approve Registration
 */
export async function approveRegistration(id: string): Promise<void> {
  try {
    const docRef = doc(db, "registrations", id);
    await updateDoc(docRef, { paymentStatus: "Approved" });
  } catch (e) {}

  const localRegs = getLocalRegistrations();
  const updated = localRegs.map((r) =>
    r.id === id ? { ...r, paymentStatus: "Approved" as const } : r
  );
  saveLocalRegistrations(updated);
}

/**
 * Reject Registration with reason
 */
export async function rejectRegistration(
  id: string,
  reason: string
): Promise<void> {
  try {
    const docRef = doc(db, "registrations", id);
    await updateDoc(docRef, {
      paymentStatus: "Rejected",
      rejectionReason: reason,
    });
  } catch (e) {}

  const localRegs = getLocalRegistrations();
  const updated = localRegs.map((r) =>
    r.id === id
      ? { ...r, paymentStatus: "Rejected" as const, rejectionReason: reason }
      : r
  );
  saveLocalRegistrations(updated);
}

/**
 * Update full registration record details (Admin Edit)
 */
export async function updateRegistrationDetails(
  id: string,
  updates: Partial<Registration>
): Promise<void> {
  try {
    const docRef = doc(db, "registrations", id);
    await updateDoc(docRef, updates);
  } catch (e) {}

  const localRegs = getLocalRegistrations();
  const updated = localRegs.map((r) =>
    r.id === id ? { ...r, ...updates } : r
  );
  saveLocalRegistrations(updated);
}

/**
 * Delete Registration permanently
 */
export async function deleteRegistration(id: string): Promise<void> {
  const localRegs = getLocalRegistrations();
  const target = localRegs.find((r) => r.id === id);

  try {
    const docRef = doc(db, "registrations", id);
    await deleteDoc(docRef);
  } catch (e) {}

  const updated = localRegs.filter((r) => r.id !== id);
  saveLocalRegistrations(updated);

  if (typeof window !== "undefined" && target) {
    const storedEmail = localStorage.getItem("csi_kare_student_email");
    if (storedEmail && storedEmail.toLowerCase() === target.email.toLowerCase()) {
      localStorage.removeItem("csi_kare_student_email");
    }
  }
}

/**
 * Delete ALL Registrations permanently
 */
export async function deleteAllRegistrations(): Promise<void> {
  try {
    const querySnapshot = await getDocs(collection(db, "registrations"));
    querySnapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, "registrations", docSnap.id));
    });
  } catch (e) {}

  saveLocalRegistrations([]);
  if (typeof window !== "undefined") {
    localStorage.removeItem("csi_kare_student_email");
  }
}

// ==========================================
// ATTENDANCE SESSION MANAGEMENT
// ==========================================

export async function createAttendanceSession(sessionName: string): Promise<AttendanceSession> {
  const newSession: AttendanceSession = {
    id: `session-${Date.now()}`,
    sessionName: sessionName.trim(),
    createdAt: new Date().toISOString(),
    status: "open",
    records: [],
  };

  const sessions = getLocalSessions();
  sessions.unshift(newSession);
  saveLocalSessions(sessions);

  try {
    const docRef = doc(db, "attendance_sessions", newSession.id);
    await setDoc(docRef, newSession);
  } catch (e) {}

  return newSession;
}

export async function toggleAttendanceSessionStatus(sessionId: string): Promise<void> {
  const sessions = getLocalSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (session) {
    session.status = session.status === "open" ? "closed" : "open";
    saveLocalSessions(sessions);

    try {
      const docRef = doc(db, "attendance_sessions", sessionId);
      await updateDoc(docRef, { status: session.status });
    } catch (e) {}
  }
}

function mergeSessions(remote: AttendanceSession[], local: AttendanceSession[]): AttendanceSession[] {
  const map = new Map<string, AttendanceSession>();
  local.forEach((s) => map.set(s.id, { ...s, records: [...(s.records || [])] }));
  remote.forEach((s) => {
    const existing = map.get(s.id);
    if (!existing) {
      map.set(s.id, { ...s, records: [...(s.records || [])] });
    } else {
      const recordMap = new Map<string, AttendanceRecord>();
      (existing.records || []).forEach((r) => {
        const key = (r.registerNumber || r.regId || r.name || "").toLowerCase().trim();
        if (key) recordMap.set(key, r);
      });
      (s.records || []).forEach((r) => {
        const key = (r.registerNumber || r.regId || r.name || "").toLowerCase().trim();
        if (key) recordMap.set(key, r);
      });
      map.set(s.id, {
        ...existing,
        ...s,
        records: Array.from(recordMap.values()),
      });
    }
  });
  return Array.from(map.values());
}

export function subscribeAttendanceSessions(
  callback: (sessions: AttendanceSession[]) => void
) {
  const handleLocalUpdate = (e: Event) => {
    const customEv = e as CustomEvent;
    if (customEv.detail) {
      callback(customEv.detail);
    } else {
      callback(getLocalSessions());
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("csi_kare_sessions_updated", handleLocalUpdate);
  }

  let unsubFirestore = () => {};

  try {
    const colRef = collection(db, "attendance_sessions");
    unsubFirestore = onSnapshot(
      colRef,
      (snapshot) => {
        const localList = getLocalSessions();
        if (!snapshot.empty) {
          const remoteList: AttendanceSession[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as AttendanceSession;
            remoteList.push({ ...data, id: docSnap.id });
          });
          const merged = mergeSessions(remoteList, localList);
          callback(merged);
        } else {
          callback(localList);
        }
      },
      () => {
        callback(getLocalSessions());
      }
    );
  } catch (e) {
    callback(getLocalSessions());
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("csi_kare_sessions_updated", handleLocalUpdate);
    }
    unsubFirestore();
  };
}

export async function markAttendanceInSession(
  sessionId: string,
  regRecord: { regId: string; registerNumber: string; name: string }
): Promise<{ success: boolean; message: string; updatedSession?: AttendanceSession }> {
  const localSessions = getLocalSessions();
  let session = localSessions.find((s) => s.id === sessionId);

  try {
    const docRef = doc(db, "attendance_sessions", sessionId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      session = { ...snap.data(), id: snap.id } as AttendanceSession;
    }
  } catch (e) {}

  if (!session) {
    return { success: false, message: "Attendance Session not found." };
  }

  if (session.status === "closed") {
    return {
      success: false,
      message: `SESSION CLOSED: '${session.sessionName}' is locked. Attendance cannot be taken when session is closed.`,
    };
  }

  const cleanRegNo = (regRecord.registerNumber || "").toLowerCase().trim();
  const cleanId = (regRecord.regId || "").toLowerCase().trim();
  const cleanName = (regRecord.name || "").toLowerCase().trim();

  const alreadyMarked = (session.records || []).some((r) => {
    const rRegNo = (r.registerNumber || "").toLowerCase().trim();
    const rId = (r.regId || "").toLowerCase().trim();
    const rName = (r.name || "").toLowerCase().trim();
    return (
      (cleanRegNo && rRegNo === cleanRegNo) ||
      (cleanId && rId === cleanId) ||
      (cleanName && rName === cleanName)
    );
  });

  if (alreadyMarked) {
    return {
      success: false,
      message: `ALREADY MARKED PRESENT: Student (${regRecord.name} - ${regRecord.registerNumber}) is already recorded in '${session.sessionName}'.`,
    };
  }

  const newRecord: AttendanceRecord = {
    regId: regRecord.regId,
    registerNumber: regRecord.registerNumber,
    name: regRecord.name,
    scannedAt: new Date().toISOString(),
  };

  session.records = session.records || [];
  session.records.unshift(newRecord);

  // Local cache update
  const idx = localSessions.findIndex((s) => s.id === sessionId);
  if (idx !== -1) {
    localSessions[idx] = session;
  } else {
    localSessions.unshift(session);
  }
  saveLocalSessions(localSessions);

  // Firestore atomic update for multi-device concurrency
  try {
    const docRef = doc(db, "attendance_sessions", sessionId);
    await updateDoc(docRef, {
      records: arrayUnion(newRecord),
    });
  } catch (e) {
    try {
      const docRef = doc(db, "attendance_sessions", sessionId);
      await setDoc(docRef, session, { merge: true });
    } catch (err) {}
  }

  return {
    success: true,
    message: `MARKED PRESENT: Attendance recorded for ${regRecord.name} (${regRecord.registerNumber}).`,
    updatedSession: session,
  };
}

export async function deleteAttendanceSession(sessionId: string): Promise<void> {
  const sessions = getLocalSessions().filter((s) => s.id !== sessionId);
  saveLocalSessions(sessions);

  try {
    const docRef = doc(db, "attendance_sessions", sessionId);
    await deleteDoc(docRef);
  } catch (e) {}
}

export async function deleteAllAttendanceSessions(): Promise<void> {
  saveLocalSessions([]);
  try {
    const colRef = collection(db, "attendance_sessions");
    const snapshot = await getDocs(colRef);
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (e) {}
}

export async function updateStudentSelfRegistration(
  regId: string,
  updatedData: Partial<Registration>
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      ...updatedData,
      isEdited: true,
      hasEditedOnce: true,
      editedAt: new Date().toISOString(),
    };

    const local = getLocalRegistrations();
    const idx = local.findIndex((r) => r.id === regId);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...payload };
      saveLocalRegistrations(local);
    }

    const docRef = doc(db, "registrations", regId);
    await updateDoc(docRef, payload);
    return { success: true };
  } catch (err: any) {
    console.error("Error updating student registration:", err);
    return { success: false, error: err.message || "Failed to save details." };
  }
}
