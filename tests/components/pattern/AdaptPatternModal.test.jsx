import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdaptPatternModal from "../../../src/components/pattern/AdaptPatternModal";
import * as patternService from "../../../src/services/patternService";

vi.mock("../../../src/services/patternService");

const MULTI_SIZE = { id: "42", title: "Test Pattern", sizes: ["XS", "S", "M"] };
const ONE_SIZE = { id: "42", title: "Test Pattern", sizes: [] };

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

    it("does not call getScaling for one-size patterns", () => {
      renderModal({ pattern: ONE_SIZE });

      expect(patternService.getScaling).not.toHaveBeenCalled();
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
    it("calls putScaling with size_position 0 for one-size patterns", async () => {
      const { onConfirm } = renderModal({ pattern: ONE_SIZE });

      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      await waitFor(() => {
        expect(patternService.putScaling).toHaveBeenCalledWith(
          "42",
          "One size",
          0,
        );
        expect(onConfirm).toHaveBeenCalled();
      });
    });

    it("calls putScaling with correct position for a selected size", async () => {
      const { onConfirm } = renderModal({ pattern: MULTI_SIZE });

      fireEvent.click(screen.getByRole("button", { name: "M" }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      await waitFor(() => {
        expect(patternService.putScaling).toHaveBeenCalledWith("42", "M", 2);
        expect(onConfirm).toHaveBeenCalled();
      });
    });

    it("shows Saving… spinner while putScaling is pending", async () => {
      patternService.putScaling.mockReturnValue(new Promise(() => {}));
      renderModal({ pattern: ONE_SIZE });

      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      await waitFor(() => {
        expect(screen.getByText("Saving…")).toBeInTheDocument();
      });
    });

    it("disables Next and Cancel while saving", async () => {
      patternService.putScaling.mockReturnValue(new Promise(() => {}));
      renderModal({ pattern: ONE_SIZE });

      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Saving/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
      });
    });

    it("shows an error alert when putScaling fails", async () => {
      patternService.putScaling.mockRejectedValue(new Error("Save failed"));
      renderModal({ pattern: ONE_SIZE });

      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      await waitFor(() => {
        expect(screen.getByText("Save failed")).toBeInTheDocument();
      });
    });

    it("re-enables the Next button after a failed save", async () => {
      patternService.putScaling.mockRejectedValue(new Error("Save failed"));
      renderModal({ pattern: ONE_SIZE });

      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
      });
    });
  });
});
