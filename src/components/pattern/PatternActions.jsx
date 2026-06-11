import { Link } from "react-router-dom";

function PatternActions({
  patternId,
  onTranslate,
  translating,
  translateError,
}) {
  return (
    <>
      <div className="pd-actions">
        <Link to={`/patterns/${patternId}/confirm`} className="pd-edit-btn">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit metadata
        </Link>
        <button
          className="pd-translate-btn"
          onClick={onTranslate}
          disabled={translating}
        >
          {translating ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
              Translating…
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 8l6 6" />
                <path d="M4 14l6-6 2-3" />
                <path d="M2 5h12" />
                <path d="M7 2h1" />
                <path d="M22 22l-5-10-5 10" />
                <path d="M14 18h6" />
              </svg>
              Translate pattern
            </>
          )}
        </button>
      </div>
      {translateError && (
        <div className="alert alert-danger" role="alert">
          {translateError}
        </div>
      )}
    </>
  );
}

export default PatternActions;
