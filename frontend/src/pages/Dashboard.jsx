import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/useAuth";
import { getWorkouts } from "../services/workoutService";
import { getExercises } from "../services/exerciseService";
import { checkHealth } from "../services/healthService";

function formatDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function Dashboard() {
  const { user } = useAuth();
  const userName = user?.user?.name || user?.name || "Athlete";

  const [workouts, setWorkouts] = useState([]);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [apiHealth, setApiHealth] = useState({ status: "Checking...", ok: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        const [workoutsRes, exercisesRes, healthRes] = await Promise.allSettled([
          getWorkouts(),
          getExercises(),
          checkHealth(),
        ]);

        if (!active) return;

        if (workoutsRes.status === "fulfilled") {
          setWorkouts(Array.isArray(workoutsRes.value) ? workoutsRes.value : []);
        }

        if (exercisesRes.status === "fulfilled") {
          const exList = Array.isArray(exercisesRes.value) ? exercisesRes.value : [];
          setExerciseCount(exList.length);
        }

        if (healthRes.status === "fulfilled" && healthRes.value?.status === "OK") {
          setApiHealth({ status: "Healthy (OK)", ok: true });
        } else {
          setApiHealth({ status: "Unavailable", ok: false });
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      active = false;
    };
  }, []);

  const totalWorkouts = workouts.length;
  const pendingWorkouts = workouts.filter((w) => (w.status || "pending") === "pending").length;
  const completedWorkouts = workouts.filter((w) => w.status === "completed").length;
  const recentWorkouts = workouts.slice(0, 5);

  if (isLoading) {
    return <LoadingSpinner message="Loading your workout dashboard..." />;
  }

  return (
    <div className="dashboard">
      <section className="dashboard-header">
        <div>
          <h1>Welcome back, {userName} 👋</h1>
          <p>Here is your current fitness overview, scheduled routines, and tracker stats.</p>
        </div>

        <div className="dashboard-header-actions">
          <Link to="/workouts/create" className="primary-button">
            + Schedule Workout
          </Link>
        </div>
      </section>

      {/* Backend Health & Features Banner */}
      <section className="system-health-strip">
        <div className="health-indicator">
          <span className={`status-dot ${apiHealth.ok ? "dot-online" : "dot-offline"}`}></span>
          <span>
            API Backend: <strong>{apiHealth.status}</strong>
          </span>
        </div>

        <div className="features-pill-row">
          <span className="feature-pill">⚡ Real-time Socket.IO Active</span>
          <span className="feature-pill">⏰ 30-min Auto Reminders</span>
          <span className="feature-pill">☁️ S3 Cloud Storage Ready</span>
        </div>
      </section>

      {/* Real Stats Grid */}
      <section className="stats-grid">
        <StatCard
          title="Total Workouts"
          value={String(totalWorkouts)}
          description="Routines created"
        />

        <StatCard
          title="Scheduled / Pending"
          value={String(pendingWorkouts)}
          description="Upcoming workouts"
        />

        <StatCard
          title="Completed"
          value={String(completedWorkouts)}
          description="Finished sessions"
        />

        <StatCard
          title="Exercise Library"
          value={String(exerciseCount)}
          description="Catalog movements"
        />
      </section>

      {/* Quick Action Navigation Cards */}
      <section className="quick-actions-grid">
        <Link to="/workouts/create" className="quick-action-card">
          <div className="quick-action-icon">🏋️‍♂️</div>
          <h3>Schedule a Workout</h3>
          <p>Create a routine with date/time to receive background reminder emails.</p>
        </Link>

        <Link to="/exercises" className="quick-action-card">
          <div className="quick-action-icon">📋</div>
          <h3>Exercise Catalog</h3>
          <p>Browse, create, update, or filter exercises by category and muscle group.</p>
        </Link>

        <Link to="/files" className="quick-action-card">
          <div className="quick-action-icon">📸</div>
          <h3>Progress Photos & Files</h3>
          <p>Upload transformation pictures and form check images via AWS S3.</p>
        </Link>
      </section>

      {/* Recent Workouts */}
      <section className="recent-workouts">
        <div className="section-header">
          <h2>Recent Workouts</h2>
          <Link to="/workouts" className="text-link">
            View All ({totalWorkouts}) →
          </Link>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="page-state empty-state">
            <h3>No workouts logged yet</h3>
            <p>Schedule your first routine to start seeing your progress here.</p>
            <Link to="/workouts/create" className="primary-button">
              Create First Workout
            </Link>
          </div>
        ) : (
          <div className="workout-list">
            {recentWorkouts.map((workout) => {
              const status = workout.status || "pending";
              const scheduledTime = formatDateTime(workout.scheduled_at || workout.scheduledAt);
              const createdTime = formatDateTime(workout.created_at || workout.createdAt);

              return (
                <Link
                  to={`/workouts/${workout.id}`}
                  className="workout-card workout-card-interactive"
                  key={workout.id}
                >
                  <div className="workout-card-left">
                    <h3>{workout.name || "Untitled Workout"}</h3>
                    <p>
                      {scheduledTime ? `📅 Scheduled: ${scheduledTime}` : `Created: ${createdTime || "Recently"}`}
                    </p>
                  </div>

                  <div className="workout-card-right">
                    <span className={`status-badge status-${status}`}>
                      {status.toUpperCase()}
                    </span>
                    <span className="workout-card-arrow">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
