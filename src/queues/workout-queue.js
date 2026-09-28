import { Queue } from "bullmq";

const connection = {
    host: "localhost",
    port: 6379
};

export const workoutQueue = new Queue(
    "workout-jobs",
    {
        connection
    }
);

export default workoutQueue;