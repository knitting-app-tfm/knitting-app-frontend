import { vi, describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import YarnsSection from "../../../src/components/confirm/YarnsSection";

const BASE_YARN = {
  label: "Merino",
  yarn_weight: "DK",
  meters_per_unit: 200,
  grams_per_unit: 100,
  grams_needed: [300],
  strands: 1,
};

function renderSection(yarns, sizes, handlers = {}) {
  render(
    <YarnsSection
      yarns={yarns}
      sizes={sizes}
      onAddYarn={handlers.onAddYarn ?? vi.fn()}
      onRemoveYarn={handlers.onRemoveYarn ?? vi.fn()}
      onYarnChange={handlers.onYarnChange ?? vi.fn()}
      onYarnGramsNeededChange={handlers.onYarnGramsNeededChange ?? vi.fn()}
    />,
  );
}

describe("YarnsSection (confirm)", () => {
  it("shows 'No yarns added yet' when yarns array is empty", () => {
    renderSection([], []);
    expect(screen.getByText("No yarns added yet")).toBeInTheDocument();
  });

  it("renders size-labelled grams inputs when sizes are provided", () => {
    renderSection([BASE_YARN], ["S", "M"]);
    expect(
      screen.getByRole("spinbutton", { name: "Grams needed — S" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: "Grams needed — M" }),
    ).toBeInTheDocument();
  });

  it("renders a single unlabelled grams input when sizes is empty", () => {
    renderSection([BASE_YARN], []);
    expect(
      screen.getByRole("spinbutton", { name: "Grams needed" }),
    ).toBeInTheDocument();
  });

  it("calls onYarnGramsNeededChange(yarnIndex, 0, value) when sizes is empty and input changes", () => {
    const onYarnGramsNeededChange = vi.fn();
    renderSection([BASE_YARN], [], { onYarnGramsNeededChange });

    fireEvent.change(screen.getByRole("spinbutton", { name: "Grams needed" }), {
      target: { value: "450" },
    });

    expect(onYarnGramsNeededChange).toHaveBeenCalledWith(0, 0, "450");
  });

  it("calls onYarnGramsNeededChange with the correct size index when sizes are provided", () => {
    const onYarnGramsNeededChange = vi.fn();
    renderSection([{ ...BASE_YARN, grams_needed: [300, 400] }], ["S", "M"], {
      onYarnGramsNeededChange,
    });

    fireEvent.change(
      screen.getByRole("spinbutton", { name: "Grams needed — M" }),
      { target: { value: "500" } },
    );

    expect(onYarnGramsNeededChange).toHaveBeenCalledWith(0, 1, "500");
  });

  it("calls onRemoveYarn with the yarn index when Remove is clicked", () => {
    const onRemoveYarn = vi.fn();
    renderSection([BASE_YARN], ["S"], { onRemoveYarn });

    fireEvent.click(screen.getByRole("button", { name: "Remove yarn 1" }));

    expect(onRemoveYarn).toHaveBeenCalledWith(0);
  });

  it("calls onAddYarn when Add yarn is clicked", () => {
    const onAddYarn = vi.fn();
    renderSection([], [], { onAddYarn });

    fireEvent.click(screen.getByRole("button", { name: "Add yarn" }));

    expect(onAddYarn).toHaveBeenCalledOnce();
  });

  it("renders an empty grams input when grams_needed[0] is null and sizes is empty", () => {
    renderSection([{ ...BASE_YARN, grams_needed: [null] }], []);
    expect(
      screen.getByRole("spinbutton", { name: "Grams needed" }),
    ).toHaveValue(null);
  });
});
