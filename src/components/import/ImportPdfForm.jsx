import { useState } from "react";

function ImportPdfForm({ onSubmit, loading }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState(null);

  const validate = (f) => {
    if (f?.type !== "application/pdf") {
      setFileError("Only PDF files are accepted. Please select a valid file.");
      setFile(null);
      return false;
    }
    setFileError(null);
    setFile(f);
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    validate(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    validate(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) onSubmit(file);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "560px" }}>
      <div
        className={`rounded p-5 text-center mb-3 border ${dragging ? "border-primary bg-primary-subtle" : "border-secondary-subtle bg-light"}`}
        style={{
          borderStyle: "dashed",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("pdfFileInput").click()}
      >
        <svg
          className="mb-3 text-secondary"
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>

        {file ? (
          <>
            <p className="fw-semibold text-success mb-1">{file.name}</p>
            <p className="text-muted small mb-0">Click or drop to replace</p>
          </>
        ) : (
          <>
            <p className="fw-semibold mb-1">Drag &amp; drop your PDF here</p>
            <p className="text-muted small mb-0">
              or <span className="text-primary">browse files</span>
            </p>
          </>
        )}

        <input
          id="pdfFileInput"
          type="file"
          accept=".pdf"
          className="d-none"
          onChange={handleFileChange}
        />
      </div>

      {fileError && (
        <div className="alert alert-danger py-2 small" role="alert">
          {fileError}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary-custom"
        disabled={!file || loading}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            />
            Processing…
          </>
        ) : (
          "Import"
        )}
      </button>
    </form>
  );
}

export default ImportPdfForm;
