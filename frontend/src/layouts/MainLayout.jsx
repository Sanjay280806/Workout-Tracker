import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const displayName = user?.user?.name || user?.name;

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-brand-group">
          <Link className="navbar-brand" to={isAuthenticated ? "/dashboard" : "/"}>
            ⚡ Workout Tracker
          </Link>
        </div>

        <nav className="navbar-links">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            end
          >
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/workouts"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                end
              >
                Workouts
              </NavLink>

              <NavLink
                to="/exercises"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Exercises
              </NavLink>

              <NavLink
                to="/files"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Photos & Files
              </NavLink>

              <NavLink
                to="/workouts/create"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                + Create
              </NavLink>

              <div className="navbar-user-section">
                {displayName && (
                  <span className="navbar-user-greeting">
                    👤 {displayName}
                  </span>
                )}

                <button
                  className="navbar-button"
                  onClick={handleLogout}
                  title="Sign out of account"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="primary-button-sm">
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>
          Workout Tracker &bull; Powered by Express, PostgreSQL, Redis BullMQ, AWS S3 &amp; Socket.IO
        </p>
      </footer>
    </div>
  );
}

export default MainLayout;
