
import { useEffect, useRef, useState } from "react";
import { connectWorkoutSocket } from "../socket/workout-socket";

function LiveWorkout({
  accessToken,
  workoutId,
  exercises = [],
}) {
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [progressByExercise, setProgressByExercise] =
    useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    // Don't create a connection without credentials.
    if (!accessToken || !workoutId) {
      return;
    }

    let active = true;

    const socket = connectWorkoutSocket(accessToken);
    socketRef.current = socket;

    function handleConnect() {
      if (!active) return;

      setConnected(true);
      setJoined(false);
      setError("");

      socket.emit("workout:join", { workoutId });
    }

    function handleDisconnect() {
      if (!active) return;

      setConnected(false);
      setJoined(false);
    }

    function handleConnectError(err) {
      if (!active) return;

      setConnected(false);
      setJoined(false);
      setError(
        err.message || "Unable to connect to live progress."
      );
    }

    function handleJoined() {
      if (!active) return;

      setJoined(true);
      setError("");
    }

    function handleProgress(data) {
      if (!active || !data) return;

      const exerciseId =
        data.workoutExerciseId ?? data.exerciseId;

      if (exerciseId == null) return;

      setProgressByExercise((current) => ({
        ...current,
        [String(exerciseId)]: data,
      }));

      setError("");
    }

    function handleWorkoutError(data) {
      if (!active) return;

      setError(
        data?.message || "The live workout request failed."
      );
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("workout:joined", handleJoined);
    socket.on("workout:progress", handleProgress);
    socket.on("workout:error", handleWorkoutError);

    socket.connect();

    return () => {
      active = false;

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("workout:joined", handleJoined);
      socket.off("workout:progress", handleProgress);
      socket.off("workout:error", handleWorkoutError);

      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [accessToken, workoutId]);

  function completeExercise(workoutExerciseId) {
    const socket = socketRef.current;

    if (!socket?.connected || !joined) {
      setError("Join the workout before updating progress.");
      return;
    }

    setError("");

    socket.emit("workout:set.completed", {
      workoutId,
      workoutExerciseId,
    });
  }

  // Render a clear message without setting state in an effect.
  if (!accessToken || !workoutId) {
    return (
      <section className="live-workout">
        <h2>Live Workout Progress</h2>
        <p className="live-help">
          Sign in and open a workout to enable live progress.
        </p>
      </section>
    );
  }

  return (
    <section className="live-workout">
      <div className="live-workout-header">
        <div>
          <h2>Live Workout Progress</h2>
          <p>Track exercise completion in real time.</p>
        </div>

        <span
          className={`live-status ${
            connected ? "is-connected" : "is-disconnected"
          }`}
        >
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <p className="live-room-status">
        Workout room: {joined ? "Joined" : "Not joined"}
      </p>

      {!joined && connected && (
        <p className="live-help">
          Waiting for the server to confirm the room join...
        </p>
      )}

      {exercises.length === 0 ? (
        <p className="live-help">
          No exercises are available for live tracking.
        </p>
      ) : (
        <div className="live-exercise-list">
          {exercises.map((exercise, index) => {
            const workoutExerciseId =
              exercise.workoutExerciseId ??
              exercise.id ??
              exercise._id;

            const progressKey =
              workoutExerciseId == null
                ? null
                : String(workoutExerciseId);

            const progress = progressKey
              ? progressByExercise[progressKey]
              : null;

            return (
              <div
                className="live-exercise-row"
                key={
                  progressKey ??
                  `${exercise.name}-${index}`
                }
              >
                <div className="live-exercise-info">
                  <strong>
                    {exercise.name || "Exercise"}
                  </strong>

                  <span>
                    {progress
                      ? progress.completed
                        ? "Completed"
                        : "Pending"
                      : "Awaiting update"}
                  </span>
                </div>

                <button
                  type="button"
                  className="live-complete-button"
                  disabled={
                    !connected ||
                    !joined ||
                    workoutExerciseId == null ||
                    progress?.completed === true
                  }
                  onClick={() =>
                    completeExercise(workoutExerciseId)
                  }
                >
                  {progress?.completed
                    ? "Completed"
                    : "Complete"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p className="live-workout-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

export default LiveWorkout;
