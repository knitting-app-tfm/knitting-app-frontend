import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAbbreviationByCode } from "../../services/abbreviationService";
import {
  getScaledPattern,
  getPattern,
  translatePattern,
  getYarnCalculation,
} from "../../services/patternService";
import TokenRenderer from "../../components/translation/TokenRenderer";
import AbbreviationDetail from "../../components/dictionary/AbbreviationDetail";
import AdaptPatternModal from "../../components/pattern/AdaptPatternModal";
import YarnCalculatorModal from "../../components/pattern/YarnCalculatorModal";
import "./PatternDetailPage.css";
import "./PatternTranslationPage.css";

function PatternScaledPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pattern, setPattern] = useState(null);
  const [scaledData, setScaledData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [yarnModalOpen, setYarnModalOpen] = useState(false);
  const [yarnSummary, setYarnSummary] = useState(null);

  const [selectedAbbr, setSelectedAbbr] = useState(null);
  const [abbrLoading, setAbbrLoading] = useState(false);
  const [abbrError, setAbbrError] = useState(null);
  const detailRef = useRef(null);
  const fetchCancelledRef = useRef(false);

  function fetchYarnSummary() {
    getYarnCalculation(id)
      .then((raw) => {
        const yarns = Array.isArray(raw) ? raw : (raw.yarns ?? [raw]);
        setYarnSummary(yarns);
      })
      .catch(() => setYarnSummary("prompt"));
  }

  useEffect(() => {
    getPattern(id)
      .then(setPattern)
      .catch(() => {});
    getScaledPattern(id)
      .then(setScaledData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    fetchYarnSummary();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const panelOpen = abbrLoading || selectedAbbr !== null || abbrError !== null;
  const lines = scaledData?.lines ?? [];

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

  async function handleViewTranslated() {
    setTranslating(true);
    try {
      const tokens = await translatePattern(id);
      navigate(`/patterns/${id}/translation`, { state: { tokens } });
    } catch {
      setTranslating(false);
    }
  }

  function handleYarnModalClose() {
    setYarnModalOpen(false);
    fetchYarnSummary();
  }

  function handleModalConfirm() {
    setModalOpen(false);
    setLoading(true);
    setError(null);
    getScaledPattern(id)
      .then(setScaledData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

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
        <span className="kn-breadcrumb__current">Scaled</span>
      </nav>

      <div className="pd-header">
        <div className="pt-header-row">
          <h1 className="pd-header__title">Pattern Scaled</h1>
          <button
            className="pt-adapt-btn"
            onClick={() => setModalOpen(true)}
            disabled={!pattern}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            Edit adaptation
          </button>
        </div>
      </div>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div
            className="spinner-border"
            role="status"
            style={{ color: "var(--kn-primary)" }}
          >
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {Array.isArray(yarnSummary) && (
        <div className="pt-yarn-summary">
          <div className="pt-yarn-summary__head">
            <h2 className="pt-yarn-summary__title">Yarn summary</h2>
            <button
              className="pt-yarn-edit-btn"
              onClick={() => setYarnModalOpen(true)}
              disabled={!pattern}
            >
              Edit yarn data
            </button>
          </div>
          <ul className="pt-yarn-summary__list">
            {yarnSummary.map((item, i) => {
              const py = item.pattern_yarn ?? {};
              const uy = item.user_yarn ?? {};
              const patternLabel = py.label || `Yarn ${i + 1}`;
              const userLabel =
                uy.label && uy.label !== py.label ? uy.label : null;
              return (
                <li key={i} className="pt-yarn-summary__item">
                  <span className="pt-yarn-summary__name">
                    {patternLabel}
                    {userLabel && (
                      <span className="pt-yarn-summary__user-yarn">
                        {" "}
                        ({userLabel})
                      </span>
                    )}
                    :
                  </span>{" "}
                  {item.calculated ? (
                    <>
                      <span className="pt-yarn-summary__value">
                        ~{Math.round(item.result?.grams_needed)} g (~
                        {item.result?.skeins_needed} skeins)
                      </span>
                      {item.weight_warning && (
                        <span className="pt-yarn-summary__warning">
                          ⚠ Different yarn weight
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="pt-yarn-summary__message">
                      {item.message}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {yarnSummary === "prompt" && (
        <div className="pt-yarn-prompt">
          <p className="pt-yarn-prompt__text">
            Add your yarn information to know how much you'll need for this
            project.
          </p>
          <button
            className="pt-yarn-prompt__btn"
            onClick={() => setYarnModalOpen(true)}
            disabled={!pattern}
          >
            Calculate yarn needed
          </button>
        </div>
      )}

      {!loading && !error && scaledData && (
        <>
          {scaledData.rows_warning && (
            <div className="alert alert-warning" role="alert">
              Row gauge was not provided, so rounds have not been scaled.
            </div>
          )}

          <div className="pt-card">
            <div className="pt-card__head">
              <div className="pt-toggles">
                <button
                  className="pt-toggle-btn"
                  onClick={handleViewTranslated}
                  disabled={translating}
                >
                  {translating ? "Loading…" : "Translated"}
                </button>
                <button
                  className="pt-toggle-btn pt-toggle-btn--active"
                  disabled
                >
                  Scaled
                </button>
              </div>
              {scaledData.size_label && (
                <span className="pt-size-label">
                  Viewing pattern for size {scaledData.size_label}
                </span>
              )}
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
                        scaled={token.scaled}
                      />
                    ))}
                  </div>
                ),
              )}
            </div>
          </div>
        </>
      )}

      {modalOpen && pattern && (
        <AdaptPatternModal
          pattern={pattern}
          onClose={() => setModalOpen(false)}
          onConfirm={handleModalConfirm}
        />
      )}

      {yarnModalOpen && pattern && (
        <YarnCalculatorModal pattern={pattern} onClose={handleYarnModalClose} />
      )}

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

export default PatternScaledPage;
