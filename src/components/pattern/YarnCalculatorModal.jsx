import { useState, useEffect } from "react";
import { getUserYarns, putUserYarn } from "../../services/patternService";
import "./YarnCalculatorModal.css";

const YARN_WEIGHT_OPTIONS = ["LACE", "FINGERING", "DK", "ARAN", "BULKY"];

function makeEmptyUserYarn() {
  return {
    label: "",
    yarn_weight: "",
    meters_per_unit: "",
    grams_per_unit: "",
    strands: "",
  };
}

function fromSaved(saved) {
  return {
    label: saved.label ?? "",
    yarn_weight: saved.yarn_weight ?? "",
    meters_per_unit:
      saved.meters_per_unit != null ? String(saved.meters_per_unit) : "",
    grams_per_unit:
      saved.grams_per_unit != null ? String(saved.grams_per_unit) : "",
    strands: saved.strands != null ? String(saved.strands) : "",
  };
}

function fromPattern(py) {
  return {
    label: py.label ?? "",
    yarn_weight: py.yarn_weight ?? "",
    meters_per_unit:
      py.meters_per_unit != null ? String(py.meters_per_unit) : "",
    grams_per_unit: py.grams_per_unit != null ? String(py.grams_per_unit) : "",
    strands: py.strands != null ? String(py.strands) : "",
  };
}

