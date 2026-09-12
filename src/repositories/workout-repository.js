import pool from "../db/pool.js";

export async function createWorkout({
    userId,
    name,
    scheduledAt,
    exercises
}) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const workoutResult = await client.query(
            `
            INSERT INTO workouts
                (user_id, name, scheduled_at)
            VALUES
                ($1, $2, $3)
            RETURNING
                id,
                user_id,
                name,
                scheduled_at,
                status,
                created_at;
            `,
            [
                userId,
                name,
                scheduledAt
            ]
        );

        const workout = workoutResult.rows[0];

        for (const exercise of exercises) {
            await client.query(
                `
                INSERT INTO workout_exercises
                    (
                        workout_id,
                        exercise_id,
                        sets,
                        reps,
                        weight_kg
                    )
                VALUES
                    ($1, $2, $3, $4, $5);
                `,
                [
                    workout.id,
                    exercise.exerciseId,
                    exercise.sets,
                    exercise.reps,
                    exercise.weightKg
                ]
            );
        }

        await client.query("COMMIT");

        return workout;

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
}