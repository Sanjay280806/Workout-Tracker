import AppError from "../errors/AppError.js";
import express from "express";
const router = express.Router();

const exercises = [
    {
        id: 1,
        name: "Bench Press",
        category: "strength",
        muscleGroup: "chest"
    },
    {
        id: 2,
        name: "Squat",
        category: "strength",
        muscleGroup: "legs"
    }
];

router.get("/" , (req, res) => {
    res.status(200).json(exercises);
});

router.get("/:id" ,(req, res) => {

    const {id} = req.params;

    if (!/^\d+$/.test(id)) {

        return res.status(400).json({
            error: {
                code: "INVALID_EXERCISE_ID",
                message: "Exercise ID must be a positive integer"
            }
        });

    }

    const exerciseId = Number(id);
     if (!Number.isSafeInteger(exerciseId) || exerciseId <= 0) {

        return res.status(400).json({
            error: {
                code: "INVALID_EXERCISE_ID",
                message: "Exercise ID must be a positive integer"
            }
        });

    }
    const exercise = exercises.find(
        (exercise) => exercise.id === exerciseId
    );
    

    if (!exercise) {
        return res.status(404).json({
            error: {
                code: "EXERCISE_NOT_FOUND",
                message: "Exercise not found"
            }
        });
    }

    res.status(200).json(exercise);
});

export default router;