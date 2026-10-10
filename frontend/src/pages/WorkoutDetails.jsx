
import { useCallback, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getWorkout,
  deleteWorkout,
} from "../services/workoutService";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

import useFetch from "../hooks/useFetch";
import getApiError from "../utils/getApiError";

function formatWorkoutDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function WorkoutDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchWorkout = useCallback(
    (signal) => getWorkout(id, signal),
    [id]
  );

  const {
    data: workout,
    isLoading,
    error,
    refetch,
  } = useFetch(fetchWorkout);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workout? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");

      await deleteWorkout(id);

      navigate("/workouts", { replace: true });
    } catch (error) {
      console.error(error);

      setDeleteError(
        getApiError(
          error,
          "Unable to delete this workout."
        )
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <LoadingSpinner message="Loading workout..." />
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Unable to load workout"
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (!workout) {
    return (
      <ErrorMessage
        title="Workout not found"
        message="This workout could not be found."
      />
    );
  }

  const exercises = Array.isArray(workout.exercises)
    ? workout.exercises
    : [];

  const exerciseCount =
    typeof workout.exerciseCount === "number"
      ? workout.exerciseCount
      : exercises.length;

  const workoutDate = formatWorkoutDate(
    workout.date ?? workout.createdAt
  );

  const duration =
    workout.duration !== null &&
    workout.duration !== undefined &&
    workout.duration !== ""
      ? typeof workout.duration === "number"
        ? `${workout.duration} min`
        : workout.duration
      : "Not recorded";

  return (
    <div className="workout-details-page">
      {/* Header */}
      <div className="workout-details-header">
        <div>
          <Link
            to="/workouts"
            className="back-link"
          >
            ← Back to workouts
          </Link>

          <h1>{workout.name || "Untitled Workout"}</h1>

          <p className="workout-details-date">
            {workoutDate}
          </p>
        </div>

        <div className="workout-actions">
          <Link
            to={`/workouts/${id}/edit`}
            className="primary-button"
          >
            Edit Workout
          </Link>

          <button
            type="button"
            className="delete-button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Workout"}
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="workout-delete-error" role="alert">
          <p>{deleteError}</p>
        </div>
      )}

      {/* Summary */}
      <section className="workout-details-summary">
        <div className="workout-summary-card">
          <span>Exercises</span>
          <strong>{exerciseCount}</strong>
        </div>

        <div className="workout-summary-card">
          <span>Duration</span>
          <strong>{duration}</strong>
        </div>

        <div className="workout-summary-card">
          <span>Workout date</span>
          <strong>{workoutDate}</strong>
        </div>
      </section>

      {/* Exercises */}
      <section className="workout-details-exercises">
        <div className="workout-details-section-heading">
          <h2>Exercises</h2>
          <span>{exercises.length} listed</span>
        </div>

        {exercises.length === 0 ? (
          <div className="page-state empty-state">
            <h2>No exercises recorded</h2>
            <p>
              Edit this workout to add exercises and sets.
            </p>

            <Link
              to={`/workouts/${id}/edit`}
              className="primary-button"
            >
              Edit Workout
            </Link>
          </div>
        ) : (
          <div className="workout-exercise-list">
            {exercises.map((exercise, exerciseIndex) => {
              const sets = Array.isArray(exercise.sets)
                ? exercise.sets
                : [];

              return (
                <article
                  className="exercise-details-card"
                  key={
                    exercise.id ??
                    exercise.exerciseId ??
                    `${exercise.name}-${exerciseIndex}`
                  }
                >
                  <div className="exercise-details-header">
                    <div>
                      <h3>{exercise.name || "Exercise"}</h3>

                      {exercise.muscleGroup && (
                        <p>{exercise.muscleGroup}</p>
                      )}
                    </div>

                    <span className="exercise-set-count">
                      {sets.length}{" "}
                      {sets.length === 1 ? "set" : "sets"}
                    </span>
                  </div>

                  {sets.length === 0 ? (
                    <p className="exercise-no-sets">
                      No sets recorded.
                    </p>
                  ) : (
                    <div className="sets-table-wrapper">
                      <table className="workout-sets-table">
                        <thead>
                          <tr>
                            <th>Set</th>
                            <th>Weight (kg)</th>
                            <th>Reps</th>
                          </tr>
                        </thead>

                        <tbody>
                          {sets.map((set, setIndex) => (
                            <tr
                              key={
                                set.id ??
                                `${exerciseIndex}-${setIndex}`
                              }
                            >
                              <td>{setIndex + 1}</td>
                              <td>{set.weight ?? "—"}</td>
                              <td>{set.reps ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default WorkoutDetails;
