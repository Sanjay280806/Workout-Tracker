import api from "./api";


// ==========================================
// CREATE
// ==========================================

export async function createWorkout(
  workoutData
) {
  const response = await api.post(
    "/workouts",
    workoutData
  );

  return response.data;
}


// ==========================================
// GET ALL
// ==========================================

export async function getWorkouts(
  signal
) {
  const response = await api.get(
    "/workouts",
    {
      signal,
    }
  );

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


// ==========================================
// GET ONE
// ==========================================

export async function getWorkout(
  id,
  signal
) {
  const response = await api.get(
    `/workouts/${id}`,
    {
      signal,
    }
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


// ==========================================
// UPDATE
// ==========================================

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


// ==========================================
// DELETE
// ==========================================

export async function deleteWorkout(
  id
) {
  const response = await api.delete(
    `/workouts/${id}`
  );

  return response.data;
}