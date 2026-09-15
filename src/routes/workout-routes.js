import express from "express";

import { authenticate } from "../middleware/auth-middleware.js";

import {
    createWorkout,
    findWorkoutsByUserId,
    findWorkoutByIdForUser,
    deleteWorkoutForUser
} from "../repositories/workout-repository.js";

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
    try {
        const workouts =
            await findWorkoutsByUserId(req.user.id);

        res.status(200).json(workouts);

    } catch (error) {
        next(error);
    }
});

router.post("/", authenticate, async (req, res, next) => {
    try {
        const {
            name,
            scheduledAt
        } = req.body;

        if (!name) {
            return res.status(400).json({
                error: {
                    code: "INVALID_WORKOUT_DATA",
                    message: "Workout name is required"
                }
            });
        }

        const workout = await createWorkout({
            userId: req.user.id,
            name: name.trim(),
            scheduledAt: scheduledAt ?? null
        });

        res.status(201).json(workout);

    } catch (error) {
        next(error);
    }
});

router.get("/:id", authenticate, async (req, res, next) => {
    try {
        const workoutId = Number(req.params.id);

        if (!Number.isSafeInteger(workoutId) || workoutId <= 0) {
            return res.status(400).json({
                error: {
                    code: "INVALID_WORKOUT_ID",
                    message: "Workout ID must be a positive integer"
                }
            });
        }

        const workout =
            await findWorkoutByIdForUser(
                workoutId,
                req.user.id
            );

        if (!workout) {
            return res.status(404).json({
                error: {
                    code: "WORKOUT_NOT_FOUND",
                    message: "Workout not found"
                }
            });
        }

        res.status(200).json(workout);

    } catch (error) {
        next(error);
    }
});

router.delete("/:id", authenticate, async (req, res, next) => {
    try {
        const workoutId = Number(req.params.id);

        if (!Number.isSafeInteger(workoutId) || workoutId <= 0) {
            return res.status(400).json({
                error: {
                    code: "INVALID_WORKOUT_ID",
                    message: "Workout ID must be a positive integer"
                }
            });
        }

        const deleted =
            await deleteWorkoutForUser(
                workoutId,
                req.user.id
            );

        if (!deleted) {
            return res.status(404).json({
                error: {
                    code: "WORKOUT_NOT_FOUND",
                    message: "Workout not found"
                }
            });
        }

        res.status(204).send();

    } catch (error) {
        next(error);
    }
});

export default router;
