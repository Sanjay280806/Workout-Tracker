import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { login as loginRequest } from "../services/authService";
import { useAuth } from "../context/useAuth";
import getApiError from "../utils/getApiError";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);


  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }


  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    try {
      setIsLoading(true);

      const userData =
        await loginRequest(formData);

      login(userData);

      /*
       * If ProtectedRoute redirected the user
       * here, return them to their original page.
       *
       * Otherwise go to dashboard.
       */

      const from =
        location.state?.from?.pathname ||
        "/dashboard";

      navigate(from, {
        replace: true,
      });

    } catch (error) {
      console.error(error);

      setError(
        getApiError(
          error,
          "Unable to login. Please try again."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>Login</h1>

        <p>
          Login to continue to your workouts.
        </p>


        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />

          </div>


          {/* ERROR */}

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}


          {/* SUBMIT */}

          <button
            type="submit"
            className="primary-button"
            disabled={isLoading}
          >
            {isLoading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>


        {/* REGISTER */}

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;