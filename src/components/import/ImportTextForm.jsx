import { useState } from "react";

function ImportTextForm({ onSubmit, loading }) {
  const [text, setText] = useState("");
  const [textError, setTextError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setTextError("Please paste your pattern text before importing.");
      return;
    }
    setTextError(null);
    onSubmit(text);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "560px" }}>
      <div className="mb-3">
        <textarea
          className={`form-control ${textError ? "is-invalid" : ""}`}
          rows={12}
          placeholder="Paste your knitting or crochet pattern here…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (textError && e.target.value.trim()) setTextError(null);
          }}
        />
        {textError && (
          <div className="invalid-feedback">{textError}</div>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={!text.trim() || loading}
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

export default ImportTextForm;
