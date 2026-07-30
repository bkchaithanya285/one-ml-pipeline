import { Registration, EventSettings } from "@/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/**
 * Frontend API Client for communicating with Render Backend REST API
 */

// Health check
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    return await res.json();
  } catch (e) {
    return { status: "OFFLINE" };
  }
}

// Request Cloudinary upload signature from Render Backend API
export async function getCloudinarySignature(registerNumber: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/cloudinary/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registerNumber }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch signature.");
    }

    return await res.json();
  } catch (err: any) {
    // Fallback if local API is invoked
    const res2 = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registerNumber }),
    });
    return await res2.json();
  }
}

// Create Registration via Render Backend API
export async function postRegistrationApi(data: Partial<Registration>) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();
    if (!res.ok) {
      throw new Error(responseData.error || "Backend registration failed.");
    }
    return responseData;
  } catch (err: any) {
    const res2 = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const responseData2 = await res2.json();
    if (!res2.ok) {
      throw new Error(responseData2.error || "Registration failed.");
    }
    return responseData2;
  }
}

// Fetch Event Settings from Render Backend API
export async function getSettingsApi(): Promise<EventSettings> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/settings`);
    if (res.ok) {
      const data = await res.json();
      return data.settings;
    }
  } catch (e) {}

  const res2 = await fetch("/api/settings");
  const data2 = await res2.json();
  return data2.settings;
}

// Update Event Settings on Render Backend API
export async function updateSettingsApi(settings: Partial<EventSettings>) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const res2 = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return await res2.json();
}
