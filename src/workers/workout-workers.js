import { Worker } from "bullmq";

const connection = {
    host: "localhost",
    port: 6379
};

export const workoutWorker = new Worker(
    "workout-jobs",
    async job => {

        console.log(
            "Processing job:",
            job.name
        );

        console.log(
            "Job data:",
            job.data
        );

        // actual work here

    },
    {
        connection
    }
);

worker.on("completed", job => {
    console.log(
        `Job ${job.id} completed`
    );
});

worker.on("failed", (job, error) => {
    console.error(
        `Job ${job?.id} failed`,
        error
    );
});
