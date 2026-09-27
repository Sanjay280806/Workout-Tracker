import api from "./api";

export async function createWorkout(workoutData) {
  const response = await api.post(
    "/workouts",
    workoutData
  );

  return response.data;
}


export async function getWorkouts() {
  const response = await api.get("/workouts");

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.workouts)) {
    return data.workouts;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}


export async function getWorkout(id) {
  const response = await api.get(
    `/workouts/${id}`
  );

  const data = response.data;

  if (data?.workout) {
    return data.workout;
  }

  if (data?.data) {
    return data.data;
  }

  return data;
}


export async function updateWorkout(
  id,
  workoutData
) {
  const response = await api.put(
    `/workouts/${id}`,
    workoutData
  );

  return response.data;
}


export async function deleteWorkout(id) {
  const response = await api.delete(
    `/workouts/${id}`
  );

  return response.data;
}