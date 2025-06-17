import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// The backend's base URL is read from an environment variable.
// This allows the same code to work for local development and deployed production.
const API_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api/`, // The base for all API calls
});

// Request Interceptor: Adds the auth token to every outgoing request
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // No need to proactively check for expiration here,
      // the response interceptor will handle it if it fails.
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles expired access tokens and retries requests
axiosInstance.interceptors.response.use(
  // If the response is successful, just return it
  (response) => response,
  // If the response has an error (like 401 Unauthorized)
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is a 401 and we haven't already retried this request
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark that we've tried to refresh once

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Make a request to the refresh token endpoint using the absolute path
          const response = await axios.post(`${API_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;

          // Save the new access token
          localStorage.setItem('accessToken', newAccessToken);

          // Update the Authorization header for the original failed request
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request with the new token
          console.log('Access token refreshed. Retrying original request...');
          return axiosInstance(originalRequest);

        } catch (refreshError) {
          console.error('Refresh token is invalid or expired. Logging out.', refreshError);
          // If refresh fails, log the user out
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login'; // Redirect to login page
          return Promise.reject(refreshError);
        }
      }
    }

    // For any other errors, just reject the promise
    return Promise.reject(error);
  }
);

export default axiosInstance;