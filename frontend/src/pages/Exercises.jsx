import { useState } from "react";
import ExerciseCard from "../components/ExerciseCard";

const exercises = [
  {
    id: 1,
    name: "Bench Press",
    muscleGroup: "Chest",
    equipment: "Barbell",
  },
  {
    id: 2,
    name: "Squat",
    muscleGroup: "Legs",
    equipment: "Barbell",
  },
  {
    id: 3,
    name: "Pull Up",
    muscleGroup: "Back",
    equipment: "Bodyweight",
  },
  {
    id: 4,
    name: "Shoulder Press",
    muscleGroup: "Shoulders",
    equipment: "Dumbbell",
  },
];

const muscleGroups = ["All", "Chest", "Back", "Legs", "Shoulders"];

function Exercises() {
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesMuscle =
      selectedMuscle === "All" ||
      exercise.muscleGroup === selectedMuscle;

    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="exercises-page">
      <div className="page-header">
        <div>
          <h1>Exercises</h1>
          <p>Browse exercises and build your workouts.</p>
        </div>
      </div>

      <div className="exercise-controls">
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="muscle-filters">
          {muscleGroups.map((muscle) => (
            <button
              key={muscle}
              className={selectedMuscle === muscle ? "active" : ""}
              onClick={() => setSelectedMuscle(muscle)}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      <div className="exercise-list">
        {filteredExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            name={exercise.name}
            muscleGroup={exercise.muscleGroup}
            equipment={exercise.equipment}
          />
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <p className="empty-state">No exercises found.</p>
      )}
    </div>
  );
}

export default Exercises;