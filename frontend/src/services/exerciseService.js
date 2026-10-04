import api from "./api";

export async function getExercises(signal) {
  const response = await api.get("/exercises", {
    signal,
  });

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.exercises)) {
    return data.exercises;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}