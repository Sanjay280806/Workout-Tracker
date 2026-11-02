function ExerciseCard({
  exercise,
  name,
  muscleGroup,
  category,
  description,
  onEdit,
  onDelete,
  isDeleting = false,
}) {
  const exerciseName = name || exercise?.name || "Exercise";
  const exerciseMuscle =
    muscleGroup ||
    exercise?.muscle_group ||
    exercise?.muscleGroup ||
    "General";
  const exerciseCategory = category || exercise?.category || "strength";
  const exerciseDesc = description || exercise?.description;

  return (
    <article className="exercise-card exercise-card-enhanced">
      <div className="exercise-card-main">
        <div className="exercise-card-header-row">
          <h3>{exerciseName}</h3>
          <div className="exercise-badges">
            <span className={`badge-pill badge-category badge-${exerciseCategory}`}>
              {exerciseCategory}
            </span>
            <span className="badge-pill badge-muscle">
              {exerciseMuscle}
            </span>
          </div>
        </div>

        {exerciseDesc && (
          <p className="exercise-card-description">{exerciseDesc}</p>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="exercise-card-actions">
          {onEdit && (
            <button
              type="button"
              className="action-btn-secondary"
              onClick={() => onEdit(exercise)}
              title="Edit exercise"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="action-btn-danger"
              onClick={() => onDelete(exercise)}
              disabled={isDeleting}
              title="Delete exercise"
            >
              {isDeleting ? "..." : "Delete"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default ExerciseCard;
