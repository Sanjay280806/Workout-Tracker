function WorkoutCard({ name, duration, exercises }) {
  return (
    <article className="workout-card">
      <div>
        <h3>{name}</h3>
        <p>{exercises}</p>
      </div>

      <span>{duration}</span>
    </article>
  );
}

export default WorkoutCard;