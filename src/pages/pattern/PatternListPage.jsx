import { useState, useEffect } from "react";
import { getPatterns } from "../../services/patternService";
import { useAuth } from "../../context/AuthContext.jsx";
import PatternCard from "../../components/pattern/PatternCard";
import "./PatternListPage.css";

function PatternListPage() {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user === undefined) return; // Firebase still initializing
    getPatterns()
      .then(setPatterns)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="pl-page">
      <h1 className="pl-page__title">My patterns</h1>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div
            className="spinner-border"
            role="status"
            style={{ color: "var(--kn-primary)" }}
          >
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && patterns.length === 0 && (
        <div className="pl-empty">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3.6 8.4Q7 4.8 12 12Q17 19.2 20.4 15.6" />
            <path d="M5.5 16Q9 11 15 13" />
            <path d="M10 3.6Q12 9 10 12" />
          </svg>
          <p className="pl-empty__title">No patterns yet</p>
          <p className="pl-empty__sub">
            Import your first pattern to get started.
          </p>
        </div>
      )}

      {!loading && !error && patterns.length > 0 && (
        <div className="pl-grid">
          {patterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PatternListPage;
