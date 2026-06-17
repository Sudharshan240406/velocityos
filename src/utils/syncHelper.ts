/**
 * Sync Helper — Phase 6
 * Local-first profile migration and simulated Cloud synchronization.
 * Handles state serialization, validation, encryption/decryption (Base64 + simple obfuscation),
 * and conflict resolution comparison.
 */

export interface SyncProfileData {
  version: string;
  timestamp: number;
  focusStore: Record<string, any>;
  memoryEvents: any[];
  vehicleProfile: {
    name: string;
    mileage: number;
    fuelLogs: any[];
    serviceReminders: any[];
  };
  authProfile: {
    email: string;
    username: string;
    avatarUrl: string;
  } | null;
}

export function generateSyncPackage(): string {
  if (typeof window === "undefined") return "";

  // Get focus store data
  const focusStoreRaw = localStorage.getItem("focusos-storage");
  const focusStore = focusStoreRaw ? JSON.parse(focusStoreRaw)?.state : {};

  // Get memory logs
  const memoryRaw = localStorage.getItem("velocityos-memory");
  const memoryEvents = memoryRaw ? JSON.parse(memoryRaw) : [];

  // Get vehicle profile
  const vehicleRaw = localStorage.getItem("velocityos-vehicle");
  const vehicleProfile = vehicleRaw
    ? JSON.parse(vehicleRaw)
    : { name: "Ferrari Roma", mileage: 12450, fuelLogs: [], serviceReminders: [] };

  // Get auth profile
  const authRaw = localStorage.getItem("velocityos-auth");
  const authProfile = authRaw ? JSON.parse(authRaw) : null;

  const packageData: SyncProfileData = {
    version: "1.0.0",
    timestamp: Date.now(),
    focusStore,
    memoryEvents,
    vehicleProfile,
    authProfile,
  };

  // Convert to base64 encrypted-like string
  const jsonStr = JSON.stringify(packageData);
  return btoa(unescape(encodeURIComponent(jsonStr)));
}

export function parseSyncPackage(encodedData: string): SyncProfileData | null {
  try {
    const jsonStr = decodeURIComponent(escape(atob(encodedData)));
    const parsed = JSON.parse(jsonStr) as SyncProfileData;
    if (parsed.version && parsed.timestamp && parsed.focusStore) {
      return parsed;
    }
    return null;
  } catch (e) {
    console.error("Invalid sync package structure:", e);
    return null;
  }
}

export interface ConflictReport {
  localTime: number;
  importTime: number;
  localSessions: number;
  importSessions: number;
  localStreak: number;
  importStreak: number;
}

export function analyzeConflict(imported: SyncProfileData): ConflictReport {
  const localStoreRaw = localStorage.getItem("focusos-storage");
  const localStore = localStoreRaw ? JSON.parse(localStoreRaw)?.state : {};
  
  return {
    localTime: localStore.timestamp || Date.now(),
    importTime: imported.timestamp,
    localSessions: localStore.sessionsCompleted || 0,
    importSessions: imported.focusStore.sessionsCompleted || 0,
    localStreak: localStore.streak || 0,
    importStreak: imported.focusStore.streak || 0,
  };
}

export function applySyncProfile(profile: SyncProfileData) {
  if (typeof window === "undefined") return;

  // Restore focusStore
  localStorage.setItem(
    "focusos-storage",
    JSON.stringify({
      state: profile.focusStore,
      version: 0,
    })
  );

  // Restore memory
  localStorage.setItem("velocityos-memory", JSON.stringify(profile.memoryEvents));

  // Restore vehicle
  localStorage.setItem("velocityos-vehicle", JSON.stringify(profile.vehicleProfile));

  // Restore auth
  if (profile.authProfile) {
    localStorage.setItem("velocityos-auth", JSON.stringify(profile.authProfile));
  } else {
    localStorage.removeItem("velocityos-auth");
  }

  // Force page reload to rehydrate components
  window.location.reload();
}
