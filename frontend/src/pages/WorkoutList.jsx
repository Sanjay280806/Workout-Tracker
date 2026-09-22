import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWorkouts } from "../services/workoutService";

function WorkoutList() {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorkouts() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getWorkouts();

        setWorkouts(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load workouts.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkouts();
  }, []);

  if (isLoading) {
    return <p>Loading workouts...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

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

      {workouts.length === 0 ? (
        <div className="empty-state">
          <h2>No workouts yet</h2>
          <p>Create your first workout to get started.</p>

          <Link to="/workouts/create">
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
                  {workout.exerciseCount} exercises ·{" "}
                  {workout.duration}
                </p>

                <small>{workout.date}</small>
              </div>

              <Link to={`/workouts/${workout.id}`}>
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