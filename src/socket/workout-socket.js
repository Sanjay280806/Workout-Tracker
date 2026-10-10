import jwt from "jsonwebtoken";
import { z } from "zod";
import pool from "../db/pool.js";

const joinWorkoutSchema = z.object({
    workoutId: z.coerce.number().int().positive()
});

const completeSetSchema = z.object({
    workoutId: z.coerce.number().int().positive(),
    workoutExerciseId: z.coerce.number().int().positive()
});

function workoutRoom(workoutId) {
    return `workout:${workoutId}`;
}

function sendSocketError(socket, code, message) {
    socket.emit("workout:error", { code, message });
}

export function configureWorkoutSockets(io) {
    // Authenticate the socket connection using the JWT.
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (typeof token !== "string" || !token) {
                return next(new Error("Authentication required"));
            }

            const payload = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            if (
                typeof payload.sub !== "string" ||
                !/^\d+$/.test(payload.sub)
            ) {
                return next(new Error("Invalid authentication token"));
            }

            // Identity comes from the verified token, not client data.
            socket.user = { id: payload.sub };

            next();
        } catch {
            next(new Error("Invalid or expired authentication token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`Authenticated socket connected: ${socket.id}`);

        // Join only a workout the authenticated user owns.
        socket.on("workout:join", async (data) => {
            try {
                const parsed = joinWorkoutSchema.safeParse(data);

                if (!parsed.success) {
                    return sendSocketError(
                        socket,
                        "INVALID_WORKOUT_ID",
                        "A valid workout ID is required"
                    );
                }

                const { workoutId } = parsed.data;

                const result = await pool.query(
                    `
                    SELECT id
                    FROM workouts
                    WHERE id = $1
                      AND user_id = $2;
                    `,
                    [workoutId, socket.user.id]
                );

                if (result.rowCount === 0) {
                    return sendSocketError(
                        socket,
                        "WORKOUT_NOT_FOUND",
                        "Workout not found"
                    );
                }

                await socket.join(workoutRoom(workoutId));

                socket.emit("workout:joined", { workoutId });
            } catch (error) {
                console.error("workout:join failed", error);

                sendSocketError(
                    socket,
                    "INTERNAL_ERROR",
                    "Unable to join workout"
                );
            }
        });

        // Mark a workout exercise entry as completed.
        socket.on("workout:set.completed", async (data) => {
            try {
                const parsed = completeSetSchema.safeParse(data);

                if (!parsed.success) {
                    return sendSocketError(
                        socket,
                        "INVALID_COMPLETION_DATA",
                        "Valid workout and workout exercise IDs are required"
                    );
                }

                const { workoutId, workoutExerciseId } = parsed.data;

                // Require the socket to have joined this workout room.
                if (!socket.rooms.has(workoutRoom(workoutId))) {
                    return sendSocketError(
                        socket,
                        "WORKOUT_ROOM_REQUIRED",
                        "Join this workout before updating its progress"
                    );
                }

                // Update only if the authenticated user owns the workout.
                // The ownership check and update happen in one SQL statement.
                const result = await pool.query(
                    `
                    UPDATE workout_exercises AS we
                    SET completed = TRUE
                    FROM workouts AS w
                    WHERE we.id = $1
                      AND we.workout_id = $2
                      AND w.id = we.workout_id
                      AND w.user_id = $3
                    RETURNING
                        we.id AS workout_exercise_id,
                        we.workout_id,
                        we.exercise_id,
                        we.completed;
                    `,
                    [
                        workoutExerciseId,
                        workoutId,
                        socket.user.id
                    ]
                );

                if (result.rowCount === 0) {
                    return sendSocketError(
                        socket,
                        "WORKOUT_EXERCISE_NOT_FOUND",
                        "Workout exercise not found"
                    );
                }

                const updated = result.rows[0];

                // Broadcast only after PostgreSQL confirms the update.
                io.to(workoutRoom(workoutId)).emit(
                    "workout:progress",
                    {
                        workoutId: updated.workout_id,
                        workoutExerciseId: updated.workout_exercise_id,
                        exerciseId: updated.exercise_id,
                        completed: updated.completed,
                        updatedBy: socket.user.id
                    }
                );
            } catch (error) {
                console.error("workout:set.completed failed", error);

                sendSocketError(
                    socket,
                    "INTERNAL_ERROR",
                    "Unable to update workout progress"
                );
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`Socket disconnected: ${socket.id}`, reason);
        });
    });
}