function validateUserYarn(yarn) {
  const errs = {};

  if (String(yarn.meters_per_unit).trim() === "") {
    errs.meters_per_unit = "Meters per skein are required";
  } else {
    const v = Number(yarn.meters_per_unit);
    if (isNaN(v) || v <= 0)
      errs.meters_per_unit = "Value must be greater than zero";
  }

  if (String(yarn.grams_per_unit).trim() === "") {
    errs.grams_per_unit = "Grams per skein are required";
  } else {
    const v = Number(yarn.grams_per_unit);
    if (isNaN(v) || v <= 0)
      errs.grams_per_unit = "Value must be greater than zero";
  }

  if (String(yarn.strands).trim() === "") {
    errs.strands = "Number of strands is required";
  } else {
    const v = Number(yarn.strands);
    if (isNaN(v) || v <= 0) errs.strands = "Value must be greater than zero";
    else if (!Number.isInteger(v))
      errs.strands = "Number of strands must be a whole number";
  }

  return errs;
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function YarnCalculatorModal({ pattern, onClose }) {
  const patternYarns = pattern.yarns ?? [];

  const [userYarns, setUserYarns] = useState(
    patternYarns.map(makeEmptyUserYarn),
  );
  const [useSameYarn, setUseSameYarn] = useState(patternYarns.map(() => false));
  const [errors, setErrors] = useState(patternYarns.map(() => ({})));
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    getUserYarns(pattern.id)
      .then((existing) => {
        setUserYarns((prev) =>
          prev.map((uy, i) => {
            const found = existing.find(
              (e) => String(e.pattern_yarn_id) === String(patternYarns[i]?.id),
            );
            return found ? fromSaved(found) : uy;
          }),
        );
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(i, field, val) {
    setUserYarns((prev) =>
      prev.map((y, j) => (j === i ? { ...y, [field]: val } : y)),
    );
    setErrors((prev) =>
      prev.map((e, j) => (j === i ? { ...e, [field]: undefined } : e)),
    );
  }

  function handleUseSameYarnToggle(i, checked) {
    setUseSameYarn((prev) => prev.map((v, j) => (j === i ? checked : v)));
    if (checked) {
      setUserYarns((prev) =>
        prev.map((y, j) => (j === i ? fromPattern(patternYarns[i]) : y)),
      );
      setErrors((prev) => prev.map((e, j) => (j === i ? {} : e)));
    }
  }

  async function handleConfirm() {
    const allErrors = userYarns.map((uy, i) =>
      useSameYarn[i] ? {} : validateUserYarn(uy),
    );
    if (allErrors.some((e) => Object.keys(e).length > 0)) {
      setErrors(allErrors);
      return;
    }
    setErrors(patternYarns.map(() => ({})));
    setGlobalError(null);
    setSaving(true);
    try {
      await Promise.all(
        userYarns.map((uy, i) =>
          putUserYarn(pattern.id, patternYarns[i].id, {
            label: uy.label.trim() || null,
            yarn_weight: uy.yarn_weight || null,
            meters_per_unit: Number(uy.meters_per_unit),
            grams_per_unit: Number(uy.grams_per_unit),
            strands: Number(uy.strands),
          }),
        ),
      );
      onClose();
    } catch (err) {
      setGlobalError(err.message);
      setSaving(false);
    }
  }

  function handleOverlayMouseDown(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="yc-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="yc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="yc-title"
      >
        {/* Header */}
        <div className="yc-modal__head">
          <h2 className="yc-modal__title" id="yc-title">
            Calculate yarn needed
          </h2>
          <button
            className="yc-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="yc-modal__body">
          {globalError && (
            <div className="alert alert-danger mb-4" role="alert">
              {globalError}
            </div>
          )}

          {patternYarns.length === 0 && (
            <p className="yc-empty">This pattern has no yarns defined.</p>
          )}

          {patternYarns.map((py, i) => {
            const same = useSameYarn[i];
            return (
              <div key={i} className="yc-block">
                <div className="yc-block__header">
                  <span className="yc-block__num">{i + 1}</span>
                  <span className="yc-block__name">
                    {py.label || `Yarn ${i + 1}`}
                  </span>
                </div>

                <div className="yc-block__body">
                  {/* Same yarn checkbox */}
                  <label
                    className={`yc-same-row${same ? " yc-same-row--active" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={same}
                      onChange={(e) =>
                        handleUseSameYarnToggle(i, e.target.checked)
                      }
                    />
                    Use same yarn as pattern
                  </label>

                  {/* Comparison table */}
                  <div className="yc-table">
                    <div className="yc-row yc-row--head">
                      <div className="yc-row__prop" />
                      <div className="yc-row__pattern">Pattern</div>
                      <div className="yc-row__user">Your yarn</div>
                    </div>

                    {/* Label */}
                    <div className="yc-row">
                      <div className="yc-row__prop">
                        <label htmlFor={`uy-label-${i}`}>Label</label>
                      </div>
                      <div className="yc-row__pattern">{py.label || "—"}</div>
                      <div className="yc-row__user">
                        <input
                          id={`uy-label-${i}`}
                          type="text"
                          className="form-control form-control-sm"
                          value={userYarns[i].label}
                          onChange={(e) =>
                            handleChange(i, "label", e.target.value)
                          }
                          disabled={same}
                        />
                      </div>
                    </div>

                    {/* Weight */}
                    <div className="yc-row">
                      <div className="yc-row__prop">
                        <label htmlFor={`uy-weight-${i}`}>Weight</label>
                      </div>
                      <div className="yc-row__pattern">
                        {py.yarn_weight || "—"}
                      </div>
                      <div className="yc-row__user">
                        <select
                          id={`uy-weight-${i}`}
                          className="form-select form-select-sm"
                          value={userYarns[i].yarn_weight}
                          onChange={(e) =>
                            handleChange(i, "yarn_weight", e.target.value)
                          }
                          disabled={same}
                        >
                          <option value="">—</option>
                          {YARN_WEIGHT_OPTIONS.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* m/skein */}
                    <div className="yc-row">
                      <div className="yc-row__prop">
                        <label htmlFor={`uy-mpu-${i}`}>
                          m/skein <span className="yc-required">*</span>
                        </label>
                      </div>
                      <div className="yc-row__pattern">
                        {py.meters_per_unit != null ? py.meters_per_unit : "—"}
                      </div>
                      <div className="yc-row__user">
                        <input
                          id={`uy-mpu-${i}`}
                          type="number"
                          min="0"
                          step="any"
                          className={`form-control form-control-sm${errors[i]?.meters_per_unit ? " is-invalid" : ""}`}
                          value={userYarns[i].meters_per_unit}
                          onChange={(e) =>
                            handleChange(i, "meters_per_unit", e.target.value)
                          }
                          disabled={same}
                        />
                        {errors[i]?.meters_per_unit && (
                          <p className="yc-error">
                            {errors[i].meters_per_unit}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* g/skein */}
                    <div className="yc-row">
                      <div className="yc-row__prop">
                        <label htmlFor={`uy-gpu-${i}`}>
                          g/skein <span className="yc-required">*</span>
                        </label>
                      </div>
                      <div className="yc-row__pattern">
                        {py.grams_per_unit != null ? py.grams_per_unit : "—"}
                      </div>
                      <div className="yc-row__user">
                        <input
                          id={`uy-gpu-${i}`}
                          type="number"
                          min="0"
                          step="any"
                          className={`form-control form-control-sm${errors[i]?.grams_per_unit ? " is-invalid" : ""}`}
                          value={userYarns[i].grams_per_unit}
                          onChange={(e) =>
                            handleChange(i, "grams_per_unit", e.target.value)
                          }
                          disabled={same}
                        />
                        {errors[i]?.grams_per_unit && (
                          <p className="yc-error">{errors[i].grams_per_unit}</p>
                        )}
                      </div>
                    </div>

                    {/* Strands */}
                    <div className="yc-row">
                      <div className="yc-row__prop">
                        <label htmlFor={`uy-strands-${i}`}>
                          Strands <span className="yc-required">*</span>
                        </label>
                      </div>
                      <div className="yc-row__pattern">
                        {py.strands != null ? py.strands : "—"}
                      </div>
                      <div className="yc-row__user">
                        <input
                          id={`uy-strands-${i}`}
                          type="number"
                          min="1"
                          step="1"
                          className={`form-control form-control-sm${errors[i]?.strands ? " is-invalid" : ""}`}
                          value={userYarns[i].strands}
                          onChange={(e) =>
                            handleChange(i, "strands", e.target.value)
                          }
                          disabled={same}
                        />
                        {errors[i]?.strands && (
                          <p className="yc-error">{errors[i].strands}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="yc-modal__foot">
          <button className="yc-cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="yc-confirm-btn"
            onClick={handleConfirm}
            disabled={saving || patternYarns.length === 0}
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                Saving…
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default YarnCalculatorModal;
