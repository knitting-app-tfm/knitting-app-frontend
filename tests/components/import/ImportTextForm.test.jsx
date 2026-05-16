import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImportTextForm from "../../../src/components/import/ImportTextForm";

describe("ImportTextForm", () => {
  it("disables the submit button when the textarea is empty", () => {
    render(<ImportTextForm onSubmit={vi.fn()} loading={false} />);

    expect(screen.getByRole("button", { name: "Import" })).toBeDisabled();
  });

  it("shows an error when the form is submitted with empty text", () => {
    render(<ImportTextForm onSubmit={vi.fn()} loading={false} />);

    fireEvent.submit(screen.getByRole("button", { name: "Import" }).closest("form"));

    expect(screen.getByText("Please paste your pattern text before importing.")).toBeInTheDocument();
  });

  it("enables the button and clears any error when text is entered", () => {
    render(<ImportTextForm onSubmit={vi.fn()} loading={false} />);

    fireEvent.submit(screen.getByRole("button", { name: "Import" }).closest("form"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Cast on 20 stitches" },
    });

    expect(screen.queryByText("Please paste your pattern text before importing.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import" })).not.toBeDisabled();
  });

  it("calls onSubmit with the entered text when submitted", () => {
    const onSubmit = vi.fn();
    render(<ImportTextForm onSubmit={onSubmit} loading={false} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Cast on 20 stitches" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));

    expect(onSubmit).toHaveBeenCalledWith("Cast on 20 stitches");
  });

  it("disables the button and shows a spinner while loading", () => {
    render(<ImportTextForm onSubmit={vi.fn()} loading={true} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Cast on 20 stitches" },
    });

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("Processing…")).toBeInTheDocument();
  });
});
