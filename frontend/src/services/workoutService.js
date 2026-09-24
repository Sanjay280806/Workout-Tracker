import api from "./api";

export async function createWorkout(workoutData) {
  const response = await api.post("/workouts", workoutData);
  return response.data;
}

export async function getWorkouts() {
  const response = await api.get("/workouts");
  return response.data;
}

export async function getWorkout(id) {
  const response = await api.get(`/workouts/${id}`);
  return response.data;
}

export async function updateWorkout(id, workoutData) {
  const response = await api.put(`/workouts/${id}`, workoutData);
  return response.data;
}

export async function deleteWorkout(id) {
  const response = await api.delete(`/workouts/${id}`);
  return response.data;
}