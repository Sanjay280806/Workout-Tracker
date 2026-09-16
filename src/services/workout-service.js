import {
  createWorkout as createWorkoutRepository,
  findWorkoutsByUserId,
  findWorkoutByIdForUser,
  deleteWorkoutForUser,
} from "../repositories/workout-repository.js";
import { AppError } from "../errors/AppError.js";

//Service: Create Workout
export async function createWorkout({ userId, name, scheduledAt }) {
  if (!name || !name.trim()) {
    throw new AppError("Workout name is required", 400, "INVALID_WORKOUT_DATA");
  }

  const workout = await createWorkoutRepository({
    userId,
    name: name.trim(),
    scheduledAt: scheduledAt ?? null,
  });

  return workout;
}

//Service: List Workouts
export async function getUserWorkouts(userId) {
  return findWorkoutsByUserId(userId);
}

//Service: Get One Workout
export async function getWorkout(workoutId, userId) {
  const workout = await findWorkoutByIdForUser(workoutId, userId);

  if (!workout) {
    throw new AppError(
        "Workout not found", 
        404, 
        "WORKOUT_NOT_FOUND"
    );
  }

  return workout;
}

//Service: Delete Workout
export async function deleteWorkout(workoutId, userId) {
  const deleted = await deleteWorkoutForUser(workoutId, userId);

  if (!deleted) {
    const error = new Error("Workout not found");

    error.code = "WORKOUT_NOT_FOUND";
    error.statusCode = 404;

    throw error;
  }

  return deleted;
}
