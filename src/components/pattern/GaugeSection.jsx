import PdSection from "./PdSection";
import GaugeDiagram from "./GaugeDiagram";
import { NeedleIcon, HookIcon } from "./CraftIcons";

function GaugeSection({ pattern }) {
  const GaugeToolIcon = pattern.craft === "CROCHET" ? HookIcon : NeedleIcon;
  const gaugeToolLabel =
    pattern.craft === "CROCHET" ? "Hook size" : "Needle size";

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

  return (
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
              <span style={{ color: "var(--kn-text-muted)", fontWeight: 400 }}>
                {gaugeToolLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </PdSection>
  );
}

export default GaugeSection;
