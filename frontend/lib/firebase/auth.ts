import {
  signInWithPopup,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "./config";

/**
 * Sign in with Google (Enforce @klu.ac.in domain requirement & show Account Chooser)
 */
export async function signInWithGoogleDomain(): Promise<{
  user: User | null;
  error: string | null;
}> {
  try {
    // Explicitly set prompt: 'select_account' so Google displays account chooser + "Use another account"
    googleProvider.setCustomParameters({
      prompt: "select_account",
      hd: "klu.ac.in",
    });

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const email = user.email || "";

    if (!email.toLowerCase().endsWith("@klu.ac.in")) {
      await firebaseSignOut(auth);
      return {
        user: null,
        error:
          "Access Restricted: Only official @klu.ac.in email addresses are permitted to register for this CSI KARE event.",
      };
    }

    return { user, error: null };
  } catch (err: any) {
    if (err.code === "auth/popup-closed-by-user") {
      return { user: null, error: "Sign in cancelled." };
    }
    return {
      user: null,
      error: err.message || "Failed to authenticate with Google.",
    };
  }
}

/**
 * Student Sign Out / Switch Google Account
 */
export async function signOutStudent(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (e) {}
  if (typeof window !== "undefined") {
    localStorage.removeItem("csi_kare_student_email");
    localStorage.removeItem("csi_kare_student_record");
  }
}

/**
 * Admin Sign In with Email and Password (Admin Password: Tony@2006)
 */
export async function signInAdmin(
  email: string,
  pass: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    if (pass === "Tony@2006") {
      if (typeof window !== "undefined") {
        localStorage.setItem("csi_kare_admin_session", "active");
      }
      return { success: true, error: null };
    }

    await signInWithEmailAndPassword(auth, email, pass);
    return { success: true, error: null };
  } catch (err: any) {
    if (pass === "Tony@2006") {
      if (typeof window !== "undefined") {
        localStorage.setItem("csi_kare_admin_session", "active");
      }
      return { success: true, error: null };
    }
    return {
      success: false,
      error: "Invalid Admin Credentials",
    };
  }
}

/**
 * Check if Admin session is active
 */
export function isLocalAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("csi_kare_admin_session") === "active";
}

/**
 * Admin Sign Out
 */
export async function signOutAdmin(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (e) {}
  if (typeof window !== "undefined") {
    localStorage.removeItem("csi_kare_admin_session");
  }
}

/**
 * Listen to auth state changes
 */
export function subscribeAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}
