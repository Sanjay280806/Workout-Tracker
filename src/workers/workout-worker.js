import "dotenv/config";
import { Worker } from "bullmq";
import pool from "../db/pool.js";

const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
    ...(process.env.REDIS_PASSWORD
        ? { password: process.env.REDIS_PASSWORD }
        : {}),
};

export const workoutWorker = new Worker(
    "workout-jobs",
    async (job) => {
        if (job.name !== "workout-reminder") {
            throw new Error(`Unknown job type: ${job.name}`);
        }

        const { workoutId, userId, scheduledAt } = job.data;

        // Always recheck current PostgreSQL state.
        const result = await pool.query(
            `SELECT id, user_id, name, scheduled_at, status
             FROM workouts
             WHERE id = $1 AND user_id = $2`,
            [workoutId, userId]
        );

        const workout = result.rows[0];

        if (!workout) {
            console.log(`Skipping job ${job.id}: workout no longer exists`);
            return { skipped: true, reason: "WORKOUT_NOT_FOUND" };
        }

        if (["cancelled", "completed"].includes(workout.status)) {
            console.log(`Skipping job ${job.id}: workout is ${workout.status}`);
            return { skipped: true, reason: "WORKOUT_INACTIVE" };
        }

        if (!workout.scheduled_at) {
            return { skipped: true, reason: "NO_SCHEDULE" };
        }

        const currentScheduledAt =
            new Date(workout.scheduled_at).getTime();

        const jobScheduledAt = new Date(scheduledAt).getTime();

        if (currentScheduledAt !== jobScheduledAt) {
            console.log(`Skipping stale reminder job ${job.id}`);
            return { skipped: true, reason: "STALE_SCHEDULE" };
        }

        // Protect against execution before the actual due time.
        const remainingDelay = currentScheduledAt - Date.now();

        if (remainingDelay > 0) {
            throw new Error(
                "Reminder was picked up before its scheduled time"
            );
        }

        // Replace this with actual email, push, or in-app notification delivery.
        console.log("Workout reminder due:", {
            workoutId: workout.id,
            userId: workout.user_id,
            workoutName: workout.name,
            scheduledAt: workout.scheduled_at,
        });

        return { success: true, workoutId: String(workout.id) };
    },
    {
        connection,
        concurrency: 5,
    }
);

workoutWorker.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed`, result);
});

workoutWorker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
});

workoutWorker.on("error", (error) => {
    console.error("BullMQ worker error:", error);
});

export async function closeWorkoutWorker() {
    await workoutWorker.close();
    await pool.end();
}
