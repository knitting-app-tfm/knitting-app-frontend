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
    <div>
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/import">Import</Link>
          </li>
          <li className="breadcrumb-item active">PDF</li>
        </ol>
      </nav>
      <h2 className="mb-4">Import pattern from PDF</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <ImportPdfForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

export default ImportPdfPage;
