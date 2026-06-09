import { useState, useRef, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { getAbbreviationByCode } from "../../services/abbreviationService";
import TokenRenderer from "../../components/translation/TokenRenderer";
import AbbreviationDetail from "../../components/dictionary/AbbreviationDetail";
import "./PatternDetailPage.css";
import "./PatternTranslationPage.css";

function PatternTranslationPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const lines = state?.tokens ?? [];

  const [selectedAbbr, setSelectedAbbr] = useState(null);
  const [abbrLoading, setAbbrLoading] = useState(false);
  const [abbrError, setAbbrError] = useState(null);
  const detailRef = useRef(null);
  const fetchCancelledRef = useRef(false);

  const panelOpen = abbrLoading || selectedAbbr !== null || abbrError !== null;

  useEffect(() => {
    if (!panelOpen) return;
    function handleMouseDown(e) {
      if (detailRef.current && !detailRef.current.contains(e.target)) {
        fetchCancelledRef.current = true;
        setSelectedAbbr(null);
        setAbbrError(null);
        setAbbrLoading(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [panelOpen]);

  async function handleAbbreviationClick(token) {
    const lookupCode =
      token.quantity !== null ? token.code.replace(/\d+$/, "") : token.code;
    fetchCancelledRef.current = false;
    setSelectedAbbr(null);
    setAbbrError(null);
    setAbbrLoading(true);
    try {
      const abbr = await getAbbreviationByCode(lookupCode);
      if (!fetchCancelledRef.current) setSelectedAbbr(abbr);
    } catch (err) {
      if (!fetchCancelledRef.current) setAbbrError(err.message);
    } finally {
      if (!fetchCancelledRef.current) setAbbrLoading(false);
    }
  }

  function handleCloseDetail() {
    fetchCancelledRef.current = true;
    setSelectedAbbr(null);
    setAbbrError(null);
    setAbbrLoading(false);
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
                  <TokenRenderer
                    key={j}
                    token={token}
                    onAbbreviationClick={handleAbbreviationClick}
                    bold={lineTokens.bold}
                    italic={lineTokens.italic}
                    fontSize={lineTokens.font_size}
                  />
                ))}
              </div>
            ),
          )}
        </div>
      </div>

      <div
        ref={detailRef}
        className={`pt-detail-col${panelOpen ? " pt-detail-col--open" : ""}`}
      >
        {abbrLoading && (
          <div className="pt-detail-loading">
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            />
          </div>
        )}
        {abbrError && (
          <div className="alert alert-danger" role="alert">
            {abbrError}
          </div>
        )}
        <AbbreviationDetail
          abbreviation={selectedAbbr}
          onClose={handleCloseDetail}
        />
      </div>
    </div>
  );
}

export default PatternTranslationPage;
