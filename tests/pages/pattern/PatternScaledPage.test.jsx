import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import PatternScaledPage from "../../../src/pages/pattern/PatternScaledPage";
import * as abbreviationService from "../../../src/services/abbreviationService";
import * as patternService from "../../../src/services/patternService";

vi.mock("../../../src/services/patternService");
vi.mock("../../../src/services/abbreviationService");
vi.mock("../../../src/components/pattern/AdaptPatternModal", () => ({
  default: ({ onClose, onConfirm }) => (
    <div data-testid="adapt-modal">
      <button onClick={onClose}>Close modal</button>
      <button onClick={onConfirm}>Confirm modal</button>
    </div>
  ),
}));

const PATTERN = {
  id: "42",
  title: "Test Pattern",
  status: "TOKENIZED",
  sizes: ["S", "M", "L"],
  gauge_stitches: 22,
  gauge_size: 10,
  gauge_unit: "CM",
};

const SCALED_DATA = {
  size_label: "M",
  rows_warning: false,
  lines: [
    {
      line: 1,
      tokens: [
        { type: "text", value: "Cast on", scaled: false },
        { type: "number", value: 22, unit: null, scaled: true },
        {
          type: "abbreviation",
          code: "sts",
          translated: true,
          full_name: "stitches",
          quantity: null,
          scaled: false,
        },
      ],
      bold: false,
      italic: false,
      font_size: null,
    },
    { line: 2, tokens: [] },
  ],
};

async function renderPage(id = "42") {
  const router = createMemoryRouter(
    [
      { path: "/patterns/:id/scaled", element: <PatternScaledPage /> },
      {
        path: "/patterns/:id/translation",
        element: <div>Translation page</div>,
      },
    ],
    { initialEntries: [`/patterns/${id}/scaled`] },
  );
  await act(async () => {
    render(<RouterProvider router={router} />);
  });
}

