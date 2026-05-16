import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImportPdfForm from "../../../src/components/import/ImportPdfForm";

const pdfFile = new File(["content"], "pattern.pdf", {
  type: "application/pdf",
});
const txtFile = new File(["content"], "pattern.txt", { type: "text/plain" });

function getFileInput() {
  return document.getElementById("pdfFileInput");
}

describe("ImportPdfForm", () => {
  it("disables the submit button when no file is selected", () => {
    render(<ImportPdfForm onSubmit={vi.fn()} loading={false} />);

    expect(screen.getByRole("button", { name: "Import" })).toBeDisabled();
  });

  it("shows an error alert when a non-PDF file is selected", () => {
    render(<ImportPdfForm onSubmit={vi.fn()} loading={false} />);

    fireEvent.change(getFileInput(), { target: { files: [txtFile] } });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not show an error and enables the button when a PDF is selected", () => {
    render(<ImportPdfForm onSubmit={vi.fn()} loading={false} />);

    fireEvent.change(getFileInput(), { target: { files: [pdfFile] } });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import" })).not.toBeDisabled();
  });

  it("calls onSubmit with the selected PDF file when submitted", () => {
    const onSubmit = vi.fn();
    render(<ImportPdfForm onSubmit={onSubmit} loading={false} />);

    fireEvent.change(getFileInput(), { target: { files: [pdfFile] } });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));

    expect(onSubmit).toHaveBeenCalledWith(pdfFile);
  });

  it("disables the button and shows a spinner while loading", () => {
    render(<ImportPdfForm onSubmit={vi.fn()} loading={true} />);

    fireEvent.change(getFileInput(), { target: { files: [pdfFile] } });

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("Processing…")).toBeInTheDocument();
  });
});
