// Spotify PKCE OAuth Flow — Client-side only, no backend needed

const SPOTIFY_SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "playlist-read-private",
].join(" ");

export const SPOTIFY_REDIRECT_URI =
  typeof window !== "undefined"
    ? `${window.location.origin}/spotify-callback`
    : "http://localhost:3000/spotify-callback";

// ── PKCE Helpers ──────────────────────────────────────────────────────────────

function generateRandomString(length: number): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join("");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(input: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function generateCodeVerifier(): Promise<string> {
  const verifier = generateRandomString(64);
  return verifier;
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const hashed = await sha256(verifier);
  return base64urlencode(hashed);
}

// ── Auth Flow ─────────────────────────────────────────────────────────────────

export async function initiateSpotifyLogin(clientId: string): Promise<void> {
  const verifier = await generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("spotify_code_verifier", verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string
): Promise<SpotifyToken | null> {
  const verifier = localStorage.getItem("spotify_code_verifier");
  if (!verifier) return null;

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    code_verifier: verifier,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) return null;

  const data = await response.json();
  const token: SpotifyToken = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  localStorage.setItem("spotify_token", JSON.stringify(token));
  localStorage.removeItem("spotify_code_verifier");

  return token;
}

export async function refreshSpotifyToken(
  refreshToken: string,
  clientId: string
): Promise<SpotifyToken | null> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) return null;

  const data = await response.json();
  const token: SpotifyToken = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  localStorage.setItem("spotify_token", JSON.stringify(token));
  return token;
}

export function getStoredToken(): SpotifyToken | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("spotify_token");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SpotifyToken;
  } catch {
    return null;
  }
}

export function clearToken(): void {
  localStorage.removeItem("spotify_token");
  localStorage.removeItem("spotify_code_verifier");
}

export interface SpotifyToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// ── API Helpers ───────────────────────────────────────────────────────────────

async function spotifyFetch(
  endpoint: string,
  token: string,
  method = "GET",
  body?: unknown
): Promise<Response> {
  return fetch(`https://api.spotify.com/v1${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  duration_ms: number;
  is_playing: boolean;
  progress_ms: number;
}

export async function getCurrentTrack(token: string): Promise<SpotifyTrack | null> {
  try {
    const res = await spotifyFetch("/me/player/currently-playing", token);
    if (res.status === 204 || !res.ok) return null;
    const data = await res.json();
    if (!data || !data.item) return null;
    return {
      ...data.item,
      is_playing: data.is_playing,
      progress_ms: data.progress_ms,
    };
  } catch {
    return null;
  }
}

export async function playTrack(token: string): Promise<void> {
  await spotifyFetch("/me/player/play", token, "PUT");
}

export async function pauseTrack(token: string): Promise<void> {
  await spotifyFetch("/me/player/pause", token, "PUT");
}

export async function nextTrack(token: string): Promise<void> {
  await spotifyFetch("/me/player/next", token, "POST");
}

export async function previousTrack(token: string): Promise<void> {
  await spotifyFetch("/me/player/previous", token, "POST");
}

export async function searchPlaylist(
  token: string,
  query: string
): Promise<string | null> {
  try {
    const res = await spotifyFetch(
      `/search?q=${encodeURIComponent(query)}&type=playlist&limit=1`,
      token
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.playlists?.items?.[0]?.uri || null;
  } catch {
    return null;
  }
}

export async function playContext(token: string, contextUri: string): Promise<void> {
  await spotifyFetch("/me/player/play", token, "PUT", { context_uri: contextUri });
}
