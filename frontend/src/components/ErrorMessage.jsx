function ErrorMessage({
  title = "Something went wrong",
  message = "Unable to complete the request.",
  onRetry,
}) {
  return (
    <div className="page-state error-state">
      <h2>{title}</h2>

      <p>{message}</p>

      {onRetry && (
        <button
          className="primary-button"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;