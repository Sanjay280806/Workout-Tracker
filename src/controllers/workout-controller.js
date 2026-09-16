import {
    createWorkout,
    getUserWorkouts,
    getWorkout,
    deleteWorkout
} from "../services/workout-service.js";

//Controller: Create Workout
export async function createWorkoutHandler(
    req,
    res,
    next
) {
    try {
        const {
            name,
            scheduledAt
        } = req.body;

        const workout =
            await createWorkout({
                userId: req.user.id,
                name,
                scheduledAt
            });

        res.status(201).json(workout);

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

        if (
            !Number.isSafeInteger(workoutId) ||
            workoutId <= 0
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_WORKOUT_ID",
                    message:
                        "Workout ID must be a positive integer"
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

        if (
            !Number.isSafeInteger(workoutId) ||
            workoutId <= 0
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_WORKOUT_ID",
                    message:
                        "Workout ID must be a positive integer"
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