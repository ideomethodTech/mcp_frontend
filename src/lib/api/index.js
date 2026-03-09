import axios from "axios";

export const baseURL = process.env.NEXT_PUBLIC_API_URL
const api = (config) => {
  const axiosInstance = axios.create({
    baseURL,
    timeout: 300000,
  });

  // ADD THIS: Request interceptor to add auth token
  axiosInstance.interceptors.request.use(
    (config) => {
      // Log outgoing request details for debugging
      console.log("➡️ API Request URL:", config.url);
      console.log("➡️ API Request Payload:", config.data);

      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // ADD THIS BEFORE YOUR API CALLS
  // api.interceptors.request.use(
  //   (config) => {
  //     // Log and BLOCK get_chapters calls
  //     if (config.url?.includes("get_chapters")) {
  //       console.error("🚫 BLOCKED: Infinite get_chapters call from:", new Error().stack);
  //       return Promise.reject(new Error("get_chapters endpoint removed"));
  //     }
  //     return config;
  //   },
  //   (error) => Promise.reject(error)
  // );

  // Add response interceptor for error handling
  axiosInstance.interceptors.response.use(
    (response) => {
      // Check if response is HTML when JSON is expected
      const contentType = response.headers["content-type"];
      if (typeof contentType === "string" && contentType.includes("text/html")) {
        console.error("Received HTML response when JSON was expected:", response.config.url);
        const error = new Error(`API endpoint returned HTML instead of JSON: ${response.config.url}`);
        error.name = "HTMLResponseError";
        throw error;
      }
      return response;
    },
    (error) => {
      // Enhanced diagnostic logging for "Network Error"
      if (!error.response) {
        console.error("🌐 Network Error detected!");
        console.error("Config URL:", error.config?.url);
        console.error("Base URL:", error.config?.baseURL);
        console.error("Full URL attempted:", (error.config?.baseURL || '') + (error.config?.url || ''));

        // Check for common causes
        if (typeof window !== 'undefined' && !window.navigator.onLine) {
          console.error("Device is offline.");
        } else {
          console.error("Possible causes: CORS issues, server down, or invalid domain.");
        }
      } else {
        // Handle cases where error response is HTML (like 404 pages)
        const contentType = error.response?.headers?.["content-type"];
        if (typeof contentType === "string" && contentType.includes("text/html")) {
          console.error("API Error: Received HTML error page instead of JSON:", error.config?.url);
          const customError = new Error(`API endpoint not found (404/500 HTML): ${error.config?.url}`);
          customError.name = "APINotFoundError";
          return Promise.reject(customError);
        }

        // If the backend returned JSON as a string, parse it so frontend code doesn't break
        if (typeof error.response.data === 'string') {
          try {
            error.response.data = JSON.parse(error.response.data);
          } catch (e) {
            // keep it as a string if not JSON
          }
        }

        // Log structured error if available
        const logMethod = error.response.status === 404 ? console.warn : console.error;
        logMethod("API Error Status:", error.response.status);
        logMethod("API Error Response Data:", typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data, null, 2));
      }

      // Handle specific JSON parse errors
      if (error.message?.includes("Unexpected token") && error.message?.includes("<!DOCTYPE")) {
        console.error("JSON Parse Error - API returned HTML:", error.config?.url);
        const customError = new Error(`Invalid JSON response from API: ${error.config?.url || "unknown endpoint"}`);
        customError.name = "JSONParseError";
        return Promise.reject(customError);
      }

      // Handle global errors here
      const finalLogMethod = error.response?.status === 404 ? console.warn : console.error;
      finalLogMethod("Final API Error Log:", error.message || error);
      return Promise.reject(error);
    }
  );

  return axiosInstance(config);
};

export default api;
