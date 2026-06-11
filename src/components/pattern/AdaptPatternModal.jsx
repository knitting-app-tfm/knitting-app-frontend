import { useState, useEffect } from "react";
import { getScaling, putScaling } from "../../services/patternService";
import SizeStep from "./SizeStep";
import GaugeStep from "./GaugeStep";
import "./AdaptPatternModal.css";

function gaugeMatchesPattern(scaling, pattern) {
  const eq = (a, b) => {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return Number(a) === Number(b);
  };
  return (
    eq(scaling.gauge_stitches, pattern.gauge_stitches) &&
    eq(scaling.gauge_rows, pattern.gauge_rows) &&
    eq(scaling.gauge_size, pattern.gauge_size) &&
    (scaling.gauge_unit ?? "") === (pattern.gauge_unit ?? "")
  );
}

function AdaptPatternModal({ pattern, onClose, onConfirm }) {
  const sizes = pattern.sizes ?? [];
  const isOneSize = sizes.length === 0;
  const hasPatternGauge =
    pattern.gauge_stitches != null || pattern.gauge_size != null;

  const initialGaugeMode = hasPatternGauge ? "pattern" : "manual";

  const [step, setStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState(
    isOneSize ? "One size" : null,
  );

  const [gaugeMode, setGaugeMode] = useState(initialGaugeMode);
  const [gaugeStitches, setGaugeStitches] = useState(
    initialGaugeMode === "pattern" ? String(pattern.gauge_stitches ?? "") : "",
  );
  const [gaugeRows, setGaugeRows] = useState(
    initialGaugeMode === "pattern" ? String(pattern.gauge_rows ?? "") : "",
  );
  const [gaugeSize, setGaugeSize] = useState(
    initialGaugeMode === "pattern" ? String(pattern.gauge_size ?? "") : "",
  );
  const [gaugeUnit, setGaugeUnit] = useState(
    initialGaugeMode === "pattern" ? pattern.gauge_unit || "CM" : "CM",
  );
  const [needleSize, setNeedleSize] = useState(
    initialGaugeMode === "pattern" ? (pattern.needle_size ?? "") : "",
  );

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getScaling(pattern.id)
      .then((scaling) => {
        if (!scaling) return;
        if (!isOneSize && scaling.size_label)
          setSelectedSize(scaling.size_label);
        if (scaling.gauge_stitches != null || scaling.gauge_size != null) {
          const mode = gaugeMatchesPattern(scaling, pattern)
            ? "pattern"
            : "manual";
          setGaugeMode(mode);
          setGaugeStitches(String(scaling.gauge_stitches ?? ""));
          setGaugeRows(String(scaling.gauge_rows ?? ""));
          setGaugeSize(String(scaling.gauge_size ?? ""));
          setGaugeUnit(scaling.gauge_unit || "CM");
          setNeedleSize(scaling.needle_size ?? "");
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleGaugeModeChange(mode) {
    setGaugeMode(mode);
    if (mode === "pattern") {
      setGaugeStitches(String(pattern.gauge_stitches ?? ""));
      setGaugeRows(String(pattern.gauge_rows ?? ""));
      setGaugeSize(String(pattern.gauge_size ?? ""));
      setGaugeUnit(pattern.gauge_unit || "CM");
      setNeedleSize(pattern.needle_size ?? "");
      setErrors({});
    }
  }

  function handleClearError(field) {
    setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function validate() {
    const errs = {};

    const stitchesStr = String(gaugeStitches).trim();
    if (!stitchesStr) {
      errs.gaugeStitches = "Stitch gauge is required";
    } else {
      const val = parseFloat(stitchesStr);
      if (isNaN(val) || val <= 0)
        errs.gaugeStitches = "Value must be greater than zero";
      else if (!Number.isInteger(val))
        errs.gaugeStitches = "Stitches and rows must be whole numbers";
    }

    const sizeStr = String(gaugeSize).trim();
    if (!sizeStr) {
      errs.gaugeSize = "Gauge size is required";
    } else {
      const val = parseFloat(sizeStr);
      if (isNaN(val) || val <= 0)
        errs.gaugeSize = "Value must be greater than zero";
    }

    const rowsStr = String(gaugeRows).trim();
    if (rowsStr) {
      const val = parseFloat(rowsStr);
      if (isNaN(val) || val <= 0)
        errs.gaugeRows = "Value must be greater than zero";
      else if (!Number.isInteger(val))
        errs.gaugeRows = "Stitches and rows must be whole numbers";
    }

    return errs;
  }

  async function handleConfirm() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const sizePosition = isOneSize ? 0 : sizes.indexOf(selectedSize);
    setSaving(true);
    try {
      await putScaling(pattern.id, {
        size_label: selectedSize,
        size_position: sizePosition,
        gauge_stitches: Number(gaugeStitches),
        gauge_rows: String(gaugeRows).trim() ? Number(gaugeRows) : null,
        gauge_size: Number(gaugeSize),
        gauge_unit: gaugeUnit,
        needle_size: needleSize.trim() || null,
      });
      onConfirm();
    } catch (err) {
      setErrors({ global: err.message });
      setSaving(false);
    }
  }

  function handleOverlayMouseDown(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="am-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="am-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="am-title"
      >
        {/* Header */}
        <div className="am-modal__head">
          <h2 className="am-modal__title" id="am-title">
            Adapt pattern
          </h2>
          <button
            className="am-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
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
          </button>
        </div>

        {/* Step indicator */}
        <div className="am-steps" aria-label="Steps">
          <div
            className={`am-step${step === 1 ? " am-step--active" : " am-step--done"}`}
          >
            <div
              className="am-step__num"
              aria-current={step === 1 ? "step" : undefined}
            >
              {step > 1 ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="1.5,6 4.5,9 10.5,3" />
                </svg>
              ) : (
                "1"
              )}
            </div>
            <span className="am-step__label">Select size</span>
          </div>
          <div className="am-step__line" aria-hidden="true" />
          <div className={`am-step${step === 2 ? " am-step--active" : ""}`}>
            <div
              className="am-step__num"
              aria-current={step === 2 ? "step" : undefined}
            >
              2
            </div>
            <span className="am-step__label">Gauge</span>
          </div>
        </div>

        {/* Body */}
        <div className="am-modal__body">
          {step === 1 ? (
            <SizeStep
              sizes={sizes}
              isOneSize={isOneSize}
              selectedSize={selectedSize}
              onSelect={setSelectedSize}
              patternId={pattern.id}
              onClose={onClose}
            />
          ) : (
            <GaugeStep
              pattern={pattern}
              hasPatternGauge={hasPatternGauge}
              gaugeMode={gaugeMode}
              onGaugeModeChange={handleGaugeModeChange}
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
              errors={errors}
              onClearError={handleClearError}
            />
          )}
        </div>

        {/* Footer */}
        <div className="am-modal__foot">
          {step === 1 ? (
            <>
              <button className="am-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                className="am-next-btn"
                onClick={() => setStep(2)}
                disabled={!selectedSize}
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                className="am-cancel-btn"
                onClick={() => setStep(1)}
                disabled={saving}
              >
                Back
              </button>
              <button
                className="am-next-btn"
                onClick={handleConfirm}
                disabled={saving}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdaptPatternModal;
