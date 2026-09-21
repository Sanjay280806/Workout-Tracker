import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function MainLayout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app">
      <header className="navbar">
        <Link className="navbar-brand" to="/">
          Workout Tracker
        </Link>

        <nav className="navbar-links">
          <Link to="/">Home</Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/workouts">Workouts</Link>
              <Link to="/exercises">Exercises</Link>
              <Link to="/workouts/create">
                Create Workout
              </Link>

              <button
                className="navbar-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;