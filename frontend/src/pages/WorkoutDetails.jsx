import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getWorkout,
  deleteWorkout,
} from "../services/workoutService";

function WorkoutDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function loadWorkout() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getWorkout(id);

        setWorkout(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load this workout.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkout();
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
      setDeleteError("Unable to delete this workout.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <p>Loading workout...</p>;
  }

  if (error) {
    return (
      <div className="empty-state">
        <h2>Unable to load workout</h2>
        <p>{error}</p>

        <Link to="/workouts">
          Back to workouts
        </Link>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="empty-state">
        <h2>Workout not found</h2>

        <Link to="/workouts">
          Back to workouts
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

      {/* Delete error */}
      {deleteError && (
        <p className="form-error">
          {deleteError}
        </p>
      )}

      {/* Exercises */}
      <div className="workout-details-exercises">

        {workout.exercises.map((exercise) => (
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

              {exercise.sets.map((set, index) => (
                <div
                  className="sets-table-row"
                  key={set.id}
                >
                  <span>{index + 1}</span>

                  <span>
                    {set.weight} kg
                  </span>

                  <span>
                    {set.reps}
                  </span>
                </div>
              ))}

            </div>

          </section>
        ))}

      </div>

    </div>
  );
}

export default WorkoutDetails;