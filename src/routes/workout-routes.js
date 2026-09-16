import express from "express";

import { authenticate } from "../middleware/auth-middleware.js";

import {
    createWorkoutHandler,
    getUserWorkoutsHandler,
    getWorkoutHandler,
    deleteWorkoutHandler
} from "../controllers/workout-controller.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    getUserWorkoutsHandler
);

router.post(
    "/",
    authenticate,
    createWorkoutHandler
);

router.get(
    "/:id",
    authenticate,
    getWorkoutHandler
)

router.delete(
    "/:id",
    authenticate,
    deleteWorkoutHandler
);

export default router;
