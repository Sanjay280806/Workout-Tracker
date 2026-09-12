import { useState } from "react";
import { createWorkout } from "../services/workoutService";
const exercises = [
  { id: 1, name: "Bench Press", muscleGroup: "Chest" },
  { id: 2, name: "Squat", muscleGroup: "Legs" },
  { id: 3, name: "Pull Up", muscleGroup: "Back" },
  { id: 4, name: "Shoulder Press", muscleGroup: "Shoulders" },
];

function CreateWorkout() {
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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
      exercises: selectedExercises.map((exercise) => ({
        exerciseId: exercise.id,
        sets: exercise.sets.map((set) => ({
          weight: Number(set.weight),
          reps: Number(set.reps),
        })),
      })),
    };

    try {
      setIsSaving(true);

      await createWorkout(workoutData);

      alert("Workout saved successfully!");
    } catch (error) {
      console.error(error);
      setError("Unable to save workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function addExercise(exercise) {
    const alreadyAdded = selectedExercises.some(
      (item) => item.id === exercise.id
    );

    if (alreadyAdded) return;

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
          sets: [...exercise.sets, newSet],
        };
      })
    );
  }

  function updateSet(exerciseId, setId, field, value) {
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

  return (
    <div className="create-workout">
      <div className="page-header">
        <h1>Create Workout</h1>
        <p>Build your workout and configure your sets.</p>
      </div>

      <form className="workout-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="workout-name">
            Workout name
          </label>

          <input
            id="workout-name"
            type="text"
            placeholder="e.g. Push Day"
            value={workoutName}
            onChange={(event) =>
              setWorkoutName(event.target.value)
            }
          />
        </div>

        <section>
          <h2>Available Exercises</h2>

          <div className="available-exercises">
            {exercises.map((exercise) => (
              <button
                key={exercise.id}
                className="exercise-option"
                onClick={() => addExercise(exercise)}
              >
                <span>{exercise.name}</span>
                <small>{exercise.muscleGroup}</small>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2>Workout Exercises</h2>

          {selectedExercises.length === 0 ? (
            <p className="empty-state">
              Add exercises to your workout.
            </p>
          ) : (
            <div className="selected-exercises">
              {selectedExercises.map((exercise) => (
                <div
                  className="selected-exercise workout-exercise"
                  key={exercise.id}
                >
                  <div className="exercise-heading">
                    <div>
                      <h3>{exercise.name}</h3>
                      <p>{exercise.muscleGroup}</p>
                    </div>

                    <button
                      onClick={() =>
                        removeExercise(exercise.id)
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className="sets">
                    {exercise.sets.map((set, index) => (
                      <div className="set-row" key={set.id}>
                        <span>Set {index + 1}</span>

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
                    ))}
                  </div>

                  <button
                    className="add-set-button"
                    onClick={() => addSet(exercise.id)}
                  >
                    + Add Set
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        {error && <p className="form-error">{error}</p>}
        <button
          type="submit"
          className="save-workout-button"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Workout"}
        </button>
      </form>
    </div>
  );
}

export default CreateWorkout;

