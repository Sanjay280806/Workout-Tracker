import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Exercises from "./pages/Exercises";
import CreateWorkout from "./pages/CreateWorkout";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkoutList from "./pages/WorkoutList";
import WorkoutDetails from "./pages/WorkoutDetails";
import EditWorkout from "./pages/EditWorkout";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/workouts" element={<WorkoutList />} />
            <Route
              path="/workouts/create"
              element={<CreateWorkout />}
            />
            <Route
              path="/workouts/:id"
              element={<WorkoutDetails />}
            />
            <Route
              path="/workouts/:id/edit"
              element={<EditWorkout />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;