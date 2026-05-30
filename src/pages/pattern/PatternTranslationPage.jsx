import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { getPatternOriginalText } from "../../services/patternService";
import TokenRenderer from "../../components/translation/TokenRenderer";
import "./PatternDetailPage.css";
import "./PatternTranslationPage.css";

function PatternTranslationPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const lines = state?.tokens ?? [];

  const [originalText, setOriginalText] = useState(null);
  const [originalLoading, setOriginalLoading] = useState(false);
  const [originalError, setOriginalError] = useState(null);

  async function handleViewOriginal() {
    if (originalText !== null) {
      setOriginalText(null);
      return;
    }
    setOriginalLoading(true);
    setOriginalError(null);
    try {
      const text = await getPatternOriginalText(id);
      setOriginalText(text);
    } catch (err) {
      setOriginalError(err.message);
    } finally {
      setOriginalLoading(false);
    }
  }

  return (
    <div className="pd-page">
      <nav className="kn-breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span className="kn-breadcrumb__sep">/</span>
        <Link to={`/patterns/${id}`}>Pattern</Link>
        <span className="kn-breadcrumb__sep">/</span>
        <span className="kn-breadcrumb__current">Translation</span>
      </nav>

      <div className="pd-header">
        <h1 className="pd-header__title">Pattern Translation</h1>
      </div>

      <div className="pt-card">
        <div className="pt-card__head">
          <span className="pt-card__label">Translated pattern</span>
          <button
            className="pt-original-btn"
            onClick={handleViewOriginal}
            disabled={originalLoading}
          >
            {originalLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                Loading…
              </>
            ) : originalText !== null ? (
              "Hide original"
            ) : (
              "View original pattern"
            )}
          </button>
        </div>

        <div className="pt-pattern">
          {lines.map((lineTokens, i) =>
            lineTokens.tokens.length === 0 ? (
              <div
                key={i}
                className="pt-line pt-line--blank"
                aria-hidden="true"
              />
            ) : (
              <div key={i} className="pt-line">
                {lineTokens.tokens.map((token, j) => (
                  <TokenRenderer key={j} token={token} />
                ))}
              </div>
            ),
          )}
        </div>
      </div>

      {originalError && (
        <div className="alert alert-danger" role="alert">
          {originalError}
        </div>
      )}

      {originalText !== null && (
        <div className="pt-card">
          <div className="pt-card__head">
            <span className="pt-card__label">Original pattern</span>
          </div>
          <pre className="pt-original-text">{originalText}</pre>
        </div>
      )}
    </div>
  );
}

export default PatternTranslationPage;
