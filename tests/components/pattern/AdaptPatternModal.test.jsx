import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdaptPatternModal from "../../../src/components/pattern/AdaptPatternModal";
import * as patternService from "../../../src/services/patternService";

vi.mock("../../../src/services/patternService");

const MULTI_SIZE = { id: "42", title: "Test Pattern", sizes: ["XS", "S", "M"] };
const ONE_SIZE = { id: "42", title: "Test Pattern", sizes: [] };
const GAUGED = {
  id: "42",
  sizes: [],
  gauge_stitches: 22,
  gauge_size: 10,
  gauge_unit: "CM",
};

function renderModal({ pattern = MULTI_SIZE, onClose, onConfirm } = {}) {
  const mockClose = onClose ?? vi.fn();
  const mockConfirm = onConfirm ?? vi.fn();
  render(
    <MemoryRouter>
      <AdaptPatternModal
        pattern={pattern}
        onClose={mockClose}
        onConfirm={mockConfirm}
      />
    </MemoryRouter>,
  );
  return { onClose: mockClose, onConfirm: mockConfirm };
}

beforeEach(() => {
  patternService.getScaling.mockResolvedValue(null);
  patternService.putScaling.mockResolvedValue({});
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("AdaptPatternModal", () => {
  it("renders the Adapt pattern title", () => {
    renderModal();

    expect(screen.getByText("Adapt pattern")).toBeInTheDocument();
  });

  it("renders two steps with step 1 active", () => {
    renderModal();

    expect(document.querySelectorAll(".am-step").length).toBe(2);
    expect(document.querySelector(".am-step--active")).toBeInTheDocument();
  });

  it("renders the Select size step label", () => {
    renderModal();

    expect(screen.getByText("Select size")).toBeInTheDocument();
  });

  it("treats a pattern with null sizes as one-size", () => {
    renderModal({ pattern: { id: "42", sizes: null } });

    expect(
      screen.getByRole("button", { name: "One size" }),
    ).toBeInTheDocument();
  });

  describe("one-size pattern", () => {
    it("renders a pre-selected disabled One size pill", () => {
      renderModal({ pattern: ONE_SIZE });

      const pill = screen.getByRole("button", { name: "One size" });
      expect(pill).toBeDisabled();
      expect(pill).toHaveAttribute("aria-pressed", "true");
      expect(pill).toHaveClass("am-size-pill--selected");
    });

    it("renders the disclaimer with a link to the confirm page", () => {
      renderModal({ pattern: ONE_SIZE });

      const link = screen.getByRole("link", { name: "edit the metadata" });
      expect(link).toHaveAttribute("href", "/patterns/42/confirm");
    });

    it("calls getScaling on mount to pre-fill saved gauge values", async () => {
      renderModal({ pattern: ONE_SIZE });

      await waitFor(() => {
        expect(patternService.getScaling).toHaveBeenCalledWith("42");
      });
    });

    it("Next button is enabled because One size is auto-selected", () => {
      renderModal({ pattern: ONE_SIZE });

      expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
    });
  });

  describe("multi-size pattern", () => {
    it("renders all size pills", () => {
      renderModal({ pattern: MULTI_SIZE });

      expect(screen.getByRole("button", { name: "XS" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "S" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "M" })).toBeInTheDocument();
    });

    it("Next button is disabled when no size is selected", () => {
      renderModal({ pattern: MULTI_SIZE });

      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    });

    it("selecting a size enables the Next button and marks it pressed", () => {
      renderModal({ pattern: MULTI_SIZE });

      fireEvent.click(screen.getByRole("button", { name: "S" }));

      expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "S" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("pre-selects the saved size returned by getScaling", async () => {
      patternService.getScaling.mockResolvedValue({ size_label: "S" });

      renderModal({ pattern: MULTI_SIZE });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "S" })).toHaveClass(
          "am-size-pill--selected",
        );
      });
    });

    it("calls getScaling with the pattern id on mount", async () => {
      renderModal({ pattern: MULTI_SIZE });

      await waitFor(() => {
        expect(patternService.getScaling).toHaveBeenCalledWith("42");
      });
    });
  });

  describe("closing", () => {
    it("calls onClose when the X button is clicked", () => {
      const { onClose } = renderModal();

      fireEvent.click(screen.getByRole("button", { name: "Close" }));

      expect(onClose).toHaveBeenCalled();
    });

    it("calls onClose when the Cancel button is clicked", () => {
      const { onClose } = renderModal();

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onClose).toHaveBeenCalled();
    });

    it("calls onClose when clicking on the overlay outside the modal", () => {
      const { onClose } = renderModal();

      fireEvent.mouseDown(document.querySelector(".am-overlay"));

      expect(onClose).toHaveBeenCalled();
    });

    it("does not call onClose when clicking inside the modal", () => {
      const { onClose } = renderModal();

      fireEvent.mouseDown(document.querySelector(".am-modal"));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("confirming", () => {
    // Advances to step 2 and fills the required gauge fields.
    async function advanceToStep2() {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      await screen.findByLabelText(/gauge stitches/i);
      fireEvent.change(screen.getByLabelText(/gauge stitches/i), {
        target: { value: "22" },
      });
      fireEvent.change(screen.getByLabelText(/gauge size/i), {
        target: { value: "10" },
      });
    }

    it("calls putScaling with size_position 0 for one-size patterns", async () => {
      const { onConfirm } = renderModal({ pattern: ONE_SIZE });

      await advanceToStep2();
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(patternService.putScaling).toHaveBeenCalledWith(
          "42",
          expect.objectContaining({ size_label: "One size", size_position: 0 }),
        );
        expect(onConfirm).toHaveBeenCalled();
      });
    });

    it("calls putScaling with correct position for a selected size", async () => {
      const { onConfirm } = renderModal({ pattern: MULTI_SIZE });

      fireEvent.click(screen.getByRole("button", { name: "M" }));
      await advanceToStep2();
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(patternService.putScaling).toHaveBeenCalledWith(
          "42",
          expect.objectContaining({ size_label: "M", size_position: 2 }),
        );
        expect(onConfirm).toHaveBeenCalled();
      });
    });

    it("shows Saving… spinner while putScaling is pending", async () => {
      patternService.putScaling.mockReturnValue(new Promise(() => {}));
      renderModal({ pattern: ONE_SIZE });

      await advanceToStep2();
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(screen.getByText("Saving…")).toBeInTheDocument();
      });
    });

    it("disables Confirm and Back while saving", async () => {
      patternService.putScaling.mockReturnValue(new Promise(() => {}));
      renderModal({ pattern: ONE_SIZE });

      await advanceToStep2();
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Saving/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
      });
    });

    it("shows an error alert when putScaling fails", async () => {
      patternService.putScaling.mockRejectedValue(new Error("Save failed"));
      renderModal({ pattern: ONE_SIZE });

      await advanceToStep2();
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(screen.getByText("Save failed")).toBeInTheDocument();
      });
    });

    it("re-enables the Confirm button after a failed save", async () => {
      patternService.putScaling.mockRejectedValue(new Error("Save failed"));
      renderModal({ pattern: ONE_SIZE });

      await advanceToStep2();
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Confirm" }),
        ).not.toBeDisabled();
      });
    });
  });

  describe("step 2 — pre-fill from scaling", () => {
    async function goToStep2(pattern) {
      renderModal({ pattern });
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      return screen.findByText("Gauge source");
    }

    it("keeps pattern mode when saved gauge matches the pattern", async () => {
      patternService.getScaling.mockResolvedValue({
        gauge_stitches: 22,
        gauge_rows: null,
        gauge_size: 10,
        gauge_unit: "CM",
      });
      await goToStep2(GAUGED);

      await waitFor(() => {
        expect(screen.getByLabelText(/gauge stitches/i)).toBeDisabled();
      });
    });

    it("switches to manual mode and pre-fills when saved stitches differ from pattern", async () => {
      patternService.getScaling.mockResolvedValue({
        gauge_stitches: 18,
        gauge_size: 10,
        gauge_unit: "CM",
      });
      await goToStep2(GAUGED);

      await waitFor(() => {
        expect(screen.getByLabelText(/gauge stitches/i)).toHaveValue(18);
        expect(screen.getByLabelText(/gauge stitches/i)).not.toBeDisabled();
      });
    });

    it("switches to manual mode when scaling has rows but pattern does not", async () => {
      patternService.getScaling.mockResolvedValue({
        gauge_stitches: 22,
        gauge_rows: 30,
        gauge_size: 10,
        gauge_unit: "CM",
      });
      await goToStep2(GAUGED);

      await waitFor(() => {
        expect(screen.getByLabelText(/gauge stitches/i)).not.toBeDisabled();
      });
    });
  });

  describe("step 2 — gauge source", () => {
    async function goToStep2() {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      return screen.findByText("Gauge source");
    }

    it("auto-fills and disables inputs for a pattern with gauge data", async () => {
      renderModal({ pattern: GAUGED });
      await goToStep2();

      expect(screen.getByLabelText(/gauge stitches/i)).toHaveValue(22);
      expect(screen.getByLabelText(/gauge stitches/i)).toBeDisabled();
    });

    it("shows the pattern gauge size as a reference hint", async () => {
      renderModal({ pattern: GAUGED });
      await goToStep2();

      expect(screen.getByText(/Pattern: 10 CM/)).toBeInTheDocument();
    });

    it("shows the gauge size hint without a unit when pattern has no gauge unit", async () => {
      renderModal({ pattern: { ...GAUGED, gauge_unit: null } });
      await goToStep2();

      expect(screen.getByText("Pattern: 10")).toBeInTheDocument();
    });

    it("enables inputs when switching to 'Enter my gauge'", async () => {
      renderModal({ pattern: GAUGED });
      await goToStep2();

      fireEvent.click(screen.getByRole("radio", { name: "Enter my gauge" }));

      expect(screen.getByLabelText(/gauge stitches/i)).not.toBeDisabled();
    });

    it("refills from pattern and disables inputs when switching back to 'Use pattern gauge'", async () => {
      renderModal({ pattern: GAUGED });
      await goToStep2();

      fireEvent.click(screen.getByRole("radio", { name: "Enter my gauge" }));
      fireEvent.change(screen.getByLabelText(/gauge stitches/i), {
        target: { value: "15" },
      });

      fireEvent.click(screen.getByRole("radio", { name: "Use pattern gauge" }));

      expect(screen.getByLabelText(/gauge stitches/i)).toHaveValue(22);
      expect(screen.getByLabelText(/gauge stitches/i)).toBeDisabled();
    });
  });

  describe("step 2 — gauge fields", () => {
    async function goToStep2() {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      return screen.findByLabelText(/gauge stitches/i);
    }

    it("allows filling gauge rows", async () => {
      renderModal({ pattern: ONE_SIZE });
      await goToStep2();

      fireEvent.change(screen.getByLabelText(/gauge rows/i), {
        target: { value: "28" },
      });

      expect(screen.getByLabelText(/gauge rows/i)).toHaveValue(28);
    });

    it("allows changing the unit to INCH", async () => {
      renderModal({ pattern: ONE_SIZE });
      await goToStep2();

      fireEvent.click(screen.getByRole("button", { name: "INCH" }));

      expect(screen.getByRole("button", { name: "INCH" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("allows filling needle size", async () => {
      renderModal({ pattern: ONE_SIZE });
      await goToStep2();

      fireEvent.change(screen.getByLabelText(/needle size/i), {
        target: { value: "4mm" },
      });

      expect(screen.getByLabelText(/needle size/i)).toHaveValue("4mm");
    });

    it("returns to step 1 when Back is clicked", async () => {
      renderModal({ pattern: ONE_SIZE });
      await goToStep2();

      fireEvent.click(screen.getByRole("button", { name: "Back" }));

      expect(screen.getByText("Select your size")).toBeInTheDocument();
    });
  });

  describe("step 2 — validation", () => {
    async function goToStep2() {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      return screen.findByLabelText(/gauge stitches/i);
    }

    it("shows 'Stitch gauge is required' when stitches is empty", async () => {
      renderModal({ pattern: ONE_SIZE });
      await goToStep2();
      fireEvent.change(screen.getByLabelText(/gauge size/i), {
        target: { value: "10" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(
          screen.getByText("Stitch gauge is required"),
        ).toBeInTheDocument();
      });
      expect(patternService.putScaling).not.toHaveBeenCalled();
    });

    it("shows 'Gauge size is required' when gauge size is empty", async () => {
      renderModal({ pattern: ONE_SIZE });
      await goToStep2();
      fireEvent.change(screen.getByLabelText(/gauge stitches/i), {
        target: { value: "22" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(screen.getByText("Gauge size is required")).toBeInTheDocument();
      });
      expect(patternService.putScaling).not.toHaveBeenCalled();
    });

    it("shows 'Value must be greater than zero' for zero stitches", async () => {
      renderModal({ pattern: ONE_SIZE });
      await goToStep2();
      fireEvent.change(screen.getByLabelText(/gauge stitches/i), {
        target: { value: "0" },
      });
      fireEvent.change(screen.getByLabelText(/gauge size/i), {
        target: { value: "10" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(
          screen.getByText("Value must be greater than zero"),
        ).toBeInTheDocument();
      });
    });

    it("shows 'Stitches and rows must be whole numbers' for decimal stitches", async () => {
      renderModal({ pattern: ONE_SIZE });
      await goToStep2();
      fireEvent.change(screen.getByLabelText(/gauge stitches/i), {
        target: { value: "22.5" },
      });
      fireEvent.change(screen.getByLabelText(/gauge size/i), {
        target: { value: "10" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(
          screen.getByText("Stitches and rows must be whole numbers"),
        ).toBeInTheDocument();
      });
    });

    it("shows a row error for decimal rows", async () => {
      renderModal({ pattern: ONE_SIZE });
      await goToStep2();
      fireEvent.change(screen.getByLabelText(/gauge stitches/i), {
        target: { value: "22" },
      });
      fireEvent.change(screen.getByLabelText(/gauge size/i), {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByLabelText(/gauge rows/i), {
        target: { value: "28.5" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(
          screen.getByText("Stitches and rows must be whole numbers"),
        ).toBeInTheDocument();
      });
    });

    it("clears the stitch error when the stitches field changes", async () => {
      renderModal({ pattern: ONE_SIZE });
      await goToStep2();
      fireEvent.change(screen.getByLabelText(/gauge size/i), {
        target: { value: "10" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
      await waitFor(() => {
        expect(
          screen.getByText("Stitch gauge is required"),
        ).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/gauge stitches/i), {
        target: { value: "22" },
      });

      expect(
        screen.queryByText("Stitch gauge is required"),
      ).not.toBeInTheDocument();
    });
  });
});
