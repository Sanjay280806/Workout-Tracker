function getApiError(error, fallbackMessage = "Something went wrong.") {
  if (!error.response) {
    return "Unable to connect to the server.";
  }

  const data = error.response.data;

  // Common backend format:
  // { message: "Email already exists" }
  if (data?.message) {
    return data.message;
  }

  // Validation format:
  // { error: "Validation failed" }
  if (data?.error) {
    return data.error;
  }

  // Express-style validation array
  if (Array.isArray(data?.errors)) {
    return data.errors
      .map((item) => item.message || item.msg)
      .filter(Boolean)
      .join(", ");
  }

  return fallbackMessage;
}

export default getApiError;