import api from "./api";

export async function createWorkout(workoutData) {
  const response = await api.post("/api/v1/workouts", workoutData);
  return response.data;
}

export async function getWorkouts() {
  const response = await api.get("/api/v1/workouts");
  return response.data;
}

export async function getWorkout(id) {
  const response = await api.get(`/api/v1/workouts/${id}`);
  return response.data;
}

export async function updateWorkout(id, workoutData) {
  const response = await api.put(`/api/v1/workouts/${id}`, workoutData);
  return response.data;
}

export async function deleteWorkout(id) {
  const response = await api.delete(`/api/v1/workouts/${id}`);
  return response.data;
}