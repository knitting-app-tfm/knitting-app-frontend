const GAUGE_UNIT_OPTIONS = ["CM", "INCH"];

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

      {/* ── Rows: vertical arrow on the right ── */}
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

function GaugeSection({
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
}) {
  return (
    <div className="cp-gauge-layout">
      <div className="cp-gauge-diagram">
        <GaugeDiagram />
      </div>

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
            onChange={(e) => onGaugeStitchesChange(e.target.value)}
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
            onChange={(e) => onGaugeRowsChange(e.target.value)}
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
              The measurement the stitch & row count is based on (usually 10).
            </span>
            <input
              id="gaugeSize"
              type="number"
              min="0"
              step="any"
              className="form-control"
              value={gaugeSize}
              onChange={(e) => onGaugeSizeChange(e.target.value)}
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
              onChange={(e) => onGaugeUnitChange(e.target.value)}
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
        <div className="cp-field" style={{ marginTop: "var(--kn-spacing-4)" }}>
          <label htmlFor="needleSize" className="cp-label">
            Needle / hook size
          </label>
          <span className="cp-hint">
            The recommended needle or crochet hook size, such as 4 mm or US 6.
          </span>
          <input
            id="needleSize"
            type="text"
            className="form-control"
            value={needleSize}
            onChange={(e) => onNeedleSizeChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default GaugeSection;
