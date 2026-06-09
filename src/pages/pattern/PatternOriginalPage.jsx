import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPatternOriginalText } from "../../services/patternService";
import "./PatternDetailPage.css";
import "./PatternTranslationPage.css";

function PatternOriginalPage() {
  const { id } = useParams();
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPatternOriginalText(id)
      .then(setText)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div
          className="spinner-border"
          role="status"
          style={{ color: "var(--kn-primary)" }}
        >
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="pd-page">
      <nav className="kn-breadcrumb" aria-label="breadcrumb">
        <Link to="/patterns">My patterns</Link>
        <span className="kn-breadcrumb__sep">/</span>
        <Link to={`/patterns/${id}`}>Pattern</Link>
        <span className="kn-breadcrumb__sep">/</span>
        <span className="kn-breadcrumb__current">Original</span>
      </nav>

      <div className="pd-header">
        <h1 className="pd-header__title">Original pattern</h1>
      </div>

      <div className="pt-card">
        <div className="pt-card__head">
          <span className="pt-card__label">Source text</span>
        </div>
        <pre className="pt-original-text">{text}</pre>
      </div>
    </div>
  );
}

export default PatternOriginalPage;
