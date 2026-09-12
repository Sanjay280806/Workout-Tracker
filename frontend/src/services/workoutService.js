import api from "./api";

export async function createWorkout(workoutData) {
  const response = await api.post("/workouts", workoutData);

  return response.data;
}