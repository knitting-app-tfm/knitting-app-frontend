import "./TokenRenderer.css";

const FONT_SIZE_BASELINE = 10;

function buildStyle(bold, italic, fontSize) {
  const style = {};
  if (bold) style.fontWeight = "bold";
  if (italic) style.fontStyle = "italic";
  if (fontSize != null) {
    const scale = Math.max(0.75, Math.min(2.5, fontSize / FONT_SIZE_BASELINE));
    style.fontSize = `${scale.toFixed(2)}em`;
  }
  return style;
}

function TokenRenderer({ token, onAbbreviationClick, bold, italic, fontSize }) {
  const style = buildStyle(bold, italic, fontSize);

  if (token.type === "text") {
    return <span style={style}>{token.value}</span>;
  }

  if (token.type === "number") {
    const text = token.unit
      ? `${token.value} ${token.unit}`
      : String(token.value);
    return <span style={style}>{text}</span>;
  }

  if (token.type === "size_group") {
    const text = token.values
      .map((v, i) => (i === 0 ? String(v) : `(${v})`))
      .join(" ");
    return (
      <span className="tr-size-group" style={style}>
        {text}
      </span>
    );
  }

  if (token.type === "abbreviation") {
    if (token.translated) {
      return (
        <span
          className="tr-abbr tr-abbr--translated"
          style={style}
          onClick={() => onAbbreviationClick?.(token)}
        >
          {token.full_name}
        </span>
      );
    }
    return (
      <span className="tr-abbr tr-abbr--untranslated" style={style}>
        {token.code}
      </span>
    );
  }

  return null;
}

export default TokenRenderer;
