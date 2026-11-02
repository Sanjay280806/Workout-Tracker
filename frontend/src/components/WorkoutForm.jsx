import { Link } from "react-router-dom";

function WorkoutForm({
  title,
  description,
  workoutName,
  setWorkoutName,
  scheduledAt = "",
  setScheduledAt,
  exercises = [],
  selectedExercises = [],
  addExercise,
  removeExercise,
  addSet,
  updateSet,
  onSubmit,
  isSaving,
  error,
  submitLabel = "Save Workout",
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
        <div className="workout-form-fields">
          {/* Workout name */}
          <div className="form-group">
            <label htmlFor="workoutName">Workout Name *</label>
            <input
              id="workoutName"
              type="text"
              value={workoutName}
              onChange={(event) => setWorkoutName(event.target.value)}
              placeholder="e.g. Morning Push Routine"
              maxLength={100}
              required
            />
          </div>

          {/* Schedule Date & Time */}
          {setScheduledAt && (
            <div className="form-group">
              <label htmlFor="scheduledAt">
                Schedule Workout (Optional)
              </label>
              <input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
              />
              <small className="form-help">
                Set a time to receive background email reminders 30 mins before your workout.
              </small>
            </div>
          )}
        </div>

        {/* Available exercises */}
        <section className="workout-section">
          <div className="section-header-compact">
            <h2>Add Exercises from Catalog</h2>
            <Link to="/exercises" className="text-link" target="_blank">
              + Manage Catalog
            </Link>
          </div>

          {exercises.length === 0 ? (
            <div className="page-state empty-state">
              <h3>No exercises available in catalog</h3>
              <p>Add some exercises to your library first to attach them.</p>
              <Link to="/exercises" className="secondary-button">
                Go to Exercises Catalog
              </Link>
            </div>
          ) : (
            <div className="available-exercises">
              {exercises.map((exercise) => {
                const alreadyAdded = selectedExercises.some(
                  (item) => item.id === exercise.id
                );

                const muscle =
                  exercise.muscle_group || exercise.muscleGroup || "";

                return (
                  <button
                    type="button"
                    key={exercise.id}
                    className={`exercise-chip ${alreadyAdded ? "selected" : ""}`}
                    disabled={alreadyAdded}
                    onClick={() => addExercise(exercise)}
                  >
                    <span>{alreadyAdded ? "✓" : "+"}</span>
                    <strong>{exercise.name}</strong>
                    {muscle && <small>({muscle})</small>}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Selected exercises */}
        <section className="workout-section">
          <h2>Selected Workout Plan ({selectedExercises.length})</h2>

          {selectedExercises.length === 0 ? (
            <div className="empty-selection-box">
              <p>No exercises added yet. Click exercises above to plan your routine.</p>
            </div>
          ) : (
            <div className="selected-exercises-list">
              {selectedExercises.map((exercise) => {
                const muscle =
                  exercise.muscle_group || exercise.muscleGroup || "";

                return (
                  <div className="selected-exercise" key={exercise.id}>
                    <div className="selected-exercise-header">
                      <div>
                        <h3>{exercise.name}</h3>
                        {muscle && (
                          <span className="badge-pill badge-muscle">
                            {muscle}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="action-btn-danger"
                        onClick={() => removeExercise(exercise.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="sets">
                      {exercise.sets?.map((set, index) => (
                        <div className="set-row" key={set.id}>
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
                        className="add-set-button"
                        onClick={() => addSet(exercise.id)}
                      >
                        + Add Set
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
          className="primary-button submit-workout-btn"
          disabled={isSaving}
        >
          {isSaving ? "Saving Workout..." : submitLabel}
        </button>
      </form>
    </div>
  );
}

export default WorkoutForm;
