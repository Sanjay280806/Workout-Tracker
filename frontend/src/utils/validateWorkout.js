function validateWorkout({
  workoutName,
  selectedExercises = [],
}) {
  const errors = {};

  if (!workoutName?.trim()) {
    errors.workoutName = "Workout name is required.";
  } else if (workoutName.trim().length > 100) {
    errors.workoutName = "Workout name must be less than 100 characters.";
  }

  if (Array.isArray(selectedExercises) && selectedExercises.length > 0) {
    selectedExercises.forEach((exercise, exerciseIndex) => {
      if (!exercise.sets?.length) {
        errors[`exercise_${exerciseIndex}`] =
          `${exercise.name} must have at least one set.`;
        return;
      }

      exercise.sets.forEach((set, setIndex) => {
        const errorKey = `exercise_${exerciseIndex}_set_${setIndex}`;

        if (
          set.weight !== "" &&
          set.weight !== null &&
          set.weight !== undefined
        ) {
          const weight = Number(set.weight);
          if (Number.isNaN(weight) || weight < 0) {
            errors[errorKey] =
              `${exercise.name}, Set ${setIndex + 1}: weight must be 0 or greater.`;
            return;
          }
        }

        if (
          set.reps !== "" &&
          set.reps !== null &&
          set.reps !== undefined
        ) {
          const reps = Number(set.reps);
          if (Number.isNaN(reps) || !Number.isInteger(reps) || reps <= 0) {
            errors[errorKey] =
              `${exercise.name}, Set ${setIndex + 1}: reps must be a positive integer.`;
          }
        }
      });
    });
  }

  return errors;
}

export default validateWorkout;
