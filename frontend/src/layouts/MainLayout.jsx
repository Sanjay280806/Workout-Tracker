import { Link, Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <>
      <nav>
        <Link to="/">Workout Tracker</Link>

        <div>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;