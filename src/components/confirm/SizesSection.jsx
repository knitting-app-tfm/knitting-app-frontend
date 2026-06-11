function SizesSection({
  oneSize,
  onOneSizeChange,
  sizes,
  newSize,
  onNewSizeChange,
  onAddSize,
  onRemoveSize,
}) {
  return (
    <>
      <div className="cp-onesize-row">
        <input
          id="oneSizeCheck"
          type="checkbox"
          checked={oneSize}
          onChange={(e) => onOneSizeChange(e.target.checked)}
        />
        <label htmlFor="oneSizeCheck">This pattern is one size</label>
      </div>

      <div className="cp-size-tags">
        {oneSize ? (
          <span className="cp-size-tag cp-size-tag--onesize">One size</span>
        ) : (
          <>
            {sizes.map((size, i) => (
              <span key={i} className="cp-size-tag">
                {size}
                <button
                  type="button"
                  className="cp-size-tag__remove"
                  onClick={() => onRemoveSize(i)}
                  aria-label={`Remove size ${size}`}
                >
                  ×
                </button>
              </span>
            ))}
            {sizes.length === 0 && (
              <span
                style={{
                  fontSize: "var(--kn-text-sm)",
                  color: "var(--kn-text-muted)",
                }}
              >
                No sizes added yet
              </span>
            )}
          </>
        )}
      </div>

      {!oneSize && (
        <div className="cp-size-add">
          <input
            type="text"
            className="form-control"
            placeholder="e.g. XS, S, M, 38…"
            value={newSize}
            onChange={(e) => onNewSizeChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddSize();
              }
            }}
            aria-label="New size"
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onAddSize}
            style={{ whiteSpace: "nowrap" }}
            aria-label="Add size"
          >
            + Add
          </button>
        </div>
      )}
    </>
  );
}

export default SizesSection;
