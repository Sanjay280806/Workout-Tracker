import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getWorkout,
  deleteWorkout,
} from "../services/workoutService";

import getApiError from "../utils/getApiError";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

function WorkoutDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function loadWorkout() {
    try {
      setIsLoading(true);
      setError("");

      const data = await getWorkout(id);

      setWorkout(data);
    } catch (error) {
      console.error(error);

      setError(
        getApiError(
          error,
          "Unable to load this workout."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function fetchWorkout() {
      try {
        setError("");

        const data = await getWorkout(id);

        setWorkout(data);
      } catch (error) {
        console.error(error);

        setError(
          getApiError(
            error,
            "Unable to load this workout."
          )
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkout();
  }, [id]);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workout?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");

      await deleteWorkout(id);

      navigate("/workouts");
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
        onRetry={loadWorkout}
      />
    );
  }

  if (!workout) {
    return (
      <div className="page-state empty-state">
        <h2>Workout not found</h2>

        <p>
          The workout you're looking for doesn't exist.
        </p>

        <Link
          to="/workouts"
          className="primary-button"
        >
          Back to Workouts
        </Link>
      </div>
    );
  }

  return (
    <div className="workout-details">

      {/* Header */}
      <div className="workout-details-header">

        <div>
          <Link
            to="/workouts"
            className="back-link"
          >
            ← Back to workouts
          </Link>

          <h1>{workout.name}</h1>

          <p>
            {workout.date} · {workout.duration}
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
            className="delete-button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting
              ? "Deleting..."
              : "Delete Workout"}
          </button>

        </div>

      </div>

      {/* Delete error */}
      {deleteError && (
        <p className="form-error">
          {deleteError}
        </p>
      )}

      {/* Exercises */}
      <div className="workout-details-exercises">

        {workout.exercises?.length === 0 ? (
          <div className="page-state empty-state">
            <h2>No exercises</h2>

            <p>
              This workout doesn't contain any exercises.
            </p>
          </div>
        ) : (
          workout.exercises?.map((exercise) => (
            <section
              className="exercise-details-card"
              key={exercise.id}
            >

              <div className="exercise-details-header">

                <div>
                  <h2>{exercise.name}</h2>

                  <p>
                    {exercise.muscleGroup}
                  </p>
                </div>

              </div>

              {/* Sets */}
              <div className="sets-table">

                <div className="sets-table-header">
                  <span>Set</span>
                  <span>Weight</span>
                  <span>Reps</span>
                </div>

                {exercise.sets?.map(
                  (set, index) => (
                    <div
                      className="sets-table-row"
                      key={set.id}
                    >
                      <span>
                        {index + 1}
                      </span>

                      <span>
                        {set.weight} kg
                      </span>

                      <span>
                        {set.reps}
                      </span>
                    </div>
                  )
                )}

              </div>

            </section>
          ))
        )}

      </div>

    </div>
  );
}

export default WorkoutDetails;