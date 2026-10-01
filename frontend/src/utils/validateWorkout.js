function validateWorkout({
  workoutName,
  selectedExercises,
}) {
  const errors = {};

  if (!workoutName?.trim()) {
    errors.workoutName =
      "Workout name is required.";
  } else if (workoutName.trim().length < 3) {
    errors.workoutName =
      "Workout name must be at least 3 characters.";
  } else if (workoutName.trim().length > 100) {
    errors.workoutName =
      "Workout name must be less than 100 characters.";
  }

  if (!selectedExercises?.length) {
    errors.exercises =
      "Add at least one exercise.";

    return errors;
  }

  selectedExercises.forEach(
    (exercise, exerciseIndex) => {
      if (!exercise.sets?.length) {
        errors[`exercise_${exerciseIndex}`] =
          `${exercise.name} must have at least one set.`;

        return;
      }

      exercise.sets.forEach(
        (set, setIndex) => {
          const weight = Number(set.weight);
          const reps = Number(set.reps);

          const errorKey =
            `exercise_${exerciseIndex}_set_${setIndex}`;

          if (
            set.weight === "" ||
            set.weight === null ||
            set.weight === undefined
          ) {
            errors[errorKey] =
              `${exercise.name}, Set ${
                setIndex + 1
              }: weight is required.`;

            return;
          }

          if (
            Number.isNaN(weight) ||
            weight < 0
          ) {
            errors[errorKey] =
              `${exercise.name}, Set ${
                setIndex + 1
              }: weight must be 0 or greater.`;

            return;
          }

          if (
            set.reps === "" ||
            set.reps === null ||
            set.reps === undefined
          ) {
            errors[errorKey] =
              `${exercise.name}, Set ${
                setIndex + 1
              }: reps are required.`;

            return;
          }

          if (
            Number.isNaN(reps) ||
            !Number.isInteger(reps) ||
            reps <= 0
          ) {
            errors[errorKey] =
              `${exercise.name}, Set ${
                setIndex + 1
              }: reps must be a positive whole number.`;
          }
        }
      );
    }
  );

  return errors;
}

export default validateWorkout;