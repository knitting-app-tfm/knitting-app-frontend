import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getAbbreviations,
  getAbbreviationById,
  getAbbreviationByCode,
} from "../../src/services/abbreviationService";

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

describe("getAbbreviations", () => {
  it("GETs /abbreviations with no query params when called without filters", async () => {
    const list = [{ id: "1", abbreviation: "k", full_name: "knit" }];
    const fetchMock = mockFetch({ abbreviations: list });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getAbbreviations();

    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/abbreviations`);
    expect(result).toEqual(list);
  });

  it("includes craft query param when provided", async () => {
    const fetchMock = mockFetch({ abbreviations: [] });
    vi.stubGlobal("fetch", fetchMock);

    await getAbbreviations("KNITTING");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/abbreviations?craft=KNITTING`,
    );
  });

  it("includes type query param when provided", async () => {
    const fetchMock = mockFetch({ abbreviations: [] });
    vi.stubGlobal("fetch", fetchMock);

    await getAbbreviations(null, "STITCH");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/abbreviations?type=STITCH`,
    );
  });

  it("includes both craft and type query params when provided", async () => {
    const fetchMock = mockFetch({ abbreviations: [] });
    vi.stubGlobal("fetch", fetchMock);

    await getAbbreviations("CROCHET", "DECREASE");

    const calledUrl = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain("craft=CROCHET");
    expect(calledUrl).toContain("type=DECREASE");
  });

  it("throws with detail message when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: "Invalid filter value" }, false),
    );

    await expect(getAbbreviations("INVALID")).rejects.toThrow(
      "Invalid filter value",
    );
  });

  it("throws a generic error when detail is not a string", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: [{ msg: "validation error" }] }, false),
    );

    await expect(getAbbreviations()).rejects.toThrow(
      "Error al obtener las abreviaturas",
    );
  });
});

describe("getAbbreviationById", () => {
  it("GETs /abbreviations/{id} and returns the abbreviation", async () => {
    const abbr = { id: "5", abbreviation: "yo", full_name: "yarn over" };
    const fetchMock = mockFetch(abbr);
    vi.stubGlobal("fetch", fetchMock);

    const result = await getAbbreviationById("5");

    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/abbreviations/5`);
    expect(result).toEqual(abbr);
  });

  it("throws with detail message when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: "Abbreviation not found" }, false),
    );

    await expect(getAbbreviationById("99")).rejects.toThrow(
      "Abbreviation not found",
    );
  });

  it("throws a generic error when detail is not a string", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: [{ msg: "not found" }] }, false),
    );

    await expect(getAbbreviationById("99")).rejects.toThrow(
      "Error al obtener la abreviatura",
    );
  });
});

describe("getAbbreviationByCode", () => {
  it("GETs /abbreviations/code/{code} and returns the abbreviation", async () => {
    const abbr = { id: "5", abbreviation: "sts", full_name: "stitches" };
    const fetchMock = mockFetch(abbr);
    vi.stubGlobal("fetch", fetchMock);

    const result = await getAbbreviationByCode("sts");

    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/abbreviations/code/sts`);
    expect(result).toEqual(abbr);
  });

  it("throws with detail message when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: "Abbreviation not found" }, false),
    );

    await expect(getAbbreviationByCode("XX")).rejects.toThrow(
      "Abbreviation not found",
    );
  });

  it("throws a generic error when detail is not a string", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: [{ msg: "not found" }] }, false),
    );

    await expect(getAbbreviationByCode("XX")).rejects.toThrow(
      "Error al obtener la abreviatura",
    );
  });
});
