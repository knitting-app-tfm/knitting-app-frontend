function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const fullMatch = url.match(/[?&]v=([^&]+)/);
  if (fullMatch) return `https://www.youtube.com/embed/${fullMatch[1]}`;
  if (url.includes("/embed/")) return url;
  return null;
}

function AbbreviationDetail({ abbreviation, onClose }) {
  if (!abbreviation) return null;

  const embedUrl = getYouTubeEmbedUrl(abbreviation.video_link);

  return (
    <div className="dict-detail">
      <button
        className="dict-detail__close"
        onClick={onClose}
        aria-label="Close detail"
      >
        ×
      </button>
      <code className="dict-detail__abbr">{abbreviation.abbreviation}</code>
      <h3 className="dict-detail__name">{abbreviation.full_name}</h3>
      <div className="dict-detail__meta">
        <span className="dict-detail__badge">{abbreviation.craft}</span>
        <span className="dict-detail__badge dict-detail__badge--type">
          {abbreviation.type}
        </span>
      </div>
      {abbreviation.description && (
        <p className="dict-detail__desc">{abbreviation.description}</p>
      )}
      {embedUrl ? (
        <div className="dict-detail__video">
          <iframe
            src={embedUrl}
            title={`Video for ${abbreviation.abbreviation}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : abbreviation.video_link ? (
        <a
          href={abbreviation.video_link}
          target="_blank"
          rel="noopener noreferrer"
          className="dict-detail__video-link"
        >
          Watch video →
        </a>
      ) : null}
    </div>
  );
}

export default AbbreviationDetail;
