import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import RavelryCompletePage from "../../../src/pages/auth/RavelryCompletePage";

vi.mock("firebase/auth", () => ({
  signInWithCustomToken: vi.fn(),
}));
vi.mock("../../../src/services/firebase", () => ({
  auth: {},
}));

import { signInWithCustomToken } from "firebase/auth";

function renderPage(url = "/ravelry/complete") {
  const router = createMemoryRouter(
    [
      { path: "/ravelry/complete", element: <RavelryCompletePage /> },
      { path: "/", element: <div>Home</div> },
      { path: "/login", element: <div>Login</div> },
    ],
    { initialEntries: [url] },
  );
  render(<RouterProvider router={router} />);
}

describe("RavelryCompletePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading spinner while processing", () => {
    signInWithCustomToken.mockReturnValue(new Promise(() => {}));
    renderPage("/ravelry/complete?token=abc123");
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("calls signInWithCustomToken with the token from the URL", async () => {
    signInWithCustomToken.mockResolvedValue({});
    renderPage("/ravelry/complete?token=abc123");
    await waitFor(() =>
      expect(signInWithCustomToken).toHaveBeenCalledWith({}, "abc123"),
    );
  });

  it("redirects to / on successful sign-in", async () => {
    signInWithCustomToken.mockResolvedValue({});
    renderPage("/ravelry/complete?token=abc123");
    await waitFor(() => expect(screen.getByText("Home")).toBeInTheDocument());
  });

  it("redirects to /login?error=ravelry_failed when token is missing", async () => {
    renderPage("/ravelry/complete");
    await waitFor(() => expect(screen.getByText("Login")).toBeInTheDocument());
  });

  it("redirects to /login?error=ravelry_failed when signInWithCustomToken rejects", async () => {
    signInWithCustomToken.mockRejectedValue(new Error("invalid token"));
    renderPage("/ravelry/complete?token=bad-token");
    await waitFor(() => expect(screen.getByText("Login")).toBeInTheDocument());
  });
});
