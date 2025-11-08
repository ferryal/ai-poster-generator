import axios, { AxiosError } from "axios";
import { API_CONFIG } from "./config";

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export class ApiError extends Error {
  public statusCode: number;
  public errorResponse?: ApiErrorResponse;

  constructor(
    message: string,
    statusCode: number,
    errorResponse?: ApiErrorResponse
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorResponse = errorResponse;
  }
}

// Error message mappings based on status codes
const getErrorMessage = (
  statusCode: number,
  defaultMessage: string
): string => {
  const errorMessages: Record<number, string> = {
    400: "Bad Request - Invalid parameters",
    404: "Not Found - Resource doesn't exist",
    500: "Internal Server Error",
  };

  return errorMessages[statusCode] || defaultMessage;
};

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with improved error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    let apiError: ApiError;

    if (error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data;

      if (errorData && typeof errorData === "object" && "error" in errorData) {
        const errorMessage =
          errorData.error || getErrorMessage(statusCode, "An error occurred");
        apiError = new ApiError(errorMessage, statusCode, errorData);

        // Log specific error types for debugging
        console.error(`[API Error ${statusCode}]:`, errorMessage);

        // Log common errors with additional context
        if (errorMessage.includes("Job not found")) {
          console.warn("Tip: Check if the jobId is valid and not expired");
        } else if (errorMessage.includes("Job not completed yet")) {
          console.warn(
            'Tip: Wait for job status to be "completed" before fetching results'
          );
        } else if (errorMessage.includes("Invalid language")) {
          console.warn('Tip: Use only "en" (English) or "ar" (Arabic)');
        } else if (errorMessage.includes("Audio file too large")) {
          console.warn("Tip: Maximum audio file size is 25MB");
        } else if (errorMessage.includes("Invalid poster")) {
          console.warn(
            "Tip: Use Get Poster Presets endpoint to see valid options"
          );
        }
      } else {
        // Fallback for non-standard error responses
        const errorMessage = getErrorMessage(
          statusCode,
          "An unexpected error occurred"
        );
        apiError = new ApiError(errorMessage, statusCode);
        console.error(`[API Error ${statusCode}]:`, errorMessage);
      }
    } else if (error.request) {
      // Request made but no response received (network error)
      apiError = new ApiError(
        "Network Error - Unable to reach the server. Please check your internet connection.",
        0
      );
      console.error("[Network Error]:", error.message);
    } else {
      apiError = new ApiError(
        error.message || "An unexpected error occurred",
        0
      );
      console.error("[Request Error]:", error.message);
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
