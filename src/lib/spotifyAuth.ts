const REDIRECT_URI = typeof window !== "undefined" ? `${window.location.origin}/spotify-callback` : "http://localhost:3000/spotify-callback";

export function generateCodeVerifier(length: number = 128): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  
  // Base64Url encode the digest
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function redirectToSpotifyAuthorize(clientId: string) {
  const verifier = generateCodeVerifier();
  localStorage.setItem("spotify:code_verifier", verifier);

  const challenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: "user-read-playback-state user-modify-playback-state user-read-currently-playing",
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getSpotifyTokens(clientId: string, code: string): Promise<any> {
  const codeVerifier = localStorage.getItem("spotify:code_verifier") || "";

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Spotify access token");
  }

  const tokens = await response.json();
  saveTokens(tokens);
  return tokens;
}

export async function refreshSpotifyToken(clientId: string): Promise<any> {
  const refreshToken = localStorage.getItem("spotify:refresh_token");
  if (!refreshToken) return null;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    localStorage.removeItem("spotify:access_token");
    localStorage.removeItem("spotify:refresh_token");
    throw new Error("Failed to refresh Spotify token");
  }

  const tokens = await response.json();
  saveTokens(tokens);
  return tokens;
}

function saveTokens(tokens: any) {
  localStorage.setItem("spotify:access_token", tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem("spotify:refresh_token", tokens.refresh_token);
  }
  localStorage.setItem("spotify:expires_at", (Date.now() + tokens.expires_in * 1000).toString());
}
