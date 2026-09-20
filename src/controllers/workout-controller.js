import {
    createWorkout,
    getUserWorkouts,
    getWorkout,
    deleteWorkout,
    updateWorkout
} from "../services/workout-service.js";

import { toWorkoutDto }
from "../dtos/workout-dto.js";

//Controller: Create Workout
export async function createWorkoutHandler(
    req,
    res,
    next
) {
    try {
        const workout =
            await createWorkout({
                userId: req.user.id,
                name: req.body.name,
                scheduledAt: req.body.scheduledAt
            });

        res.status(201).json(
            toWorkoutDto(workout)
        );

    } catch (error) {
        next(error);
    }
}

//Controller: Get Workouts
export async function getUserWorkoutsHandler(
    req,
    res,
    next
) {
    try {
        const workouts =
            await getUserWorkouts(
                req.user.id
            );

        res.status(200).json(workouts);

    } catch (error) {
        next(error);
    }
}

//Controller: Get One
export async function getWorkoutHandler(
    req,
    res,
    next
) {
    try {
        const workoutId =
            Number(req.params.id);

        if (!Number.isSafeInteger(workoutId) ||
            workoutId <= 0
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_WORKOUT_ID",
                    message: "Workout ID must be a positive integer"
                }
            });
        }

        const workout =
            await getWorkout(
                workoutId,
                req.user.id
            );

        res.status(200).json(workout);

    } catch (error) {
        next(error);
    }
}

//Controller: Delete
export async function deleteWorkoutHandler(
    req,
    res,
    next
) {
    try {
        const workoutId =
            Number(req.params.id);

        if (!Number.isSafeInteger(workoutId) ||
            workoutId <= 0
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_WORKOUT_ID",
                    message: "Workout ID must be a positive integer"
                }
            });
        }

        await deleteWorkout(
            workoutId,
            req.user.id
        );

        res.status(204).send();

    } catch (error) {
        next(error);
    }
}

export async function updateWorkoutHandler(
    req,
    res,
    next
) {
    try {
        const workoutId =
            Number(req.params.id);

        if (!Number.isSafeInteger(workoutId) ||
            workoutId <= 0
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_WORKOUT_ID",
                    message: "Workout ID must be a positive integer"
                }
            });
        }

        const workout =
            await updateWorkout(
                workoutId,
                req.user.id,
                req.body
            );

        res.status(200).json(
            toWorkoutDto(workout)
        );

    } catch (error) {
        next(error);
    }
}