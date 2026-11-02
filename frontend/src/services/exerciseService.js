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

export async function getExercise(id, signal) {
  const response = await api.get(`/exercises/${id}`, { signal });
  return response.data;
}

export async function createExercise(exerciseData) {
  const response = await api.post("/exercises", exerciseData);
  return response.data;
}

export async function updateExercise(id, exerciseData) {
  const response = await api.patch(`/exercises/${id}`, exerciseData);
  return response.data;
}

export async function deleteExercise(id) {
  const response = await api.delete(`/exercises/${id}`);
  return response.data;
}
