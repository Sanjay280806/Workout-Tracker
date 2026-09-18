import express from "express";

import { authenticate } from "../middleware/auth-middleware.js";

import {
    createWorkoutHandler,
    getUserWorkoutsHandler,
    getWorkoutHandler,
    deleteWorkoutHandler
} from "../controllers/workout-controller.js";

import { validate }
    from "../middleware/validate.js";

import {
    createWorkoutSchema
} from "../schemas/workout-schema.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    getUserWorkoutsHandler
);

router.post(
    "/",
    authenticate,
    validate(createWorkoutSchema),
    createWorkoutHandler
);

router.get(
    "/:id",
    authenticate,
    getWorkoutHandler
);

router.delete(
    "/:id",
    authenticate,
    deleteWorkoutHandler
);

export default router;
