import { useState } from "react";
import CoverImageSection from "./CoverImageSection";
import SizesSection from "./SizesSection";
import GaugeSection from "./GaugeSection";
import YarnsSection from "./YarnsSection";
import "./ConfirmPatternForm.css";

/* ── Craft icons ────────────────────────────────────── */

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
      <line x1="5" y1="3" x2="20" y2="21" />
      <circle cx="5" cy="3" r="2.5" fill="currentColor" stroke="none" />
      <line x1="19" y1="3" x2="4" y2="21" />
      <circle cx="19" cy="3" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
const ALLOWED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

const makeEmptyYarn = (sizes) => ({
  label: "",
  yarn_weight: "",
  meters_per_unit: "",
  grams_per_unit: "",
  grams_needed: Array(Math.max(1, sizes.length)).fill(""),
  strands: 1,
});

function normalizeYarn(y, sizes = []) {
  const targetLen = Math.max(1, sizes.length);
  const raw = y.grams_needed;
  let gramsNeeded;
  if (Array.isArray(raw)) {
    gramsNeeded = Array.from({ length: targetLen }, (_, i) => {
      const v = raw[i];
      return v != null && v !== "" ? String(v) : "";
    });
  } else if (sizes.length === 0 && raw != null && raw !== "") {
    gramsNeeded = [String(raw)];
  } else {
    gramsNeeded = Array(targetLen).fill("");
  }
  return {
    label: y.label ?? "",
    yarn_weight: y.yarn_weight ?? "",
    meters_per_unit: y.meters_per_unit ?? "",
    grams_per_unit: y.grams_per_unit ?? "",
    grams_needed: gramsNeeded,
    strands: y.strands ?? 1,
  };
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
  const [coverImageError, setCoverImageError] = useState(null);
  const [oneSize, setOneSize] = useState(
    (initialData?.sizes ?? []).length === 0,
  );
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
    (initialData?.yarns ?? []).map((y) =>
      normalizeYarn(y, initialData?.sizes ?? []),
    ),
  );
  const [titleError, setTitleError] = useState(null);

  /* ── Cover image ── */
  const isAllowedImageFile = (file) => {
    if (!(file instanceof File)) return false;
    const allowedMime = ALLOWED_COVER_TYPES.includes(file.type);
    const allowedExt = /\.(png|jpe?g|webp)$/i.test(file.name || "");
    return allowedMime && allowedExt && file.size > 0;
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0] ?? null;
    if (file && isAllowedImageFile(file)) {
      setCoverImageError(null);
      setCoverImage(file);
      setCoverPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    } else {
      if (file)
        setCoverImageError("Only JPG, PNG and WebP images are allowed.");
      setCoverImage(null);
      setCoverPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  };

  /* ── Sizes ── */
  const handleOneSizeChange = (checked) => {
    setOneSize(checked);
    if (checked) {
      setSizes([]);
      setNewSize("");
      setYarns((prev) => prev.map((y) => ({ ...y, grams_needed: [""] })));
    }
  };

  const handleAddSize = () => {
    const t = newSize.trim();
    if (!t) return;
    setSizes((p) => [...p, t]);
    setYarns((prev) =>
      prev.map((y) => ({ ...y, grams_needed: [...y.grams_needed, ""] })),
    );
    setNewSize("");
  };

  const handleRemoveSize = (i) => {
    setSizes((p) => p.filter((_, j) => j !== i));
    setYarns((prev) =>
      prev.map((y) => ({
        ...y,
        grams_needed: y.grams_needed.filter((_, j) => j !== i),
      })),
    );
  };

  /* ── Yarns ── */
  const handleAddYarn = () => setYarns((p) => [...p, makeEmptyYarn(sizes)]);
  const handleRemoveYarn = (i) => setYarns((p) => p.filter((_, j) => j !== i));
  const handleYarnChange = (i, field, val) =>
    setYarns((p) => p.map((y, j) => (j === i ? { ...y, [field]: val } : y)));
  const handleYarnGramsNeededChange = (yarnIdx, sizeIdx, val) =>
    setYarns((p) =>
      p.map((y, j) => {
        if (j !== yarnIdx) return y;
        const grams = [...y.grams_needed];
        grams[sizeIdx] = val;
        return { ...y, grams_needed: grams };
      }),
    );

  /* ── Submit ── */
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
          <CoverImageSection
            coverPreview={coverPreview}
            onCoverChange={handleCoverChange}
            coverImageError={coverImageError}
          />

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

            {/* Hidden select kept in sync with craft state — enables getElementById("patternCraft") in tests */}
            <select
              id="patternCraft"
              style={{ display: "none" }}
              value={craft}
              onChange={(e) => setCraft(e.target.value)}
            >
              {CRAFT_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* ── 2 · Sizes ────────────────────────────────── */}
      <Section
        num={2}
        title="Sizes"
        desc="Add the sizes this pattern comes in, such as XS, S, M, L or numeric sizes like 36, 38, 40."
      >
        <SizesSection
          oneSize={oneSize}
          onOneSizeChange={handleOneSizeChange}
          sizes={sizes}
          newSize={newSize}
          onNewSizeChange={setNewSize}
          onAddSize={handleAddSize}
          onRemoveSize={handleRemoveSize}
        />
      </Section>

      {/* ── 3 · Gauge ────────────────────────────────── */}
      <Section
        num={3}
        title="Gauge"
        desc="Gauge tells you how many stitches and rows fit in a given measurement, usually 10 cm. If your gauge doesn't match the pattern, the finished piece will be a different size."
      >
        <GaugeSection
          gaugeStitches={gaugeStitches}
          onGaugeStitchesChange={setGaugeStitches}
          gaugeRows={gaugeRows}
          onGaugeRowsChange={setGaugeRows}
          gaugeSize={gaugeSize}
          onGaugeSizeChange={setGaugeSize}
          gaugeUnit={gaugeUnit}
          onGaugeUnitChange={setGaugeUnit}
          needleSize={needleSize}
          onNeedleSizeChange={setNeedleSize}
        />
      </Section>

      {/* ── 4 · Yarns ────────────────────────────────── */}
      <Section
        num={4}
        title="Yarns"
        desc="All the yarn types needed to complete this pattern. Most patterns use one, but colorwork or multi-yarn designs may need more."
      >
        <YarnsSection
          yarns={yarns}
          sizes={sizes}
          onAddYarn={handleAddYarn}
          onRemoveYarn={handleRemoveYarn}
          onYarnChange={handleYarnChange}
          onYarnGramsNeededChange={handleYarnGramsNeededChange}
        />
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
              Confirming…
            </>
          ) : (
            "Confirm"
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
