import pool from "../db/pool.js";

export async function findAllExercises() {
    const result = await pool.query(`
        SELECT
            id,
            name,
            description,
            category,
            muscle_group,
            created_at
        FROM exercises
        ORDER BY id;
    `);

    return result.rows;
}

export async function findExerciseById(id) {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            description,
            category,
            muscle_group,
            created_at
        FROM exercises
        WHERE id = $1;
        `,
        [id]
    );

    return result.rows[0] ?? null;
}

export async function createExercise({
    name,
    description,
    category,
    muscleGroup
}) {
    const result = await pool.query(
        `
        INSERT INTO exercises
            (name, description, category, muscle_group)
        VALUES
            ($1, $2, $3, $4)
        RETURNING
            id,
            name,
            description,
            category,
            muscle_group,
            created_at;
        `,
        [
            name,
            description,
            category,
            muscleGroup
        ]
    );

    return result.rows[0];
}

export async function updateExercise(
    id,
    {
        name,
        description,
        category,
        muscleGroup
    }
) {
    const result = await pool.query(
        `
        UPDATE exercises
        SET
            name = $1,
            description = $2,
            category = $3,
            muscle_group = $4
        WHERE id = $5
        RETURNING
            id,
            name,
            description,
            category,
            muscle_group,
            created_at;
        `,
        [
            name,
            description,
            category,
            muscleGroup,
            id
        ]
    );

    return result.rows[0] ?? null;
}

export async function deleteExercise(id) {
    const result = await pool.query(
        `
        DELETE FROM exercises
        WHERE id = $1
        RETURNING id;
        `,
        [id]
    );

    return result.rows[0] ?? null;
}