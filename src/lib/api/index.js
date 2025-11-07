import axios from "axios";

export const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = (config) => {
  const axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor for auth tokens if needed
  axiosInstance.interceptors.request.use(
    async (config) => {
      // Add Firebase auth token if available
      try {
        if (typeof window !== 'undefined') {
          const { getAuth } = await import('firebase/auth');
          const auth = getAuth();
          const user = auth.currentUser;
          
          if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  axiosInstance.interceptors.response.use(
    (response) => {
      // Check if response is HTML when JSON is expected
      const contentType = response.headers['content-type'];
      if (typeof contentType === 'string' && contentType.includes('text/html')) {
        console.error('Received HTML response when JSON was expected:', response.config.url);
        const error = new Error(`API endpoint returned HTML instead of JSON: ${response.config.url}`);
        error.name = 'HTMLResponseError';
        throw error;
      }
      return response;
    },
    (error) => {
      // Handle cases where error response is HTML (like 404 pages)
      const contentType = error.response?.headers?.['content-type'];
      if (typeof contentType === 'string' && contentType.includes('text/html')) {
        console.error('API Error: Received HTML error page instead of JSON:', error.config?.url);
        const customError = new Error(`API endpoint not found: ${error.config?.url}`);
        customError.name = 'APINotFoundError';
        return Promise.reject(customError);
      }
      
      // Handle specific JSON parse errors
      if (error.message?.includes('Unexpected token') && error.message?.includes('<!DOCTYPE')) {
        console.error('JSON Parse Error - API returned HTML:', error.config?.url);
        const customError = new Error(`Invalid JSON response from API: ${error.config?.url || 'unknown endpoint'}`);
        customError.name = 'JSONParseError';
        return Promise.reject(customError);
      }
      
      // Handle global errors here
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  );

  return axiosInstance(config);
};

export default api;