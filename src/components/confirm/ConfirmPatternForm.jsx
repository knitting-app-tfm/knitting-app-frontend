import { useState } from "react";

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

function ConfirmPatternForm({ initialData, onSubmit, loading, error }) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [craft, setCraft] = useState(initialData?.craft ?? "KNITTING");
  const [coverImage, setCoverImage] = useState(null);
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

  const handleAddSize = () => {
    const trimmed = newSize.trim();
    if (!trimmed) return;
    setSizes((prev) => [...prev, trimmed]);
    setNewSize("");
  };

  const handleRemoveSize = (index) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddYarn = () => {
    setYarns((prev) => [...prev, EMPTY_YARN()]);
  };

  const handleRemoveYarn = (index) => {
    setYarns((prev) => prev.filter((_, i) => i !== index));
  };

  const handleYarnChange = (index, field, value) => {
    setYarns((prev) =>
      prev.map((y, i) => (i === index ? { ...y, [field]: value } : y)),
    );
  };

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
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Basic info</div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="patternTitle" className="form-label">
              Title <span className="text-danger">*</span>
            </label>
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
            {titleError && <div className="invalid-feedback">{titleError}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="patternCraft" className="form-label">
              Craft <span className="text-danger">*</span>
            </label>
            <select
              id="patternCraft"
              className="form-select"
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

          <div className="mb-3">
            <label htmlFor="coverImage" className="form-label">
              Cover image <span className="text-muted small">(optional)</span>
            </label>
            <input
              id="coverImage"
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files[0] ?? null)}
            />
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Sizes</div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 mb-3">
            {sizes.map((size, i) => (
              <span
                key={i}
                className="badge bg-secondary d-flex align-items-center gap-1 fs-6"
              >
                {size}
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  style={{ fontSize: "0.6rem" }}
                  aria-label={`Remove size ${size}`}
                  onClick={() => handleRemoveSize(i)}
                />
              </span>
            ))}
            {sizes.length === 0 && (
              <span className="text-muted small">No sizes added yet</span>
            )}
          </div>
          <div className="input-group" style={{ maxWidth: "320px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. XS, S, M…"
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
            >
              Add size
            </button>
          </div>
        </div>
      </div>

      {/* Gauge */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Gauge</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-sm-4">
              <label htmlFor="gaugeStitches" className="form-label">
                Stitches
              </label>
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
            <div className="col-sm-4">
              <label htmlFor="gaugeRows" className="form-label">
                Rows
              </label>
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
            <div className="col-sm-4">
              <label htmlFor="gaugeSize" className="form-label">
                Size
              </label>
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
            <div className="col-sm-4">
              <label htmlFor="gaugeUnit" className="form-label">
                Unit
              </label>
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
            <div className="col-sm-8">
              <label htmlFor="needleSize" className="form-label">
                Needle size
              </label>
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
      </div>

      {/* Yarns */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Yarns</div>
        <div className="card-body">
          {yarns.length === 0 && (
            <p className="text-muted small mb-3">No yarns added yet</p>
          )}
          {yarns.map((yarn, i) => (
            <div key={i} className="border rounded p-3 mb-3 position-relative">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2"
                onClick={() => handleRemoveYarn(i)}
                aria-label={`Remove yarn ${i + 1}`}
              >
                Remove
              </button>
              <p className="fw-semibold mb-2">Yarn {i + 1}</p>
              <div className="row g-2">
                <div className="col-sm-6">
                  <label className="form-label small">Label</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={yarn.label}
                    onChange={(e) =>
                      handleYarnChange(i, "label", e.target.value)
                    }
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small">Weight</label>
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
                <div className="col-sm-4">
                  <label className="form-label small">m/unit</label>
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
                <div className="col-sm-4">
                  <label className="form-label small">g/unit</label>
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
                <div className="col-sm-4">
                  <label className="form-label small">g needed</label>
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
                <div className="col-sm-4">
                  <label className="form-label small">Strands</label>
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
            Add yarn
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
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
    </form>
  );
}

export default ConfirmPatternForm;
