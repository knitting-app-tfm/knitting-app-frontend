import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPattern, translatePattern } from "../../services/patternService";
import { KnittingIcon, CrochetIcon } from "../../components/pattern/CraftIcons";
import GaugeSection from "../../components/pattern/GaugeSection";
import YarnsSection from "../../components/pattern/YarnsSection";
import PatternHero from "../../components/pattern/PatternHero";
import PatternActions from "../../components/pattern/PatternActions";
import "./PatternDetailPage.css";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

function PatternDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pattern, setPattern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(null);

  async function handleTranslate() {
    setTranslating(true);
    setTranslateError(null);
    try {
      const tokens = await translatePattern(id);
      navigate(`/patterns/${id}/translation`, { state: { tokens } });
    } catch (err) {
      setTranslateError(err.message);
    } finally {
      setTranslating(false);
    }
  }

  useEffect(() => {
    getPattern(id)
      .then(setPattern)
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

  const rawPath = pattern.cover_image_path;
  const coverImageUrl = rawPath
    ? rawPath.startsWith("http")
      ? rawPath
      : `${BASE_URL}${rawPath.startsWith("/") ? rawPath : `/${rawPath}`}`
    : null;

  const craftLabel = pattern.craft === "CROCHET" ? "Crochet" : "Knitting";
  const CraftIcon = pattern.craft === "CROCHET" ? CrochetIcon : KnittingIcon;

  const hasGauge =
    (pattern.gauge_stitches != null && pattern.gauge_stitches !== "") ||
    (pattern.gauge_rows != null && pattern.gauge_rows !== "") ||
    (pattern.gauge_size != null && pattern.gauge_size !== "") ||
    !!pattern.needle_size;
  const hasYarns = (pattern.yarns?.length ?? 0) > 0;

  const badgeRows = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--kn-spacing-2)",
      }}
    >
      <div>
        <span className="pd-badge pd-badge--light">
          <CraftIcon /> {craftLabel}
        </span>
      </div>
      {pattern.sizes?.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--kn-spacing-2)",
          }}
        >
          {pattern.sizes.map((size) => (
            <span key={size} className="pd-badge pd-badge--light">
              {size}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="pd-page">
      <nav className="kn-breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span className="kn-breadcrumb__sep">/</span>
        <span className="kn-breadcrumb__current">{pattern.title}</span>
      </nav>

      <PatternHero
        coverImageUrl={coverImageUrl}
        title={pattern.title}
        badgeRows={badgeRows}
      />

      {hasGauge && <GaugeSection pattern={pattern} />}

      {hasYarns && (
        <YarnsSection yarns={pattern.yarns} sectionNum={hasGauge ? 2 : 1} />
      )}

      <PatternActions
        patternId={id}
        onTranslate={handleTranslate}
        translating={translating}
        translateError={translateError}
      />
    </div>
  );
}

export default PatternDetailPage;
