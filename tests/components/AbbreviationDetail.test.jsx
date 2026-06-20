import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AbbreviationDetail from "../../src/components/dictionary/AbbreviationDetail";

const baseAbbreviation = {
  abbreviation: "k",
  full_name: "Knit",
  craft: "KNITTING",
  type: "STITCH",
  description: "Basic knit stitch.",
  video_link: null,
};

function renderDetail(overrides = {}) {
  return render(
    <AbbreviationDetail
      abbreviation={{ ...baseAbbreviation, ...overrides }}
      onClose={vi.fn()}
    />,
  );
}

describe("AbbreviationDetail — video embed", () => {
  it("renders an iframe with the correct embed src for a full YouTube URL", () => {
    renderDetail({
      video_link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    const iframe = screen.getByTitle(/video for k/i);
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("renders an iframe with the correct embed src for a short youtu.be URL", () => {
    renderDetail({ video_link: "https://youtu.be/dQw4w9WgXcQ" });

    const iframe = screen.getByTitle(/video for k/i);
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("iframe has allow attributes required for inline playback", () => {
    renderDetail({
      video_link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    const iframe = screen.getByTitle(/video for k/i);
    const allow = iframe.getAttribute("allow");
    expect(allow).toContain("autoplay");
    expect(allow).toContain("picture-in-picture");
  });

  it("does not render any video element when video_link is null", () => {
    renderDetail({ video_link: null });

    expect(screen.queryByTitle(/video for/i)).not.toBeInTheDocument();
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("does not render any video element when video_link is absent", () => {
    render(
      <AbbreviationDetail
        abbreviation={{
          abbreviation: "k",
          full_name: "Knit",
          craft: "KNITTING",
          type: "STITCH",
        }}
        onClose={vi.fn()}
      />,
    );

    expect(document.querySelector("iframe")).toBeNull();
  });
});
