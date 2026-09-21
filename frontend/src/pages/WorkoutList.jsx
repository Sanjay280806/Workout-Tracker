import { Link } from "react-router-dom";

const workouts = [
  {
    id: 1,
    name: "Push Day",
    duration: "45 min",
    exerciseCount: 4,
    date: "Sep 20, 2026",
  },
  {
    id: 2,
    name: "Pull Day",
    duration: "52 min",
    exerciseCount: 5,
    date: "Sep 18, 2026",
  },
  {
    id: 3,
    name: "Leg Day",
    duration: "60 min",
    exerciseCount: 5,
    date: "Sep 16, 2026",
  },
];

function WorkoutList() {
  return (
    <div className="workouts-page">
      <div className="page-header workout-page-header">
        <div>
          <h1>My Workouts</h1>
          <p>View and manage your workout history.</p>
        </div>

        <Link
          to="/workouts/create"
          className="primary-button create-workout-link"
        >
          + Create Workout
        </Link>
      </div>

      <div className="workouts-list">
        {workouts.map((workout) => (
          <article className="workout-list-card" key={workout.id}>
            <div>
              <h2>{workout.name}</h2>

              <p>
                {workout.exerciseCount} exercises ·{" "}
                {workout.duration}
              </p>

              <small>{workout.date}</small>
            </div>

            <Link to={`/workouts/${workout.id}`}>
              View
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

export default WorkoutList;