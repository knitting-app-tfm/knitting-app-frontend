import { useState } from "react";
import "./ConfirmPatternForm.css";

/* ── Craft icons ────────────────────────────────────── */

/** Two crossed knitting needles with round knobs at the tops */
function KnittingIcon() {
  return (
    <svg
      width="13"
      height="13"
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
function CrochetIcon() {
  return (
    <svg
      width="13"
      height="13"
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

const CRAFT_OPTIONS = ["KNITTING", "CROCHET"];
const GAUGE_UNIT_OPTIONS = ["CM", "INCH"];
const YARN_WEIGHT_OPTIONS = ["LACE", "FINGERING", "DK", "ARAN", "BULKY"];

const EMPTY_YARN = () => ({
  label: "",
  yarn_weight: "",
  meters_per_unit: "",
  grams_per_unit: "",
  grams_needed: "",
  strands: 1,
});

function normalizeYarn(y) {
  return {
    label: y.label ?? "",
    yarn_weight: y.yarn_weight ?? "",
    meters_per_unit: y.meters_per_unit ?? "",
    grams_per_unit: y.grams_per_unit ?? "",
    grams_needed: y.grams_needed ?? "",
    strands: y.strands ?? 1,
  };
}

/* ── Gauge SVG diagram ─────────────────────────────── */
function GaugeDiagram() {
  return (
    <svg
      viewBox="0 0 200 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Swatch background */}
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

      {/* Knitting stitch texture — rows of V shapes */}
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

      {/* ── Stitches: horizontal arrow at bottom ── */}
      <line
        x1="28"
        y1="152"
        x2="158"
        y2="152"
        stroke="#5b0101"
        strokeWidth="1.5"
      />
      {/* left arrowhead */}
      <polyline
        points="34,148 28,152 34,156"
        stroke="#5b0101"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* right arrowhead */}
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

      {/* ── Rows: vertical arrow on the right ── */}
      <line
        x1="170"
        y1="16"
        x2="170"
        y2="136"
        stroke="#7a9d50"
        strokeWidth="1.5"
      />
      {/* top arrowhead */}
      <polyline
        points="166,22 170,16 174,22"
        stroke="#7a9d50"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* bottom arrowhead */}
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

      {/* ── Gauge size: bracket at top ── */}
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

      {/* ── Needle icon at bottom ── */}
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

/* ── Yarn SVG illustration ─────────────────────────── */
function YarnBallIllustration() {
  return (
    <svg
      viewBox="0 0 180 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: "180px", height: "auto", flexShrink: 0 }}
    >
      {/* Ball of yarn */}
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="#f2ede7"
        stroke="#cec6bc"
        strokeWidth="1.5"
      />
      {/* Yarn lines on ball */}
      <path
        d="M15 50 Q50 20 85 50"
        stroke="#a7c37a"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M13 58 Q50 30 87 58"
        stroke="#a7c37a"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M18 38 Q50 10 82 38"
        stroke="#a7c37a"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M20 65 Q50 40 80 65"
        stroke="#5b0101"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M25 72 Q50 50 75 72"
        stroke="#5b0101"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      {/* Tail of yarn */}
      <path
        d="M85 50 C100 50 110 40 120 35"
        stroke="#a7c37a"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Label: m/unit */}
      <line
        x1="120"
        y1="35"
        x2="145"
        y2="20"
        stroke="#cec6bc"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <text
        x="148"
        y="19"
        fontSize="9"
        fontWeight="700"
        fill="#7a9d50"
        fontFamily="Figtree, sans-serif"
      >
        m/unit
      </text>
      <text
        x="148"
        y="28"
        fontSize="8"
        fill="#9a928a"
        fontFamily="Figtree, sans-serif"
      >
        Length of 1 skein
      </text>

      {/* Label: g/unit */}
      <line
        x1="70"
        y1="85"
        x2="95"
        y2="90"
        stroke="#cec6bc"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <text
        x="98"
        y="89"
        fontSize="9"
        fontWeight="700"
        fill="#5b0101"
        fontFamily="Figtree, sans-serif"
      >
        g/unit
      </text>
      <text
        x="98"
        y="98"
        fontSize="8"
        fill="#9a928a"
        fontFamily="Figtree, sans-serif"
      >
        Weight of 1 skein
      </text>
    </svg>
  );
}

/* ── Section wrapper ───────────────────────────────── */
function Section({ num, title, desc, children }) {
  return (
    <div className="cp-section">
      <div className="cp-section__head">
        <span className="cp-section__num">{String(num).padStart(2, "0")}</span>
        <div>
          <p className="cp-section__title">{title}</p>
          <p className="cp-section__desc">{desc}</p>
        </div>
      </div>
      <div className="cp-section__body">{children}</div>
    </div>
  );
}

/* ── Main form ─────────────────────────────────────── */
function ConfirmPatternForm({ initialData, onSubmit, loading, error }) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [craft, setCraft] = useState(initialData?.craft ?? "KNITTING");
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [sizes, setSizes] = useState(initialData?.sizes ?? []);
  const [newSize, setNewSize] = useState("");
  const [gaugeStitches, setGaugeStitches] = useState(
    initialData?.gauge_stitches ?? "",
  );
  const [gaugeRows, setGaugeRows] = useState(initialData?.gauge_rows ?? "");
  const [gaugeSize, setGaugeSize] = useState(initialData?.gauge_size ?? "");
  const [gaugeUnit, setGaugeUnit] = useState(initialData?.gauge_unit ?? "");
  const [needleSize, setNeedleSize] = useState(initialData?.needle_size ?? "");
  const [yarns, setYarns] = useState(
    (initialData?.yarns ?? []).map(normalizeYarn),
  );
  const [titleError, setTitleError] = useState(null);

  /* handlers — logic unchanged */
  const handleCoverChange = (e) => {
    const file = e.target.files[0] ?? null;
    setCoverImage(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
    else setCoverPreview(null);
  };

  const handleAddSize = () => {
    const t = newSize.trim();
    if (!t) return;
    setSizes((p) => [...p, t]);
    setNewSize("");
  };
  const handleRemoveSize = (i) => setSizes((p) => p.filter((_, j) => j !== i));

  const handleAddYarn = () => setYarns((p) => [...p, EMPTY_YARN()]);
  const handleRemoveYarn = (i) => setYarns((p) => p.filter((_, j) => j !== i));
  const handleYarnChange = (i, field, val) =>
    setYarns((p) => p.map((y, j) => (j === i ? { ...y, [field]: val } : y)));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }
    setTitleError(null);
    onSubmit({
      title: title.trim(),
      craft,
      coverImage,
      sizes,
      gauge_stitches: gaugeStitches,
      gauge_rows: gaugeRows,
      gauge_size: gaugeSize,
      gauge_unit: gaugeUnit,
      needle_size: needleSize,
      yarns,
    });
  };

  return (
    <form className="cp-form" onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {/* ── 1 · Basic info ───────────────────────────── */}
      <Section
        num={1}
        title="Pattern basics"
        desc="The title, craft type and cover photo that will identify this pattern."
      >
        <div className="cp-basic-layout">
          {/* Photo */}
          <div className="cp-photo-area">
            <input
              id="coverImage"
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleCoverChange}
            />
            <div
              className="cp-photo-preview"
              onClick={() => document.getElementById("coverImage").click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                document.getElementById("coverImage").click()
              }
              aria-label="Upload cover image"
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover preview" />
                  <div className="cp-photo-preview__overlay">Change photo</div>
                </>
              ) : (
                <>
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="cp-photo-preview__hint">
                    Click to add
                    <br />a cover photo
                  </span>
                </>
              )}
            </div>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--kn-text-muted)",
                textAlign: "center",
                margin: 0,
              }}
            >
              Optional · JPG, PNG, WEBP
            </p>
          </div>

          {/* Fields */}
          <div>
            <div className="cp-field">
              <label htmlFor="patternTitle" className="cp-label">
                Title <span style={{ color: "var(--kn-primary)" }}>*</span>
              </label>
              <span className="cp-hint">
                The name of the pattern as it appears in the original document.
              </span>
              <input
                id="patternTitle"
                type="text"
                className={`form-control ${titleError ? "is-invalid" : ""}`}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) setTitleError(null);
                }}
              />
              {titleError && (
                <div className="invalid-feedback">{titleError}</div>
              )}
            </div>

            <div className="cp-field">
              <label htmlFor="patternCraft" className="cp-label">
                Craft type
              </label>
              <span className="cp-hint">
                Is this a knitting or crochet pattern?
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "var(--kn-spacing-2)",
                  flexWrap: "wrap",
                }}
              >
                {CRAFT_OPTIONS.map((c) => (
                  <label
                    key={c}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--kn-spacing-2)",
                      padding: "0.5rem 1rem",
                      borderRadius: "var(--kn-radius-full)",
                      border: `2px solid ${craft === c ? "var(--kn-primary)" : "var(--kn-border)"}`,
                      background:
                        craft === c
                          ? "var(--kn-primary-bg)"
                          : "var(--kn-surface)",
                      cursor: "pointer",
                      fontWeight: craft === c ? 700 : 500,
                      fontSize: "var(--kn-text-sm)",
                      color:
                        craft === c
                          ? "var(--kn-primary)"
                          : "var(--kn-text-secondary)",
                      transition: "all var(--kn-transition-fast)",
                    }}
                  >
                    <input
                      type="radio"
                      name="craft"
                      value={c}
                      checked={craft === c}
                      onChange={() => setCraft(c)}
                      className="d-none"
                    />
                    {c === "KNITTING" ? (
                      <>
                        <KnittingIcon /> Knitting
                      </>
                    ) : (
                      <>
                        <CrochetIcon /> Crochet
                      </>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 2 · Sizes ────────────────────────────────── */}
      <Section
        num={2}
        title="Sizes"
        desc="Add the sizes this pattern comes in, such as XS, S, M, L or numeric sizes like 36, 38, 40."
      >
        <div className="cp-size-tags">
          {sizes.map((size, i) => (
            <span key={i} className="cp-size-tag">
              {size}
              <button
                type="button"
                className="cp-size-tag__remove"
                onClick={() => handleRemoveSize(i)}
                aria-label={`Remove ${size}`}
              >
                ×
              </button>
            </span>
          ))}
          {sizes.length === 0 && (
            <span
              style={{
                fontSize: "var(--kn-text-sm)",
                color: "var(--kn-text-muted)",
              }}
            >
              No sizes added yet. Use the field below to add one.
            </span>
          )}
        </div>
        <div className="cp-size-add">
          <input
            type="text"
            className="form-control"
            placeholder="e.g. XS, S, M, 38…"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSize();
              }
            }}
            aria-label="New size"
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleAddSize}
            style={{ whiteSpace: "nowrap" }}
          >
            + Add
          </button>
        </div>
      </Section>

      {/* ── 3 · Gauge ────────────────────────────────── */}
      <Section
        num={3}
        title="Gauge"
        desc="Gauge tells you how many stitches and rows fit in a given measurement, usually 10 cm. If your gauge doesn't match the pattern, the finished piece will be a different size."
      >
        <div className="cp-gauge-layout">
          {/* Diagram */}
          <div className="cp-gauge-diagram">
            <GaugeDiagram />
          </div>

          {/* Inputs */}
          <div>
            <div className="cp-field">
              <label htmlFor="gaugeStitches" className="cp-label">
                Stitches
              </label>
              <span className="cp-hint">
                Number of stitches counted horizontally across the swatch.
              </span>
              <input
                id="gaugeStitches"
                type="number"
                min="0"
                step="any"
                className="form-control"
                value={gaugeStitches}
                onChange={(e) => setGaugeStitches(e.target.value)}
              />
            </div>
            <div className="cp-field">
              <label htmlFor="gaugeRows" className="cp-label">
                Rows
              </label>
              <span className="cp-hint">
                Number of rows counted vertically in the swatch.
              </span>
              <input
                id="gaugeRows"
                type="number"
                min="0"
                step="any"
                className="form-control"
                value={gaugeRows}
                onChange={(e) => setGaugeRows(e.target.value)}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 100px",
                gap: "var(--kn-spacing-3)",
              }}
            >
              <div className="cp-field" style={{ marginBottom: 0 }}>
                <label htmlFor="gaugeSize" className="cp-label">
                  Gauge size
                </label>
                <span className="cp-hint">
                  The measurement the stitch & row count is based on (usually
                  10).
                </span>
                <input
                  id="gaugeSize"
                  type="number"
                  min="0"
                  step="any"
                  className="form-control"
                  value={gaugeSize}
                  onChange={(e) => setGaugeSize(e.target.value)}
                />
              </div>
              <div className="cp-field" style={{ marginBottom: 0 }}>
                <label htmlFor="gaugeUnit" className="cp-label">
                  Unit
                </label>
                <span className="cp-hint">&nbsp;</span>
                <select
                  id="gaugeUnit"
                  className="form-select"
                  value={gaugeUnit}
                  onChange={(e) => setGaugeUnit(e.target.value)}
                >
                  <option value="">—</option>
                  {GAUGE_UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              className="cp-field"
              style={{ marginTop: "var(--kn-spacing-4)" }}
            >
              <label htmlFor="needleSize" className="cp-label">
                Needle / hook size
              </label>
              <span className="cp-hint">
                The recommended needle or crochet hook size, such as 4 mm or US
                6.
              </span>
              <input
                id="needleSize"
                type="text"
                className="form-control"
                value={needleSize}
                onChange={(e) => setNeedleSize(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ── 4 · Yarns ────────────────────────────────── */}
      <Section
        num={4}
        title="Yarns"
        desc="All the yarn types needed to complete this pattern. Most patterns use one, but colorwork or multi-yarn designs may need more."
      >
        {/* Visual intro */}
        <div className="cp-yarn-intro">
          <YarnBallIllustration />
          <p className="cp-yarn-intro__text">
            <strong>m/unit</strong> is the total length of yarn in one skein or
            ball.
            <br />
            <strong>g/unit</strong> is its weight.
            <br />
            <strong>g needed</strong> is the total amount required to finish the
            project.
            <br />
            <strong>Strands</strong> means how many threads you hold together at
            once.
          </p>
        </div>

        {yarns.length === 0 && (
          <p
            style={{
              fontSize: "var(--kn-text-sm)",
              color: "var(--kn-text-muted)",
              marginBottom: "var(--kn-spacing-4)",
            }}
          >
            No yarns added yet.
          </p>
        )}

        {yarns.map((yarn, i) => (
          <div key={i} className="cp-yarn-card">
            <div className="cp-yarn-card__head">
              <span className="cp-yarn-card__title">
                <span className="cp-yarn-card__num">{i + 1}</span>
                {yarn.label || `Yarn ${i + 1}`}
              </span>
              <button
                type="button"
                className="cp-yarn-remove"
                onClick={() => handleRemoveYarn(i)}
              >
                Remove
              </button>
            </div>

            <div className="cp-yarn-grid">
              <div className="cp-yarn-stat">
                <label className="cp-label" style={{ fontSize: "0.8rem" }}>
                  Label
                </label>
                <span className="cp-hint">
                  Name or brand of the yarn, if known.
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={yarn.label}
                  onChange={(e) => handleYarnChange(i, "label", e.target.value)}
                />
              </div>
              <div className="cp-yarn-stat">
                <label className="cp-label" style={{ fontSize: "0.8rem" }}>
                  Weight category
                </label>
                <span className="cp-hint">
                  Thickness, from fine Lace to chunky Bulky.
                </span>
                <select
                  className="form-select form-select-sm"
                  value={yarn.yarn_weight}
                  onChange={(e) =>
                    handleYarnChange(i, "yarn_weight", e.target.value)
                  }
                >
                  <option value="">—</option>
                  {YARN_WEIGHT_OPTIONS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div className="cp-yarn-stat">
                <label className="cp-label" style={{ fontSize: "0.8rem" }}>
                  Meters per unit
                </label>
                <span className="cp-hint">
                  Length of yarn in one skein or ball.
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-control form-control-sm"
                  value={yarn.meters_per_unit}
                  onChange={(e) =>
                    handleYarnChange(i, "meters_per_unit", e.target.value)
                  }
                />
              </div>
              <div className="cp-yarn-stat">
                <label className="cp-label" style={{ fontSize: "0.8rem" }}>
                  Grams per unit
                </label>
                <span className="cp-hint">Weight of one skein or ball.</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-control form-control-sm"
                  value={yarn.grams_per_unit}
                  onChange={(e) =>
                    handleYarnChange(i, "grams_per_unit", e.target.value)
                  }
                />
              </div>
              <div className="cp-yarn-stat">
                <label className="cp-label" style={{ fontSize: "0.8rem" }}>
                  Grams needed
                </label>
                <span className="cp-hint">
                  Total yarn needed to complete the project.
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-control form-control-sm"
                  value={yarn.grams_needed}
                  onChange={(e) =>
                    handleYarnChange(i, "grams_needed", e.target.value)
                  }
                />
              </div>
              <div className="cp-yarn-stat">
                <label className="cp-label" style={{ fontSize: "0.8rem" }}>
                  Strands
                </label>
                <span className="cp-hint">
                  Threads held together at once, usually 1.
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="form-control form-control-sm"
                  value={yarn.strands}
                  onChange={(e) =>
                    handleYarnChange(
                      i,
                      "strands",
                      parseInt(e.target.value, 10) || 1,
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={handleAddYarn}
        >
          + Add yarn
        </button>
      </Section>

      {/* ── Submit ── */}
      <div className="cp-submit-row">
        <button type="submit" className="cp-submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Saving…
            </>
          ) : (
            "Save pattern"
          )}
        </button>
        {loading && (
          <span
            style={{
              fontSize: "var(--kn-text-sm)",
              color: "var(--kn-text-muted)",
            }}
          >
            This may take a moment…
          </span>
        )}
      </div>
    </form>
  );
}

export default ConfirmPatternForm;
