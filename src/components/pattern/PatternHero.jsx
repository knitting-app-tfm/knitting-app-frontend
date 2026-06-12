function PatternHero({ coverImageUrl, title, badgeRows }) {
  return (
    <>
      {coverImageUrl ? (
        <div className="pd-hero">
          <img
            src={coverImageUrl}
            alt={title}
            className="pd-hero__img"
            onError={(e) => {
              e.currentTarget.closest(".pd-hero").style.display = "none";
              e.currentTarget
                .closest(".pd-hero")
                .nextElementSibling?.style.removeProperty("display");
            }}
          />
          <div className="pd-hero__overlay">
            <h1 className="pd-hero__title">{title}</h1>
            {badgeRows}
          </div>
        </div>
      ) : null}

      <div
        className="pd-header"
        style={coverImageUrl ? { display: "none" } : {}}
      >
        <h1 className="pd-header__title">{title}</h1>
        {badgeRows}
      </div>
    </>
  );
}

export default PatternHero;
