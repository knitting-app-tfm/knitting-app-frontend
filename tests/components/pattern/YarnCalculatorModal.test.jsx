import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import YarnCalculatorModal from "../../../src/components/pattern/YarnCalculatorModal";
import * as patternService from "../../../src/services/patternService";

vi.mock("../../../src/services/patternService");

const PATTERN = {
  id: "42",
  yarns: [
    {
      id: "yarn-1",
      label: "Main yarn",
      yarn_weight: "DK",
      meters_per_unit: 200,
      grams_per_unit: 100,
      strands: 1,
    },
  ],
};

const PATTERN_TWO_YARNS = {
  id: "42",
  yarns: [
    {
      id: "yarn-1",
      label: "Main yarn",
      yarn_weight: "DK",
      meters_per_unit: 200,
      grams_per_unit: 100,
      strands: 1,
    },
    {
      id: "yarn-2",
      label: "CC",
      yarn_weight: "FINGERING",
      meters_per_unit: 400,
      grams_per_unit: 50,
      strands: 2,
    },
  ],
};

const PATTERN_NO_YARNS = { id: "42", yarns: [] };

const PATTERN_NULL_YARN = {
  id: "42",
  yarns: [
    {
      id: "yarn-1",
      label: null,
      yarn_weight: null,
      meters_per_unit: null,
      grams_per_unit: null,
      strands: null,
    },
  ],
};

const CALC_RESULT = {
  size_label: "M",
  yarns: [
    {
      pattern_yarn_id: "yarn-1",
      calculated: true,
      weight_warning: false,
      message: null,
      pattern_yarn: {
        label: "Main yarn",
        yarn_weight: "DK",
        meters_per_unit: 200,
        grams_per_unit: 100,
        strands: 1,
        grams_needed: 200,
      },
      result: { grams_needed: 180, skeins_needed: 2 },
      user_yarn: {
        label: "Main yarn",
        yarn_weight: "DK",
        meters_per_unit: 200,
        grams_per_unit: 100,
        strands: 1,
      },
    },
  ],
};

async function renderModal(pattern = PATTERN, onClose = vi.fn()) {
  await act(async () => {
    render(<YarnCalculatorModal pattern={pattern} onClose={onClose} />);
  });
}

