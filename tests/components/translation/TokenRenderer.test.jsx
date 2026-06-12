import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TokenRenderer from "../../../src/components/translation/TokenRenderer";

describe("TokenRenderer", () => {
  it("renders a text token as a plain span", () => {
    render(<TokenRenderer token={{ type: "text", value: "Cast on" }} />);
    expect(screen.getByText("Cast on")).toBeInTheDocument();
  });

  it("renders a number token with its unit", () => {
    render(
      <TokenRenderer token={{ type: "number", value: 3.5, unit: "mm" }} />,
    );
    expect(screen.getByText("3.5 mm")).toBeInTheDocument();
  });

  it("renders a number token without a unit as a plain string", () => {
    render(<TokenRenderer token={{ type: "number", value: 42, unit: null }} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders a size_group token as first value followed by parenthesised values", () => {
    render(
      <TokenRenderer
        token={{ type: "size_group", values: [147, 159, 174], scalable: true }}
      />,
    );
    expect(screen.getByText("147 (159) (174)")).toBeInTheDocument();
  });

  it("applies the tr-size-group highlight class to a size_group token", () => {
    render(
      <TokenRenderer
        token={{
          type: "size_group",
          values: [25, 25, 27, 27, 29, 31],
          unit: "stitches",
          scalable: true,
        }}
      />,
    );
    expect(
      screen.getByText("25 (25) (27) (27) (29) (31) stitches"),
    ).toHaveClass("tr-size-group");
  });

  it("renders a single-value size_group without parentheses", () => {
    render(
      <TokenRenderer
        token={{ type: "size_group", values: [80], scalable: false }}
      />,
    );
    expect(screen.getByText("80")).toBeInTheDocument();
  });

  it("renders a translated abbreviation with its full name and the translated class", () => {
    render(
      <TokenRenderer
        token={{
          type: "abbreviation",
          code: "sts",
          translated: true,
          full_name: "stitches",
        }}
      />,
    );
    const el = screen.getByText("stitches");
    expect(el).toHaveClass("tr-abbr--translated");
  });

  it("calls onAbbreviationClick with the full token when a translated abbreviation is clicked", () => {
    const onAbbreviationClick = vi.fn();
    const token = {
      type: "abbreviation",
      code: "sts",
      translated: true,
      full_name: "stitches",
      quantity: null,
    };
    render(
      <TokenRenderer token={token} onAbbreviationClick={onAbbreviationClick} />,
    );
    fireEvent.click(screen.getByText("stitches"));
    expect(onAbbreviationClick).toHaveBeenCalledWith(token);
  });

  it("renders an untranslated abbreviation with its code and the untranslated class", () => {
    render(
      <TokenRenderer
        token={{
          type: "abbreviation",
          code: "CO",
          translated: false,
          full_name: null,
        }}
      />,
    );
    const el = screen.getByText("CO");
    expect(el).toHaveClass("tr-abbr--untranslated");
  });

  it("renders nothing for an unknown token type", () => {
    const { container } = render(
      <TokenRenderer token={{ type: "unknown_type" }} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("applies bold style when bold prop is true", () => {
    render(
      <TokenRenderer token={{ type: "text", value: "Row 1" }} bold={true} />,
    );
    expect(screen.getByText("Row 1")).toHaveStyle({ fontWeight: "bold" });
  });

  it("applies italic style when italic prop is true", () => {
    render(
      <TokenRenderer token={{ type: "text", value: "Note" }} italic={true} />,
    );
    expect(screen.getByText("Note")).toHaveStyle({ fontStyle: "italic" });
  });

  it("maps fontSize proportionally relative to a 10pt baseline", () => {
    render(
      <TokenRenderer
        token={{ type: "text", value: "Heading" }}
        fontSize={15}
      />,
    );
    expect(screen.getByText("Heading")).toHaveStyle({ fontSize: "1.50em" });
  });

  it("clamps fontSize to 0.75em at the lower bound", () => {
    render(
      <TokenRenderer token={{ type: "text", value: "Tiny" }} fontSize={3} />,
    );
    expect(screen.getByText("Tiny")).toHaveStyle({ fontSize: "0.75em" });
  });

  it("clamps fontSize to 2.50em at the upper bound", () => {
    render(
      <TokenRenderer token={{ type: "text", value: "Giant" }} fontSize={50} />,
    );
    expect(screen.getByText("Giant")).toHaveStyle({ fontSize: "2.50em" });
  });

  it("does not apply fontSize style when fontSize prop is absent", () => {
    render(<TokenRenderer token={{ type: "text", value: "Normal" }} />);
    const el = screen.getByText("Normal");
    expect(el.style.fontSize).toBe("");
  });

  it("applies formatting to number tokens", () => {
    render(
      <TokenRenderer
        token={{ type: "number", value: 4, unit: "mm" }}
        bold={true}
        fontSize={12}
      />,
    );
    expect(screen.getByText("4 mm")).toHaveStyle({
      fontWeight: "bold",
      fontSize: "1.20em",
    });
  });
});
