import pool from "../db/pool.js";

export async function createFile({
    userId,
    objectKey,
    originalFilename,
    contentType,
    sizeBytes
}) {
    const result = await pool.query(
        `
        INSERT INTO files (
            user_id,
            object_key,
            original_filename,
            content_type,
            size_bytes
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            user_id,
            object_key,
            original_filename,
            content_type,
            size_bytes,
            created_at;
        `,
        [
            userId,
            objectKey,
            originalFilename,
            contentType,
            sizeBytes
        ]
    );

    return result.rows[0];
}

export async function findFileByIdForUser(
    fileId,
    userId
) {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            object_key,
            original_filename,
            content_type,
            size_bytes,
            created_at
        FROM files
        WHERE id = $1
        AND user_id = $2;
        `,
        [
            fileId,
            userId
        ]
    );

    return result.rows[0] ?? null;
}