// All backend routes live under /api/v1. SERVER_URL holds the bare host,
// so append the prefix here unless it was already included.
const API_PREFIX = "/api/v1";

const serverUrl = (import.meta.env.SERVER_URL || "").replace(/\/+$/, "");

export const API_BASE_URL = serverUrl.endsWith(API_PREFIX)
  ? serverUrl
  : `${serverUrl}${API_PREFIX}`;