beforeEach(() => {
  patternService.getPattern.mockResolvedValue(PATTERN);
  patternService.getScaledPattern.mockResolvedValue(SCALED_DATA);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("PatternScaledPage", () => {
  it("renders a breadcrumb link back to the pattern detail page", async () => {
    await renderPage("42");

    expect(screen.getByRole("link", { name: "Pattern" })).toHaveAttribute(
      "href",
      "/patterns/42",
    );
  });

  it("renders the Pattern Scaled heading", async () => {
    await renderPage();

    expect(
      screen.getByRole("heading", { name: "Pattern Scaled" }),
    ).toBeInTheDocument();
  });

  it("shows a loading spinner before the scaled data resolves", () => {
    patternService.getScaledPattern.mockReturnValue(new Promise(() => {}));
    const router = createMemoryRouter(
      [{ path: "/patterns/:id/scaled", element: <PatternScaledPage /> }],
      { initialEntries: ["/patterns/42/scaled"] },
    );
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows an error alert when getScaledPattern fails", async () => {
    patternService.getScaledPattern.mockRejectedValue(
      new Error("Failed to load scaled pattern"),
    );
    await renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to load scaled pattern",
    );
  });

  it("renders text tokens", async () => {
    await renderPage();

    expect(screen.getByText("Cast on")).toBeInTheDocument();
  });

  it("renders a blank line as pt-line--blank", async () => {
    await renderPage();

    expect(document.querySelector(".pt-line--blank")).toBeInTheDocument();
  });

  it("wraps scaled tokens with tr-token--scaled class", async () => {
    await renderPage();

    expect(
      document.querySelectorAll(".tr-token--scaled").length,
    ).toBeGreaterThan(0);
  });

  it("does not wrap non-scaled tokens with tr-token--scaled class", async () => {
    await renderPage();

    const castOn = screen.getByText("Cast on");
    expect(castOn.parentElement.className).toBeFalsy();
  });

  it("shows the rows_warning banner when rows_warning is true", async () => {
    patternService.getScaledPattern.mockResolvedValue({
      ...SCALED_DATA,
      rows_warning: true,
    });
    await renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Row gauge was not provided",
    );
  });

  it("does not show the rows_warning banner when rows_warning is false", async () => {
    await renderPage();

    expect(
      screen.queryByText(/row gauge was not provided/i),
    ).not.toBeInTheDocument();
  });

  it("shows the size label when size_label is present", async () => {
    await renderPage();

    expect(screen.getByText("Viewing pattern for size M")).toBeInTheDocument();
  });

  it("does not show the size label when size_label is absent", async () => {
    patternService.getScaledPattern.mockResolvedValue({
      ...SCALED_DATA,
      size_label: null,
    });
    await renderPage();

    expect(
      screen.queryByText(/viewing pattern for size/i),
    ).not.toBeInTheDocument();
  });

  it("renders the Scaled toggle as active and disabled", async () => {
    await renderPage();

    expect(screen.getByRole("button", { name: "Scaled" })).toBeDisabled();
  });

  it("renders the Translated toggle as an enabled button", async () => {
    await renderPage();

    expect(
      screen.getByRole("button", { name: "Translated" }),
    ).not.toBeDisabled();
  });

  it("shows Loading… on the Translated toggle while translatePattern is in-flight", async () => {
    patternService.translatePattern.mockReturnValue(new Promise(() => {}));
    await renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Translated" }));

    expect(screen.getByRole("button", { name: "Loading…" })).toBeDisabled();
  });

  it("navigates to the translation page with tokens after translatePattern resolves", async () => {
    patternService.translatePattern.mockResolvedValue([
      { line: 1, tokens: [] },
    ]);
    await renderPage();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Translated" }));
    });

    expect(screen.getByText("Translation page")).toBeInTheDocument();
  });

  it("re-enables the Translated toggle when translatePattern fails", async () => {
    patternService.translatePattern.mockRejectedValue(
      new Error("Translation failed"),
    );
    await renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Translated" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Translated" }),
      ).not.toBeDisabled(),
    );
  });

  it("disables the Edit adaptation button until pattern loads", async () => {
    let resolvePattern;
    patternService.getPattern.mockReturnValue(
      new Promise((res) => {
        resolvePattern = res;
      }),
    );
    const router = createMemoryRouter(
      [{ path: "/patterns/:id/scaled", element: <PatternScaledPage /> }],
      { initialEntries: ["/patterns/42/scaled"] },
    );
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("button", { name: /edit adaptation/i }),
    ).toBeDisabled();

    await act(async () => {
      resolvePattern(PATTERN);
    });

    expect(
      screen.getByRole("button", { name: /edit adaptation/i }),
    ).not.toBeDisabled();
  });

  it("opens the adapt modal when Edit adaptation is clicked", async () => {
    await renderPage();

    fireEvent.click(screen.getByRole("button", { name: /edit adaptation/i }));

    expect(screen.getByTestId("adapt-modal")).toBeInTheDocument();
  });

  it("closes the adapt modal when onClose is triggered", async () => {
    await renderPage();
    fireEvent.click(screen.getByRole("button", { name: /edit adaptation/i }));

    fireEvent.click(screen.getByRole("button", { name: "Close modal" }));

    expect(screen.queryByTestId("adapt-modal")).not.toBeInTheDocument();
  });

  it("closes the modal and re-fetches scaled data when onConfirm is triggered", async () => {
    const updatedData = { ...SCALED_DATA, size_label: "L" };
    patternService.getScaledPattern
      .mockResolvedValueOnce(SCALED_DATA)
      .mockResolvedValueOnce(updatedData);
    await renderPage();
    fireEvent.click(screen.getByRole("button", { name: /edit adaptation/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Confirm modal" }));
    });

    expect(screen.queryByTestId("adapt-modal")).not.toBeInTheDocument();
    expect(patternService.getScaledPattern).toHaveBeenCalledTimes(2);
    await waitFor(() =>
      expect(
        screen.getByText("Viewing pattern for size L"),
      ).toBeInTheDocument(),
    );
  });

  it("shows an error alert when re-fetching after modal confirm fails", async () => {
    patternService.getScaledPattern
      .mockResolvedValueOnce(SCALED_DATA)
      .mockRejectedValueOnce(new Error("Reload failed"));
    await renderPage();
    fireEvent.click(screen.getByRole("button", { name: /edit adaptation/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Confirm modal" }));
    });

    expect(await screen.findByRole("alert")).toHaveTextContent("Reload failed");
  });

  it("opens the detail panel with a spinner when a translated abbreviation is clicked", async () => {
    abbreviationService.getAbbreviationByCode.mockReturnValue(
      new Promise(() => {}),
    );
    await renderPage();
    fireEvent.click(screen.getByText("stitches"));

    expect(document.querySelector(".pt-detail-col--open")).toBeInTheDocument();
    expect(document.querySelector(".pt-detail-loading")).toBeInTheDocument();
  });

  it("shows abbreviation detail after a successful load", async () => {
    abbreviationService.getAbbreviationByCode.mockResolvedValue({
      id: "1",
      abbreviation: "sts",
      full_name: "stitches",
      craft: "KNITTING",
      type: "STITCH",
      description: "A basic knitting stitch",
      video_link: null,
    });
    await renderPage();
    fireEvent.click(screen.getByText("stitches"));

    await waitFor(() =>
      expect(screen.getByText("A basic knitting stitch")).toBeInTheDocument(),
    );
  });

  it("shows an error alert in the panel when abbreviation load fails", async () => {
    abbreviationService.getAbbreviationByCode.mockRejectedValue(
      new Error("Not found"),
    );
    await renderPage();
    fireEvent.click(screen.getByText("stitches"));

    expect(await screen.findByText("Not found")).toBeInTheDocument();
  });

  it("closes the detail panel when the close button is clicked", async () => {
    abbreviationService.getAbbreviationByCode.mockResolvedValue({
      id: "1",
      abbreviation: "sts",
      full_name: "stitches",
      craft: "KNITTING",
      type: "STITCH",
      description: "A basic knitting stitch",
      video_link: null,
    });
    await renderPage();
    fireEvent.click(screen.getByText("stitches"));
    await screen.findByText("A basic knitting stitch");

    fireEvent.click(screen.getByRole("button", { name: "Close detail" }));

    expect(
      screen.queryByText("A basic knitting stitch"),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(".pt-detail-col--open"),
    ).not.toBeInTheDocument();
  });

  it("closes the detail panel when clicking outside it", async () => {
    abbreviationService.getAbbreviationByCode.mockResolvedValue({
      id: "1",
      abbreviation: "sts",
      full_name: "stitches",
      craft: "KNITTING",
      type: "STITCH",
      description: "A basic knitting stitch",
      video_link: null,
    });
    await renderPage();
    fireEvent.click(screen.getByText("stitches"));
    await screen.findByText("A basic knitting stitch");

    fireEvent.mouseDown(screen.getByText("Cast on"));

    expect(
      screen.queryByText("A basic knitting stitch"),
    ).not.toBeInTheDocument();
  });

  it("does not close the detail panel when clicking inside it", async () => {
    abbreviationService.getAbbreviationByCode.mockResolvedValue({
      id: "1",
      abbreviation: "sts",
      full_name: "stitches",
      craft: "KNITTING",
      type: "STITCH",
      description: "A basic knitting stitch",
      video_link: null,
    });
    await renderPage();
    fireEvent.click(screen.getByText("stitches"));
    await screen.findByText("A basic knitting stitch");

    fireEvent.mouseDown(screen.getByText("A basic knitting stitch"));

    expect(screen.getByText("A basic knitting stitch")).toBeInTheDocument();
    expect(document.querySelector(".pt-detail-col--open")).toBeInTheDocument();
  });

  it("discards a successful fetch result when the request was cancelled", async () => {
    let resolveAbbr;
    abbreviationService.getAbbreviationByCode.mockReturnValue(
      new Promise((res) => {
        resolveAbbr = res;
      }),
    );
    await renderPage();
    fireEvent.click(screen.getByText("stitches"));
    fireEvent.mouseDown(screen.getByText("Cast on"));

    await act(async () => {
      resolveAbbr({
        id: "1",
        abbreviation: "sts",
        full_name: "stitches",
        craft: "KNITTING",
        type: "STITCH",
        description: "A basic knitting stitch",
        video_link: null,
      });
    });

    expect(
      screen.queryByText("A basic knitting stitch"),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(".pt-detail-col--open"),
    ).not.toBeInTheDocument();
  });

  it("discards a failed fetch result when the request was cancelled", async () => {
    let rejectAbbr;
    abbreviationService.getAbbreviationByCode.mockReturnValue(
      new Promise((_, rej) => {
        rejectAbbr = rej;
      }),
    );
    await renderPage();
    fireEvent.click(screen.getByText("stitches"));
    fireEvent.mouseDown(screen.getByText("Cast on"));

    await act(async () => {
      rejectAbbr(new Error("Not found"));
    });

    expect(screen.queryByText("Not found")).not.toBeInTheDocument();
    expect(
      document.querySelector(".pt-detail-col--open"),
    ).not.toBeInTheDocument();
  });

  it("looks up the base code when quantity is not null (e.g. K23 → K)", async () => {
    abbreviationService.getAbbreviationByCode.mockResolvedValue({
      id: "2",
      abbreviation: "K",
      full_name: "knit",
      craft: "KNITTING",
      type: "STITCH",
      description: "Knit stitch",
      video_link: null,
    });
    patternService.getScaledPattern.mockResolvedValue({
      ...SCALED_DATA,
      lines: [
        {
          line: 1,
          tokens: [
            {
              type: "abbreviation",
              code: "K23",
              translated: true,
              full_name: "knit",
              quantity: 23,
              scaled: false,
            },
          ],
          bold: false,
          italic: false,
          font_size: null,
        },
      ],
    });
    await renderPage();
    fireEvent.click(screen.getByText("knit"));

    await waitFor(() =>
      expect(abbreviationService.getAbbreviationByCode).toHaveBeenCalledWith(
        "K",
      ),
    );
  });

  it("uses the code as-is when quantity is null", async () => {
    abbreviationService.getAbbreviationByCode.mockResolvedValue({
      id: "1",
      abbreviation: "sts",
      full_name: "stitches",
      craft: "KNITTING",
      type: "STITCH",
      description: "A basic knitting stitch",
      video_link: null,
    });
    await renderPage();
    fireEvent.click(screen.getByText("stitches"));

    await waitFor(() =>
      expect(abbreviationService.getAbbreviationByCode).toHaveBeenCalledWith(
        "sts",
      ),
    );
  });
});