beforeEach(() => {
  patternService.getUserYarns.mockResolvedValue([]);
  patternService.putUserYarn.mockResolvedValue({ id: "yarn-1" });
  patternService.getYarnCalculation.mockResolvedValue(CALC_RESULT);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("YarnCalculatorModal", () => {
  it("renders the modal title", async () => {
    await renderModal();
    expect(
      screen.getByRole("heading", { name: "Calculate yarn needed" }),
    ).toBeInTheDocument();
  });

  it("renders pattern yarn data in the left column", async () => {
    await renderModal();
    expect(screen.getAllByText("Main yarn").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DK").length).toBeGreaterThan(0);
    expect(screen.getAllByText("200").length).toBeGreaterThan(0);
    expect(screen.getAllByText("100").length).toBeGreaterThan(0);
  });

  it("renders the pattern yarn label as block header", async () => {
    await renderModal();
    expect(document.querySelector(".yc-block__name")).toHaveTextContent(
      "Main yarn",
    );
  });

  it("renders 'This pattern has no yarns defined.' when yarns array is empty", async () => {
    await renderModal(PATTERN_NO_YARNS);
    expect(
      screen.getByText("This pattern has no yarns defined."),
    ).toBeInTheDocument();
  });

  it("Calculate button is disabled when there are no yarns", async () => {
    await renderModal(PATTERN_NO_YARNS);
    expect(screen.getByRole("button", { name: "Calculate" })).toBeDisabled();
  });

  it("closes when the close button is clicked", async () => {
    const onClose = vi.fn();
    await renderModal(PATTERN, onClose);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes when the Cancel button is clicked", async () => {
    const onClose = vi.fn();
    await renderModal(PATTERN, onClose);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes when clicking the overlay", async () => {
    const onClose = vi.fn();
    await renderModal(PATTERN, onClose);
    fireEvent.mouseDown(document.querySelector(".yc-overlay"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not close when clicking inside the modal", async () => {
    const onClose = vi.fn();
    await renderModal(PATTERN, onClose);
    fireEvent.mouseDown(document.querySelector(".yc-modal"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("checking 'use same yarn as pattern' auto-fills and disables user fields", async () => {
    await renderModal();
    fireEvent.click(screen.getByRole("checkbox", { name: /use same yarn/i }));
    expect(screen.getByLabelText(/m\/skein/)).toHaveValue(200);
    expect(screen.getByLabelText(/g\/skein/)).toHaveValue(100);
    expect(screen.getByLabelText(/strands/i)).toHaveValue(1);
    expect(screen.getByLabelText(/m\/skein/)).toBeDisabled();
    expect(screen.getByLabelText(/g\/skein/)).toBeDisabled();
    expect(screen.getByLabelText(/strands/i)).toBeDisabled();
  });

  it("validation is skipped when 'use same yarn as pattern' is checked", async () => {
    await renderModal();
    fireEvent.click(screen.getByRole("checkbox", { name: /use same yarn/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });
    expect(patternService.putUserYarn).toHaveBeenCalledOnce();
  });

  it("unchecking 'use same yarn as pattern' re-enables user fields", async () => {
    await renderModal();
    const checkbox = screen.getByRole("checkbox", { name: /use same yarn/i });
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);
    expect(screen.getByLabelText(/m\/skein/)).not.toBeDisabled();
  });

  it("shows validation error when m/skein is empty on Calculate", async () => {
    await renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    expect(
      screen.getByText("Meters per skein are required"),
    ).toBeInTheDocument();
  });

  it("shows validation error when g/skein is empty on Calculate", async () => {
    await renderModal();
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    expect(
      screen.getByText("Grams per skein are required"),
    ).toBeInTheDocument();
  });

  it("shows validation error when strands is empty on Calculate", async () => {
    await renderModal();
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    expect(
      screen.getByText("Number of strands is required"),
    ).toBeInTheDocument();
  });

  it("shows validation error when m/skein is zero", async () => {
    await renderModal();
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    expect(
      screen.getAllByText("Value must be greater than zero").length,
    ).toBeGreaterThan(0);
  });

  it("shows validation error when strands is a decimal", async () => {
    await renderModal();
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    expect(
      screen.getByText("Number of strands must be a whole number"),
    ).toBeInTheDocument();
  });

  it("shows validation error when g/skein is zero", async () => {
    await renderModal();
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    expect(
      screen.getAllByText("Value must be greater than zero").length,
    ).toBeGreaterThan(0);
  });

  it("does not call putUserYarn when validation fails", async () => {
    await renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    expect(patternService.putUserYarn).not.toHaveBeenCalled();
  });

  it("clears the m/skein error when the field is edited", async () => {
    await renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    expect(
      screen.getByText("Meters per skein are required"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "150" },
    });
    expect(
      screen.queryByText("Meters per skein are required"),
    ).not.toBeInTheDocument();
  });

  it("calls putUserYarn with the correct payload on successful Calculate", async () => {
    await renderModal();
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "180" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "90" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "2" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });

    expect(patternService.putUserYarn).toHaveBeenCalledWith(
      "42",
      "yarn-1",
      expect.objectContaining({
        meters_per_unit: 180,
        grams_per_unit: 90,
        strands: 2,
      }),
    );
  });

  it("shows the results step and Done button after a successful Calculate", async () => {
    const onClose = vi.fn();
    await renderModal(PATTERN, onClose);
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "180" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "90" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });

    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls putUserYarn for each yarn on a multi-yarn pattern", async () => {
    patternService.putUserYarn.mockResolvedValue({});
    patternService.getYarnCalculation.mockResolvedValue({ yarns: [] });
    await renderModal(PATTERN_TWO_YARNS);

    const mpuInputs = screen.getAllByLabelText(/m\/skein/);
    const gpuInputs = screen.getAllByLabelText(/g\/skein/);
    const strandsInputs = screen.getAllByLabelText(/strands/i);

    fireEvent.change(mpuInputs[0], { target: { value: "200" } });
    fireEvent.change(gpuInputs[0], { target: { value: "100" } });
    fireEvent.change(strandsInputs[0], { target: { value: "1" } });
    fireEvent.change(mpuInputs[1], { target: { value: "400" } });
    fireEvent.change(gpuInputs[1], { target: { value: "50" } });
    fireEvent.change(strandsInputs[1], { target: { value: "2" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });

    expect(patternService.putUserYarn).toHaveBeenCalledTimes(2);
    expect(patternService.putUserYarn).toHaveBeenCalledWith(
      "42",
      "yarn-1",
      expect.any(Object),
    );
    expect(patternService.putUserYarn).toHaveBeenCalledWith(
      "42",
      "yarn-2",
      expect.any(Object),
    );
  });

  it("shows a global error and does not close when putUserYarn fails", async () => {
    patternService.putUserYarn.mockRejectedValue(new Error("Server error"));
    const onClose = vi.fn();
    await renderModal(PATTERN, onClose);
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Server error");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("pre-fills user yarn fields from getUserYarns on load", async () => {
    patternService.getUserYarns.mockResolvedValue([
      {
        pattern_yarn_id: "yarn-1",
        label: "Saved yarn",
        yarn_weight: "ARAN",
        meters_per_unit: 150,
        grams_per_unit: 80,
        strands: 3,
      },
    ]);

    await renderModal();

    expect(screen.getByLabelText(/m\/skein/)).toHaveValue(150);
    expect(screen.getByLabelText(/g\/skein/)).toHaveValue(80);
    expect(screen.getByLabelText(/strands/i)).toHaveValue(3);
  });

  it("sends label as null when label field is blank", async () => {
    await renderModal();
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });

    expect(patternService.putUserYarn).toHaveBeenCalledWith(
      "42",
      "yarn-1",
      expect.objectContaining({ label: null }),
    );
  });

  it("sends the label value when the label field is filled", async () => {
    await renderModal();
    fireEvent.change(screen.getByLabelText("Label"), {
      target: { value: "Cascade 220" },
    });
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });

    expect(patternService.putUserYarn).toHaveBeenCalledWith(
      "42",
      "yarn-1",
      expect.objectContaining({ label: "Cascade 220" }),
    );
  });

  it("sends the yarn_weight value when the weight select is changed", async () => {
    await renderModal();
    fireEvent.change(screen.getByLabelText("Weight"), {
      target: { value: "ARAN" },
    });
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });

    expect(patternService.putUserYarn).toHaveBeenCalledWith(
      "42",
      "yarn-1",
      expect.objectContaining({ yarn_weight: "ARAN" }),
    );
  });

  it("shows '—' in the pattern column when yarn fields are null", async () => {
    await renderModal(PATTERN_NULL_YARN);
    const patternCells = document.querySelectorAll(".yc-row__pattern");
    const texts = Array.from(patternCells).map((el) => el.textContent.trim());
    expect(texts.filter((t) => t === "—").length).toBeGreaterThanOrEqual(3);
  });

  it("uses 'Yarn 1' as block name when pattern yarn has no label", async () => {
    await renderModal(PATTERN_NULL_YARN);
    expect(document.querySelector(".yc-block__name")).toHaveTextContent(
      "Yarn 1",
    );
  });

  it("renders an empty pattern when the pattern has no yarns property", async () => {
    await renderModal({ id: "42" });
    expect(
      screen.getByText("This pattern has no yarns defined."),
    ).toBeInTheDocument();
  });

  it("does not crash when getUserYarns rejects on load", async () => {
    patternService.getUserYarns.mockRejectedValue(new Error("Network error"));
    await renderModal();
    expect(
      screen.getByRole("heading", { name: "Calculate yarn needed" }),
    ).toBeInTheDocument();
  });

  it("only disables the toggled yarn's fields in a multi-yarn pattern", async () => {
    await renderModal(PATTERN_TWO_YARNS);
    const checkboxes = screen.getAllByRole("checkbox", {
      name: /use same yarn/i,
    });
    fireEvent.click(checkboxes[0]);

    const mpuInputs = screen.getAllByLabelText(/m\/skein/);
    expect(mpuInputs[0]).toBeDisabled();
    expect(mpuInputs[1]).not.toBeDisabled();
  });

  it("clicking 'Edit yarn data' on step 2 returns to step 1", async () => {
    await renderModal(PATTERN);
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "180" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "90" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });

    expect(
      screen.getByRole("button", { name: "Edit yarn data" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit yarn data" }));

    expect(
      screen.getByRole("button", { name: "Calculate" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit yarn data" }),
    ).not.toBeInTheDocument();
  });

  // lines 23-40: fromSaved null-field branches — fields absent in saved yarn become ""
  it("treats null meters/grams/strands in a saved yarn as empty strings", async () => {
    patternService.getUserYarns.mockResolvedValue([
      {
        pattern_yarn_id: "yarn-1",
        label: null,
        yarn_weight: null,
        meters_per_unit: null,
        grams_per_unit: null,
        strands: null,
      },
    ]);

    await renderModal();

    expect(screen.getByLabelText(/m\/skein/)).toHaveValue(null);
    expect(screen.getByLabelText(/g\/skein/)).toHaveValue(null);
    expect(screen.getByLabelText(/strands/i)).toHaveValue(null);
  });

  // lines 33-40: fromPattern null-field branches — "use same yarn" with an all-null pattern yarn
  it("treats null meters/grams/strands in pattern yarn as empty strings when 'use same yarn' is checked", async () => {
    await renderModal(PATTERN_NULL_YARN);
    fireEvent.click(screen.getByRole("checkbox", { name: /use same yarn/i }));

    expect(screen.getByLabelText(/m\/skein/)).toHaveValue(null);
    expect(screen.getByLabelText(/g\/skein/)).toHaveValue(null);
    expect(screen.getByLabelText(/strands/i)).toHaveValue(null);
  });

  // line 67: strands <= 0 branch in validateUserYarn
  it("shows 'Value must be greater than zero' when strands is zero", async () => {
    await renderModal();
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    expect(
      screen.getAllByText("Value must be greater than zero").length,
    ).toBeGreaterThan(0);
  });

  // line 182: Array.isArray(raw) branch — getYarnCalculation returns an array directly
  it("handles getYarnCalculation returning an array directly", async () => {
    patternService.getYarnCalculation.mockResolvedValue([
      {
        calculated: true,
        weight_warning: false,
        pattern_yarn: { label: "Main yarn" },
        result: { grams_needed: 180, skeins_needed: 2 },
      },
    ]);
    await renderModal();
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });
    expect(screen.getByText(/approximately/i)).toBeInTheDocument();
  });

  // line 182: raw.yarns ?? [raw] — getYarnCalculation returns a single object without .yarns
  it("wraps a bare result object in an array when yarns key is absent", async () => {
    patternService.getYarnCalculation.mockResolvedValue({
      calculated: true,
      weight_warning: false,
      pattern_yarn: { label: "Main yarn" },
      result: { grams_needed: 200 },
    });
    await renderModal();
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });
    expect(screen.getByText(/approximately/i)).toBeInTheDocument();
  });

  // line 451: result.pattern_yarn ?? {} — null pattern_yarn falls back to patternYarns label
  it("falls back to the pattern yarn label when result.pattern_yarn is null", async () => {
    patternService.getYarnCalculation.mockResolvedValue({
      yarns: [
        {
          calculated: true,
          weight_warning: false,
          pattern_yarn: null,
          result: { grams_needed: 180, skeins_needed: 1 },
        },
      ],
    });
    await renderModal(PATTERN);
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });
    expect(document.querySelector(".yc-block__name")).toHaveTextContent(
      "Main yarn",
    );
  });

  // line 461: result.calculated === false branch shows message instead of result
  it("shows the result message when calculated is false", async () => {
    patternService.getYarnCalculation.mockResolvedValue({
      yarns: [
        {
          calculated: false,
          message: "Not enough yarn data to calculate",
          pattern_yarn: { label: "Main yarn" },
          result: null,
        },
      ],
    });
    await renderModal(PATTERN);
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });
    expect(
      screen.getByText("Not enough yarn data to calculate"),
    ).toBeInTheDocument();
  });

  // line 475: weight_warning true branch shows the warning paragraph
  it("shows the weight warning when result.weight_warning is true", async () => {
    patternService.getYarnCalculation.mockResolvedValue({
      yarns: [
        {
          ...CALC_RESULT.yarns[0],
          weight_warning: true,
        },
      ],
    });
    await renderModal(PATTERN);
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    });
    expect(
      screen.getByText(/different weight than the pattern/i),
    ).toBeInTheDocument();
  });

  it("shows the Calculating… spinner while the request is pending", async () => {
    patternService.putUserYarn.mockReturnValue(new Promise(() => {}));
    await renderModal();
    fireEvent.change(screen.getByLabelText(/m\/skein/), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/g\/skein/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/strands/i), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));

    await waitFor(() => {
      expect(screen.getByText("Calculating…")).toBeInTheDocument();
    });
  });
});
