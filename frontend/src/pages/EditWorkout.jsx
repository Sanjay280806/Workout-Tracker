import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getWorkout,
  updateWorkout,
} from "../services/workoutService";

const exercises = [
  {
    id: 1,
    name: "Bench Press",
    muscleGroup: "Chest",
  },
  {
    id: 2,
    name: "Squat",
    muscleGroup: "Legs",
  },
  {
    id: 3,
    name: "Pull Up",
    muscleGroup: "Back",
  },
  {
    id: 4,
    name: "Shoulder Press",
    muscleGroup: "Shoulders",
  },
];

function EditWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorkout() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getWorkout(id);

        setWorkoutName(data.name);

        setSelectedExercises(data.exercises);
      } catch (error) {
        console.error(error);
        setError("Unable to load this workout.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkout();
  }, [id]);

  function addExercise(exercise) {
    const alreadyAdded = selectedExercises.some(
      (item) => item.id === exercise.id
    );

    if (alreadyAdded) {
      return;
    }

    const exerciseWithSet = {
      ...exercise,
      sets: [
        {
          id: 1,
          weight: "",
          reps: "",
        },
      ],
    };

    setSelectedExercises([
      ...selectedExercises,
      exerciseWithSet,
    ]);
  }

  function removeExercise(exerciseId) {
    setSelectedExercises(
      selectedExercises.filter(
        (exercise) => exercise.id !== exerciseId
      )
    );
  }

  function addSet(exerciseId) {
    setSelectedExercises(
      selectedExercises.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        const newSet = {
          id: exercise.sets.length + 1,
          weight: "",
          reps: "",
        };

        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            newSet,
          ],
        };
      })
    );
  }

  function updateSet(
    exerciseId,
    setId,
    field,
    value
  ) {
    setSelectedExercises(
      selectedExercises.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        return {
          ...exercise,

          sets: exercise.sets.map((set) => {
            if (set.id !== setId) {
              return set;
            }

            return {
              ...set,
              [field]: value,
            };
          }),
        };
      })
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!workoutName.trim()) {
      setError("Please enter a workout name.");
      return;
    }

    if (selectedExercises.length === 0) {
      setError("Please add at least one exercise.");
      return;
    }

    const workoutData = {
      name: workoutName.trim(),

      exercises: selectedExercises.map(
        (exercise) => ({
          exerciseId: exercise.id,

          sets: exercise.sets.map((set) => ({
            weight: Number(set.weight),
            reps: Number(set.reps),
          })),
        })
      ),
    };

    try {
      setIsSaving(true);

      await updateWorkout(id, workoutData);

      navigate(`/workouts/${id}`);
    } catch (error) {
      console.error(error);
      setError(
        "Unable to update workout. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p>Loading workout...</p>;
  }

  if (error && !workoutName) {
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

  return (
    <div className="create-workout">

      <div className="page-header">
        <div>
          <Link
            to={`/workouts/${id}`}
            className="back-link"
          >
            ← Back to workout
          </Link>

          <h1>Edit Workout</h1>

          <p>
            Update your workout and exercise details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Workout name */}
        <div className="form-group">
          <label htmlFor="workoutName">
            Workout Name
          </label>

          <input
            id="workoutName"
            type="text"
            value={workoutName}
            onChange={(event) =>
              setWorkoutName(event.target.value)
            }
            placeholder="e.g. Push Day"
          />
        </div>

        {/* Available exercises */}
        <section className="workout-section">
          <h2>Add Exercises</h2>

          <div className="available-exercises">
            {exercises.map((exercise) => (
              <button
                type="button"
                key={exercise.id}
                onClick={() =>
                  addExercise(exercise)
                }
              >
                {exercise.name}
              </button>
            ))}
          </div>
        </section>

        {/* Selected exercises */}
        <section className="workout-section">

          <h2>Selected Exercises</h2>

          {selectedExercises.length === 0 ? (
            <p className="empty-state">
              No exercises selected.
            </p>
          ) : (
            selectedExercises.map((exercise) => (
              <div
                className="selected-exercise"
                key={exercise.id}
              >

                <div className="selected-exercise-header">
                  <div>
                    <h3>{exercise.name}</h3>

                    <p>
                      {exercise.muscleGroup}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeExercise(
                        exercise.id
                      )
                    }
                  >
                    Remove
                  </button>
                </div>

                {/* Sets */}
                <div className="sets">

                  {exercise.sets.map(
                    (set, index) => (
                      <div
                        className="set-row"
                        key={set.id}
                      >

                        <span>
                          Set {index + 1}
                        </span>

                        <input
                          type="number"
                          placeholder="Weight"
                          value={set.weight}
                          onChange={(event) =>
                            updateSet(
                              exercise.id,
                              set.id,
                              "weight",
                              event.target.value
                            )
                          }
                        />

                        <input
                          type="number"
                          placeholder="Reps"
                          value={set.reps}
                          onChange={(event) =>
                            updateSet(
                              exercise.id,
                              set.id,
                              "reps",
                              event.target.value
                            )
                          }
                        />

                      </div>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      addSet(exercise.id)
                    }
                  >
                    + Add Set
                  </button>

                </div>

              </div>
            ))
          )}

        </section>

        {/* Error */}
        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {/* Save */}
        <button
          type="submit"
          className="primary-button"
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : "Save Changes"}
        </button>

      </form>

    </div>
  );
}

export default EditWorkout;