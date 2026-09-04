import { useState } from "react";

const exercises = [
  { id: 1, name: "Bench Press", muscleGroup: "Chest" },
  { id: 2, name: "Squat", muscleGroup: "Legs" },
  { id: 3, name: "Pull Up", muscleGroup: "Back" },
  { id: 4, name: "Shoulder Press", muscleGroup: "Shoulders" },
];

function CreateWorkout() {
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);

  function addExercise(exercise) {
    const alreadyAdded = selectedExercises.some(
      (item) => item.id === exercise.id
    );

    if (alreadyAdded) return;

    setSelectedExercises([...selectedExercises, exercise]);
  }

  function removeExercise(exerciseId) {
    setSelectedExercises(
      selectedExercises.filter((exercise) => exercise.id !== exerciseId)
    );
  }

  return (
    <div className="create-workout">
      <div className="page-header">
        <h1>Create Workout</h1>
        <p>Build your workout by selecting exercises.</p>
      </div>

      <div className="workout-form">
        <div className="form-group">
          <label htmlFor="workout-name">Workout name</label>

          <input
            id="workout-name"
            type="text"
            placeholder="e.g. Push Day"
            value={workoutName}
            onChange={(event) => setWorkoutName(event.target.value)}
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
          <h2>Selected Exercises</h2>

          {selectedExercises.length === 0 ? (
            <p className="empty-state">
              No exercises added yet.
            </p>
          ) : (
            <div className="selected-exercises">
              {selectedExercises.map((exercise) => (
                <div className="selected-exercise" key={exercise.id}>
                  <div>
                    <strong>{exercise.name}</strong>
                    <p>{exercise.muscleGroup}</p>
                  </div>

                  <button
                    onClick={() => removeExercise(exercise.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CreateWorkout;