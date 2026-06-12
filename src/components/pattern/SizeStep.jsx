import { Link } from "react-router-dom";

function SizeStep({
  sizes,
  isOneSize,
  selectedSize,
  onSelect,
  patternId,
  onClose,
}) {
  return (
    <>
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
              onClick={() => onSelect(size)}
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
          <Link to={`/patterns/${patternId}/confirm`} onClick={onClose}>
            edit the metadata
          </Link>
          .
        </p>
      )}
    </>
  );
}

export default SizeStep;
