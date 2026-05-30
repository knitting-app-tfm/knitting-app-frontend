import { useParams, Link, useLocation } from "react-router-dom";

function PatternTranslationPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const tokens = state?.tokens ?? [];

  return (
    <div className="pd-page">
      <nav className="kn-breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span className="kn-breadcrumb__sep">/</span>
        <Link to={`/patterns/${id}`}>Pattern</Link>
        <span className="kn-breadcrumb__sep">/</span>
        <span className="kn-breadcrumb__current">Translation</span>
      </nav>
      <div
        className="pd-header"
        style={{ display: "flex", alignItems: "center" }}
      >
        <h1 className="pd-header__title" style={{ margin: 0 }}>
          Pattern Translation
        </h1>
      </div>
      <p
        style={{ color: "var(--kn-text-muted)", fontSize: "var(--kn-text-sm)" }}
      >
        Translation view coming soon. Received {tokens.length} token
        {tokens.length !== 1 ? "s" : ""}.
      </p>
    </div>
  );
}

export default PatternTranslationPage;
