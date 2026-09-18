import { z } from "zod";

export const createWorkoutSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Workout name is required")
        .max(100, "Workout name must not exceed 100 characters"),

    scheduledAt: z
        .string()
        .datetime()
        .nullable()
        .optional()
});