import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WeightDots from "../../../src/components/pattern/WeightDots";

describe("WeightDots", () => {
  it("renders the weight label for a known weight", () => {
    render(<WeightDots weight="DK" />);
    expect(screen.getByText("DK")).toBeInTheDocument();
  });

  it("renders 5 dots with 3 active for DK weight", () => {
    const { container } = render(<WeightDots weight="DK" />);
    const dots = container.querySelectorAll(".pd-weight__dot");
    const activeDots = container.querySelectorAll(".pd-weight__dot--on");
    expect(dots.length).toBe(5);
    expect(activeDots.length).toBe(3);
  });

  it("renders 1 active dot for LACE (lightest weight)", () => {
    const { container } = render(<WeightDots weight="LACE" />);
    expect(container.querySelectorAll(".pd-weight__dot--on").length).toBe(1);
  });

  it("renders 5 active dots for BULKY (heaviest weight)", () => {
    const { container } = render(<WeightDots weight="BULKY" />);
    expect(container.querySelectorAll(".pd-weight__dot--on").length).toBe(5);
  });

  it("renders nothing for an unrecognised weight", () => {
    const { container } = render(<WeightDots weight="SUPER_CHUNKY" />);
    expect(container.firstChild).toBeNull();
  });
});
