
import "dotenv/config";

import cron from "node-cron";
import IORedis from "ioredis";

import { workoutQueue } from "../queues/workout-queue.js";

import {
    findWorkoutsNeedingReminders,
    reserveReminder,
    markReminderQueued
} from "../repositories/reminder-repository.js";

const redisConnection = new IORedis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
        maxRetriesPerRequest: null
    }
);

let isRunning = false;

async function scheduleWorkoutReminders() {
    // Prevent overlapping runs inside this process.
    if (isRunning) {
        console.log("Previous scheduler run is still running.");
        return;
    }

    isRunning = true;

    try {
        const workouts = await findWorkoutsNeedingReminders();

        console.log(
            `Found ${workouts.length} workouts needing reminder processing.`
        );

        for (const workout of workouts) {
            const reminderTime = new Date(workout.reminder_time);

            const reminder = await reserveReminder({
                workoutId: workout.workout_id,
                scheduledFor: reminderTime
            });

            if (!reminder) {
                console.error(
                    `Could not reserve reminder for workout ${workout.workout_id}`
                );
                continue;
            }

            // Only pending reminders need to be enqueued.
            if (reminder.status !== "pending") {
                continue;
            }

            const delay = Math.max(
                0,
                reminderTime.getTime() - Date.now()
            );

            try {
                await workoutQueue.add(
                    "send-workout-reminder",
                    {
                        workoutId: String(workout.workout_id),
                        userId: String(workout.user_id),
                        reminderId: String(reminder.id)
                    },
                    {
                        delay,

                        // Stable job ID prevents duplicate jobs
                        // for this reminder within BullMQ.
                        jobId: `workout-reminder-${reminder.id}`
                    }
                );

                await markReminderQueued(reminder.id);

                console.log(
                    `Queued reminder ${reminder.id} for workout ${workout.workout_id}`
                );
            } catch (error) {
                // Leave it pending so a later scheduler run can retry.
                console.error(
                    `Failed to queue reminder ${reminder.id}:`,
                    error.message
                );
            }
        }
    } catch (error) {
        console.error("Workout reminder scheduler failed:", error);
    } finally {
        isRunning = false;
    }
}

// Run once at startup so we don't have to wait for the first minute.
scheduleWorkoutReminders();

// Run every minute.
const task = cron.schedule("* * * * *", () => {
    scheduleWorkoutReminders();
});

async function shutdown() {
    console.log("Stopping workout reminder scheduler...");

    task.stop();

    await workoutQueue.close();
    await redisConnection.quit();

    process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

console.log("Workout reminder scheduler started.");