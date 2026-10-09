
import { Link } from "react-router-dom";

import { getWorkouts } from "../services/workoutService";
import useFetch from "../hooks/useFetch";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

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

function getExerciseCount(workout) {
  if (typeof workout.exerciseCount === "number") {
    return workout.exerciseCount;
  }

  if (Array.isArray(workout.exercises)) {
    return workout.exercises.length;
  }

  return 0;
}

function formatDuration(duration) {
  if (duration === null || duration === undefined || duration === "") {
    return "Duration unavailable";
  }

  if (typeof duration === "number") {
    return `${duration} min`;
  }

  return String(duration);
}

function WorkoutList() {
  const {
    data: workouts,
    isLoading,
    error,
    refetch,
  } = useFetch(getWorkouts);

  if (isLoading) {
    return <LoadingSpinner message="Loading workouts..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Unable to load workouts"
        message={error}
        onRetry={refetch}
      />
    );
  }

  // Supports the normalized array returned by workoutService.
  const workoutList = Array.isArray(workouts) ? workouts : [];

  return (
    <div className="workouts-page">
      <div className="page-header workout-page-header">
        <div>
          <h1>My Workouts</h1>
          <p>View and manage your workout history.</p>
        </div>

        <Link
          to="/workouts/create"
          className="primary-button create-workout-link"
        >
          + Create Workout
        </Link>
      </div>

      <div className="workout-summary">
        <div>
          <span className="workout-summary-label">
            Total workouts
          </span>

          <strong>{workoutList.length}</strong>
        </div>
      </div>

      {workoutList.length === 0 ? (
        <div className="page-state empty-state">
          <h2>No workouts yet</h2>

          <p>
            Your workout history will appear here once you
            create your first workout.
          </p>

          <Link
            to="/workouts/create"
            className="primary-button"
          >
            Create Your First Workout
          </Link>
        </div>
      ) : (
        <div className="workouts-list">
          {workoutList.map((workout) => {
            const workoutId = workout.id ?? workout._id;
            const exerciseCount = getExerciseCount(workout);

            return (
              <article
                className="workout-list-card"
                key={workoutId}
              >
                <div className="workout-list-card-content">
                  <h2>
                    {workout.name || "Untitled Workout"}
                  </h2>

                  <div className="workout-meta">
                    <span>
                      {exerciseCount}{" "}
                      {exerciseCount === 1 ? "exercise" : "exercises"}
                    </span>

                    <span>
                      {formatDuration(workout.duration)}
                    </span>

                    <span>
                      {formatWorkoutDate(
                        workout.date ??
                        workout.createdAt ??
                        workout.updatedAt
                      )}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/workouts/${workoutId}`}
                  className="workout-view-link"
                  aria-label={`View ${workout.name || "workout"}`}
                >
                  View Details →
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WorkoutList;
