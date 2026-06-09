import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { getAuth } from "firebase/auth";

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
}));

import { apiFetch } from "../../src/services/apiClient";

const API_URL = "http://localhost:8000";

function mockFetch(body = {}, ok = true) {
  return vi.fn().mockResolvedValue({ ok, json: () => Promise.resolve(body) });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch — authentication header", () => {
  it("sends no Authorization header when there is no current user", async () => {
    getAuth.mockReturnValue({ currentUser: null });
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/patterns");

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("attaches a Bearer token when a user is signed in", async () => {
    getAuth.mockReturnValue({
      currentUser: {
        getIdToken: vi.fn().mockResolvedValue("test-token-123"),
      },
    });
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/patterns");

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer test-token-123");
  });
});

describe("apiFetch — Content-Type header", () => {
  beforeEach(() => {
    getAuth.mockReturnValue({ currentUser: null });
  });

  it("sets Content-Type to application/json for plain requests", async () => {
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/patterns");

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("omits Content-Type when the body is FormData", async () => {
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/patterns/import/pdf", {
      method: "POST",
      body: new FormData(),
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers).not.toHaveProperty("Content-Type");
  });

  it("uses the caller-supplied URL and options", async () => {
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/patterns/1/confirm", { method: "PUT" });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/patterns/1/confirm`,
      expect.objectContaining({ method: "PUT" }),
    );
  });
});
