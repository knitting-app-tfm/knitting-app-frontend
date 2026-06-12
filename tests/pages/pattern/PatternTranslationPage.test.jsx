import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import PatternTranslationPage from "../../../src/pages/pattern/PatternTranslationPage";
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
        quantity: null,
      },
    ],
  },
  { line: 2, tokens: [] },
  {
    line: 3,
    tokens: [
      {
        type: "abbreviation",
        code: "CO",
        translated: false,
        full_name: null,
        quantity: null,
      },
      { type: "number", value: 3.5, unit: "mm", scalable: false },
    ],
  },
];

async function renderPage(id = "42", state = undefined) {
  const router = createMemoryRouter(
    [
      {
        path: "/patterns/:id/translation",
        element: <PatternTranslationPage />,
      },
    ],
    { initialEntries: [{ pathname: `/patterns/${id}/translation`, state }] },
  );
  await act(async () => {
    render(<RouterProvider router={router} />);
  });
}

beforeEach(() => {
  patternService.getPattern.mockResolvedValue({
    id: "42",
    title: "Test Pattern",
    status: "TOKENIZED",
    sizes: [],
  });
  patternService.getScaling.mockResolvedValue(null);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("PatternTranslationPage", () => {
  it("renders a breadcrumb link back to the pattern detail page", async () => {
    await renderPage("42", { tokens: [] });

    expect(screen.getByRole("link", { name: "Pattern" })).toHaveAttribute(
      "href",
      "/patterns/42",
    );
  });

  it("renders plain text tokens", async () => {
    await renderPage("42", { tokens: LINES });

    expect(screen.getByText("Cast on")).toBeInTheDocument();
  });

  it("renders size_group tokens as first value followed by parenthesised values", async () => {
    await renderPage("42", { tokens: LINES });

    expect(screen.getByText("147 (159) (174)")).toBeInTheDocument();
  });

  it("renders a translated abbreviation using its full name with the translated class", async () => {
    await renderPage("42", { tokens: LINES });

    const el = screen.getByText("stitches");
    expect(el).toHaveClass("tr-abbr--translated");
  });

  it("renders an untranslated abbreviation using its code with the untranslated class", async () => {
    await renderPage("42", { tokens: LINES });

    const el = screen.getByText("CO");
    expect(el).toHaveClass("tr-abbr--untranslated");
  });

  it("renders number tokens with their unit", async () => {
    await renderPage("42", { tokens: LINES });

    expect(screen.getByText("3.5 mm")).toBeInTheDocument();
  });

  it("renders an empty div for blank lines", async () => {
    await renderPage("42", { tokens: LINES });

    const blankLines = document.querySelectorAll(".pt-line--blank");
    expect(blankLines.length).toBe(1);
  });

  it("renders an empty pattern area when no state is provided", async () => {
    await renderPage("42");

    expect(document.querySelector(".pt-pattern")).toBeInTheDocument();
    expect(document.querySelectorAll(".pt-line").length).toBe(0);
  });

  it("opens the detail panel with a spinner when a translated abbreviation is clicked", async () => {
    abbreviationService.getAbbreviationByCode.mockReturnValue(
      new Promise(() => {}),
    );

    await renderPage("42", { tokens: LINES });
    fireEvent.click(screen.getByText("stitches"));

    expect(document.querySelector(".pt-detail-col--open")).toBeInTheDocument();
    expect(document.querySelector(".pt-detail-loading")).toBeInTheDocument();
  });

  it("shows the abbreviation detail in the panel after a successful load", async () => {
    abbreviationService.getAbbreviationByCode.mockResolvedValue({
      id: "1",
      abbreviation: "sts",
      full_name: "stitches",
      craft: "KNITTING",
      type: "STITCH",
      description: "A basic knitting stitch",
      video_link: null,
    });

    await renderPage("42", { tokens: LINES });
    fireEvent.click(screen.getByText("stitches"));

    await waitFor(() => {
      expect(screen.getByText("A basic knitting stitch")).toBeInTheDocument();
    });
  });

  it("shows an error alert in the panel when loading the abbreviation detail fails", async () => {
    abbreviationService.getAbbreviationByCode.mockRejectedValue(
      new Error("Abbreviation not found"),
    );

    await renderPage("42", { tokens: LINES });
    fireEvent.click(screen.getByText("stitches"));

    expect(
      await screen.findByText("Abbreviation not found"),
    ).toBeInTheDocument();
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

    await renderPage("42", { tokens: LINES });
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

    await renderPage("42", { tokens: LINES });
    fireEvent.click(screen.getByText("stitches"));
    await screen.findByText("A basic knitting stitch");

    fireEvent.mouseDown(screen.getByText("Cast on"));

    expect(
      screen.queryByText("A basic knitting stitch"),
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

    const lines = [
      {
        line: 1,
        tokens: [
          {
            type: "abbreviation",
            code: "K23",
            translated: true,
            full_name: "knit",
            quantity: 23,
          },
        ],
      },
    ];

    await renderPage("42", { tokens: lines });
    fireEvent.click(screen.getByText("knit"));

    await waitFor(() => {
      expect(abbreviationService.getAbbreviationByCode).toHaveBeenCalledWith(
        "K",
      );
    });
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

    await renderPage("42", { tokens: LINES });
    fireEvent.click(screen.getByText("stitches"));

    await waitFor(() => {
      expect(abbreviationService.getAbbreviationByCode).toHaveBeenCalledWith(
        "sts",
      );
    });
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

    await renderPage("42", { tokens: LINES });
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

    await renderPage("42", { tokens: LINES });
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

  it("shows the Adapt pattern button when pattern status is TOKENIZED", async () => {
    await renderPage("42", { tokens: [] });

    expect(
      screen.getByRole("button", { name: /Adapt pattern/i }),
    ).toBeInTheDocument();
  });

  it("disables the Adapt pattern button when pattern status is not TOKENIZED", async () => {
    patternService.getPattern.mockResolvedValue({
      id: "42",
      title: "Test Pattern",
      status: "CONFIRMED",
      sizes: [],
    });

    await renderPage("42", { tokens: [] });

    expect(
      screen.getByRole("button", { name: /Adapt pattern/i }),
    ).toBeDisabled();
  });

  it("opens the adapt modal when Adapt pattern is clicked", async () => {
    await renderPage("42", { tokens: [] });

    fireEvent.click(screen.getByRole("button", { name: /Adapt pattern/i }));

    expect(screen.getByTestId("adapt-modal")).toBeInTheDocument();
  });

  it("closes the adapt modal when onClose is triggered", async () => {
    await renderPage("42", { tokens: [] });

    fireEvent.click(screen.getByRole("button", { name: /Adapt pattern/i }));
    fireEvent.click(screen.getByRole("button", { name: "Close modal" }));

    expect(screen.queryByTestId("adapt-modal")).not.toBeInTheDocument();
  });

  it("closes the modal and navigates to scaled page when onConfirm is triggered", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/patterns/:id/translation",
          element: <PatternTranslationPage />,
        },
        { path: "/patterns/:id/scaled", element: <div>Scaled page</div> },
      ],
      {
        initialEntries: [
          { pathname: "/patterns/42/translation", state: { tokens: [] } },
        ],
      },
    );
    await act(async () => {
      render(<RouterProvider router={router} />);
    });

    fireEvent.click(screen.getByRole("button", { name: /Adapt pattern/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Confirm modal" }));
    });

    expect(await screen.findByText("Scaled page")).toBeInTheDocument();
  });

  it("discards a failed fetch result when the request was cancelled", async () => {
    let rejectAbbr;
    abbreviationService.getAbbreviationByCode.mockReturnValue(
      new Promise((_, rej) => {
        rejectAbbr = rej;
      }),
    );

    await renderPage("42", { tokens: LINES });
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
});
