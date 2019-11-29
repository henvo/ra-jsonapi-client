import axios from 'axios';
import { HttpError } from './errors';

// Handle HTTP errors.
export default () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const password = localStorage.getItem('password');

      const newConfig = config;

      // When a 'token' is available set as Bearer token.
      if (token) {
        newConfig.headers.Authorization = `Bearer ${token}`;
      }

      // When username and password are available use
      // as basic auth credentials.
      if (username && password) {
        newConfig.auth = { username, password };
      }

      return newConfig;
    },
    err => Promise.reject(err),
  );

  // Response interceptor
  axios.interceptors.response.use(
    response => response,
    error => {
      const { status, message } = error;

      if (status < 200 || status >= 300) {
        return Promise.reject(
          new HttpError(message, status),
        );
      }

      return Promise.reject(error);
    },
  );
};
