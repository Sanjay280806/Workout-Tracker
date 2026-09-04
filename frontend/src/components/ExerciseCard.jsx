function ExerciseCard({ name, muscleGroup, equipment }) {
  return (
    <article className="exercise-card">
      <div>
        <h3>{name}</h3>
        <p>{muscleGroup}</p>
      </div>

      <span>{equipment}</span>
    </article>
  );
}

export default ExerciseCard;