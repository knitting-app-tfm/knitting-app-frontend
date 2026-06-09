import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AbbreviationDetail from "../../../src/components/dictionary/AbbreviationDetail";

const BASE = {
  abbreviation: "k2tog",
  full_name: "Knit 2 Together",
  craft: "KNITTING",
  type: "DECREASE",
  description: "A right-leaning decrease",
  video_link: null,
};

describe("AbbreviationDetail", () => {
  it("renders nothing when abbreviation is null", () => {
    const { container } = render(
      <AbbreviationDetail abbreviation={null} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders code, full name, craft badge and type badge", () => {
    render(<AbbreviationDetail abbreviation={BASE} onClose={vi.fn()} />);

    expect(screen.getByText("k2tog")).toBeInTheDocument();
    expect(screen.getByText("Knit 2 Together")).toBeInTheDocument();
    expect(screen.getByText("KNITTING")).toBeInTheDocument();
    expect(screen.getByText("DECREASE")).toBeInTheDocument();
  });

  it("renders description when present", () => {
    render(<AbbreviationDetail abbreviation={BASE} onClose={vi.fn()} />);

    expect(screen.getByText("A right-leaning decrease")).toBeInTheDocument();
  });

  it("does not render description when absent", () => {
    render(
      <AbbreviationDetail
        abbreviation={{ ...BASE, description: null }}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.queryByText("A right-leaning decrease"),
    ).not.toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<AbbreviationDetail abbreviation={BASE} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Close detail" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders no video element when video_link is null", () => {
    render(<AbbreviationDetail abbreviation={BASE} onClose={vi.fn()} />);

    expect(screen.queryByTitle(/video for/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Watch video →" }),
    ).not.toBeInTheDocument();
  });

  it("embeds a youtu.be short URL as an iframe", () => {
    render(
      <AbbreviationDetail
        abbreviation={{ ...BASE, video_link: "https://youtu.be/abc123" }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTitle("Video for k2tog")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/abc123",
    );
  });

  it("embeds a full youtube.com watch URL as an iframe", () => {
    render(
      <AbbreviationDetail
        abbreviation={{
          ...BASE,
          video_link: "https://www.youtube.com/watch?v=xyz789",
        }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTitle("Video for k2tog")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/xyz789",
    );
  });

  it("passes through an already-embedded URL unchanged", () => {
    render(
      <AbbreviationDetail
        abbreviation={{
          ...BASE,
          video_link: "https://www.youtube.com/embed/abc123",
        }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTitle("Video for k2tog")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/abc123",
    );
  });

  it("renders a fallback link for a non-embeddable video URL", () => {
    render(
      <AbbreviationDetail
        abbreviation={{ ...BASE, video_link: "https://vimeo.com/123456" }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: "Watch video →" })).toHaveAttribute(
      "href",
      "https://vimeo.com/123456",
    );
    expect(screen.queryByTitle(/video for/i)).not.toBeInTheDocument();
  });
});
