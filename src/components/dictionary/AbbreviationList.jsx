function AbbreviationList({ abbreviations, onSelect, selectedId }) {
  if (abbreviations.length === 0) {
    return (
      <div className="dict-list__empty">
        <p>No abbreviations found.</p>
      </div>
    );
  }

  return (
    <ul className="dict-list" role="list">
      {abbreviations.map((abbr) => (
        <li
          key={abbr.id}
          className={`dict-list__item${abbr.id === selectedId ? " dict-list__item--active" : ""}`}
          onClick={() => onSelect(abbr)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onSelect(abbr)}
        >
          <code className="dict-list__abbr">{abbr.abbreviation}</code>
          <div className="dict-list__info">
            <span className="dict-list__name">{abbr.full_name}</span>
            {abbr.description && (
              <span className="dict-list__desc">{abbr.description}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default AbbreviationList;
