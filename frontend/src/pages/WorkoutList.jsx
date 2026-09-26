import { Link } from "react-router-dom";

import { getWorkouts } from "../services/workoutService";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

import useFetch from "../hooks/useFetch";

function WorkoutList() {
  const {
    data: workouts,
    isLoading,
    error,
    refetch,
  } = useFetch(getWorkouts);

  if (isLoading) {
    return (
      <LoadingSpinner message="Loading workouts..." />
    );
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

  return (
    <div className="workouts-page">

      <div className="page-header workout-page-header">
        <div>
          <h1>My Workouts</h1>

          <p>
            View and manage your workout history.
          </p>
        </div>

        <Link
          to="/workouts/create"
          className="primary-button create-workout-link"
        >
          + Create Workout
        </Link>
      </div>

      {!workouts || workouts.length === 0 ? (
        <div className="page-state empty-state">
          <h2>No workouts yet</h2>

          <p>
            Create your first workout to get started.
          </p>

          <Link
            to="/workouts/create"
            className="primary-button"
          >
            Create Workout
          </Link>
        </div>
      ) : (
        <div className="workouts-list">

          {workouts.map((workout) => (
            <article
              className="workout-list-card"
              key={workout.id}
            >
              <div>
                <h2>{workout.name}</h2>

                <p>
                  {workout.exerciseCount} exercises
                  {" · "}
                  {workout.duration}
                </p>

                <small>
                  {workout.date}
                </small>
              </div>

              <Link
                to={`/workouts/${workout.id}`}
              >
                View
              </Link>
            </article>
          ))}

        </div>
      )}

    </div>
  );
}

export default WorkoutList;