import express from "express";
import { 
    findAllExercises , 
    findExerciseById ,
    createExercise ,
    updateExercise ,
    deleteExercise
} from "../repositories/exercise-repository.js";
const router = express.Router();

router.get("/" , async(req, res, next) => {
    try{
        const exercises = await findAllExercises();

        res.status(200).json(exercises);
               
    }catch(error){
        next(error);
    }
});

router.get("/:id" , async(req, res, next) => {
    try{
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: {
                    code: "INVALID_EXERCISE_ID",
                    message: "Exercise ID must be a positive integer"
                }
            });
        }

        const exerciseId = Number(id);

        if (!Number.isSafeInteger(exerciseId) ||exerciseId <= 0){
            return res.status(400).json({
                error: {
                    code: "INVALID_EXERCISE_ID",
                    message: "Exercise ID must be a positive integer"
                }
            });
        }

        const exercise = await findExerciseById(exerciseId);

        if (!exercise) {
            return res.status(404).json({
                error: {
                    code: "EXERCISE_NOT_FOUND",
                    message: "Exercise not found"
                }
            });
        }

        res.status(200).json(exercise);
    }

    catch (error) {
        next(error);
    }

});

router.post("/", async (req, res, next) => {
    try {
        const {
            name,
            description,
            category,
            muscleGroup
        } = req.body;

        if (!name || !category || !muscleGroup) {
            return res.status(400).json({
                error: {
                    code: "INVALID_EXERCISE_DATA",
                    message: "name, category and muscleGroup are required"
                }
            });
        }

        const exercise = await createExercise({
            name,
            description,
            category,
            muscleGroup
        });

        res.status(201).json(exercise);

    } catch (error) {
        next(error);
    }
});

router.patch("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: {
                    code: "INVALID_EXERCISE_ID",
                    message: "Exercise ID must be a positive integer"
                }
            });
        }

        const exerciseId = Number(id);

        if (
            !Number.isSafeInteger(exerciseId) ||
            exerciseId <= 0
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_EXERCISE_ID",
                    message: "Exercise ID must be a positive integer"
                }
            });
        }

        const {
            name,
            description,
            category,
            muscleGroup
        } = req.body;

        if (!name || !category || !muscleGroup) {
            return res.status(400).json({
                error: {
                    code: "INVALID_EXERCISE_DATA",
                    message: "name, category and muscleGroup are required"
                }
            });
        }

        const exercise = await updateExercise(
            exerciseId,
            {
                name,
                description,
                category,
                muscleGroup
            }
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

    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: {
                    code: "INVALID_EXERCISE_ID",
                    message: "Exercise ID must be a positive integer"
                }
            });
        }

        const exerciseId = Number(id);

        if (
            !Number.isSafeInteger(exerciseId) ||
            exerciseId <= 0
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_EXERCISE_ID",
                    message: "Exercise ID must be a positive integer"
                }
            });
        }

        const deletedExercise = await deleteExercise(exerciseId);

        if (!deletedExercise) {
            return res.status(404).json({
                error: {
                    code: "EXERCISE_NOT_FOUND",
                    message: "Exercise not found"
                }
            });
        }

        res.status(204).send();

    } catch (error) {
        next(error);
    }
});

export default router;