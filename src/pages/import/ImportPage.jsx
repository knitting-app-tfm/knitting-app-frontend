import { Link } from "react-router-dom";
import "./ImportPage.css";

function ImportPage() {
  return (
    <div className="import-page">
      <h1 className="import-page__title">How do you want to import?</h1>

      <div className="import-options">
        <Link to="/import/pdf" className="import-option">
          <div className="import-option__icon">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <span className="import-option__title">PDF</span>
          <span className="import-option__desc">
            Upload a PDF file from your device
          </span>
        </Link>

        <Link to="/import/text" className="import-option">
          <div className="import-option__icon">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="17" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="17" y1="18" x2="3" y2="18" />
            </svg>
          </div>
          <span className="import-option__title">Plain text</span>
          <span className="import-option__desc">
            Paste the pattern text directly
          </span>
        </Link>

        <div className="import-option import-option--disabled">
          <div className="import-option__icon">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <span className="import-option__title">Ravelry</span>
          <span className="import-option__desc">Coming soon</span>
        </div>
      </div>
    </div>
  );
}

export default ImportPage;
