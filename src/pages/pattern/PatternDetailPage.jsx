import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPattern } from "../../services/patternService";
import "./PatternDetailPage.css";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const WEIGHT_ORDER = ["LACE", "FINGERING", "DK", "ARAN", "BULKY"];

/* ── Craft icons ──────────────────────────────────────── */

/** Two crossed knitting needles with round knobs at the tops */
function KnittingIcon({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* needle \ */}
      <line x1="5" y1="3" x2="20" y2="21" />
      <circle cx="5" cy="3" r="2.5" fill="currentColor" stroke="none" />
      {/* needle / */}
      <line x1="19" y1="3" x2="4" y2="21" />
      <circle cx="19" cy="3" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Crochet hook — straight shaft with a J-curve at the end */
function CrochetIcon({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <line x1="12" y1="2" x2="12" y2="15" />
      <path d="M12 15 Q12 22 6 22 Q3 22 3 18" />
    </svg>
  );
}

/** Single knitting needle (for gauge row) */
function NeedleIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <line x1="4" y1="20" x2="20" y2="4" />
      <circle cx="20" cy="4" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Crochet hook (for gauge row, crochet patterns) */
function HookIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <line x1="12" y1="2" x2="12" y2="15" />
      <path d="M12 15 Q12 22 6 22 Q3 22 3 18" />
    </svg>
  );
}

/* ── Gauge SVG diagram ────────────────────────────────── */
function GaugeDiagram() {
  return (
    <svg
      viewBox="0 0 200 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="28"
        y="16"
        width="130"
        height="120"
        rx="6"
        fill="#f2ede7"
        stroke="#cec6bc"
        strokeWidth="1.5"
      />
      {[0, 1, 2, 3, 4, 5, 6].map((row) =>
        [0, 1, 2, 3, 4, 5, 6, 7].map((col) => {
          const cx = 38 + col * 16;
          const cy = 26 + row * 16;
          return (
            <path
              key={`${row}-${col}`}
              d={`M${cx} ${cy + 8} L${cx + 6} ${cy} L${cx + 12} ${cy + 8}`}
              stroke="#c0b0a0"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          );
        }),
      )}
      <line
        x1="28"
        y1="152"
        x2="158"
        y2="152"
        stroke="#5b0101"
        strokeWidth="1.5"
      />
      <polyline
        points="34,148 28,152 34,156"
        stroke="#5b0101"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polyline
        points="152,148 158,152 152,156"
        stroke="#5b0101"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <text
        x="93"
        y="168"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#5b0101"
        fontFamily="Figtree, sans-serif"
      >
        Stitches
      </text>
      <text
        x="93"
        y="179"
        textAnchor="middle"
        fontSize="9"
        fill="#9a928a"
        fontFamily="Figtree, sans-serif"
      >
        ← horizontal →
      </text>
      <line
        x1="170"
        y1="16"
        x2="170"
        y2="136"
        stroke="#7a9d50"
        strokeWidth="1.5"
      />
      <polyline
        points="166,22 170,16 174,22"
        stroke="#7a9d50"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polyline
        points="166,130 170,136 174,130"
        stroke="#7a9d50"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <text
        x="185"
        y="76"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#7a9d50"
        fontFamily="Figtree, sans-serif"
        transform="rotate(90 185 76)"
      >
        Rows
      </text>
      <rect
        x="28"
        y="4"
        width="130"
        height="8"
        rx="3"
        fill="#a7bada"
        opacity="0.5"
      />
      <text
        x="93"
        y="11"
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fill="#5b7090"
        fontFamily="Figtree, sans-serif"
      >
        Gauge size (e.g. 10 cm)
      </text>
      <line
        x1="28"
        y1="196"
        x2="120"
        y2="196"
        stroke="#9a928a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="122" cy="196" r="4" fill="#9a928a" />
      <text
        x="130"
        y="200"
        fontSize="9"
        fill="#9a928a"
        fontFamily="Figtree, sans-serif"
      >
        Needle size
      </text>
    </svg>
  );
}

/* ── Yarn weight dot indicator ────────────────────────── */
function WeightDots({ weight }) {
  const level = WEIGHT_ORDER.indexOf(weight) + 1;
  if (level === 0) return null;
  return (
    <div className="pd-weight">
      {WEIGHT_ORDER.map((_, i) => (
        <div
          key={i}
          className={`pd-weight__dot${i < level ? " pd-weight__dot--on" : ""}`}
        />
      ))}
      <span className="pd-weight__label">{weight}</span>
    </div>
  );
}

