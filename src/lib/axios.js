import axios from 'axios';
import { API_BASE_URL } from './config';
import { clearSession, getAccessToken } from './auth';

const AUTH_PATH = '/auth/';
const SIGN_IN_PATH = '/sign-in';

const createInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
  });

  instance.interceptors.request.use((config) => {
    const accessToken = getAccessToken();
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const isAuthRequest = error.config?.url?.includes(AUTH_PATH);

      // The backend has no refresh endpoint, so an expired or revoked token
      // means the user has to sign in again. A 401 from an /auth/ call
      // (e.g. wrong password) is a normal error the form handles itself.
      if (error.response?.status === 401 && !isAuthRequest) {
        clearSession();
        if (typeof window !== 'undefined' && window.location.pathname !== SIGN_IN_PATH) {
          const from = `${window.location.pathname}${window.location.search}`;
          window.location.assign(
            `${SIGN_IN_PATH}?expired=1&from=${encodeURIComponent(from)}`
          );
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

const instance = createInstance();

export { instance as axios };
