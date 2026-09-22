import express from "express";

import { authenticate } from "../middleware/auth-middleware.js";

import {
    createWorkoutHandler,
    getUserWorkoutsHandler,
    getWorkoutHandler,
    deleteWorkoutHandler,
    updateWorkoutHandler
} from "../controllers/workout-controller.js";

import { validate }
from "../middleware/validate.js";

import {
    createWorkoutSchema,
    updateWorkoutSchema
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

router.patch(
    "/:id",
    authenticate,
    validate(updateWorkoutSchema),
    updateWorkoutHandler
);

router.delete(
    "/:id",
    authenticate,
    deleteWorkoutHandler
);

export default router;