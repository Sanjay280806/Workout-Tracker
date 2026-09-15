import pool from "../db/pool.js";

export async function createWorkout({
    userId,
    name,
    scheduledAt
}) {
    const result = await pool.query(
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

    return result.rows[0];
}

export async function findWorkoutsByUserId(userId) {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            name,
            scheduled_at,
            status,
            created_at
        FROM workouts
        WHERE user_id = $1
        ORDER BY scheduled_at ASC NULLS LAST, id ASC;
        `,
        [userId]
    );

    return result.rows;
}

export async function findWorkoutByIdForUser(
    workoutId,
    userId
) {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            name,
            scheduled_at,
            status,
            created_at
        FROM workouts
        WHERE id = $1
        AND user_id = $2;
        `,
        [
            workoutId,
            userId
        ]
    );

    return result.rows[0] ?? null;
}

export async function deleteWorkoutForUser(
    workoutId,
    userId
) {
    const result = await pool.query(
        `
        DELETE FROM workouts
        WHERE id = $1
        AND user_id = $2
        RETURNING id;
        `,
        [
            workoutId,
            userId
        ]
    );

    return result.rows[0] ?? null;
}