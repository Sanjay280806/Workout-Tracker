import {
  createWorkout as createWorkoutRepository,
  findWorkoutsByUserId,
  findWorkoutByIdForUser,
  deleteWorkoutForUser,
  updateWorkoutForUser,
} from "../repositories/workout-repository.js";
import {
  scheduleWorkoutReminder,
  cancelWorkoutReminder,
} from "../queues/workout-queue.js";
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

  if (workout.scheduled_at) {
    await scheduleWorkoutReminder(workout);
  }

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
    throw new AppError("Workout not found", 404, "WORKOUT_NOT_FOUND");
  }

  return workout;
}

//Service: Delete Workout
export async function deleteWorkout(workoutId, userId) {
    const deleted = await deleteWorkoutForUser(workoutId, userId);

    if (!deleted) {
        throw new AppError(
            "Workout not found",
            404,
            "WORKOUT_NOT_FOUND"
        );
    }

    await cancelWorkoutReminder(deleted.id);

    return deleted;
}

export async function updateWorkout(workoutId, userId, updates) {
  const existingWorkout = await findWorkoutByIdForUser(workoutId, userId);

  if (!existingWorkout) {
    throw new AppError("Workout not found", 404, "WORKOUT_NOT_FOUND");
  }

  if (existingWorkout.status === "completed") {
    throw new AppError(
      "Completed workouts cannot be modified",
      409,
      "WORKOUT_ALREADY_COMPLETED",
    );
  }

  const updatedWorkout = await updateWorkoutForUser(workoutId, userId, updates);

  if (!updatedWorkout) {
    throw new AppError("Workout not found", 404, "WORKOUT_NOT_FOUND");
  }

  await scheduleWorkoutReminder(updatedWorkout);

  return updatedWorkout;
}
