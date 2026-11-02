import { useState } from "react";
import { uploadFile, getFile } from "../services/fileService";
import getApiError from "../utils/getApiError";

function getStoredFiles() {
  try {
    return JSON.parse(localStorage.getItem("user_files") || "[]");
  } catch {
    return [];
  }
}

function Files() {
  const [files, setFiles] = useState(getStoredFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [refreshingId, setRefreshingId] = useState(null);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only JPEG, PNG, and WebP images are accepted by the backend.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");
      setUploadSuccess("");

      const result = await uploadFile(file);

      // Fetch presigned URL immediately
      let presignedUrl = "";
      try {
        const fileData = await getFile(result.id);
        presignedUrl = fileData.url;
      } catch (err) {
        console.warn("Signed URL fetch error:", err);
      }

      const newFileItem = {
        id: result.id,
        originalFilename: result.originalFilename,
        contentType: result.contentType,
        sizeBytes: result.sizeBytes,
        createdAt: result.createdAt,
        url: presignedUrl,
      };

      const updated = [newFileItem, ...files];
      setFiles(updated);
      localStorage.setItem("user_files", JSON.stringify(updated));
      setUploadSuccess(`Successfully uploaded "${result.originalFilename}" to S3 storage!`);
      setTimeout(() => setUploadSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      setUploadError(getApiError(err, "File upload failed. Please try again."));
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function refreshSignedUrl(fileItem) {
    try {
      setRefreshingId(fileItem.id);
      const res = await getFile(fileItem.id);
      const updated = files.map((f) =>
        f.id === fileItem.id ? { ...f, url: res.url } : f
      );
      setFiles(updated);
      localStorage.setItem("user_files", JSON.stringify(updated));
      if (selectedFile?.id === fileItem.id) {
        setSelectedFile({ ...selectedFile, url: res.url });
      }
    } catch (err) {
      alert("Failed to refresh file URL: " + getApiError(err));
    } finally {
      setRefreshingId(null);
    }
  }

  function removeFileEntry(id) {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    localStorage.setItem("user_files", JSON.stringify(updated));
    if (selectedFile?.id === id) {
      setSelectedFile(null);
    }
  }

  return (
    <div className="files-page">
      <div className="page-header">
        <div>
          <h1>Progress Photos & Files</h1>
          <p>
            Securely upload and manage workout photos powered by Sharp & AWS S3 cloud storage.
          </p>
        </div>

        <label className="primary-button upload-btn-label">
          {isUploading ? "Uploading to S3..." : "+ Upload Progress Photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploading}
            onChange={handleUpload}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {uploadSuccess && (
        <div className="alert-banner alert-success" role="alert">
          {uploadSuccess}
        </div>
      )}

      {uploadError && (
        <div className="alert-banner alert-error" role="alert">
          {uploadError}
        </div>
      )}

      {/* S3 Storage Feature Card */}
      <div className="s3-feature-card">
        <div className="feature-icon">☁️</div>
        <div>
          <h3>Backend S3 Storage & Presigned URLs</h3>
          <p>
            Files are validated with Sharp image detection, uploaded to S3, and retrieved on-demand using 300-second secure presigned URLs (`/api/v1/files/:id`).
          </p>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="page-state empty-state">
          <h2>No progress photos uploaded yet</h2>
          <p>
            Upload your transformation pictures, workout check-ins, or form checks (JPEG, PNG, WebP).
          </p>
          <label className="primary-button upload-btn-label">
            + Upload First Photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
      ) : (
        <div className="files-layout">
          <div className="files-grid">
            {files.map((file) => (
              <div
                className={`file-card-full ${
                  selectedFile?.id === file.id ? "active-selection" : ""
                }`}
                key={file.id}
                onClick={() => setSelectedFile(file)}
              >
                <div className="file-preview-container">
                  {file.url ? (
                    <img
                      src={file.url}
                      alt={file.originalFilename}
                      className="file-preview-img-full"
                    />
                  ) : (
                    <div className="file-missing-url">
                      <span>🖼️ Preview Expired</span>
                      <button
                        type="button"
                        className="refresh-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          refreshSignedUrl(file);
                        }}
                        disabled={refreshingId === file.id}
                      >
                        {refreshingId === file.id ? "Loading..." : "Get Signed URL"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="file-card-details">
                  <h4>{file.originalFilename}</h4>
                  <p>
                    {(file.sizeBytes / 1024).toFixed(1)} KB • {file.contentType}
                  </p>
                  <small>
                    ID: #{file.id} • {new Date(file.createdAt).toLocaleDateString()}
                  </small>
                </div>

                <div className="file-card-actions">
                  <button
                    type="button"
                    className="action-btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshSignedUrl(file);
                    }}
                    disabled={refreshingId === file.id}
                    title="Generate new presigned link"
                  >
                    Refresh URL
                  </button>
                  <button
                    type="button"
                    className="action-btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFileEntry(file.id);
                    }}
                    title="Remove from history"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox / Selected Preview */}
          {selectedFile && (
            <div className="file-inspect-panel">
              <div className="inspect-header">
                <h3>Image Details</h3>
                <button
                  type="button"
                  className="close-button"
                  onClick={() => setSelectedFile(null)}
                >
                  ✕
                </button>
              </div>

              {selectedFile.url ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.originalFilename}
                  className="inspect-full-img"
                />
              ) : (
                <div className="empty-files-box">
                  <p>Presigned URL is expired or unavailable.</p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => refreshSignedUrl(selectedFile)}
                  >
                    Request New Signed URL
                  </button>
                </div>
              )}

              <div className="inspect-meta">
                <p><strong>Filename:</strong> {selectedFile.originalFilename}</p>
                <p><strong>Type:</strong> {selectedFile.contentType}</p>
                <p><strong>Size:</strong> {(selectedFile.sizeBytes / 1024).toFixed(2)} KB</p>
                <p><strong>Database ID:</strong> #{selectedFile.id}</p>
                {selectedFile.url && (
                  <a
                    href={selectedFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-button-sm text-center"
                  >
                    Open in New Tab ↗
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Files;
