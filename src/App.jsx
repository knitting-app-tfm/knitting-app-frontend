import { Link } from "react-router-dom";
import "./App.css";

const App = () => {
  return (
    <div className="home">
      <div className="home-layout">
        {/* Left — hero */}
        <section className="home-hero">
          <h1 className="home-hero__title">
            Your knitting<br />patterns,<br />
            <span className="home-hero__accent">in one place.</span>
          </h1>
          <p className="home-hero__sub">
            Import from PDF or plain text, review and edit the metadata,
            and look up any abbreviation in the dictionary.
          </p>
          <Link to="/import" className="home-hero__cta">
            Start importing
          </Link>
        </section>

        {/* Right — action tiles */}
        <aside className="home-tiles">
          <Link to="/import/pdf" className="home-tile">
            <div className="home-tile__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div className="home-tile__body">
              <span className="home-tile__label">Upload PDF</span>
              <span className="home-tile__desc">Drop a PDF and we'll extract gauge, yarn and sizes automatically.</span>
            </div>
            <span className="home-tile__arrow">→</span>
          </Link>

          <Link to="/import/text" className="home-tile">
            <div className="home-tile__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="17" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="17" y1="18" x2="3" y2="18" />
              </svg>
            </div>
            <div className="home-tile__body">
              <span className="home-tile__label">Paste text</span>
              <span className="home-tile__desc">Copy-paste any plain-text pattern and we'll parse the structure.</span>
            </div>
            <span className="home-tile__arrow">→</span>
          </Link>

          <Link to="/dictionary" className="home-tile">
            <div className="home-tile__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="home-tile__body">
              <span className="home-tile__label">Dictionary</span>
              <span className="home-tile__desc">Look up knitting and crochet abbreviations with video guides.</span>
            </div>
            <span className="home-tile__arrow">→</span>
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default App;
