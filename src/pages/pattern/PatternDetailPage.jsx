import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPattern } from "../../services/patternService";
import "./PatternDetailPage.css";

const API_URL = import.meta.env.VITE_API_URL;

function GaugeGrid({ pattern }) {
  const stats = [
    pattern.gauge_stitches && {
      value: pattern.gauge_stitches,
      label: "Stitches",
    },
    pattern.gauge_rows && { value: pattern.gauge_rows, label: "Rows" },
    pattern.gauge_size && {
      value: `${pattern.gauge_size}${pattern.gauge_unit ? " " + pattern.gauge_unit.toLowerCase() : ""}`,
      label: "Gauge size",
    },
    pattern.needle_size && { value: pattern.needle_size, label: "Needle" },
  ].filter(Boolean);

  if (stats.length === 0) return null;

  return (
    <section className="mb-4">
      <p className="pattern-section-title">Gauge</p>
      <div className="gauge-grid">
        {stats.map((s) => (
          <div key={s.label} className="gauge-stat">
            <div className="gauge-stat__value">{s.value}</div>
            <div className="gauge-stat__label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function YarnCard({ yarn, index }) {
  const yarnStats = [
    yarn.meters_per_unit && {
      value: `${yarn.meters_per_unit} m`,
      label: "Per unit",
    },
    yarn.grams_per_unit && {
      value: `${yarn.grams_per_unit} g`,
      label: "Per unit",
    },
    yarn.grams_needed && {
      value: `${yarn.grams_needed} g`,
      label: "Total needed",
    },
  ].filter(Boolean);

  return (
    <div className="yarn-card">
      <div className="yarn-card__header">
        <span className="yarn-card__name">
          {yarn.label || `Yarn ${index + 1}`}
        </span>
        {yarn.yarn_weight && (
          <span className="yarn-card__badge">{yarn.yarn_weight}</span>
        )}
        {yarn.strands > 1 && (
          <span className="yarn-card__badge">{yarn.strands} strands</span>
        )}
      </div>
      {yarnStats.length > 0 && (
        <div className="yarn-card__stats">
          {yarnStats.map((s) => (
            <div key={s.label + s.value} className="yarn-stat">
              <span className="yarn-stat__value">{s.value}</span>
              <span className="yarn-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PatternDetailPage() {
  const { id } = useParams();
  const [pattern, setPattern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPattern(id)
      .then(setPattern)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status">
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

  const coverImageUrl = pattern.cover_image_path
    ? `${API_URL}${pattern.cover_image_path}`
    : null;

  return (
    <div className="pattern-detail">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item active">{pattern.title}</li>
        </ol>
      </nav>

      {coverImageUrl ? (
        <div className="pattern-hero">
          <img
            src={coverImageUrl}
            alt={pattern.title}
            className="pattern-hero__img"
          />
          <div className="pattern-hero__overlay">
            <h2 className="pattern-hero__title">{pattern.title}</h2>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <span className="pattern-badge pattern-badge--craft-light">
                {pattern.craft}
              </span>
              {pattern.sizes?.map((size) => (
                <span
                  key={size}
                  className="pattern-badge pattern-badge--craft-light"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="pattern-header">
          <h2 className="pattern-header__title">{pattern.title}</h2>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="pattern-badge pattern-badge--craft">
              {pattern.craft}
            </span>
            {pattern.sizes?.map((size) => (
              <span key={size} className="pattern-size-pill">
                {size}
              </span>
            ))}
          </div>
        </div>
      )}

      <GaugeGrid pattern={pattern} />

      {pattern.yarns?.length > 0 && (
        <section className="mb-4">
          <p className="pattern-section-title">Yarns</p>
          {pattern.yarns.map((yarn, i) => (
            <YarnCard key={i} yarn={yarn} index={i} />
          ))}
        </section>
      )}

      <div className="mt-4">
        <Link to={`/patterns/${id}/confirm`} className="pattern-edit-link">
          Edit metadata
        </Link>
      </div>
    </div>
  );
}

export default PatternDetailPage;
