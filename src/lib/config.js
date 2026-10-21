// The app always calls its own origin. The backend is reached through a proxy:
// vercel.json rewrites in production, the Vite server proxy in dev/preview
// (target: SERVER_URL). Calling the backend directly fails its CORS allowlist
// on any origin it doesn't list, e.g. Vercel deployment URLs.
export const API_BASE_URL = "/api/v1";
