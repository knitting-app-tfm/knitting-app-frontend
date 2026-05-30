import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import PatternTranslationPage from "../../../src/pages/pattern/PatternTranslationPage";
import * as patternService from "../../../src/services/patternService";

vi.mock("../../../src/services/patternService");

const LINES = [
  {
    line: 1,
    tokens: [
      { type: "text", value: "Cast on" },
      {
        type: "size_group",
        values: [147, 159, 174],
        unit: "stitches",
        scalable: true,
      },
      {
        type: "abbreviation",
        code: "sts",
        translated: true,
        full_name: "stitches",
      },
    ],
  },
  { line: 2, tokens: [] },
  {
    line: 3,
    tokens: [
      { type: "abbreviation", code: "CO", translated: false, full_name: null },
      { type: "number", value: 3.5, unit: "mm", scalable: false },
    ],
  },
];

function renderPage(id = "42", state = undefined) {
  const router = createMemoryRouter(
    [
      {
        path: "/patterns/:id/translation",
        element: <PatternTranslationPage />,
      },
    ],
    { initialEntries: [{ pathname: `/patterns/${id}/translation`, state }] },
  );
  render(<RouterProvider router={router} />);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("PatternTranslationPage", () => {
  it("renders a breadcrumb link back to the pattern detail page", () => {
    renderPage("42", { tokens: [] });

    expect(screen.getByRole("link", { name: "Pattern" })).toHaveAttribute(
      "href",
      "/patterns/42",
    );
  });

  it("renders the View original pattern button", () => {
    renderPage("42", { tokens: [] });

    expect(
      screen.getByRole("button", { name: "View original pattern" }),
    ).toBeInTheDocument();
  });

  it("renders plain text tokens", () => {
    renderPage("42", { tokens: LINES });

    expect(screen.getByText("Cast on")).toBeInTheDocument();
  });

  it("renders size_group tokens as first value followed by parenthesised values", () => {
    renderPage("42", { tokens: LINES });

    expect(screen.getByText("147 (159) (174)")).toBeInTheDocument();
  });

  it("renders a translated abbreviation using its full name with the translated class", () => {
    renderPage("42", { tokens: LINES });

    const el = screen.getByText("stitches");
    expect(el).toHaveClass("tr-abbr--translated");
  });

  it("renders an untranslated abbreviation using its code with the untranslated class", () => {
    renderPage("42", { tokens: LINES });

    const el = screen.getByText("CO");
    expect(el).toHaveClass("tr-abbr--untranslated");
  });

  it("renders number tokens with their unit", () => {
    renderPage("42", { tokens: LINES });

    expect(screen.getByText("3.5 mm")).toBeInTheDocument();
  });

  it("renders an empty div for blank lines", () => {
    renderPage("42", { tokens: LINES });

    const blankLines = document.querySelectorAll(".pt-line--blank");
    expect(blankLines.length).toBe(1);
  });

  it("renders an empty pattern area when no state is provided", () => {
    renderPage("42");

    expect(document.querySelector(".pt-pattern")).toBeInTheDocument();
    expect(document.querySelectorAll(".pt-line").length).toBe(0);
  });

  it("loads and shows original text when View original button is clicked", async () => {
    patternService.getPatternOriginalText.mockResolvedValue(
      "CO 147 stitches\nK2, P2",
    );

    renderPage("42", { tokens: [] });
    fireEvent.click(
      screen.getByRole("button", { name: "View original pattern" }),
    );

    await waitFor(() => {
      const pre = document.querySelector(".pt-original-text");
      expect(pre?.textContent).toContain("CO 147 stitches");
    });
  });

  it("shows a spinner and disables the button while loading original text", async () => {
    patternService.getPatternOriginalText.mockReturnValue(
      new Promise(() => {}),
    );

    renderPage("42", { tokens: [] });
    fireEvent.click(
      screen.getByRole("button", { name: "View original pattern" }),
    );

    expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
  });

  it("changes button label to Hide original after loading", async () => {
    patternService.getPatternOriginalText.mockResolvedValue("raw text");

    renderPage("42", { tokens: [] });
    fireEvent.click(
      screen.getByRole("button", { name: "View original pattern" }),
    );

    expect(
      await screen.findByRole("button", { name: "Hide original" }),
    ).toBeInTheDocument();
  });

  it("hides the original text when Hide original is clicked", async () => {
    patternService.getPatternOriginalText.mockResolvedValue("raw text");

    renderPage("42", { tokens: [] });
    fireEvent.click(
      screen.getByRole("button", { name: "View original pattern" }),
    );
    await screen.findByRole("button", { name: "Hide original" });

    fireEvent.click(screen.getByRole("button", { name: "Hide original" }));

    expect(screen.queryByText("raw text")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "View original pattern" }),
    ).toBeInTheDocument();
  });

  it("shows an error alert when loading the original text fails", async () => {
    patternService.getPatternOriginalText.mockRejectedValue(
      new Error("Could not load original pattern text"),
    );

    renderPage("42", { tokens: [] });
    fireEvent.click(
      screen.getByRole("button", { name: "View original pattern" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load original pattern text",
    );
  });

  it("re-enables the button after a failed load", async () => {
    patternService.getPatternOriginalText.mockRejectedValue(new Error("Error"));

    renderPage("42", { tokens: [] });
    fireEvent.click(
      screen.getByRole("button", { name: "View original pattern" }),
    );

    expect(
      await screen.findByRole("button", { name: "View original pattern" }),
    ).not.toBeDisabled();
  });
});
