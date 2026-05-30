import { describe, it, expect, vi, afterEach } from "vitest";
import {
  importPatternFromPdf,
  importPatternFromText,
  getPattern,
  confirmPattern,
  translatePattern,
  getPatternOriginalText,
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

    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/patterns/42`);
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

describe("getPatternOriginalText", () => {
  function mockFetchSequence(...responses) {
    const fn = vi.fn();
    responses.forEach((r) => fn.mockResolvedValueOnce(r));
    return fn;
  }

  it("fetches the original text from an absolute http URL in original_text_path", async () => {
    const textUrl = "http://storage.example.com/patterns/42.txt";
    vi.stubGlobal(
      "fetch",
      mockFetchSequence(
        {
          ok: true,
          json: () =>
            Promise.resolve({ id: "42", original_text_path: textUrl }),
        },
        { ok: true, text: () => Promise.resolve("CO 20 sts") },
      ),
    );

    const result = await getPatternOriginalText("42");

    expect(result).toBe("CO 20 sts");
  });

  it("constructs the URL from a slash-prefixed path", async () => {
    const fetchMock = mockFetchSequence(
      {
        ok: true,
        json: () =>
          Promise.resolve({ id: "42", original_text_path: "/media/42.txt" }),
      },
      { ok: true, text: () => Promise.resolve("K2, P2") },
    );
    vi.stubGlobal("fetch", fetchMock);

    await getPatternOriginalText("42");

    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_URL}/media/42.txt`);
  });

  it("constructs the URL from a bare path without a leading slash", async () => {
    const fetchMock = mockFetchSequence(
      {
        ok: true,
        json: () =>
          Promise.resolve({ id: "42", original_text_path: "media/42.txt" }),
      },
      { ok: true, text: () => Promise.resolve("K2, P2") },
    );
    vi.stubGlobal("fetch", fetchMock);

    await getPatternOriginalText("42");

    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_URL}/media/42.txt`);
  });

  it("throws when original_text_path is missing from the pattern", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchSequence({
        ok: true,
        json: () => Promise.resolve({ id: "42", original_text_path: null }),
      }),
    );

    await expect(getPatternOriginalText("42")).rejects.toThrow(
      "No original text available for this pattern",
    );
  });

  it("throws when the text file fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchSequence(
        {
          ok: true,
          json: () =>
            Promise.resolve({ id: "42", original_text_path: "/media/42.txt" }),
        },
        { ok: false, text: () => Promise.resolve("") },
      ),
    );

    await expect(getPatternOriginalText("42")).rejects.toThrow(
      "Could not load original pattern text",
    );
  });
});
