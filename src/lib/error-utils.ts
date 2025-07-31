// Error message utilities for converting technical errors to user-friendly messages

export interface ApiError {
  response?: {
    status?: number;
    data?: any;
  };
  code?: string;
  message?: string;
}

export function getErrorMessage(error: ApiError): string {
  // Handle validation errors (400 status)
  if (error.response?.status === 400) {
    if (error.response.data && typeof error.response.data === "object") {
      // Handle field-specific validation errors
      const errorMessages = Object.values(error.response.data).flat();
      return errorMessages.join(" ");
    } else if (typeof error.response.data === "string") {
      return error.response.data;
    }
    return "Please check your input and try again.";
  }

  // Handle authentication errors (401 status)
  if (error.response?.status === 401) {
    return "Your session has expired. Please refresh the page and try again.";
  }

  // Handle forbidden errors (403 status)
  if (error.response?.status === 403) {
    return "You don't have permission to perform this action.";
  }

  // Handle not found errors (404 status)
  if (error.response?.status === 404) {
    return "The requested resource was not found. Please try again.";
  }

  // Handle conflict errors (409 status)
  if (error.response?.status === 409) {
    return "This information already exists. Please check your details.";
  }

  // Handle unprocessable entity errors (422 status)
  if (error.response?.status === 422) {
    return "The provided information is invalid. Please check your input.";
  }

  // Handle server errors (5xx status)
  if (error.response?.status && error.response.status >= 500) {
    return "Server error. Please try again later or contact support if the problem persists.";
  }

  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || !error.response) {
    return "Network error. Please check your internet connection and try again.";
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return "Request timed out. Please try again.";
  }

  // Handle specific API error messages
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Handle generic error messages
  if (error.message) {
    // Convert technical error messages to user-friendly ones
    const technicalMessages: { [key: string]: string } = {
      'Network Error': 'Network error. Please check your internet connection.',
      'Request failed': 'Request failed. Please try again.',
      'Internal Server Error': 'Server error. Please try again later.',
      'Bad Request': 'Invalid request. Please check your input.',
      'Unauthorized': 'Please log in again to continue.',
      'Forbidden': 'You don\'t have permission to perform this action.',
      'Not Found': 'The requested information was not found.',
      'Conflict': 'This information already exists.',
      'Unprocessable Entity': 'The provided information is invalid.',
    };

    for (const [technical, userFriendly] of Object.entries(technicalMessages)) {
      if (error.message.includes(technical)) {
        return userFriendly;
      }
    }
  }

  // Default user-friendly message
  return "Something went wrong. Please try again or contact support if the problem persists.";
}

// Function to get error title based on error type
export function getErrorTitle(error: ApiError): string {
  if (error.response?.status === 400) return "Validation Error";
  if (error.response?.status === 401) return "Authentication Error";
  if (error.response?.status === 403) return "Permission Error";
  if (error.response?.status === 404) return "Not Found";
  if (error.response?.status === 409) return "Conflict";
  if (error.response?.status === 422) return "Invalid Data";
  if (error.response?.status && error.response.status >= 500) return "Server Error";
  if (error.code === 'NETWORK_ERROR' || !error.response) return "Network Error";
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) return "Timeout Error";
  
  return "Error";
}

// Function to determine if error is retryable
export function isRetryableError(error: ApiError): boolean {
  // Network errors and server errors are usually retryable
  if (error.code === 'NETWORK_ERROR' || !error.response) return true;
  if (error.response?.status && error.response.status >= 500) return true;
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) return true;
  
  return false;
} 