import "dotenv/config";

import { Worker } from "bullmq";
import IORedis from "ioredis";

import pool from "../db/pool.js";

const connection = new IORedis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
        maxRetriesPerRequest: null
    }
);

const worker = new Worker(
    "workout-jobs",

    async (job) => {
        // We only store IDs in the job.
        const { workoutId, userId ,reminderId } = job.data;

        console.log(`Processing job: ${job.name}`);
        console.log(`Workout ID: ${workoutId}`);

        // Always retrieve the latest data from PostgreSQL.
        const result = await pool.query(
            `
            SELECT
                w.id,
                w.name,
                w.scheduled_at,
                w.status,
                u.id AS user_id,
                u.name AS user_name,
                u.email AS user_email
            FROM workouts AS w
            JOIN users AS u
                ON u.id = w.user_id
            WHERE w.id = $1
              AND w.user_id = $2;
            `,
            [workoutId, userId]
        );

        const workout = result.rows[0];

        if (!workout) {
            console.log("Workout no longer exists. Skipping job.");
            return;
        }

        // Do not remind users about cancelled or completed workouts.
        if (!["pending", "active"].includes(workout.status)) {
            console.log(
                `Workout status is ${workout.status}. Skipping reminder.`
            );
            return;
        }

        if (!workout.scheduled_at) {
            console.log("Workout has no scheduled time. Skipping reminder.");
            return;
        }

        const scheduledTime = new Date(workout.scheduled_at);
        const now = new Date();

        if (scheduledTime <= now) {
            console.log("Workout time has passed. Skipping reminder.");
            return;
        }

        // Email integration will be added in Topic 3.
        console.log("====================================");
        console.log("WORKOUT REMINDER (SIMULATED)");
        console.log(`To: ${workout.user_email}`);
        console.log(`User: ${workout.user_name}`);
        console.log(`Workout: ${workout.name}`);
        console.log(`Scheduled: ${scheduledTime.toISOString()}`);
        console.log("====================================");

        // Returning successfully marks this job as completed.
    },

    {
        connection,
        concurrency: 5
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, error) => {
    console.error(
        `Job ${job?.id} failed: ${error.message}`
    );
});

worker.on("error", (error) => {
    console.error("Worker error:", error);
});

async function shutdown() {
    console.log("Shutting down workout worker...");

    await worker.close();
    await connection.quit();
    await pool.end();

    process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

console.log("Workout background worker started.");