/* ── Section wrapper ──────────────────────────────────── */
function PdSection({ num, title, desc, children }) {
  return (
    <div className="pd-section">
      <div className="pd-section__head">
        <span className="pd-section__num">{String(num).padStart(2, "0")}</span>
        <div>
          <p className="pd-section__title">{title}</p>
          {desc && <p className="pd-section__desc">{desc}</p>}
        </div>
      </div>
      <div className="pd-section__body">{children}</div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */
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

  /* Build image URL — handles full URL, /media/… path, and bare path */
  const rawPath = pattern.cover_image_path;
  const coverImageUrl = rawPath
    ? rawPath.startsWith("http")
      ? rawPath
      : `${BASE_URL}${rawPath.startsWith("/") ? rawPath : `/${rawPath}`}`
    : null;

  const craftLabel = pattern.craft === "CROCHET" ? "Crochet" : "Knitting";
  const CraftIcon = pattern.craft === "CROCHET" ? CrochetIcon : KnittingIcon;
  const GaugeToolIcon = pattern.craft === "CROCHET" ? HookIcon : NeedleIcon;
  const gaugeToolLabel =
    pattern.craft === "CROCHET" ? "Hook size" : "Needle size";

  /* Gauge stat callouts */
  const gaugeStats = [];
  if (pattern.gauge_stitches != null && pattern.gauge_stitches !== "")
    gaugeStats.push({
      value: pattern.gauge_stitches,
      label: "Stitches",
      dot: "primary",
    });
  if (pattern.gauge_rows != null && pattern.gauge_rows !== "")
    gaugeStats.push({ value: pattern.gauge_rows, label: "Rows", dot: "green" });
  if (pattern.gauge_size != null && pattern.gauge_size !== "")
    gaugeStats.push({
      value: `${pattern.gauge_size}${pattern.gauge_unit ? " " + pattern.gauge_unit.toLowerCase() : ""}`,
      label: "Gauge size",
      dot: "accent",
    });

  const hasGauge = gaugeStats.length > 0 || !!pattern.needle_size;
  const hasYarns = (pattern.yarns?.length ?? 0) > 0;

  /* JSX variable (not a component) (not a component) — avoids the "component created during render" lint error */
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
      {/* Breadcrumb */}
      <nav className="kn-breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span className="kn-breadcrumb__sep">/</span>
        <span className="kn-breadcrumb__current">{pattern.title}</span>
      </nav>

      {/* ── Hero with cover image ── */}
      {coverImageUrl ? (
        <div className="pd-hero">
          <img
            src={coverImageUrl}
            alt={pattern.title}
            className="pd-hero__img"
            onError={(e) => {
              /* If the image 404s, hide the hero and show the plain header instead */
              e.currentTarget.closest(".pd-hero").style.display = "none";
              e.currentTarget
                .closest(".pd-hero")
                .nextElementSibling?.style.removeProperty("display");
            }}
          />
          <div className="pd-hero__overlay">
            <h1 className="pd-hero__title">{pattern.title}</h1>
            {badgeRows}
          </div>
        </div>
      ) : null}

      {/* ── Header without cover image (always rendered, hidden when hero shown) ── */}
      <div
        className="pd-header"
        style={coverImageUrl ? { display: "none" } : {}}
      >
        <h1 className="pd-header__title">{pattern.title}</h1>
        {badgeRows}
      </div>

      {/* ── Gauge section ── */}
      {hasGauge && (
        <PdSection
          num={1}
          title="Gauge"
          desc="How many stitches and rows fit in a given area, measured over a 10 cm or 4 in swatch. Matching the gauge ensures the finished piece comes out the right size."
        >
          <div className="pd-gauge-layout">
            <div className="pd-gauge-diagram">
              <GaugeDiagram />
            </div>
            <div className="pd-gauge-stats">
              {gaugeStats.map((s) => (
                <div key={s.label} className="pd-stat">
                  <div className={`pd-stat__dot pd-stat__dot--${s.dot}`} />
                  <div>
                    <div className="pd-stat__value">{s.value}</div>
                    <div className="pd-stat__label">{s.label}</div>
                  </div>
                </div>
              ))}
              {pattern.needle_size && (
                <div className="pd-needle-row">
                  <GaugeToolIcon />
                  <strong>{pattern.needle_size}</strong>
                  <span
                    style={{ color: "var(--kn-text-muted)", fontWeight: 400 }}
                  >
                    {gaugeToolLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </PdSection>
      )}

      {/* ── Yarns section ── */}
      {hasYarns && (
        <PdSection
          num={hasGauge ? 2 : 1}
          title="Yarns"
          desc="All the yarn types needed to complete this pattern. Weight ranges from fine (Lace) to chunky (Bulky), shown by the dots on each card."
        >
          {pattern.yarns.map((yarn, i) => {
            const stats = [];
            if (yarn.meters_per_unit != null && yarn.meters_per_unit !== "")
              stats.push({
                value: `${yarn.meters_per_unit} m`,
                label: "Per skein",
              });
            if (yarn.grams_per_unit != null && yarn.grams_per_unit !== "")
              stats.push({
                value: `${yarn.grams_per_unit} g`,
                label: "Skein weight",
              });
            if (yarn.grams_needed != null && yarn.grams_needed !== "")
              stats.push({
                value: `${yarn.grams_needed} g`,
                label: "Total needed",
              });
            if (yarn.strands > 1)
              stats.push({ value: `×${yarn.strands}`, label: "Strands" });

            return (
              <div key={i} className="pd-yarn-card">
                <div className="pd-yarn-card__head">
                  <span className="pd-yarn-card__num">{i + 1}</span>
                  <span className="pd-yarn-card__name">
                    {yarn.label || `Yarn ${i + 1}`}
                  </span>
                  {yarn.yarn_weight && <WeightDots weight={yarn.yarn_weight} />}
                </div>
                {stats.length > 0 && (
                  <div className="pd-yarn-card__stats">
                    {stats.map((s) => (
                      <div key={s.label} className="pd-yarn-stat">
                        <span className="pd-yarn-stat__value">{s.value}</span>
                        <span className="pd-yarn-stat__label">{s.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </PdSection>
      )}

      {/* ── Footer action ── */}
      <div className="pd-actions">
        <Link to={`/patterns/${id}/confirm`} className="pd-edit-btn">
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit metadata
        </Link>
      </div>
    </div>
  );
}

export default PatternDetailPage;
