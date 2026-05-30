import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DictionaryFilters from "../../../src/components/dictionary/DictionaryFilters";

describe("DictionaryFilters", () => {
  it("renders craft filter buttons and type filter pills", () => {
    render(<DictionaryFilters craft={null} type={null} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Knitting" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crochet" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "All types" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stitch" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Decrease" }),
    ).toBeInTheDocument();
  });

  it("marks the active craft button with the active class", () => {
    render(
      <DictionaryFilters craft="KNITTING" type={null} onChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Knitting" })).toHaveClass(
      "dict-filter-btn--active",
    );
    expect(screen.getByRole("button", { name: "Crochet" })).not.toHaveClass(
      "dict-filter-btn--active",
    );
    expect(screen.getByRole("button", { name: "All" })).not.toHaveClass(
      "dict-filter-btn--active",
    );
  });

  it("marks the active type pill with the active class", () => {
    render(
      <DictionaryFilters craft={null} type="DECREASE" onChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Decrease" })).toHaveClass(
      "dict-filter-pill--active",
    );
    expect(screen.getByRole("button", { name: "All types" })).not.toHaveClass(
      "dict-filter-pill--active",
    );
  });

  it("calls onChange with the clicked craft and the current type", () => {
    const onChange = vi.fn();
    render(
      <DictionaryFilters craft={null} type="STITCH" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Knitting" }));

    expect(onChange).toHaveBeenCalledWith({
      craft: "KNITTING",
      type: "STITCH",
    });
  });

  it("calls onChange with null craft when All is clicked", () => {
    const onChange = vi.fn();
    render(
      <DictionaryFilters craft="CROCHET" type={null} onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "All" }));

    expect(onChange).toHaveBeenCalledWith({ craft: null, type: null });
  });

  it("calls onChange with the clicked type and the current craft", () => {
    const onChange = vi.fn();
    render(
      <DictionaryFilters craft="KNITTING" type={null} onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Decrease" }));

    expect(onChange).toHaveBeenCalledWith({
      craft: "KNITTING",
      type: "DECREASE",
    });
  });

  it("calls onChange with null type when All types is clicked", () => {
    const onChange = vi.fn();
    render(
      <DictionaryFilters craft={null} type="INCREASE" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "All types" }));

    expect(onChange).toHaveBeenCalledWith({ craft: null, type: null });
  });
});
