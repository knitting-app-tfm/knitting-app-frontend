import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImportTextForm from "../../components/import/ImportTextForm";
import { importPatternFromText } from "../../services/patternService";

function ImportTextPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (text) => {
    setLoading(true);
    setError(null);
    try {
      const pattern = await importPatternFromText(text);
      navigate(`/patterns/${pattern.id}/confirm`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <nav className="kn-breadcrumb" aria-label="breadcrumb">
        <Link to="/import">Import</Link>
        <span className="kn-breadcrumb__sep">/</span>
        <span className="kn-breadcrumb__current">Plain text</span>
      </nav>

      <h1 className="kn-page-title">Paste your pattern</h1>
      <p className="kn-page-subtitle">
        Copy and paste your pattern's text here to extract its key details.
      </p>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">{error}</div>
      )}

      <ImportTextForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

export default ImportTextPage;
