import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getWorkout, deleteWorkout } from "../services/workoutService";
import { uploadFile, getFile } from "../services/fileService";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import LiveWorkout from "../components/LiveWorkout";

import useFetch from "../hooks/useFetch";
import getApiError from "../utils/getApiError";

function formatDateTime(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function WorkoutDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchWorkout = useCallback(
    (signal) => getWorkout(id, signal),
    [id]
  );

  const {
    data: workout,
    isLoading,
    error,
    refetch,
  } = useFetch(fetchWorkout);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Workout Attachments / Photos state
  const [attachedFiles, setAttachedFiles] = useState(() => {
    if (!id) return [];
    try {
      return JSON.parse(localStorage.getItem(`workout_${id}_files`) || "[]");
    } catch {
      return [];
    }
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check format
    const validFormats = ["image/jpeg", "image/png", "image/webp"];
    if (!validFormats.includes(file.type)) {
      setUploadError("Only JPEG, PNG, and WebP images are supported by the backend.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");

      const uploaded = await uploadFile(file);

      // Fetch signed S3 URL for viewing
      let signedUrl = "";
      try {
        const fileDetail = await getFile(uploaded.id);
        signedUrl = fileDetail.url;
      } catch (e) {
        console.warn("Could not get presigned url immediately:", e);
      }

      const fileItem = {
        id: uploaded.id,
        filename: uploaded.originalFilename,
        sizeBytes: uploaded.sizeBytes,
        contentType: uploaded.contentType,
        url: signedUrl,
        createdAt: uploaded.createdAt || new Date().toISOString(),
      };

      const updated = [fileItem, ...attachedFiles];
      setAttachedFiles(updated);
      localStorage.setItem(`workout_${id}_files`, JSON.stringify(updated));
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(getApiError(err, "Failed to upload image."));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workout? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setDeleteError("");

      await deleteWorkout(id);
      localStorage.removeItem(`workout_${id}_exercises`);
      localStorage.removeItem(`workout_${id}_files`);

      navigate("/workouts", { replace: true });
    } catch (err) {
      console.error(err);
      setDeleteError(getApiError(err, "Unable to delete this workout."));
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading workout..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Unable to load workout"
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (!workout) {
    return (
      <ErrorMessage
        title="Workout not found"
        message="This workout could not be found."
      />
    );
  }

  // Retrieve planned exercises from workout response or local cache
  const storedExercises = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(`workout_${id}_exercises`) || "[]"
      );
    } catch {
      return [];
    }
  })();

  const exercises = Array.isArray(workout.exercises) && workout.exercises.length > 0
    ? workout.exercises
    : storedExercises;

  const status = workout.status || "pending";
  const isCompleted = status === "completed";
  const scheduledTime = formatDateTime(workout.scheduled_at || workout.scheduledAt);

  return (
    <div className="workout-details-page">
      {/* Header */}
      <div className="workout-details-header">
        <div>
          <Link to="/workouts" className="back-link">
            ← Back to workouts
          </Link>

          <div className="workout-title-with-badge">
            <h1>{workout.name || "Untitled Workout"}</h1>
            <span className={`status-badge status-${status}`}>
              {status.toUpperCase()}
            </span>
          </div>

          <p className="workout-details-date">
            Workout ID: #{id} • Scheduled: {scheduledTime}
          </p>
        </div>

        <div className="workout-actions">
          {!isCompleted ? (
            <Link to={`/workouts/${id}/edit`} className="primary-button">
              Edit Workout
            </Link>
          ) : (
            <span className="locked-badge" title="Completed workouts cannot be modified">
              🔒 Completed (Locked)
            </span>
          )}

          <button
            type="button"
            className="delete-button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Workout"}
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="workout-delete-error" role="alert">
          <p>{deleteError}</p>
        </div>
      )}

      {/* Summary Cards */}
      <section className="workout-details-summary">
        <div className="workout-summary-card">
          <span>Status</span>
          <strong className={`status-text-${status}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </strong>
        </div>

        <div className="workout-summary-card">
          <span>Scheduled For</span>
          <strong>{scheduledTime}</strong>
        </div>

        <div className="workout-summary-card">
          <span>Planned Exercises</span>
          <strong>{exercises.length}</strong>
        </div>

        <div className="workout-summary-card">
          <span>Photos & Attachments</span>
          <strong>{attachedFiles.length}</strong>
        </div>
      </section>

      {/* Scheduler Info Alert */}
      {(workout.scheduled_at || workout.scheduledAt) && (
        <div className="reminder-info-box">
          <span className="reminder-icon">⏰</span>
          <div>
            <strong>Automated Reminder Scheduled:</strong>
            <p>
              The backend scheduler will automatically queue an email reminder 30 minutes before {scheduledTime} via BullMQ!
            </p>
          </div>
        </div>
      )}

      {/* Live Socket.IO Tracking */}
      <LiveWorkout
        accessToken={localStorage.getItem("token")}
        workoutId={id}
        exercises={exercises}
      />

      {/* Planned Exercises List */}
      <section className="workout-details-exercises">
        <div className="workout-details-section-heading">
          <h2>Planned Routine</h2>
          <span>{exercises.length} exercises configured</span>
        </div>

        {exercises.length === 0 ? (
          <div className="page-state empty-state">
            <h2>No exercises planned yet</h2>
            <p>Edit this workout to add exercises and target sets from the catalog.</p>
            {!isCompleted && (
              <Link to={`/workouts/${id}/edit`} className="primary-button">
                Edit Workout Plan
              </Link>
            )}
          </div>
        ) : (
          <div className="workout-exercise-list">
            {exercises.map((exercise, exerciseIndex) => {
              const sets = Array.isArray(exercise.sets) ? exercise.sets : [];
              const muscle = exercise.muscle_group || exercise.muscleGroup || "";

              return (
                <article
                  className="exercise-details-card"
                  key={exercise.id ?? `${exercise.name}-${exerciseIndex}`}
                >
                  <div className="exercise-details-header">
                    <div>
                      <h3>{exercise.name || "Exercise"}</h3>
                      {muscle && (
                        <span className="badge-pill badge-muscle">{muscle}</span>
                      )}
                    </div>

                    <span className="exercise-set-count">
                      {sets.length} {sets.length === 1 ? "set" : "sets"}
                    </span>
                  </div>

                  {sets.length === 0 ? (
                    <p className="exercise-no-sets">No sets recorded.</p>
                  ) : (
                    <div className="sets-table-wrapper">
                      <table className="workout-sets-table">
                        <thead>
                          <tr>
                            <th>Set</th>
                            <th>Weight (kg)</th>
                            <th>Target Reps</th>
                          </tr>
                        </thead>

                        <tbody>
                          {sets.map((set, setIndex) => (
                            <tr key={set.id ?? `${exerciseIndex}-${setIndex}`}>
                              <td>#{setIndex + 1}</td>
                              <td>{set.weight ? `${set.weight} kg` : "Bodyweight"}</td>
                              <td>{set.reps ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Workout Progress Photos / Files (Backend S3 Upload) */}
      <section className="workout-files-section">
        <div className="section-header-compact">
          <div>
            <h2>Workout Photos & Attachments</h2>
            <p>Upload progress pictures or workout notes via AWS S3 storage.</p>
          </div>

          <label className="upload-file-btn">
            {isUploading ? "Uploading to S3..." : "+ Upload Image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isUploading}
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {uploadError && (
          <p className="form-error" role="alert">
            {uploadError}
          </p>
        )}

        {attachedFiles.length === 0 ? (
          <div className="empty-files-box">
            <p>No photos uploaded for this workout yet. Upload JPEG, PNG, or WebP files.</p>
          </div>
        ) : (
          <div className="files-grid">
            {attachedFiles.map((file) => (
              <div className="file-card" key={file.id}>
                {file.url ? (
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="file-preview-img"
                  />
                ) : (
                  <div className="file-placeholder">🖼️ Image #{file.id}</div>
                )}
                <div className="file-info">
                  <strong>{file.filename}</strong>
                  <small>
                    {(file.sizeBytes / 1024).toFixed(1)} KB • {file.contentType}
                  </small>
                  {file.url && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link-sm"
                    >
                      View Full Size ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default WorkoutDetails;
