import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { translatePattern } from "../../services/patternService";
import "./PatternCard.css";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const CRAFT_LABELS = { KNITTING: "Knitting", CROCHET: "Crochet" };
const STATUS_LABELS = {
  IMPORTED: "Imported",
  CONFIRMED: "Confirmed",
  TOKENIZED: "Translated",
};

function CoverPlaceholder() {
  return (
    <div className="pc__placeholder" aria-hidden="true">
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 8.4Q7 4.8 12 12Q17 19.2 20.4 15.6" />
        <path d="M5.5 16Q9 11 15 13" />
        <path d="M10 3.6Q12 9 10 12" />
      </svg>
    </div>
  );
}

function PatternCard({ pattern }) {
  const navigate = useNavigate();
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(null);

  const { id, title, status, craft, cover_image_path } = pattern;

  const coverUrl = cover_image_path
    ? cover_image_path.startsWith("http")
      ? cover_image_path
      : `${BASE_URL}${cover_image_path.startsWith("/") ? cover_image_path : `/${cover_image_path}`}`
    : null;

  const canTranslate = status === "CONFIRMED" || status === "TOKENIZED";

  async function handleTranslate() {
    setTranslating(true);
    setTranslateError(null);
    try {
      const tokens = await translatePattern(id);
      navigate(`/patterns/${id}/translation`, { state: { tokens } });
    } catch (err) {
      setTranslateError(err.message);
    } finally {
      setTranslating(false);
    }
  }

  return (
    <article className="pc">
      <div className="pc__cover">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="pc__img"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.style.removeProperty(
                "display",
              );
            }}
          />
        ) : null}
        {!coverUrl && <CoverPlaceholder />}
        {coverUrl && (
          <div style={{ display: "none" }}>
            <CoverPlaceholder />
          </div>
        )}
      </div>

      <div className="pc__body">
        <h3 className="pc__title">{title}</h3>
        <div className="pc__meta">
          {craft && (
            <span className={`pc__craft pc__craft--${craft.toLowerCase()}`}>
              {CRAFT_LABELS[craft] ?? craft}
            </span>
          )}
          {status && (
            <span className={`pc__status pc__status--${status.toLowerCase()}`}>
              {STATUS_LABELS[status] ?? status}
            </span>
          )}
        </div>
      </div>

      <div className="pc__actions">
        <Link to={`/patterns/${id}/confirm`} className="pc__btn pc__btn--edit">
          <svg
            width="13"
            height="13"
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
          Edit
        </Link>

        <button
          className="pc__btn pc__btn--translate"
          onClick={handleTranslate}
          disabled={!canTranslate || translating}
          title={!canTranslate ? "Confirm the pattern first" : undefined}
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
                width="13"
                height="13"
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
              View translated
            </>
          )}
        </button>
      </div>

      {translateError && (
        <p className="pc__error" role="alert">
          {translateError}
        </p>
      )}
    </article>
  );
}

export default PatternCard;
