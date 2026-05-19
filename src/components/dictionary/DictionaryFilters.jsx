const CRAFT_OPTIONS = [
  { value: null, label: "All" },
  { value: "KNITTING", label: "Knitting" },
  { value: "CROCHET", label: "Crochet" },
];

const TYPE_OPTIONS = [
  { value: null, label: "All types" },
  { value: "STITCH", label: "Stitch" },
  { value: "DECREASE", label: "Decrease" },
  { value: "INCREASE", label: "Increase" },
  { value: "TECHNIQUE", label: "Technique" },
  { value: "CONSTRUCTION", label: "Construction" },
  { value: "YARN_HANDLING", label: "Yarn" },
  { value: "MARKER", label: "Marker" },
  { value: "PATTERN_STRUCTURE", label: "Pattern" },
  { value: "OTHER", label: "Other" },
];

function DictionaryFilters({ craft, type, onChange }) {
  return (
    <div className="dict-filters">
      <div className="dict-filters__group">
        {CRAFT_OPTIONS.map((opt) => (
          <button
            key={opt.value ?? "all-craft"}
            className={`dict-filter-btn${craft === opt.value ? " dict-filter-btn--active" : ""}`}
            onClick={() => onChange({ craft: opt.value, type })}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="dict-filters__group">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value ?? "all-type"}
            className={`dict-filter-pill${type === opt.value ? " dict-filter-pill--active" : ""}`}
            onClick={() => onChange({ craft, type: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DictionaryFilters;
