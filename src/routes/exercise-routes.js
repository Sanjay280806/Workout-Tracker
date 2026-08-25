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
    const id = Number(req.params.id);
    const exercise = exercises.find(
        (exercise) => exercise.id === id
    );

    if (!exercise) {

        return res.status(404).json({
            error: "Exercise not found"
        });

    }

    res.status(200).json(exercise);
});

export default router;