import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Exercises from "./pages/Exercises";
import CreateWorkout from "./pages/CreateWorkout";
import MainLayout from "./layouts/MainLayout";
import Register from "./pages/Register";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route
            path="/workouts/create"
            element={<CreateWorkout />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;