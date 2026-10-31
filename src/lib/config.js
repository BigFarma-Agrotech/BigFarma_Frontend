// The app always calls its own origin. The backend is reached through a proxy:
// vercel.json rewrites in production, the Vite server proxy in dev/preview
// (target: SERVER_URL). Calling the backend directly fails its CORS allowlist
// on any origin it doesn't list, e.g. Vercel deployment URLs.
export const API_BASE_URL = "/api/v1";

// WebSockets can't go through the Vercel rewrite, so the notifications socket
// connects to the backend host itself (WebSockets aren't subject to CORS).
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://bigfarma-backend.onrender.com";
export const NOTIFICATIONS_WS_URL = `${BACKEND_URL.replace(/^http/, "ws")}/api/v1/notifications/ws`;
