import { Link, useParams } from "react-router-dom";

const workouts = [
  {
    id: 1,
    name: "Push Day",
    date: "Sep 20, 2026",
    duration: "45 min",
    exercises: [
      {
        id: 1,
        name: "Bench Press",
        muscleGroup: "Chest",
        sets: [
          { id: 1, weight: 80, reps: 10 },
          { id: 2, weight: 80, reps: 8 },
          { id: 3, weight: 75, reps: 10 },
        ],
      },
      {
        id: 2,
        name: "Shoulder Press",
        muscleGroup: "Shoulders",
        sets: [
          { id: 1, weight: 20, reps: 10 },
          { id: 2, weight: 20, reps: 8 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Pull Day",
    date: "Sep 18, 2026",
    duration: "52 min",
    exercises: [
      {
        id: 1,
        name: "Pull Up",
        muscleGroup: "Back",
        sets: [
          { id: 1, weight: 0, reps: 10 },
          { id: 2, weight: 0, reps: 8 },
        ],
      },
    ],
  },
];

function WorkoutDetails() {
  const { id } = useParams();

  const workout = workouts.find(
    (item) => item.id === Number(id)
  );

  if (!workout) {
    return (
      <div className="empty-state">
        <h1>Workout not found</h1>

        <Link to="/workouts">
          Back to workouts
        </Link>
      </div>
    );
  }

  return (
    <div className="workout-details">
      <div className="workout-details-header">
        <div>
          <Link to="/workouts" className="back-link">
            ← Back to workouts
          </Link>

          <h1>{workout.name}</h1>

          <p>
            {workout.date} · {workout.duration}
          </p>
        </div>
      </div>

      <div className="workout-details-exercises">
        {workout.exercises.map((exercise) => (
          <section
            className="exercise-details-card"
            key={exercise.id}
          >
            <div className="exercise-details-header">
              <div>
                <h2>{exercise.name}</h2>
                <p>{exercise.muscleGroup}</p>
              </div>
            </div>

            <div className="sets-table">
              <div className="sets-table-header">
                <span>Set</span>
                <span>Weight</span>
                <span>Reps</span>
              </div>

              {exercise.sets.map((set, index) => (
                <div className="sets-table-row" key={set.id}>
                  <span>{index + 1}</span>
                  <span>{set.weight} kg</span>
                  <span>{set.reps}</span>
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