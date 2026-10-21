import axios from "axios";

const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Check your connection and try again.";

// Maps a FastAPI validation entry's `loc` (e.g. ["body", "email"]) to its field name
const fieldFromLoc = (loc = []) => {
  const parts = loc.filter((part) => part !== "body");
  return parts.length ? String(parts[parts.length - 1]) : null;
};

// Pydantic prefixes custom validator messages with "Value error, "
const cleanMessage = (msg = "") => msg.replace(/^Value error,\s*/i, "");

/**
 * Normalises a server error body into a message plus per-field errors.
 * Handles `{ detail: "..." }`, `{ detail: [{ loc, msg }] }` (422) and `{ message: "..." }`.
 */
export const parseApiError = (error, fallback = "Something went wrong. Please try again.") => {
  if (!axios.isAxiosError(error)) {
    return { status: null, message: error?.message || fallback, fieldErrors: {} };
  }

  if (!error.response) {
    return { status: null, message: NETWORK_ERROR_MESSAGE, fieldErrors: {} };
  }

  const { status, data } = error.response;
  const detail = data?.detail ?? data?.message ?? data?.error;
  const fieldErrors = {};
  let message = fallback;

  if (typeof detail === "string" && detail.trim()) {
    message = detail;
  } else if (Array.isArray(detail) && detail.length) {
    const messages = detail.map((item) => {
      const text = cleanMessage(typeof item === "string" ? item : item?.msg);
      const field = fieldFromLoc(item?.loc);
      if (field && text && !fieldErrors[field]) fieldErrors[field] = text;
      return text;
    });
    message = messages.filter(Boolean).join(" ") || fallback;
  } else if (detail && typeof detail === "object" && detail.msg) {
    message = cleanMessage(detail.msg);
  } else if (status >= 500) {
    // Unhandled backend exceptions come back as plain-text "Internal Server Error"
    message = `${fallback} (server error ${status}). Please try again later.`;
  }

  return { status, message, fieldErrors };
};
