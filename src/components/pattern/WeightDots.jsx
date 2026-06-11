const WEIGHT_ORDER = ["LACE", "FINGERING", "DK", "ARAN", "BULKY"];

function WeightDots({ weight }) {
  const level = WEIGHT_ORDER.indexOf(weight) + 1;
  if (level === 0) return null;
  return (
    <div className="pd-weight">
      {WEIGHT_ORDER.map((_, i) => (
        <div
          key={i}
          className={`pd-weight__dot${i < level ? " pd-weight__dot--on" : ""}`}
        />
      ))}
      <span className="pd-weight__label">{weight}</span>
    </div>
  );
}

export default WeightDots;
