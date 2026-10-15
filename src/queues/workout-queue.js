
import "dotenv/config";
import { Queue } from "bullmq";

const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
    ...(process.env.REDIS_PASSWORD
        ? { password: process.env.REDIS_PASSWORD }
        : {}),
};

export const workoutQueue = new Queue("workout-jobs", {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: {
            age: 24 * 60 * 60,
            count: 1000,
        },
        removeOnFail: false,
    },
});

export async function scheduleWorkoutReminder(workout) {
    const jobId = `workout-reminder-${workout.id}`;

    // Remove an older waiting/delayed reminder, if present.
    const existingJob = await workoutQueue.getJob(jobId);

    if (existingJob) {
        const state = await existingJob.getState();

        if (["waiting", "delayed", "waiting-children"].includes(state)) {
            await existingJob.remove();
        }
    }

    if (!workout.scheduled_at || workout.status === "cancelled") {
        return null;
    }

    const scheduledTime = new Date(workout.scheduled_at).getTime();

    if (!Number.isFinite(scheduledTime)) {
        throw new Error("Invalid workout scheduled_at timestamp");
    }

    const delay = Math.max(0, scheduledTime - Date.now());

    return workoutQueue.add(
        "workout-reminder",
        {
            workoutId: String(workout.id),
            userId: String(workout.user_id),
            scheduledAt: new Date(scheduledTime).toISOString(),
        },
        {
            jobId,
            delay,
        }
    );
}

export async function cancelWorkoutReminder(workoutId) {
    const jobId = `workout-reminder-${workoutId}`;
    const job = await workoutQueue.getJob(jobId);

    if (!job) return false;

    const state = await job.getState();

    // Active jobs cannot normally be removed.
    if (["waiting", "delayed", "waiting-children"].includes(state)) {
        await job.remove();
        return true;
    }

    return false;
}

export default workoutQueue;
