
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import WorkoutForm from "../components/WorkoutForm";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

import {
  getWorkout,
  updateWorkout,
} from "../services/workoutService";

import { getExercises } from "../services/exerciseService";

import useFetch from "../hooks/useFetch";
import useWorkoutForm from "../hooks/useWorkoutForm";

import getApiError from "../utils/getApiError";
import validateWorkout from "../utils/validateWorkout";

function EditWorkout() {
  const { id } = useParams();

  const fetchWorkout = useCallback(
    (signal) => getWorkout(id, signal),
    [id]
  );

  const {
    data: workout,
    isLoading: workoutLoading,
    error: workoutError,
    refetch: refetchWorkout,
  } = useFetch(fetchWorkout);

  const {
    data: exercises,
    isLoading: exercisesLoading,
    error: exercisesError,
    refetch: refetchExercises,
  } = useFetch(getExercises);

  if (workoutLoading || exercisesLoading) {
    return (
      <LoadingSpinner message="Loading workout..." />
    );
  }

  if (workoutError) {
    return (
      <ErrorMessage
        title="Unable to load workout"
        message={workoutError}
        onRetry={refetchWorkout}
      />
    );
  }

  if (exercisesError) {
    return (
      <ErrorMessage
        title="Unable to load exercises"
        message={exercisesError}
        onRetry={refetchExercises}
      />
    );
  }

  if (!workout) {
    return (
      <ErrorMessage
        title="Workout not found"
        message="The workout you're trying to edit doesn't exist."
      />
    );
  }

  return (
    <EditWorkoutForm
      key={id}
      workout={workout}
      exercises={exercises || []}
    />
  );
}


// ==========================================
// EDIT FORM
// ==========================================

function EditWorkoutForm({ workout, exercises }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    workoutName,
    setWorkoutName,
    selectedExercises,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    getWorkoutPayload,
  } = useWorkoutForm(workout);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const validationErrors = validateWorkout({
      workoutName,
      selectedExercises,
    });

    const firstError = Object.values(
      validationErrors
    )[0];

    if (firstError) {
      setError(firstError);
      return;
    }

    try {
      setIsSaving(true);

      await updateWorkout(id, getWorkoutPayload());

      navigate(`/workouts/${id}`);
    } catch (error) {
      console.error(error);

      setError(
        getApiError(
          error,
          "Unable to update workout."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <WorkoutForm
      title="Edit Workout"
      description="Update your workout and track your sets."
      backTo={`/workouts/${id}`}
      backLabel="← Back to workout"
      workoutName={workoutName}
      setWorkoutName={setWorkoutName}
      exercises={exercises}
      selectedExercises={selectedExercises}
      addExercise={addExercise}
      removeExercise={removeExercise}
      addSet={addSet}
      updateSet={updateSet}
      onSubmit={handleSubmit}
      isSaving={isSaving}
      error={error}
      submitLabel="Update Workout"
    />
  );
}

export default EditWorkout;
