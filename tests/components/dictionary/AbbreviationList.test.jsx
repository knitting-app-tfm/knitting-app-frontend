import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AbbreviationList from "../../../src/components/dictionary/AbbreviationList";

const abbreviations = [
  {
    id: "1",
    abbreviation: "k",
    full_name: "knit",
    description: "The basic knit stitch",
    type: "STITCH",
    craft: "KNITTING",
    video_link: null,
  },
  {
    id: "2",
    abbreviation: "p",
    full_name: "purl",
    description: "The basic purl stitch",
    type: "STITCH",
    craft: "KNITTING",
    video_link: null,
  },
];

describe("AbbreviationList", () => {
  it("renders all abbreviations", () => {
    render(
      <AbbreviationList
        abbreviations={abbreviations}
        onSelect={vi.fn()}
        selectedId={null}
      />,
    );

    expect(screen.getByText("k")).toBeInTheDocument();
    expect(screen.getByText("knit")).toBeInTheDocument();
    expect(screen.getByText("p")).toBeInTheDocument();
    expect(screen.getByText("purl")).toBeInTheDocument();
  });

  it("shows empty state when abbreviations list is empty", () => {
    render(
      <AbbreviationList
        abbreviations={[]}
        onSelect={vi.fn()}
        selectedId={null}
      />,
    );

    expect(screen.getByText("No abbreviations found.")).toBeInTheDocument();
  });

  it("calls onSelect with the clicked abbreviation", () => {
    const onSelect = vi.fn();
    render(
      <AbbreviationList
        abbreviations={abbreviations}
        onSelect={onSelect}
        selectedId={null}
      />,
    );

    fireEvent.click(screen.getByText("knit").closest("li"));

    expect(onSelect).toHaveBeenCalledWith(abbreviations[0]);
  });

  it("calls onSelect when Enter is pressed on an item", () => {
    const onSelect = vi.fn();
    render(
      <AbbreviationList
        abbreviations={abbreviations}
        onSelect={onSelect}
        selectedId={null}
      />,
    );

    const item = screen.getByText("purl").closest("li");
    fireEvent.keyDown(item, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledWith(abbreviations[1]);
  });

  it("applies active class to the selected item", () => {
    render(
      <AbbreviationList
        abbreviations={abbreviations}
        onSelect={vi.fn()}
        selectedId="1"
      />,
    );

    const activeItem = screen.getByText("knit").closest("li");
    const inactiveItem = screen.getByText("purl").closest("li");

    expect(activeItem).toHaveClass("dict-list__item--active");
    expect(inactiveItem).not.toHaveClass("dict-list__item--active");
  });

  it("renders description text when present", () => {
    render(
      <AbbreviationList
        abbreviations={abbreviations}
        onSelect={vi.fn()}
        selectedId={null}
      />,
    );

    expect(screen.getByText("The basic knit stitch")).toBeInTheDocument();
  });

  it("does not render description span when description is absent", () => {
    const noDesc = [{ ...abbreviations[0], description: null }];
    render(
      <AbbreviationList
        abbreviations={noDesc}
        onSelect={vi.fn()}
        selectedId={null}
      />,
    );

    expect(screen.queryByText("The basic knit stitch")).not.toBeInTheDocument();
  });
});
