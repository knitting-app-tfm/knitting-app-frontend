import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
}));
import {
  importPatternFromPdf,
  importPatternFromText,
  getPattern,
  confirmPattern,
  translatePattern,
  getPatterns,
  getScaling,
  putScaling,
  getScaledPattern,
} from "../../src/services/patternService";

const API_URL = "http://localhost:8000";

function mockFetch(body, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getPatterns", () => {
  it("returns the parsed pattern list on success", async () => {
    const patterns = [{ id: "1", title: "Scarf" }];
    vi.stubGlobal("fetch", mockFetch(patterns));

    const result = await getPatterns();

    expect(result).toEqual(patterns);
  });

  it("throws with the detail string when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: "Authentication required" }, false),
    );

    await expect(getPatterns()).rejects.toThrow("Authentication required");
  });

  it("throws a generic message when detail is not a string", async () => {
    vi.stubGlobal("fetch", mockFetch({ detail: [{ msg: "error" }] }, false));

    await expect(getPatterns()).rejects.toThrow("Failed to load patterns");
  });
});

describe("importPatternFromPdf", () => {
  it("POSTs to /patterns/import/pdf with a FormData body", async () => {
    const fetchMock = mockFetch({ id: "1", title: "Test" });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["content"], "pattern.pdf", {
      type: "application/pdf",
    });
    await importPatternFromPdf(file);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/patterns/import/pdf`,
      expect.objectContaining({ method: "POST", body: expect.any(FormData) }),
    );
  });

  it("returns the parsed pattern on success", async () => {
    const pattern = { id: "1", title: "Test Pattern" };
    vi.stubGlobal("fetch", mockFetch(pattern));

    const file = new File(["content"], "pattern.pdf", {
      type: "application/pdf",
    });
    const result = await importPatternFromPdf(file);

    expect(result).toEqual(pattern);
  });

  it("throws with the detail message when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: "Only PDF files are allowed" }, false),
    );

    const file = new File(["content"], "pattern.pdf", {
      type: "application/pdf",
    });
    await expect(importPatternFromPdf(file)).rejects.toThrow(
      "Only PDF files are allowed",
    );
  });

  it("throws a generic error when detail is not a string", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: [{ msg: "field required" }] }, false),
    );

    const file = new File(["content"], "pattern.pdf", {
      type: "application/pdf",
    });
    await expect(importPatternFromPdf(file)).rejects.toThrow(
      "Error al importar el patrón",
    );
  });
});

describe("importPatternFromText", () => {
  it("POSTs to /patterns/import/text with Content-Type text/plain and raw text body", async () => {
    const fetchMock = mockFetch({ id: "2", title: "Text Pattern" });
    vi.stubGlobal("fetch", fetchMock);

    await importPatternFromText("Cast on 20 stitches");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/patterns/import/text`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "Cast on 20 stitches",
      }),
    );
  });

  it("returns the parsed pattern on success", async () => {
    const pattern = { id: "2", title: "Text Pattern" };
    vi.stubGlobal("fetch", mockFetch(pattern));

    const result = await importPatternFromText("Cast on 20 stitches");

    expect(result).toEqual(pattern);
  });

  it("throws with the detail message when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: "Text cannot be empty" }, false),
    );

    await expect(importPatternFromText("")).rejects.toThrow(
      "Text cannot be empty",
    );
  });

  it("throws a generic error when detail is not a string", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: [{ msg: "field required" }] }, false),
    );

    await expect(importPatternFromText("")).rejects.toThrow(
      "Error al importar el patrón",
    );
  });
});

describe("getPattern", () => {
  it("GETs /patterns/{id} and returns the pattern", async () => {
    const pattern = { id: "42", title: "My Pattern", status: "IMPORTED" };
    const fetchMock = mockFetch(pattern);
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPattern("42");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/patterns/42`,
      expect.any(Object),
    );
    expect(result).toEqual(pattern);
  });

  it("throws with the detail message when the response is not ok", async () => {
    vi.stubGlobal("fetch", mockFetch({ detail: "Pattern not found" }, false));

    await expect(getPattern("99")).rejects.toThrow("Pattern not found");
  });

  it("throws a generic error when detail is not a string", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: [{ msg: "not found" }] }, false),
    );

    await expect(getPattern("99")).rejects.toThrow(
      "Error al obtener el patrón",
    );
  });
});

describe("confirmPattern", () => {
  it("PUTs to /patterns/{id}/confirm with a FormData body", async () => {
    const confirmed = { id: "42", status: "CONFIRMED" };
    const fetchMock = mockFetch(confirmed);
    vi.stubGlobal("fetch", fetchMock);

    const fd = new FormData();
    fd.append("title", "My Pattern");
    const result = await confirmPattern("42", fd);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/patterns/42/confirm`,
      expect.objectContaining({ method: "PUT", body: expect.any(FormData) }),
    );
    expect(result).toEqual(confirmed);
  });

  it("throws with the detail message when the response is not ok", async () => {
    vi.stubGlobal("fetch", mockFetch({ detail: "Title is required" }, false));

    await expect(confirmPattern("42", new FormData())).rejects.toThrow(
      "Title is required",
    );
  });

  it("throws a generic error when detail is not a string", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: [{ msg: "field required" }] }, false),
    );

    await expect(confirmPattern("42", new FormData())).rejects.toThrow(
      "Error al confirmar el patrón",
    );
  });
});

