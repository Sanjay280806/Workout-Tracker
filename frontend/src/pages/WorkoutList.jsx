import { useState } from "react";
import { Link } from "react-router-dom";

import { getWorkouts, deleteWorkout } from "../services/workoutService";
import useFetch from "../hooks/useFetch";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import getApiError from "../utils/getApiError";

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

function WorkoutList() {
  const {
    data: workouts,
    isLoading,
    error,
    refetch,
  } = useFetch(getWorkouts);

  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  if (isLoading) {
    return <LoadingSpinner message="Loading your workouts..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Unable to load workouts"
        message={error}
        onRetry={refetch}
      />
    );
  }

  const workoutList = Array.isArray(workouts) ? workouts : [];

  const filteredWorkouts = workoutList.filter((workout) => {
    if (statusFilter === "all") return true;
    return (workout.status || "pending").toLowerCase() === statusFilter.toLowerCase();
  });

  const pendingCount = workoutList.filter(
    (w) => (w.status || "pending") === "pending"
  ).length;
  const activeCount = workoutList.filter((w) => w.status === "active").length;
  const completedCount = workoutList.filter(
    (w) => w.status === "completed"
  ).length;

  async function handleDelete(e, workoutId, workoutName) {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${workoutName || "this workout"}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(workoutId);
      await deleteWorkout(workoutId);
      localStorage.removeItem(`workout_${workoutId}_exercises`);
      setActionMessage(`Workout "${workoutName}" was deleted.`);
      refetch();
      setTimeout(() => setActionMessage(""), 4000);
    } catch (err) {
      console.error(err);
      alert(getApiError(err, "Failed to delete workout."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="workouts-page">
      <div className="page-header workout-page-header">
        <div>
          <h1>My Workouts</h1>
          <p>Schedule routines, review status, and track live progress.</p>
        </div>

        <Link
          to="/workouts/create"
          className="primary-button create-workout-link"
        >
          + Create Workout
        </Link>
      </div>

      {actionMessage && (
        <div className="alert-banner alert-success" role="alert">
          {actionMessage}
        </div>
      )}

      {/* Summary counters */}
      <div className="workout-summary-grid">
        <div
          className={`summary-pill ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <span className="summary-pill-label">Total</span>
          <strong className="summary-pill-value">{workoutList.length}</strong>
        </div>

        <div
          className={`summary-pill ${statusFilter === "pending" ? "active" : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          <span className="summary-pill-label">Pending / Scheduled</span>
          <strong className="summary-pill-value">{pendingCount}</strong>
        </div>

        <div
          className={`summary-pill ${statusFilter === "active" ? "active" : ""}`}
          onClick={() => setStatusFilter("active")}
        >
          <span className="summary-pill-label">Active</span>
          <strong className="summary-pill-value">{activeCount}</strong>
        </div>

        <div
          className={`summary-pill ${statusFilter === "completed" ? "active" : ""}`}
          onClick={() => setStatusFilter("completed")}
        >
          <span className="summary-pill-label">Completed</span>
          <strong className="summary-pill-value">{completedCount}</strong>
        </div>
      </div>

      {workoutList.length === 0 ? (
        <div className="page-state empty-state">
          <h2>No workouts found</h2>
          <p>
            You haven't scheduled any workouts yet. Create your first routine to start tracking!
          </p>
          <Link to="/workouts/create" className="primary-button">
            Create Your First Workout
          </Link>
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="page-state empty-state">
          <h2>No {statusFilter} workouts</h2>
          <p>Try switching the status filter above to see other workouts.</p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setStatusFilter("all")}
          >
            Show All Workouts
          </button>
        </div>
      ) : (
        <div className="workouts-list">
          {filteredWorkouts.map((workout) => {
            const workoutId = workout.id ?? workout._id;
            const status = workout.status || "pending";
            const scheduled = formatDateTime(workout.scheduled_at || workout.scheduledAt);
            const created = formatDateTime(workout.created_at || workout.createdAt);

            return (
              <article className="workout-list-card" key={workoutId}>
                <div className="workout-list-card-content">
                  <div className="workout-list-title-row">
                    <h2>{workout.name || "Untitled Workout"}</h2>
                    <span className={`status-badge status-${status}`}>
                      {status.toUpperCase()}
                    </span>
                  </div>

                  <div className="workout-meta">
                    {scheduled ? (
                      <span className="workout-scheduled-tag">
                        📅 Scheduled: <strong>{scheduled}</strong>
                      </span>
                    ) : (
                      <span>Created: {created || "Recently"}</span>
                    )}

                    <span className="workout-id-tag">ID: #{workoutId}</span>
                  </div>
                </div>

                <div className="workout-list-card-actions">
                  <Link
                    to={`/workouts/${workoutId}`}
                    className="primary-button-sm"
                  >
                    View & Live Track →
                  </Link>

                  <button
                    type="button"
                    className="action-btn-danger"
                    onClick={(e) => handleDelete(e, workoutId, workout.name)}
                    disabled={deletingId === workoutId}
                    title="Delete workout"
                  >
                    {deletingId === workoutId ? "..." : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WorkoutList;
