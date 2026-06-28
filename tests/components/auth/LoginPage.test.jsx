import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import LoginPage from "../../../src/pages/auth/LoginPage";

import * as authService from "../../../src/services/authService";

vi.mock("../../../src/services/authService", () => ({
  loginWithEmail: vi.fn(),
}));

function renderPage(url = "/login") {
  const router = createMemoryRouter(
    [
      { path: "/login", element: <LoginPage /> },
      { path: "/", element: <div>Home</div> },
    ],
    { initialEntries: [url] },
  );
  render(<RouterProvider router={router} />);
}

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "password123" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("LoginPage", () => {
  it("renders the Ravelry login button", () => {
    renderPage();
    expect(
      screen.getByRole("link", { name: "Continue with Ravelry" }),
    ).toBeInTheDocument();
  });

  it("does not show the Ravelry error by default", () => {
    renderPage();
    expect(
      screen.queryByText(/Could not connect to Ravelry/),
    ).not.toBeInTheDocument();
  });

  it("shows the Ravelry error message when ?error=ravelry_failed is in the URL", () => {
    renderPage("/login?error=ravelry_failed");
    expect(
      screen.getByText(/Could not connect to Ravelry/),
    ).toBeInTheDocument();
  });

  it("renders the Ravelry error in an alert element", () => {
    renderPage("/login?error=ravelry_failed");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not connect to Ravelry",
    );
  });

  it("navigates to / after a successful login", async () => {
    authService.loginWithEmail.mockResolvedValue();
    renderPage();
    fillAndSubmit();
    await waitFor(() => expect(screen.getByText("Home")).toBeInTheDocument());
  });

  it("shows an error alert when login fails", async () => {
    authService.loginWithEmail.mockRejectedValue(
      new Error("Incorrect email or password."),
    );
    renderPage();
    fillAndSubmit();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Incorrect email or password.",
      ),
    );
  });
});
