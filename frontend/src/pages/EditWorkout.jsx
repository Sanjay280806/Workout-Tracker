import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getWorkout,
  updateWorkout,
} from "../services/workoutService";

import { getExercises } from "../services/exerciseService";

import useFetch from "../hooks/useFetch";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import getApiError from "../utils/getApiError";
import validateWorkout from "../utils/validateWorkout";

function EditWorkout() {
  const { id } = useParams();

  const fetchWorkout = useCallback(() => {
    return getWorkout(id);
  }, [id]);

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
      <div className="page-state empty-state">
        <h2>Workout not found</h2>

        <p>
          The workout you're trying to edit doesn't exist.
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
    <EditWorkoutForm
      key={workout.id}
      workout={workout}
      exercises={exercises || []}
    />
  );
}


// ======================================================
// EDIT WORKOUT FORM
// ======================================================

function EditWorkoutForm({ workout, exercises }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workoutName, setWorkoutName] = useState(
    workout.name || ""
  );

  const [selectedExercises, setSelectedExercises] =
    useState(workout.exercises || []);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");


  // ======================================================
  // ADD EXERCISE
  // ======================================================

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


  // ======================================================
  // REMOVE EXERCISE
  // ======================================================

  function removeExercise(exerciseId) {
    setSelectedExercises(
      selectedExercises.filter(
        (exercise) => exercise.id !== exerciseId
      )
    );
  }


  // ======================================================
  // ADD SET
  // ======================================================

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


  // ======================================================
  // UPDATE SET
  // ======================================================

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


  // ======================================================
  // SUBMIT
  // ======================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setSaveError("");

    const validationErrors = validateWorkout({
      workoutName,
      selectedExercises,
    });

    const firstError = Object.values(
      validationErrors
    )[0];

    if (firstError) {
      setSaveError(firstError);
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

      await updateWorkout(
        id,
        workoutData
      );

      navigate(`/workouts/${id}`);
    } catch (error) {
      console.error(error);

      setSaveError(
        getApiError(
          error,
          "Unable to update workout."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="create-workout">

      {/* HEADER */}

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
            Update your workout and track your sets.
          </p>

        </div>
      </div>


      <form onSubmit={handleSubmit}>

        {/* WORKOUT NAME */}

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


        {/* AVAILABLE EXERCISES */}

        <section className="workout-section">

          <h2>Add Exercises</h2>

          {exercises.length === 0 ? (
            <div className="page-state empty-state">

              <h3>No exercises available</h3>

              <p>
                No exercises were found.
              </p>

            </div>
          ) : (
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
          )}

        </section>


        {/* SELECTED EXERCISES */}

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

                {/* EXERCISE HEADER */}

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


                {/* SETS */}

                <div className="sets">

                  {exercise.sets?.map(
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

            ))
          )}

        </section>


        {/* ERROR */}

        {saveError && (
          <p className="form-error">
            {saveError}
          </p>
        )}


        {/* UPDATE */}

        <button
          type="submit"
          className="primary-button"
          disabled={isSaving}
        >
          {isSaving
            ? "Updating..."
            : "Update Workout"}
        </button>

      </form>

    </div>
  );
}

export default EditWorkout;