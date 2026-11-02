import api from "./api";

export async function checkHealth(signal) {
  const response = await api.get("/health", { signal });
  return response.data;
}
