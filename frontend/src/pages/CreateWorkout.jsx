import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createWorkout,
} from "../services/workoutService";

import {
  getExercises,
} from "../services/exerciseService";

import useFetch from "../hooks/useFetch";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import validateWorkout from "../utils/validateWorkout";

function CreateWorkout() {
  const navigate = useNavigate();

  const {
    data: exercises,
    isLoading: exercisesLoading,
    error: exercisesError,
    refetch: refetchExercises,
  } = useFetch(getExercises);

  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] =
    useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const exerciseList = exercises || [];

  function addExercise(exercise) {
    const alreadyAdded =
      selectedExercises.some(
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
        (exercise) =>
          exercise.id !== exerciseId
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

      await createWorkout(workoutData);

      navigate("/workouts");
    } catch (error) {
      console.error(error);

      setError(
        "Unable to create workout. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (exercisesLoading) {
    return (
      <LoadingSpinner
        message="Loading exercises..."
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

  return (
    <div className="create-workout">

      {/* Header */}

      <div className="page-header">

        <div>
          <h1>Create Workout</h1>

          <p>
            Build your workout and track
            your sets.
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
              setWorkoutName(
                event.target.value
              )
            }
            placeholder="e.g. Push Day"
          />

        </div>

        {/* Available exercises */}

        <section className="workout-section">

          <h2>Add Exercises</h2>

          {exerciseList.length === 0 ? (
            <div className="page-state empty-state">

              <h3>
                No exercises available
              </h3>

              <p>
                No exercises were found.
              </p>

            </div>
          ) : (
            <div className="available-exercises">

              {exerciseList.map(
                (exercise) => (
                  <button
                    type="button"
                    key={exercise.id}
                    onClick={() =>
                      addExercise(exercise)
                    }
                  >
                    {exercise.name}
                  </button>
                )
              )}

            </div>
          )}

        </section>

        {/* Selected exercises */}

        <section className="workout-section">

          <h2>Selected Exercises</h2>

          {selectedExercises.length === 0 ? (
            <p className="empty-state">
              No exercises selected.
            </p>
          ) : (
            selectedExercises.map(
              (exercise) => (
                <div
                  className="selected-exercise"
                  key={exercise.id}
                >

                  {/* Exercise header */}

                  <div className="selected-exercise-header">

                    <div>

                      <h3>
                        {exercise.name}
                      </h3>

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
                            min="0"
                            step="0.5"
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
                            min="1"
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
              )
            )
          )}

        </section>

        {/* Error */}

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {/* Submit */}

        <button
          type="submit"
          className="primary-button"
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : "Save Workout"}
        </button>

      </form>

    </div>
  );
}

export default CreateWorkout;