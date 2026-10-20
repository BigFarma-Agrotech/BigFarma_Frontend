import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL = import.meta.env.SERVER_URL;
const refreshEndpoint = '/auth/refresh-token';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const createInstance = () => {
  const instance = axios.create({
    baseURL,
  });

  instance.interceptors.request.use((config) => {
    const accessToken = Cookies.get('BIGFARMA_ACCESS_TOKEN');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const err = error;

      if (err.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const expiredToken = Cookies.get('BIGFARMA_ACCESS_TOKEN');
        const refreshToken = Cookies.get('BIGFARMA_REFRESH_TOKEN');

        if (!refreshToken || !expiredToken) {
          Cookies.remove('BIGFARMA_ACCESS_TOKEN');
          Cookies.remove('BIGFARMA_REFRESH_TOKEN');
          Cookies.remove('BIGFARMA_USER_ID');
          if (
            typeof window !== 'undefined'
          ) {
            if (window.location.pathname !== '/sign-in') {
              window.location.href = '/sign-in';
            }
          }
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              const accessToken = token;
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return axios(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const response = await axios.post(
            `${baseURL}${refreshEndpoint}`,
            {
              expiredToken,
              refreshToken,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          const newAccessToken = response.data && response.data.accessToken;
          Cookies.set('BIGFARMA_ACCESS_TOKEN', newAccessToken);

          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          Cookies.remove('BIGFARMA_ACCESS_TOKEN');
          Cookies.remove('BIGFARMA_REFRESH_TOKEN');
          Cookies.remove('BIGFARMA_USER_ID');
          if (
            typeof window !== 'undefined' &&
            !['/', '/admin', '/login'].includes(window.location.pathname)
          ) {
            const userType = Cookies.get('BIGFARMA_USER_TYPE');
            const isAdmin = userType === 'Admin' || window.location.pathname.includes('/admin');
            window.location.href = isAdmin ? '/admin' : '/';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

const instance = createInstance();

export { instance as axios };
