import { Link } from "react-router-dom";

function ImportPage() {
  return (
    <div>
      <h2 className="mb-4">Start importing your patterns</h2>
      <div className="container text-center">
        <div className="row g-3 justify-content-center">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-img-top pt-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Upload PDF</h5>
                <p className="card-text text-muted flex-grow-1">
                  Select a PDF file from your device to automatically extract
                  pattern steps.
                </p>
                <Link
                  to="/import/pdf"
                  className="btn btn-primary stretched-link"
                >
                  Import with PDF
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 opacity-50">
              <div className="card-img-top pt-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Paste Text</h5>
                <p className="card-text text-muted flex-grow-1">
                  Paste your pattern text directly to import it into the
                  application.
                </p>
                <button className="btn btn-primary" disabled>
                  Import with plain text
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 opacity-50">
              <div
                className="card-img-top pt-4"
                style={{ fontSize: "3rem", lineHeight: 1 }}
              >
                R
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Import from Ravelry</h5>
                <p className="card-text text-muted flex-grow-1">
                  Connect your account to sync and import patterns from your
                  Ravelry library.
                </p>
                <button className="btn btn-primary" disabled>
                  Import from Ravelry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportPage;
