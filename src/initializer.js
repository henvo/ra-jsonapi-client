import axios from 'axios';
import { HttpError } from './errors';

// Handle HTTP errors.
export default () => {
  axios.interceptors.response.use(
    response => response,
    (error) => {
      const { status, data } = error.response;

      if (status < 200 || status >= 300) {
        return Promise.reject(
          new HttpError(data, status),
        );
      }

      return Promise.reject(error);
    },
  );
};
