import { useRef } from "react";

function CoverImageSection({ coverPreview, onCoverChange, coverImageError }) {
  const inputRef = useRef(null);
  const safeCoverPreview =
    typeof coverPreview === "string" && coverPreview.startsWith("blob:")
      ? coverPreview
      : "";

  return (
    <div className="cp-photo-area">
      <input
        ref={inputRef}
        id="coverImage"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="d-none"
        onChange={onCoverChange}
      />
      <div
        className="cp-photo-preview"
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Upload cover image"
      >
        {coverPreview ? (
          <>
            <img src={safeCoverPreview} alt="Cover preview" />
            <div className="cp-photo-preview__overlay">Change photo</div>
          </>
        ) : (
          <>
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="cp-photo-preview__hint">
              Click to add
              <br />a cover photo
            </span>
          </>
        )}
      </div>
      <p
        style={{
          fontSize: "0.78rem",
          color: "var(--kn-text-muted)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Optional · JPG · PNG · WebP
      </p>
      {coverImageError && (
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--kn-danger, #dc3545)",
            textAlign: "center",
            margin: "var(--kn-spacing-2) 0 0",
          }}
          role="alert"
        >
          {coverImageError}
        </p>
      )}
    </div>
  );
}

export default CoverImageSection;
