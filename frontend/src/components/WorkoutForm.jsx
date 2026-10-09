
import { Link } from "react-router-dom";

function WorkoutForm({
  title,
  description,
  workoutName,
  setWorkoutName,
  exercises,
  selectedExercises,
  addExercise,
  removeExercise,
  addSet,
  updateSet,
  onSubmit,
  isSaving,
  error,
  submitLabel,
  backTo,
  backLabel = "← Back",
}) {
  return (
    <div className="create-workout">
      <div className="page-header">
        <div>
          {backTo && (
            <Link to={backTo} className="back-link">
              {backLabel}
            </Link>
          )}

          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
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
            maxLength={100}
          />
        </div>

        {/* Available exercises */}
        <section className="workout-section">
          <h2>Add Exercises</h2>

          {exercises.length === 0 ? (
            <div className="page-state empty-state">
              <h3>No exercises available</h3>
              <p>No exercises were found.</p>
            </div>
          ) : (
            <div className="available-exercises">
              {exercises.map((exercise) => {
                const alreadyAdded =
                  selectedExercises.some(
                    (item) => item.id === exercise.id
                  );

                return (
                  <button
                    type="button"
                    key={exercise.id}
                    disabled={alreadyAdded}
                    onClick={() => addExercise(exercise)}
                  >
                    {alreadyAdded
                      ? `✓ ${exercise.name}`
                      : `+ ${exercise.name}`}
                  </button>
                );
              })}
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
            selectedExercises.map((exercise) => (
              <div
                className="selected-exercise"
                key={exercise.id}
              >
                <div className="selected-exercise-header">
                  <div>
                    <h3>{exercise.name}</h3>
                    <p>{exercise.muscleGroup}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeExercise(exercise.id)
                    }
                  >
                    Remove
                  </button>
                </div>

                <div className="sets">
                  {exercise.sets?.map((set, index) => (
                    <div
                      className="set-row"
                      key={set.id}
                    >
                      <span>Set {index + 1}</span>

                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="Weight (kg)"
                        aria-label={`${exercise.name}, set ${index + 1}, weight in kg`}
                        value={set.weight ?? ""}
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
                        step="1"
                        placeholder="Reps"
                        aria-label={`${exercise.name}, set ${index + 1}, reps`}
                        value={set.reps ?? ""}
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

                  <button
                    type="button"
                    onClick={() => addSet(exercise.id)}
                  >
                    + Add Set
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Error message */}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="primary-button"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : submitLabel}
        </button>
      </form>
    </div>
  );
}

export default WorkoutForm;