describe("getScaling", () => {
  it("GETs /patterns/{id}/scaling and returns the scaling", async () => {
    const scaling = { size_label: "S", size_position: 1 };
    const fetchMock = mockFetch(scaling);
    vi.stubGlobal("fetch", fetchMock);

    const result = await getScaling("42");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/patterns/42/scaling`,
      expect.any(Object),
    );
    expect(result).toEqual(scaling);
  });

  it("returns null when the response status is 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 404,
        ok: false,
        json: () => Promise.resolve({ detail: "Not found" }),
      }),
    );

    const result = await getScaling("42");

    expect(result).toBeNull();
  });

  it("throws with the detail string when the response is not ok (non-404)", async () => {
    vi.stubGlobal("fetch", mockFetch({ detail: "Unauthorized" }, false));

    await expect(getScaling("42")).rejects.toThrow("Unauthorized");
  });

  it("throws a generic message when detail is not a string", async () => {
    vi.stubGlobal("fetch", mockFetch({ detail: [{ msg: "error" }] }, false));

    await expect(getScaling("42")).rejects.toThrow("Failed to load scaling");
  });
});

describe("putScaling", () => {
  it("PUTs to /patterns/{id}/scaling with JSON body", async () => {
    const payload = { size_label: "S", size_position: 1 };
    const fetchMock = mockFetch(payload);
    vi.stubGlobal("fetch", fetchMock);

    await putScaling("42", payload);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/patterns/42/scaling`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("returns the parsed result on success", async () => {
    const result = { size_label: "S", size_position: 1 };
    vi.stubGlobal("fetch", mockFetch(result));

    const data = await putScaling("42", "S", 1);

    expect(data).toEqual(result);
  });

  it("throws with the detail string when the response is not ok", async () => {
    vi.stubGlobal("fetch", mockFetch({ detail: "Invalid size" }, false));

    await expect(putScaling("42", "X", 99)).rejects.toThrow("Invalid size");
  });

  it("throws a generic message when detail is not a string", async () => {
    vi.stubGlobal("fetch", mockFetch({ detail: [{ msg: "error" }] }, false));

    await expect(putScaling("42", "X", 99)).rejects.toThrow(
      "Failed to save scaling",
    );
  });
});

describe("getScaledPattern", () => {
  it("GETs /patterns/{id}/scaled and returns the scaled data", async () => {
    const scaled = { size_label: "M", rows_warning: false, lines: [] };
    const fetchMock = mockFetch(scaled);
    vi.stubGlobal("fetch", fetchMock);

    const result = await getScaledPattern("42");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/patterns/42/scaled`,
      expect.any(Object),
    );
    expect(result).toEqual(scaled);
  });

  it("throws with the detail message when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: "Scaling not configured" }, false),
    );

    await expect(getScaledPattern("42")).rejects.toThrow(
      "Scaling not configured",
    );
  });

  it("throws a generic message when detail is not a string", async () => {
    vi.stubGlobal("fetch", mockFetch({ detail: [{ msg: "error" }] }, false));

    await expect(getScaledPattern("42")).rejects.toThrow(
      "Failed to load scaled pattern",
    );
  });
});

describe("confirmPattern grams_needed", () => {
  it("test_confirm_grams_needed_length_mismatch: propagates 400 when array length does not match sizes", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: "grams_needed length must match sizes" }, false),
    );

    const fd = new FormData();
    fd.append("sizes", JSON.stringify(["S"]));
    fd.append("yarns", JSON.stringify([{ grams_needed: [100, 200] }]));

    await expect(confirmPattern("42", fd)).rejects.toThrow(
      "grams_needed length must match sizes",
    );
  });

  it("test_confirm_grams_needed_one_size: accepts a single-element grams_needed array", async () => {
    const confirmed = { id: "42", status: "CONFIRMED" };
    vi.stubGlobal("fetch", mockFetch(confirmed));

    const fd = new FormData();
    fd.append("sizes", JSON.stringify([]));
    fd.append("yarns", JSON.stringify([{ grams_needed: [100] }]));

    const result = await confirmPattern("42", fd);

    expect(result).toEqual(confirmed);
  });

  it("test_confirm_grams_needed_null: accepts null grams_needed", async () => {
    const confirmed = { id: "42", status: "CONFIRMED" };
    vi.stubGlobal("fetch", mockFetch(confirmed));

    const fd = new FormData();
    fd.append("yarns", JSON.stringify([{ grams_needed: null }]));

    const result = await confirmPattern("42", fd);

    expect(result).toEqual(confirmed);
  });
});

describe("translatePattern", () => {
  it("POSTs to /patterns/{id}/translate with no body", async () => {
    const fetchMock = mockFetch([{ line: 1, tokens: [] }]);
    vi.stubGlobal("fetch", fetchMock);

    await translatePattern("42");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/patterns/42/translate`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns the parsed token list on success", async () => {
    const tokens = [{ line: 1, tokens: ["k2tog"] }];
    vi.stubGlobal("fetch", mockFetch(tokens));

    const result = await translatePattern("42");

    expect(result).toEqual(tokens);
  });

  it("throws with the detail message when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch(
        { detail: "Pattern must be confirmed before translating" },
        false,
      ),
    );

    await expect(translatePattern("42")).rejects.toThrow(
      "Pattern must be confirmed before translating",
    );
  });

  it("throws a generic error when detail is not a string", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: [{ msg: "invalid state" }] }, false),
    );

    await expect(translatePattern("42")).rejects.toThrow(
      "Error al traducir el patrón",
    );
  });
});
