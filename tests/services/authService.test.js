import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { registerWithEmail } from "../../src/services/authService";

vi.mock("../../src/services/firebase.js", () => ({ auth: {} }));
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
}));

const API_URL = "http://localhost:8000";

function mockFetch(body, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
}

const mockUser = {
  getIdToken: vi.fn().mockResolvedValue("mock-firebase-token"),
};

beforeEach(() => {
  createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("registerWithEmail", () => {
  it("calls createUserWithEmailAndPassword with email and password", async () => {
    vi.stubGlobal("fetch", mockFetch({ id: "1" }));

    await registerWithEmail("test@example.com", "password123", "testuser");

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      "test@example.com",
      "password123",
    );
  });

  it("POSTs to /auth/register with the Firebase token and username", async () => {
    const fetchMock = mockFetch({ id: "1" });
    vi.stubGlobal("fetch", fetchMock);

    await registerWithEmail("test@example.com", "password123", "testuser");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/register`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_token: "mock-firebase-token",
          username: "testuser",
        }),
      }),
    );
  });

  it("returns the user data from the backend on success", async () => {
    const user = { id: "1", username: "testuser" };
    vi.stubGlobal("fetch", mockFetch(user));

    const result = await registerWithEmail(
      "test@example.com",
      "password123",
      "testuser",
    );

    expect(result).toEqual(user);
  });

  it("throws a friendly message when Firebase rejects with email-already-in-use", async () => {
    const firebaseError = Object.assign(
      new Error("Firebase: Error (auth/email-already-in-use)."),
      {
        code: "auth/email-already-in-use",
      },
    );
    createUserWithEmailAndPassword.mockRejectedValue(firebaseError);

    await expect(
      registerWithEmail("test@example.com", "password123", "testuser"),
    ).rejects.toThrow("This email address is already registered.");
  });

  it("throws a generic friendly message for unknown Firebase errors", async () => {
    createUserWithEmailAndPassword.mockRejectedValue(
      new Error("unknown error"),
    );

    await expect(
      registerWithEmail("test@example.com", "password123", "testuser"),
    ).rejects.toThrow("Registration failed. Please try again.");
  });

  it("throws a generic error when the backend detail is not a string", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: ["field", "is required"] }, false),
    );

    await expect(
      registerWithEmail("test@example.com", "password123", "testuser"),
    ).rejects.toThrow("Registration failed");
  });

  it("throws with the detail message if the backend returns an error", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ detail: "Username already taken" }, false),
    );

    await expect(
      registerWithEmail("test@example.com", "password123", "testuser"),
    ).rejects.toThrow("Username already taken");
  });
});
