import { useState } from "react";
import ExerciseCard from "../components/ExerciseCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import useFetch from "../hooks/useFetch";
import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} from "../services/exerciseService";
import getApiError from "../utils/getApiError";

const CATEGORIES = ["All", "strength", "cardio", "flexibility"];

const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
];

const INITIAL_FORM = {
  name: "",
  category: "strength",
  muscleGroup: "Chest",
  description: "",
};

function Exercises() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMuscle, setSelectedMuscle] = useState("All");

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const {
    data: exercises,
    isLoading,
    error,
    refetch,
  } = useFetch(getExercises);

  const exerciseList = exercises || [];

  const filteredExercises = exerciseList.filter((exercise) => {
    const nameMatch =
      exercise.name?.toLowerCase().includes(search.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(search.toLowerCase());

    const categoryMatch =
      selectedCategory === "All" ||
      exercise.category?.toLowerCase() === selectedCategory.toLowerCase();

    const muscle =
      exercise.muscle_group || exercise.muscleGroup || "";
    const muscleMatch =
      selectedMuscle === "All" ||
      muscle.toLowerCase() === selectedMuscle.toLowerCase();

    return nameMatch && categoryMatch && muscleMatch;
  });

  function openCreateModal() {
    setEditingExercise(null);
    setFormData(INITIAL_FORM);
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditModal(exercise) {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name || "",
      category: exercise.category || "strength",
      muscleGroup: exercise.muscle_group || exercise.muscleGroup || "Chest",
      description: exercise.description || "",
    });
    setFormError("");
    setIsFormOpen(true);
  }

  function closeModal() {
    setIsFormOpen(false);
    setEditingExercise(null);
    setFormError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Exercise name is required.");
      return;
    }

    if (!formData.category) {
      setFormError("Category is required (strength, cardio, flexibility).");
      return;
    }

    if (!formData.muscleGroup.trim()) {
      setFormError("Muscle group is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        muscleGroup: formData.muscleGroup.trim(),
        description: formData.description.trim() || undefined,
      };

      if (editingExercise) {
        await updateExercise(editingExercise.id, payload);
        setActionSuccess(`Exercise "${payload.name}" updated successfully!`);
      } else {
        await createExercise(payload);
        setActionSuccess(`Exercise "${payload.name}" created successfully!`);
      }

      closeModal();
      refetch();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      setFormError(
        getApiError(
          err,
          editingExercise
            ? "Failed to update exercise."
            : "Failed to create exercise."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(exercise) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${exercise.name}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(exercise.id);
      await deleteExercise(exercise.id);
      setActionSuccess(`Exercise "${exercise.name}" deleted.`);
      refetch();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      alert(getApiError(err, "Failed to delete exercise."));
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading exercises catalog..." />;
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
      <div className="page-header exercise-page-header">
        <div>
          <h1>Exercise Catalog</h1>
          <p>
            Browse, search, and manage exercises with categories & muscle groups.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openCreateModal}
        >
          + Add Exercise
        </button>
      </div>

      {actionSuccess && (
        <div className="alert-banner alert-success" role="alert">
          {actionSuccess}
        </div>
      )}

      {/* Controls & Filters */}
      <div className="exercise-controls">
        <input
          type="text"
          placeholder="Search by exercise name or description..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="filter-group">
          <span className="filter-label">Category:</span>
          <div className="category-filters">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                className={selectedCategory === cat ? "active" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Muscle:</span>
          <div className="muscle-filters">
            {MUSCLE_GROUPS.map((muscle) => (
              <button
                type="button"
                key={muscle}
                className={selectedMuscle === muscle ? "active" : ""}
                onClick={() => setSelectedMuscle(muscle)}
              >
                {muscle}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Modal */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>{editingExercise ? "Edit Exercise" : "Create New Exercise"}</h2>
              <button
                type="button"
                className="close-button"
                onClick={closeModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="form-group">
                <label htmlFor="ex-name">Name *</label>
                <input
                  id="ex-name"
                  type="text"
                  placeholder="e.g. Barbell Bench Press"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ex-category">Category *</label>
                  <select
                    id="ex-category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibility</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ex-muscle">Muscle Group *</label>
                  <input
                    id="ex-muscle"
                    type="text"
                    placeholder="e.g. Chest, Back, Legs"
                    value={formData.muscleGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, muscleGroup: e.target.value })
                    }
                    required
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ex-desc">Description (Optional)</label>
                <textarea
                  id="ex-desc"
                  rows="3"
                  placeholder="Instructions, form notes, or variations..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingExercise
                    ? "Update Exercise"
                    : "Create Exercise"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div className="exercise-stats-bar">
        <span>Showing {filteredExercises.length} of {exerciseList.length} exercises</span>
      </div>

      {filteredExercises.length === 0 ? (
        <div className="page-state empty-state">
          <h2>No exercises found</h2>
          <p>
            {exerciseList.length === 0
              ? "Your exercise library is empty. Click '+ Add Exercise' to create one!"
              : "Try changing your search or filters to see more exercises."}
          </p>
          {exerciseList.length === 0 && (
            <button
              type="button"
              className="primary-button"
              onClick={openCreateModal}
            >
              + Add First Exercise
            </button>
          )}
        </div>
      ) : (
        <div className="exercise-grid">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onEdit={openEditModal}
              onDelete={handleDelete}
              isDeleting={deletingId === exercise.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Exercises;
