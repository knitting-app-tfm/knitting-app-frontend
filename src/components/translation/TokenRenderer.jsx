import "./TokenRenderer.css";

function TokenRenderer({ token, onAbbreviationClick }) {
  if (token.type === "text") {
    return <span>{token.value}</span>;
  }

  if (token.type === "number") {
    const text = token.unit
      ? `${token.value} ${token.unit}`
      : String(token.value);
    return <span>{text}</span>;
  }

  if (token.type === "size_group") {
    const text = token.values
      .map((v, i) => (i === 0 ? String(v) : `(${v})`))
      .join(" ");
    return <span>{text}</span>;
  }

  if (token.type === "abbreviation") {
    if (token.translated) {
      return (
        <span
          className="tr-abbr tr-abbr--translated"
          onClick={() => onAbbreviationClick?.(token.code)}
        >
          {token.full_name}
        </span>
      );
    }
    return <span className="tr-abbr tr-abbr--untranslated">{token.code}</span>;
  }

  return null;
}

export default TokenRenderer;
