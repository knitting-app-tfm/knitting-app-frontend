import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getScaling, putScaling } from "../../services/patternService";
import "./AdaptPatternModal.css";

function AdaptPatternModal({ pattern, onClose, onConfirm }) {
  const sizes = pattern.sizes ?? [];
  const isOneSize = sizes.length === 0;

  const [selectedSize, setSelectedSize] = useState(
    isOneSize ? "One size" : null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOneSize) return;
    getScaling(pattern.id)
      .then((scaling) => {
        if (scaling?.size_label) setSelectedSize(scaling.size_label);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleNext() {
    if (!selectedSize) return;
    const sizePosition = isOneSize ? 0 : sizes.indexOf(selectedSize);
    setSaving(true);
    setError(null);
    try {
      await putScaling(pattern.id, selectedSize, sizePosition);
      onConfirm();
    } catch (err) {
      setError(err.message);
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
          <div className="am-step am-step--active">
            <div className="am-step__num" aria-current="step">
              1
            </div>
            <span className="am-step__label">Select size</span>
          </div>
          <div className="am-step__line" aria-hidden="true" />
          <div className="am-step">
            <div className="am-step__num">2</div>
            <span className="am-step__label">Measurements</span>
          </div>
        </div>

        {/* Body */}
        <div className="am-modal__body">
          <p className="am-body__label">Select your size</p>
          <div className="am-sizes">
            {isOneSize ? (
              <button
                className="am-size-pill am-size-pill--selected"
                disabled
                aria-pressed={true}
              >
                One size
              </button>
            ) : (
              sizes.map((size) => (
                <button
                  key={size}
                  className={`am-size-pill${selectedSize === size ? " am-size-pill--selected" : ""}`}
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={selectedSize === size}
                >
                  {size}
                </button>
              ))
            )}
          </div>

          {isOneSize && (
            <p className="am-disclaimer">
              This pattern is one size. If this is incorrect, you can{" "}
              <Link to={`/patterns/${pattern.id}/confirm`} onClick={onClose}>
                edit the metadata
              </Link>
              .
            </p>
          )}

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="am-modal__foot">
          <button className="am-cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="am-next-btn"
            onClick={handleNext}
            disabled={!selectedSize || saving}
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
              "Next"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdaptPatternModal;
