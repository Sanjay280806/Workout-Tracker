import { useState } from "react";

function toDateTimeLocalString(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function toIsoDatetime(dateTimeLocal) {
  if (!dateTimeLocal) return null;
  const d = new Date(dateTimeLocal);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function useWorkoutForm(initialWorkout = null) {
  const [workoutName, setWorkoutName] = useState(
    initialWorkout?.name || ""
  );

  const initialScheduled =
    initialWorkout?.scheduled_at ||
    initialWorkout?.scheduledAt ||
    "";

  const [scheduledAt, setScheduledAt] = useState(
    toDateTimeLocalString(initialScheduled)
  );

  // Load existing exercises if in initialWorkout or localStorage
  const savedExercises =
    initialWorkout?.exercises ||
    (initialWorkout?.id
      ? JSON.parse(
          localStorage.getItem(`workout_${initialWorkout.id}_exercises`) || "[]"
        )
      : []);

  const [selectedExercises, setSelectedExercises] = useState(savedExercises);

  // ==========================================
  // ADD EXERCISE
  // ==========================================

  function addExercise(exercise) {
    const alreadyAdded = selectedExercises.some(
      (item) => item.id === exercise.id
    );

    if (alreadyAdded) {
      return;
    }

    const exerciseWithSet = {
      ...exercise,
      workoutExerciseId: exercise.id,
      sets: [
        {
          id: 1,
          weight: "20",
          reps: "10",
        },
      ],
    };

    setSelectedExercises((current) => [...current, exerciseWithSet]);
  }

  // ==========================================
  // REMOVE EXERCISE
  // ==========================================

  function removeExercise(exerciseId) {
    setSelectedExercises((current) =>
      current.filter((exercise) => exercise.id !== exerciseId)
    );
  }

  // ==========================================
  // ADD SET
  // ==========================================

  function addSet(exerciseId) {
    setSelectedExercises((current) =>
      current.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        const newSet = {
          id: exercise.sets.length + 1,
          weight: "",
          reps: "",
        };

        return {
          ...exercise,
          sets: [...exercise.sets, newSet],
        };
      })
    );
  }

  // ==========================================
  // UPDATE SET
  // ==========================================

  function updateSet(exerciseId, setId, field, value) {
    setSelectedExercises((current) =>
      current.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.map((set) => {
            if (set.id !== setId) {
              return set;
            }

            return {
              ...set,
              [field]: value,
            };
          }),
        };
      })
    );
  }

  // ==========================================
  // BUILD API PAYLOAD
  // ==========================================

  function getWorkoutPayload() {
    return {
      name: workoutName.trim(),
      scheduledAt: toIsoDatetime(scheduledAt),
    };
  }

  return {
    workoutName,
    setWorkoutName,
    scheduledAt,
    setScheduledAt,
    selectedExercises,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    getWorkoutPayload,
  };
}

export default useWorkoutForm;
