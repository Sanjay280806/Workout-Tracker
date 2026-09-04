import { Link, Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="app">
      <header className="navbar">
        <Link className="navbar-brand" to="/">
          Workout Tracker
        </Link>

        <nav className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/exercises">Exercises</Link>
          <Link to="/workouts/create">Create Workout</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;