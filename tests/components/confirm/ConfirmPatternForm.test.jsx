import { vi, describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmPatternForm from "../../../src/components/confirm/ConfirmPatternForm";

const INITIAL_DATA = {
  title: "My Pattern",
  craft: "KNITTING",
  sizes: ["XS", "S"],
  gauge_stitches: 22,
  gauge_rows: 30,
  gauge_size: 10,
  gauge_unit: "CM",
  needle_size: "4mm",
  yarns: [{ label: "Main yarn", yarn_weight: "DK", strands: 1 }],
};

const INITIAL_DATA_RICH_YARN = {
  ...INITIAL_DATA,
  yarns: [
    {
      label: "Main yarn",
      yarn_weight: "DK",
      meters_per_unit: 200,
      grams_per_unit: 100,
      grams_needed: [300, 400],
      strands: 3,
    },
  ],
};

function getConfirmButton() {
  return screen.getByRole("button", { name: "Confirm" });
}

function submitForm(onSubmit) {
  render(
    <ConfirmPatternForm
      initialData={INITIAL_DATA}
      onSubmit={onSubmit}
      loading={false}
      error={null}
    />,
  );
  fireEvent.click(getConfirmButton());
  return onSubmit.mock.calls[0][0];
}

describe("ConfirmPatternForm", () => {
  it("shows an error and does not call onSubmit when title is empty", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={{ ...INITIAL_DATA, title: "" }}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("can add and remove sizes", () => {
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    // Initial sizes from initialData are rendered
    expect(screen.getByLabelText("Remove size XS")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove size S")).toBeInTheDocument();

    // Add a new size
    fireEvent.change(screen.getByLabelText("New size"), {
      target: { value: "M" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add size" }));
    expect(screen.getByLabelText("Remove size M")).toBeInTheDocument();

    // Remove the XS size
    fireEvent.click(screen.getByLabelText("Remove size XS"));
    expect(screen.queryByLabelText("Remove size XS")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Remove size S")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove size M")).toBeInTheDocument();
  });

  it("can add and remove yarns", () => {
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    // One yarn pre-filled from initialData
    expect(screen.getByText("Yarn 1")).toBeInTheDocument();

    // Add a second yarn
    fireEvent.click(screen.getByRole("button", { name: "Add yarn" }));
    expect(screen.getByText("Yarn 2")).toBeInTheDocument();

    // Remove the first yarn
    fireEvent.click(screen.getByLabelText("Remove yarn 1"));
    expect(screen.queryByText("Yarn 2")).not.toBeInTheDocument();
    // Now only one yarn remains (renumbered to Yarn 1)
    expect(screen.getByText("Yarn 1")).toBeInTheDocument();
  });

  it("calls onSubmit with the correct data when the form is valid", () => {
    const onSubmit = vi.fn();
    const data = submitForm(onSubmit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(data.title).toBe("My Pattern");
    expect(data.craft).toBe("KNITTING");
    expect(data.sizes).toEqual(["XS", "S"]);
    expect(data.yarns).toHaveLength(1);
    expect(data.yarns[0].label).toBe("Main yarn");
    expect(data.yarns[0].strands).toBe(1);
  });

  it("shows the error prop as a danger alert", () => {
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={vi.fn()}
        loading={false}
        error="Server error"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Server error");
  });

  it("disables the confirm button and shows a spinner while loading", () => {
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={vi.fn()}
        loading={true}
        error={null}
      />,
    );

    expect(screen.getByRole("button", { name: /confirming/i })).toBeDisabled();
    expect(screen.getByText("Confirming…")).toBeInTheDocument();
  });

  it("clears the title error when the user types in the title field", () => {
    render(
      <ConfirmPatternForm
        initialData={{ ...INITIAL_DATA, title: "" }}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    fireEvent.click(getConfirmButton());
    expect(screen.getByText("Title is required")).toBeInTheDocument();

    fireEvent.change(document.getElementById("patternTitle"), {
      target: { value: "New title" },
    });
    expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
  });

  it("can change the craft selector", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    fireEvent.change(document.getElementById("patternCraft"), {
      target: { value: "CROCHET" },
    });
    fireEvent.click(getConfirmButton());

    expect(onSubmit.mock.calls[0][0].craft).toBe("CROCHET");
  });

  it("can select a cover image and it is passed to onSubmit", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    const file = new File(["img"], "cover.jpg", { type: "image/jpeg" });
    fireEvent.change(document.getElementById("coverImage"), {
      target: { files: [file] },
    });
    fireEvent.click(getConfirmButton());

    expect(onSubmit.mock.calls[0][0].coverImage).toBe(file);
  });

  it("adds a size when the Enter key is pressed in the size input", () => {
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    const sizeInput = screen.getByLabelText("New size");
    fireEvent.change(sizeInput, { target: { value: "XXL" } });
    fireEvent.keyDown(sizeInput, { key: "Enter" });

    expect(screen.getByLabelText("Remove size XXL")).toBeInTheDocument();
  });

  it("does not add an empty size when Add size is clicked with no input", () => {
    render(
      <ConfirmPatternForm
        initialData={{ ...INITIAL_DATA, sizes: [] }}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    fireEvent.click(screen.getByLabelText("This pattern is one size"));
    fireEvent.click(screen.getByRole("button", { name: "Add size" }));

    expect(screen.getByText("No sizes added yet")).toBeInTheDocument();
  });

  it("shows empty state messages when there are no sizes or yarns", () => {
    render(
      <ConfirmPatternForm
        initialData={{ ...INITIAL_DATA, sizes: [], yarns: [] }}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByText("One size")).toBeInTheDocument();
    expect(screen.getByText("No yarns added yet")).toBeInTheDocument();
  });

  it("can edit gauge and needle size fields", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    fireEvent.change(screen.getByLabelText("Stitches"), {
      target: { value: "24" },
    });
    fireEvent.change(screen.getByLabelText("Rows"), {
      target: { value: "32" },
    });
    fireEvent.change(screen.getByLabelText("Gauge size"), {
      target: { value: "15" },
    });
    fireEvent.change(document.getElementById("gaugeUnit"), {
      target: { value: "INCH" },
    });
    fireEvent.change(screen.getByLabelText("Needle / hook size"), {
      target: { value: "5mm" },
    });
    fireEvent.click(getConfirmButton());

    const data = onSubmit.mock.calls[0][0];
    expect(data.gauge_stitches).toBe("24");
    expect(data.gauge_rows).toBe("32");
    expect(data.gauge_size).toBe("15");
    expect(data.gauge_unit).toBe("INCH");
    expect(data.needle_size).toBe("5mm");
  });

  it("can edit yarn label and weight", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("Main yarn"), {
      target: { value: "Updated yarn" },
    });
    fireEvent.change(screen.getByDisplayValue("DK"), {
      target: { value: "ARAN" },
    });
    fireEvent.click(getConfirmButton());

    const yarn = onSubmit.mock.calls[0][0].yarns[0];
    expect(yarn.label).toBe("Updated yarn");
    expect(yarn.yarn_weight).toBe("ARAN");
  });

  it("keeps the title error visible when the user types only whitespace", () => {
    render(
      <ConfirmPatternForm
        initialData={{ ...INITIAL_DATA, title: "" }}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    fireEvent.click(getConfirmButton());
    expect(screen.getByText("Title is required")).toBeInTheDocument();

    fireEvent.change(document.getElementById("patternTitle"), {
      target: { value: "   " },
    });
    expect(screen.getByText("Title is required")).toBeInTheDocument();
  });

  it("does not add a size when a non-Enter key is pressed in the size input", () => {
    render(
      <ConfirmPatternForm
        initialData={{ ...INITIAL_DATA, sizes: [] }}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    fireEvent.click(screen.getByLabelText("This pattern is one size"));

    const sizeInput = screen.getByLabelText("New size");
    fireEvent.change(sizeInput, { target: { value: "XL" } });
    fireEvent.keyDown(sizeInput, { key: "a" });

    expect(screen.queryByText("XL")).not.toBeInTheDocument();
    expect(screen.getByText("No sizes added yet")).toBeInTheDocument();
  });

  it("clears the cover image when no file is selected", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    fireEvent.change(document.getElementById("coverImage"), {
      target: { files: [] },
    });
    fireEvent.click(getConfirmButton());

    expect(onSubmit.mock.calls[0][0].coverImage).toBeNull();
  });

  it("falls back to strands=1 when an invalid value is entered", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA_RICH_YARN}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("3"), {
      target: { value: "" },
    });
    fireEvent.click(getConfirmButton());

    expect(onSubmit.mock.calls[0][0].yarns[0].strands).toBe(1);
  });

  it("can edit yarn numeric fields", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA_RICH_YARN}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("200"), {
      target: { value: "250" },
    });
    fireEvent.change(screen.getByDisplayValue("100"), {
      target: { value: "120" },
    });
    fireEvent.change(screen.getByDisplayValue("300"), {
      target: { value: "350" },
    });
    fireEvent.change(screen.getByDisplayValue("3"), {
      target: { value: "2" },
    });
    fireEvent.click(getConfirmButton());

    const yarn = onSubmit.mock.calls[0][0].yarns[0];
    expect(yarn.meters_per_unit).toBe("250");
    expect(yarn.grams_per_unit).toBe("120");
    expect(yarn.grams_needed).toEqual(["350", "400"]);
    expect(yarn.strands).toBe(2);
  });

  it("uses default values when optional fields are absent from initialData", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={{ title: "Minimal", craft: "CROCHET" }}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByText("One size")).toBeInTheDocument();
    expect(screen.getByText("No yarns added yet")).toBeInTheDocument();

    fireEvent.click(getConfirmButton());
    const data = onSubmit.mock.calls[0][0];
    expect(data.sizes).toEqual([]);
    expect(data.yarns).toEqual([]);
    expect(data.gauge_stitches).toBe("");
    expect(data.needle_size).toBe("");
  });

  it("normalizes yarns with missing fields using defaults", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={{ ...INITIAL_DATA, yarns: [{}] }}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    fireEvent.click(getConfirmButton());
    const yarn = onSubmit.mock.calls[0][0].yarns[0];
    expect(yarn.label).toBe("");
    expect(yarn.yarn_weight).toBe("");
    expect(yarn.strands).toBe(1);
  });

  it("falls back to empty title and KNITTING craft when those fields are null", () => {
    render(
      <ConfirmPatternForm
        initialData={{ title: null, craft: null, sizes: [], yarns: [] }}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    expect(document.getElementById("patternTitle").value).toBe("");
    expect(document.getElementById("patternCraft").value).toBe("KNITTING");
  });

  it("leaves unedited yarns unchanged when editing one of several", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={{
          ...INITIAL_DATA,
          yarns: [
            { label: "Yarn A", yarn_weight: "DK", strands: 1 },
            { label: "Yarn B", yarn_weight: "ARAN", strands: 2 },
          ],
        }}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("Yarn A"), {
      target: { value: "Yarn A updated" },
    });
    fireEvent.click(getConfirmButton());

    const yarns = onSubmit.mock.calls[0][0].yarns;
    expect(yarns[0].label).toBe("Yarn A updated");
    expect(yarns[1].label).toBe("Yarn B");
    expect(yarns[1].yarn_weight).toBe("ARAN");
  });

  it("shows an error when an invalid image type is uploaded", () => {
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    const file = new File(["gif"], "cover.gif", { type: "image/gif" });
    fireEvent.change(document.getElementById("coverImage"), {
      target: { files: [file] },
    });

    expect(
      screen.getByText("Only JPG, PNG and WebP images are allowed."),
    ).toBeInTheDocument();
  });

  it("triggers the file input when the cover image area is clicked", () => {
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    const input = document.getElementById("coverImage");
    const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});

    const preview = screen.getByRole("button", { name: "Upload cover image" });
    fireEvent.click(preview);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("triggers the file input when Enter is pressed on the cover image area", () => {
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    const input = document.getElementById("coverImage");
    const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});

    const preview = screen.getByRole("button", { name: "Upload cover image" });
    fireEvent.keyDown(preview, { key: "Enter" });

    expect(clickSpy).toHaveBeenCalled();
  });

  it("clears sizes when the one-size checkbox is checked on a multi-size pattern", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByLabelText("Remove size XS")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("This pattern is one size"));

    expect(screen.queryByLabelText("Remove size XS")).not.toBeInTheDocument();
    expect(screen.getByText("One size")).toBeInTheDocument();

    fireEvent.click(getConfirmButton());
    expect(onSubmit.mock.calls[0][0].sizes).toEqual([]);
  });

  it("revokes the previous object URL when a subsequent file change clears the preview", () => {
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL");

    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />,
    );

    const validFile = new File(["img"], "cover.jpg", { type: "image/jpeg" });
    fireEvent.change(document.getElementById("coverImage"), {
      target: { files: [validFile] },
    });

    fireEvent.change(document.getElementById("coverImage"), {
      target: { files: [] },
    });

    expect(revokeObjectURL).toHaveBeenCalled();
  });

  it("normalizes a scalar grams_needed into a single-element array when sizes is empty", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={{
          title: "Scalar Test",
          craft: "KNITTING",
          sizes: [],
          yarns: [
            {
              label: "Yarn A",
              yarn_weight: "DK",
              strands: 1,
              grams_needed: 300,
            },
          ],
        }}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onSubmit.mock.calls[0][0].yarns[0].grams_needed).toEqual(["300"]);
  });

  it("changes craft via the visual radio toggle", () => {
    const onSubmit = vi.fn();
    render(
      <ConfirmPatternForm
        initialData={INITIAL_DATA}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: /crochet/i }));
    fireEvent.click(getConfirmButton());

    expect(onSubmit.mock.calls[0][0].craft).toBe("CROCHET");
  });
});
