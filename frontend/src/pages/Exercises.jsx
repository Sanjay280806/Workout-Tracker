import { useState } from "react";

import ExerciseCard from "../components/ExerciseCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

import useFetch from "../hooks/useFetch";
import { getExercises } from "../services/exerciseService";

const muscleGroups = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
];

function Exercises() {
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] =
    useState("All");

  const {
    data: exercises,
    isLoading,
    error,
    refetch,
  } = useFetch(getExercises);

  const exerciseList = exercises || [];

  const filteredExercises = exerciseList.filter(
    (exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesMuscle =
        selectedMuscle === "All" ||
        exercise.muscleGroup === selectedMuscle;

      return (
        matchesSearch &&
        matchesMuscle
      );
    }
  );

  if (isLoading) {
    return (
      <LoadingSpinner
        message="Loading exercises..."
      />
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Unable to load exercises"
        message={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="exercises-page">

      {/* Header */}
      <div className="page-header">

        <div>
          <h1>Exercises</h1>

          <p>
            Browse exercises and build your
            workouts.
          </p>
        </div>

      </div>

      {/* Controls */}
      <div className="exercise-controls">

        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <div className="muscle-filters">

          {muscleGroups.map((muscle) => (
            <button
              type="button"
              key={muscle}
              className={
                selectedMuscle === muscle
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSelectedMuscle(muscle)
              }
            >
              {muscle}
            </button>
          ))}

        </div>

      </div>

      {/* Exercise list */}
      {filteredExercises.length === 0 ? (
        <div className="page-state empty-state">

          <h2>
            No exercises found
          </h2>

          <p>
            Try changing your search or
            muscle group filter.
          </p>

        </div>
      ) : (
        <div className="exercise-list">

          {filteredExercises.map(
            (exercise) => (
              <ExerciseCard
                key={exercise.id}
                name={exercise.name}
                muscleGroup={
                  exercise.muscleGroup
                }
                equipment={
                  exercise.equipment
                }
              />
            )
          )}

        </div>
      )}

    </div>
  );
}

export default Exercises;