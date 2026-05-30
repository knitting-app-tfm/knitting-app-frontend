import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import PatternDetailPage from "../../../src/pages/pattern/PatternDetailPage";
import * as patternService from "../../../src/services/patternService";

vi.mock("../../../src/services/patternService");

const PATTERN = {
  id: "42",
  title: "Test Pattern",
  craft: "KNITTING",
  sizes: [],
  yarns: [],
  cover_image_path: null,
  gauge_stitches: null,
  gauge_rows: null,
  gauge_size: null,
  gauge_unit: null,
  needle_size: null,
};

const PATTERN_WITH_GAUGE = {
  ...PATTERN,
  gauge_stitches: 22,
  gauge_rows: 30,
  gauge_size: 10,
  gauge_unit: "CM",
  needle_size: "4mm",
};

const PATTERN_WITH_YARNS = {
  ...PATTERN,
  yarns: [
    {
      label: "Merino",
      yarn_weight: "DK",
      meters_per_unit: 200,
      grams_per_unit: 100,
      grams_needed: 300,
      strands: 2,
    },
  ],
};

function renderPage(id = "42") {
  const router = createMemoryRouter(
    [
      { path: "/patterns/:id", element: <PatternDetailPage /> },
      {
        path: "/patterns/:id/translation",
        element: <div>Translation Page</div>,
      },
    ],
    { initialEntries: [`/patterns/${id}`] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("PatternDetailPage — translate button", () => {
  beforeEach(() => {
    patternService.getPattern.mockResolvedValue(PATTERN);
  });

  it("renders the Translate pattern button after loading", async () => {
    renderPage();

    expect(
      await screen.findByRole("button", { name: /translate pattern/i }),
    ).toBeInTheDocument();
  });

  it("disables the button and shows a spinner while translating", async () => {
    patternService.translatePattern.mockReturnValue(new Promise(() => {}));

    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: /translate pattern/i }),
    );

    expect(screen.getByRole("button", { name: /translating/i })).toBeDisabled();
  });

  it("navigates to the translation page on success", async () => {
    patternService.translatePattern.mockResolvedValue([]);

    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: /translate pattern/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Translation Page")).toBeInTheDocument();
    });
  });

  it("passes the token list as location state on navigation", async () => {
    const tokens = [{ line: 1, tokens: ["k2tog"] }];
    patternService.translatePattern.mockResolvedValue(tokens);

    const router = renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: /translate pattern/i }),
    );

    await waitFor(() => {
      expect(router.state.location.state).toEqual({ tokens });
    });
  });

  it("shows an error alert when translation fails", async () => {
    patternService.translatePattern.mockRejectedValue(
      new Error("Pattern must be confirmed before translating"),
    );

    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: /translate pattern/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Pattern must be confirmed before translating",
    );
  });

  it("re-enables the button after a failed translation", async () => {
    patternService.translatePattern.mockRejectedValue(new Error("Error"));

    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: /translate pattern/i }),
    );

    expect(
      await screen.findByRole("button", { name: /translate pattern/i }),
    ).not.toBeDisabled();
  });

  it("clears the error when translate is clicked again", async () => {
    patternService.translatePattern
      .mockRejectedValueOnce(
        new Error("Pattern must be confirmed before translating"),
      )
      .mockReturnValueOnce(new Promise(() => {}));

    renderPage();
    const btn = await screen.findByRole("button", {
      name: /translate pattern/i,
    });

    fireEvent.click(btn);
    await screen.findByRole("alert");

    fireEvent.click(
      await screen.findByRole("button", { name: /translate pattern/i }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});

describe("PatternDetailPage — rendering", () => {
  it("shows an error alert when the pattern fails to load", async () => {
    patternService.getPattern.mockRejectedValue(new Error("Pattern not found"));

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Pattern not found",
    );
  });

  it("renders the gauge section when pattern has gauge data", async () => {
    patternService.getPattern.mockResolvedValue(PATTERN_WITH_GAUGE);

    renderPage();

    expect(await screen.findByText("Gauge")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("4mm")).toBeInTheDocument();
    // "Needle size" appears in both the diagram SVG label and the needle row span
    expect(screen.getAllByText("Needle size").length).toBeGreaterThan(0);
  });

  it("renders the gauge_size stat with formatted unit", async () => {
    patternService.getPattern.mockResolvedValue(PATTERN_WITH_GAUGE);

    renderPage();

    expect(await screen.findByText("10 cm")).toBeInTheDocument();
  });

  it("renders the yarns section when pattern has yarns", async () => {
    patternService.getPattern.mockResolvedValue(PATTERN_WITH_YARNS);

    renderPage();

    expect(await screen.findByText("Yarns")).toBeInTheDocument();
    expect(screen.getByText("Merino")).toBeInTheDocument();
    expect(screen.getByText("200 m")).toBeInTheDocument();
    expect(screen.getByText("DK")).toBeInTheDocument();
    expect(screen.getByText("×2")).toBeInTheDocument();
  });

  it("renders size badges when pattern has sizes", async () => {
    patternService.getPattern.mockResolvedValue({
      ...PATTERN,
      sizes: ["S", "M", "L"],
    });

    renderPage();

    expect(await screen.findByText("S")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("L")).toBeInTheDocument();
  });

  it("renders the hero image when cover_image_path is a full http URL", async () => {
    patternService.getPattern.mockResolvedValue({
      ...PATTERN,
      cover_image_path: "https://example.com/cover.jpg",
    });

    renderPage();

    expect(
      await screen.findByRole("img", { name: "Test Pattern" }),
    ).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("constructs the correct image URL for a /media/ path", async () => {
    patternService.getPattern.mockResolvedValue({
      ...PATTERN,
      cover_image_path: "/media/cover.jpg",
    });

    renderPage();

    expect(
      await screen.findByRole("img", { name: "Test Pattern" }),
    ).toHaveAttribute("src", "http://localhost:8000/media/cover.jpg");
  });

  it("shows Crochet badge and Hook size label for CROCHET patterns with needle size", async () => {
    patternService.getPattern.mockResolvedValue({
      ...PATTERN,
      craft: "CROCHET",
      needle_size: "5mm",
    });

    renderPage();

    expect(await screen.findByText(/crochet/i)).toBeInTheDocument();
    expect(screen.getByText("Hook size")).toBeInTheDocument();
  });
});
