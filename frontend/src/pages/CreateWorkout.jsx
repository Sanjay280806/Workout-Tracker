import { useState } from "react";
import { useNavigate } from "react-router-dom";

import WorkoutForm from "../components/WorkoutForm";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

import { createWorkout } from "../services/workoutService";
import { getExercises } from "../services/exerciseService";

import useFetch from "../hooks/useFetch";
import useWorkoutForm from "../hooks/useWorkoutForm";

import getApiError from "../utils/getApiError";
import validateWorkout from "../utils/validateWorkout";

function CreateWorkout() {
  const navigate = useNavigate();

  const {
    data: exercises,
    isLoading,
    error: exercisesError,
    refetch,
  } = useFetch(getExercises);

  const {
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
  } = useWorkoutForm();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const validationErrors = validateWorkout({
      workoutName,
      selectedExercises,
    });

    const firstError = Object.values(validationErrors)[0];

    if (firstError) {
      setError(firstError);
      return;
    }

    try {
      setIsSaving(true);

      const payload = getWorkoutPayload();
      const created = await createWorkout(payload);

      // Persist planned exercises locally for live tracking
      if (created?.id && selectedExercises.length > 0) {
        localStorage.setItem(
          `workout_${created.id}_exercises`,
          JSON.stringify(selectedExercises)
        );
      }

      navigate("/workouts");
    } catch (err) {
      console.error(err);
      setError(getApiError(err, "Unable to create workout."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading exercises..." />;
  }

  if (exercisesError) {
    return (
      <ErrorMessage
        title="Unable to load exercises"
        message={exercisesError}
        onRetry={refetch}
      />
    );
  }

  return (
    <WorkoutForm
      title="Create New Workout"
      description="Plan your workout, schedule a reminder, and configure your sets."
      workoutName={workoutName}
      setWorkoutName={setWorkoutName}
      scheduledAt={scheduledAt}
      setScheduledAt={setScheduledAt}
      exercises={exercises || []}
      selectedExercises={selectedExercises}
      addExercise={addExercise}
      removeExercise={removeExercise}
      addSet={addSet}
      updateSet={updateSet}
      onSubmit={handleSubmit}
      isSaving={isSaving}
      error={error}
      submitLabel="Create Workout"
      backTo="/workouts"
      backLabel="← Back to Workouts"
    />
  );
}

export default CreateWorkout;
