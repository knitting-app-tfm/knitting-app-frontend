import { useState } from "react";
import { Link } from "react-router-dom";
import ImportTextForm from "../../components/import/ImportTextForm";
import { importPatternFromText } from "../../services/patternService";
// import { useNavigate } from "react-router-dom";

function ImportTextPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const navigate = useNavigate();

  const handleSubmit = async (text) => {
    setLoading(true);
    setError(null);
    try {
      const pattern = await importPatternFromText(text);
      console.log("Imported pattern:", pattern);
      // navigate(`/patterns/${pattern.id}/confirm`);
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
          <li className="breadcrumb-item active">Text</li>
        </ol>
      </nav>
      <h2 className="mb-4">Import pattern from plain text</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <ImportTextForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

export default ImportTextPage;
