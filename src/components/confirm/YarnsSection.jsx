const YARN_WEIGHT_OPTIONS = ["LACE", "FINGERING", "DK", "ARAN", "BULKY"];

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

function YarnsSection({
  yarns,
  sizes,
  onAddYarn,
  onRemoveYarn,
  onYarnChange,
  onYarnGramsNeededChange,
}) {
  return (
    <>
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
          No yarns added yet
        </p>
      )}

      {yarns.map((yarn, i) => (
        <div key={i} className="cp-yarn-card">
          <div className="cp-yarn-card__head">
            <span className="cp-yarn-card__title">
              <span className="cp-yarn-card__num">{i + 1}</span>
              <span>Yarn {i + 1}</span>
            </span>
            <button
              type="button"
              className="cp-yarn-remove"
              onClick={() => onRemoveYarn(i)}
              aria-label={`Remove yarn ${i + 1}`}
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
                onChange={(e) => onYarnChange(i, "label", e.target.value)}
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
                onChange={(e) => onYarnChange(i, "yarn_weight", e.target.value)}
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
                  onYarnChange(i, "meters_per_unit", e.target.value)
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
                  onYarnChange(i, "grams_per_unit", e.target.value)
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
                  onYarnChange(i, "strands", parseInt(e.target.value, 10) || 1)
                }
              />
            </div>
          </div>

          <div className="cp-yarn-grams">
            <span className="cp-label" style={{ fontSize: "0.8rem" }}>
              Grams needed
            </span>
            <span className="cp-hint">
              Total yarn required to finish the project per size.
            </span>
            <div className="cp-yarn-grams__row">
              {sizes.length > 0 ? (
                sizes.map((size, si) => (
                  <div key={si} className="cp-yarn-grams__cell">
                    <span className="cp-yarn-grams__pill">{size}</span>
                    <input
                      id={`yarn-${i}-grams-${si}`}
                      type="number"
                      min="0"
                      step="any"
                      className="form-control form-control-sm cp-yarn-grams__input"
                      value={yarn.grams_needed[si] ?? ""}
                      onChange={(e) =>
                        onYarnGramsNeededChange(i, si, e.target.value)
                      }
                      placeholder="g"
                      aria-label={`Grams needed — ${size}`}
                    />
                  </div>
                ))
              ) : (
                <input
                  id={`yarn-${i}-grams-0`}
                  type="number"
                  min="0"
                  step="any"
                  className="form-control form-control-sm cp-yarn-grams__input"
                  value={yarn.grams_needed[0] ?? ""}
                  onChange={(e) =>
                    onYarnGramsNeededChange(i, 0, e.target.value)
                  }
                  placeholder="g"
                  aria-label="Grams needed"
                />
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={onAddYarn}
        aria-label="Add yarn"
      >
        + Add yarn
      </button>
    </>
  );
}

export default YarnsSection;
