import StatCard from "../components/StatCard";
import WorkoutCard from "../components/WorkoutCard";

function Dashboard() {
  return (
    <div className="dashboard">
      <section className="dashboard-header">
        <div>
          <h1>Good morning 👋</h1>
          <p>Ready for your next workout?</p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          title="Total Workouts"
          value="24"
          description="All time"
        />

        <StatCard
          title="This Week"
          value="4"
          description="Workouts completed"
        />

        <StatCard
          title="Total Volume"
          value="12,450 kg"
          description="All time"
        />
      </section>

      <section className="recent-workouts">
        <div className="section-header">
          <h2>Recent Workouts</h2>
        </div>

        <div className="workout-list">
          <WorkoutCard
            name="Push Day"
            duration="45 min"
            exercises="Chest • Shoulders • Triceps"
          />

          <WorkoutCard
            name="Pull Day"
            duration="52 min"
            exercises="Back • Biceps"
          />

          <WorkoutCard
            name="Leg Day"
            duration="60 min"
            exercises="Quads • Hamstrings • Calves"
          />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;