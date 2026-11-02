import { useCallback, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

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
    return <LoadingSpinner message="Loading workout details..." />;
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
// EDIT FORM COMPONENT
// ==========================================

function EditWorkoutForm({ workout, exercises }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const isCompleted = workout.status === "completed";

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
  } = useWorkoutForm(workout);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isCompleted) {
      setError("Completed workouts cannot be modified.");
      return;
    }

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
      await updateWorkout(id, payload);

      // Persist exercise set details locally
      if (selectedExercises.length > 0) {
        localStorage.setItem(
          `workout_${id}_exercises`,
          JSON.stringify(selectedExercises)
        );
      }

      navigate(`/workouts/${id}`);
    } catch (err) {
      console.error(err);
      setError(getApiError(err, "Unable to update workout."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isCompleted) {
    return (
      <div className="workout-completed-notice">
        <Link to={`/workouts/${id}`} className="back-link">
          ← Back to workout
        </Link>
        <div className="alert-banner alert-warning">
          <h2>Workout Completed</h2>
          <p>
            This workout is marked as completed and cannot be modified according to the system rules.
          </p>
          <Link to={`/workouts/${id}`} className="primary-button">
            View Workout Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <WorkoutForm
      title="Edit Workout"
      description="Update your workout schedule and planned sets."
      backTo={`/workouts/${id}`}
      backLabel="← Back to workout"
      workoutName={workoutName}
      setWorkoutName={setWorkoutName}
      scheduledAt={scheduledAt}
      setScheduledAt={setScheduledAt}
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
