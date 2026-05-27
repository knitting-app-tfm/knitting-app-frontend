import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImportPdfForm from "../../components/import/ImportPdfForm";
import { importPatternFromPdf } from "../../services/patternService";

function ImportPdfPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const pattern = await importPatternFromPdf(file);
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
        <span className="kn-breadcrumb__current">PDF</span>
      </nav>

      <h1 className="kn-page-title">Upload a PDF pattern</h1>
      <p className="kn-page-subtitle">
        Upload your PDF pattern to extract its key details.
      </p>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      <ImportPdfForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

export default ImportPdfPage;
