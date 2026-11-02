import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <section className="hero-section">
        <span className="hero-badge">⚡ Full-Stack Workout Tracking Platform</span>
        <h1 className="hero-title">
          Elevate Your Training. <br />
          Track Live. Never Miss a Rep.
        </h1>
        <p className="hero-subtitle">
          Designed with automated reminders, real-time set tracking, custom exercise library, and secure cloud photo uploads.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="primary-button hero-cta">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="primary-button hero-cta">
                Get Started Free →
              </Link>
              <Link to="/login" className="secondary-button hero-cta">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="features-section">
        <div className="feature-box">
          <div className="feature-icon">⚡</div>
          <h3>Live Socket.IO Progress</h3>
          <p>
            Connect to live workout rooms. Mark sets completed in real-time with instant multi-device broadcasts.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">⏰</div>
          <h3>Automated Reminders</h3>
          <p>
            Schedule your workout ahead of time. Background schedulers queue email alerts 30 minutes prior via Redis & BullMQ.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">☁️</div>
          <h3>S3 & Sharp Image Storage</h3>
          <p>
            Upload transformation progress pictures and form checks with server-side validation and secure presigned URLs.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">📋</div>
          <h3>Complete Exercise Library</h3>
          <p>
            Curate exercises across Strength, Cardio, and Flexibility with detailed muscle groups and set tracking.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;
