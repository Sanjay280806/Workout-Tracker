import {Link} from 'react-router-dom';
function Home() {
  return (
    <div>
      <h1>Workout Tracker</h1>
      <p>Track your workouts and progress.</p>
      <Link to="/login">Login</Link>
    </div>
  );
}
export default Home;