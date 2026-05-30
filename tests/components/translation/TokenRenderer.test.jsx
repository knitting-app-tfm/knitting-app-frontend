import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
