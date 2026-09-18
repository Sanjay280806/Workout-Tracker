export function toWorkoutDto(workout) {
    return {
        id: workout.id,
        name: workout.name,
        scheduledAt: workout.scheduled_at,
        status: workout.status,
        createdAt: workout.created_at
    };
}