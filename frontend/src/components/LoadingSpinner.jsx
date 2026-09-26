function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="page-state">
      <div className="loading-spinner"></div>

      <p>{message}</p>
    </div>
  );
}

export default LoadingSpinner;