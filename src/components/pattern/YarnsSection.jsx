import PdSection from "./PdSection";
import WeightDots from "./WeightDots";

function YarnsSection({ yarns, sectionNum }) {
  return (
    <PdSection
      num={sectionNum}
      title="Yarns"
      desc="All the yarn types needed to complete this pattern. Weight ranges from fine (Lace) to chunky (Bulky), shown by the dots on each card."
    >
      {yarns.map((yarn, i) => {
        const stats = [];
        if (yarn.meters_per_unit != null && yarn.meters_per_unit !== "")
          stats.push({
            value: `${yarn.meters_per_unit} m`,
            label: "Per skein",
          });
        if (yarn.grams_per_unit != null && yarn.grams_per_unit !== "")
          stats.push({
            value: `${yarn.grams_per_unit} g`,
            label: "Skein weight",
          });
        if (yarn.grams_needed != null && yarn.grams_needed !== "")
          stats.push({
            value: `${yarn.grams_needed} g`,
            label: "Total needed",
          });
        if (yarn.strands > 1)
          stats.push({ value: `×${yarn.strands}`, label: "Strands" });

        return (
          <div key={i} className="pd-yarn-card">
            <div className="pd-yarn-card__head">
              <span className="pd-yarn-card__num">{i + 1}</span>
              <span className="pd-yarn-card__name">
                {yarn.label || `Yarn ${i + 1}`}
              </span>
              {yarn.yarn_weight && <WeightDots weight={yarn.yarn_weight} />}
            </div>
            {stats.length > 0 && (
              <div className="pd-yarn-card__stats">
                {stats.map((s) => (
                  <div key={s.label} className="pd-yarn-stat">
                    <span className="pd-yarn-stat__value">{s.value}</span>
                    <span className="pd-yarn-stat__label">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </PdSection>
  );
}

export default YarnsSection;
