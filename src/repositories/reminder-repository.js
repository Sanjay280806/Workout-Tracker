
import pool from "../db/pool.js";

export async function findWorkoutsNeedingReminders() {
    const result = await pool.query(
        `
        SELECT
            w.id AS workout_id,
            w.user_id,
            w.name,
            w.scheduled_at,
            (w.scheduled_at - INTERVAL '30 minutes')
                AS reminder_time
        FROM workouts AS w
        LEFT JOIN workout_reminders AS r
            ON r.workout_id = w.id
           AND r.reminder_type = 'upcoming_workout'
           AND r.scheduled_for =
               (w.scheduled_at - INTERVAL '30 minutes')
        WHERE w.status IN ('pending', 'active')
          AND w.scheduled_at > NOW()
          AND w.scheduled_at <= NOW() + INTERVAL '30 minutes'
          AND (
              r.id IS NULL
              OR r.status = 'pending'
          )
        ORDER BY w.scheduled_at ASC;
        `
    );

    return result.rows;
}

export async function reserveReminder({
    workoutId,
    scheduledFor
}) {
    const result = await pool.query(
        `
        INSERT INTO workout_reminders (
            workout_id,
            reminder_type,
            scheduled_for,
            status
        )
        VALUES ($1, 'upcoming_workout', $2, 'pending')
        ON CONFLICT (
            workout_id,
            reminder_type,
            scheduled_for
        )
        DO NOTHING
        RETURNING id;
        `,
        [workoutId, scheduledFor]
    );

    if (result.rows[0]) {
        return result.rows[0];
    }

    // A previous scheduler run may already have reserved it.
    const existing = await pool.query(
        `
        SELECT id, status
        FROM workout_reminders
        WHERE workout_id = $1
          AND reminder_type = 'upcoming_workout'
          AND scheduled_for = $2;
        `,
        [workoutId, scheduledFor]
    );

    return existing.rows[0] ?? null;
}

export async function markReminderQueued(reminderId) {
    await pool.query(
        `
        UPDATE workout_reminders
        SET status = 'queued'
        WHERE id = $1
          AND status = 'pending';
        `,
        [reminderId]
    );
}
