function GaugeStep({
  pattern,
  hasPatternGauge,
  gaugeMode,
  onGaugeModeChange,
  gaugeStitches,
  onGaugeStitchesChange,
  gaugeRows,
  onGaugeRowsChange,
  gaugeSize,
  onGaugeSizeChange,
  gaugeUnit,
  onGaugeUnitChange,
  needleSize,
  onNeedleSizeChange,
  errors,
  onClearError,
}) {
  const disabled = gaugeMode === "pattern";

  return (
    <>
      {/* Gauge source */}
      <p className="am-body__label">Gauge source</p>
      <div className="am-gauge-options">
        <label
          className={`am-gauge-option${gaugeMode === "pattern" ? " am-gauge-option--selected" : ""}${!hasPatternGauge ? " am-gauge-option--disabled" : ""}`}
        >
          <input
            type="radio"
            name="gaugeMode"
            value="pattern"
            checked={gaugeMode === "pattern"}
            onChange={() => onGaugeModeChange("pattern")}
            disabled={!hasPatternGauge}
            className="d-none"
          />
          Use pattern gauge
        </label>
        <label
          className={`am-gauge-option${gaugeMode === "manual" ? " am-gauge-option--selected" : ""}`}
        >
          <input
            type="radio"
            name="gaugeMode"
            value="manual"
            checked={gaugeMode === "manual"}
            onChange={() => onGaugeModeChange("manual")}
            className="d-none"
          />
          Enter my gauge
        </label>
      </div>

      {/* Gauge fields */}
      <div className="am-gauge-fields">
        {/* Gauge stitches */}
        <div className="am-field">
          <label htmlFor="am-gauge-stitches" className="am-field__label">
            Gauge stitches{" "}
            <span className="am-required" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="am-gauge-stitches"
            type="number"
            min="1"
            step="1"
            className={`form-control${errors.gaugeStitches ? " is-invalid" : ""}`}
            value={gaugeStitches}
            onChange={(e) => {
              onGaugeStitchesChange(e.target.value);
              onClearError("gaugeStitches");
            }}
            disabled={disabled}
          />
          {errors.gaugeStitches && (
            <div className="invalid-feedback">{errors.gaugeStitches}</div>
          )}
        </div>

        {/* Gauge rows */}
        <div className="am-field">
          <label htmlFor="am-gauge-rows" className="am-field__label">
            Gauge rows
          </label>
          <input
            id="am-gauge-rows"
            type="number"
            min="1"
            step="1"
            className={`form-control${errors.gaugeRows ? " is-invalid" : ""}`}
            value={gaugeRows}
            onChange={(e) => {
              onGaugeRowsChange(e.target.value);
              onClearError("gaugeRows");
            }}
            disabled={disabled}
          />
          {errors.gaugeRows ? (
            <div className="invalid-feedback">{errors.gaugeRows}</div>
          ) : (
            <p className="am-field__warning">
              Without row gauge, rounds will not be scaled
            </p>
          )}
        </div>

        {/* Gauge size + unit */}
        <div className="am-gauge-size-row">
          <div className="am-field" style={{ flex: 1 }}>
            <label htmlFor="am-gauge-size" className="am-field__label">
              Gauge size{" "}
              <span className="am-required" aria-hidden="true">
                *
              </span>
            </label>
            {pattern.gauge_size != null && (
              <span className="am-field__hint">
                Pattern: {pattern.gauge_size}
                {pattern.gauge_unit ? ` ${pattern.gauge_unit}` : ""}
              </span>
            )}
            <input
              id="am-gauge-size"
              type="number"
              min="0.01"
              step="any"
              className={`form-control${errors.gaugeSize ? " is-invalid" : ""}`}
              value={gaugeSize}
              onChange={(e) => {
                onGaugeSizeChange(e.target.value);
                onClearError("gaugeSize");
              }}
              disabled={disabled}
            />
            {errors.gaugeSize && (
              <div className="invalid-feedback">{errors.gaugeSize}</div>
            )}
          </div>

          <div className="am-field am-field--unit">
            <label className="am-field__label">
              Unit{" "}
              <span className="am-required" aria-hidden="true">
                *
              </span>
            </label>
            {pattern.gauge_size != null && (
              <span className="am-field__hint">&nbsp;</span>
            )}
            <div
              className="am-unit-toggle"
              role="group"
              aria-label="Gauge unit"
            >
              {["CM", "INCH"].map((u) => (
                <button
                  key={u}
                  type="button"
                  className={`am-unit-btn${gaugeUnit === u ? " am-unit-btn--selected" : ""}`}
                  onClick={() => !disabled && onGaugeUnitChange(u)}
                  disabled={disabled}
                  aria-pressed={gaugeUnit === u}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Needle size */}
        <div className="am-field">
          <label htmlFor="am-needle-size" className="am-field__label">
            Needle size
          </label>
          <input
            id="am-needle-size"
            type="text"
            className="form-control"
            value={needleSize}
            onChange={(e) => onNeedleSizeChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      {errors.global && (
        <div className="alert alert-danger mt-3" role="alert">
          {errors.global}
        </div>
      )}
    </>
  );
}

export default GaugeStep;
