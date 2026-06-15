function PdSection({ num, title, desc, children }) {
  return (
    <div className="pd-section">
      <div className="pd-section__head">
        <span className="pd-section__num">{String(num).padStart(2, "0")}</span>
        <div>
          <p className="pd-section__title">{title}</p>
          {desc && <p className="pd-section__desc">{desc}</p>}
        </div>
      </div>
      <div className="pd-section__body">{children}</div>
    </div>
  );
}

export default PdSection;
