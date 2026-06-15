import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import YarnsSection from "../../../src/components/pattern/YarnsSection";

const FULL_YARN = {
  label: "Merino",
  yarn_weight: "DK",
  meters_per_unit: 200,
  grams_per_unit: 100,
  grams_needed: 300,
  strands: 2,
};

function renderSection(yarns) {
  render(<YarnsSection yarns={yarns} sectionNum={1} />);
}

describe("YarnsSection", () => {
  it("renders yarn label, weight, and all stats for a fully specified yarn", () => {
    renderSection([FULL_YARN]);
    expect(screen.getByText("Merino")).toBeInTheDocument();
    expect(screen.getByText("200 m")).toBeInTheDocument();
    expect(screen.getByText("100 g")).toBeInTheDocument();
    expect(screen.getByText("300 g")).toBeInTheDocument();
    expect(screen.getByText("×2")).toBeInTheDocument();
  });

  it("uses 'Yarn 1' as the label fallback when yarn label is null", () => {
    renderSection([{ ...FULL_YARN, label: null }]);
    expect(screen.getByText("Yarn 1")).toBeInTheDocument();
  });

  it("omits the m/skein stat when meters_per_unit is null", () => {
    renderSection([{ ...FULL_YARN, meters_per_unit: null }]);
    expect(screen.queryByText("Per skein")).not.toBeInTheDocument();
  });

  it("omits the g/skein stat when grams_per_unit is null", () => {
    renderSection([{ ...FULL_YARN, grams_per_unit: null }]);
    expect(screen.queryByText("Skein weight")).not.toBeInTheDocument();
  });

  it("omits the 'Total needed' stat when grams_needed is null", () => {
    renderSection([{ ...FULL_YARN, grams_needed: null }]);
    expect(screen.queryByText("Total needed")).not.toBeInTheDocument();
  });

  it("omits the strands stat when strands is 1", () => {
    renderSection([{ ...FULL_YARN, strands: 1 }]);
    expect(screen.queryByText(/^×/)).not.toBeInTheDocument();
  });

  it("omits the yarn weight dots when yarn_weight is not set", () => {
    const { container } = render(
      <YarnsSection
        yarns={[{ ...FULL_YARN, yarn_weight: null }]}
        sectionNum={1}
      />,
    );
    expect(container.querySelector(".pd-weight")).not.toBeInTheDocument();
  });
});
