import { useState } from "react";

function useWorkoutForm(initialWorkout = null) {
  const [workoutName, setWorkoutName] = useState(
    initialWorkout?.name || ""
  );

  const [selectedExercises, setSelectedExercises] =
    useState(initialWorkout?.exercises || []);


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

      sets: [
        {
          id: 1,
          weight: "",
          reps: "",
        },
      ],
    };

    setSelectedExercises((current) => [
      ...current,
      exerciseWithSet,
    ]);
  }


  // ==========================================
  // REMOVE EXERCISE
  // ==========================================

  function removeExercise(exerciseId) {
    setSelectedExercises((current) =>
      current.filter(
        (exercise) => exercise.id !== exerciseId
      )
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
          sets: [
            ...exercise.sets,
            newSet,
          ],
        };
      })
    );
  }


  // ==========================================
  // UPDATE SET
  // ==========================================

  function updateSet(
    exerciseId,
    setId,
    field,
    value
  ) {
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

      exercises: selectedExercises.map(
        (exercise) => ({
          exerciseId: exercise.id,

          sets: exercise.sets.map((set) => ({
            weight: Number(set.weight),
            reps: Number(set.reps),
          })),
        })
      ),
    };
  }


  return {
    workoutName,
    setWorkoutName,

    selectedExercises,

    addExercise,
    removeExercise,
    addSet,
    updateSet,

    getWorkoutPayload,
  };
}

export default useWorkoutForm;