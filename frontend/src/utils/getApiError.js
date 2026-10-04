function getApiError(
  error,
  fallbackMessage = "Something went wrong."
) {
  // No response means the request never reached
  // the backend or there was a network/CORS issue.
  if (!error?.response) {
    if (error?.message === "Network Error") {
      return "Unable to connect to the server.";
    }

    return fallbackMessage;
  }

  const { status, data } = error.response;

  // Backend validation errors
  if (Array.isArray(data?.errors)) {
    const messages = data.errors
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return (
          item?.message ||
          item?.msg ||
          item?.error
        );
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  // Common backend formats
  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  // HTTP status fallback
  switch (status) {
    case 400:
      return "Invalid request.";

    case 401:
      return "Your session has expired. Please login again.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "The requested resource was not found.";

    case 409:
      return "This request conflicts with existing data.";

    case 422:
      return "The submitted data is invalid.";

    case 429:
      return "Too many requests. Please try again later.";

    case 500:
      return "The server encountered an error.";

    case 502:
    case 503:
    case 504:
      return "The server is temporarily unavailable.";

    default:
      return fallbackMessage;
  }
}

export default getApiError;