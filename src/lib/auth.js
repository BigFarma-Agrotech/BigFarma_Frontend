import Cookies from "js-cookie";

export const ACCESS_TOKEN_KEY = "BIGFARMA_ACCESS_TOKEN";
export const REFRESH_TOKEN_KEY = "BIGFARMA_REFRESH_TOKEN";
export const ROLE_KEY = "BIGFARMA_ROLE";
export const PROFILE_SETUP_KEY = "BIGFARMA_PROFILE_SETUP";

const REMEMBER_ME_DAYS = 7;

const cookieOptions = (remember) => ({
  // Session cookie unless the user asked to be remembered
  ...(remember ? { expires: REMEMBER_ME_DAYS } : {}),
  sameSite: "lax",
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
});

// Reads the `exp` claim without verifying the signature; the server does that.
const getTokenExpiry = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
};

export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_KEY) || null;

export const getRole = () => Cookies.get(ROLE_KEY) || null;

export const isTokenExpired = (token) => {
  const expiry = getTokenExpiry(token);
  return expiry !== null && expiry <= Date.now();
};

export const isAuthenticated = () => {
  const token = getAccessToken();
  return Boolean(token) && !isTokenExpired(token);
};

// Persists the Token payload returned by POST /auth/login
export const setSession = (
  { access_token, refresh_token, user_category, profile_setup },
  { remember = false } = {}
) => {
  const options = cookieOptions(remember);
  Cookies.set(ACCESS_TOKEN_KEY, access_token, options);
  if (refresh_token) Cookies.set(REFRESH_TOKEN_KEY, refresh_token, options);
  if (user_category) Cookies.set(ROLE_KEY, user_category, options);
  if (typeof profile_setup === "boolean") {
    Cookies.set(PROFILE_SETUP_KEY, String(profile_setup), options);
  }
};

export const clearSession = () => {
  [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE_KEY, PROFILE_SETUP_KEY].forEach(
    (key) => Cookies.remove(key)
  );
  localStorage.removeItem("token");
  localStorage.removeItem("selectedRole");
};
