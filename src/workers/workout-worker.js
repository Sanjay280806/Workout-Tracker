import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";

import pool from "../db/pool.js";

import {
    markReminderSent,
    markReminderFailed,
    markReminderSkipped
} from "../repositories/reminder-repository.js";

import {
    sendWorkoutReminderEmail
} from "../services/email-service.js";

const connection = new IORedis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
        maxRetriesPerRequest: null
    }
);

const worker = new Worker(
    "workout-jobs",

    async (job) => {
        // Ignore other job types if this queue is used for more than reminders.
        if (job.name !== "send-workout-reminder") {
            console.log(`Skipping unsupported job type: ${job.name}`);
            return;
        }

        const { workoutId, userId, reminderId } = job.data;

        if (!workoutId || !userId || !reminderId) {
            throw new Error(
                "Reminder job is missing workoutId, userId, or reminderId."
            );
        }

        console.log(`Processing reminder ${reminderId}`);

        // Fetch the workout and the user who owns it.
        const result = await pool.query(
            `
            SELECT
                w.id,
                w.user_id,
                w.name AS workout_name,
                w.scheduled_at,
                w.status AS workout_status,
                u.email,
                u.name AS user_name
            FROM workouts AS w
            JOIN users AS u
                ON u.id = w.user_id
            WHERE w.id = $1
              AND w.user_id = $2;
            `,
            [workoutId, userId]
        );

        const workout = result.rows[0];

        // The workout might have been deleted or the user/workout
        // relationship may no longer be valid.
        if (!workout) {
            await markReminderSkipped(reminderId);
            console.log(`Reminder ${reminderId} skipped: workout not found.`);
            return;
        }

        // Do not send reminders for cancelled or completed workouts.
        if (!["pending", "active"].includes(workout.workout_status)) {
            await markReminderSkipped(reminderId);
            console.log(
                `Reminder ${reminderId} skipped: workout status is ${workout.workout_status}.`
            );
            return;
        }

        // Do not send a reminder for a workout that has already started.
        if (new Date(workout.scheduled_at).getTime() <= Date.now()) {
            await markReminderSkipped(reminderId);
            console.log(`Reminder ${reminderId} skipped: workout time has passed.`);
            return;
        }

        if (!workout.email) {
            throw new Error("The workout owner does not have an email address.");
        }

        // Send the email. If this throws, BullMQ can retry the job.
        await sendWorkoutReminderEmail({
            to: workout.email,
            userName: workout.user_name,
            workoutName: workout.workout_name,
            scheduledAt: workout.scheduled_at
        });

        // Only mark sent after the email provider accepts the message.
        await markReminderSent(reminderId);

        console.log(`Reminder ${reminderId} marked as sent.`);

        return {
            reminderId,
            status: "sent"
        };
    },

    {
        connection,
        concurrency: 5
    }
);

// Fires when a job completes successfully.
worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

// Fires for failures, including failures that will be retried.
worker.on("failed", async (job, error) => {
    console.error(
        `Job ${job?.id} failed on attempt ${job?.attemptsMade}:`,
        error.message
    );

    if (!job) return;

    const maxAttempts = job.opts.attempts ?? 1;
    const isFinalAttempt = job.attemptsMade >= maxAttempts;

    // Do not mark the reminder failed while BullMQ can still retry it.
    if (
        isFinalAttempt &&
        job.name === "send-workout-reminder" &&
        job.data?.reminderId
    ) {
        try {
            await markReminderFailed(job.data.reminderId);

            console.error(
                `Reminder ${job.data.reminderId} marked as failed after all retries.`
            );
        } catch (dbError) {
            console.error(
                "Could not update failed reminder status:",
                dbError.message
            );
        }
    }
});

worker.on("error", (error) => {
    console.error("Workout worker error:", error.message);
});

// Shut down cleanly.
async function shutdown() {
    console.log("Shutting down workout worker...");

    try {
        await worker.close();
        await connection.quit();
        await pool.end();

        console.log("Workout worker stopped.");
        process.exit(0);
    } catch (error) {
        console.error("Error during worker shutdown:", error);
        process.exit(1);
    }
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

console.log("Workout email reminder worker started.");