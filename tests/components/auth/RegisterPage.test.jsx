import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import RegisterPage from "../../../src/pages/auth/RegisterPage";
import * as authService from "../../../src/services/authService";

vi.mock("../../../src/services/authService", () => ({
  registerWithEmail: vi.fn(),
}));

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: "/register", element: <RegisterPage /> },
      { path: "/", element: <div>Home</div> },
    ],
    { initialEntries: ["/register"] },
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
  fireEvent.change(screen.getByLabelText("Username"), {
    target: { value: "testuser" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Register" }));
}

describe("RegisterPage", () => {
  it("renders the registration form", () => {
    renderPage();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
  });

  it("navigates to / after a successful registration", async () => {
    authService.registerWithEmail.mockResolvedValue();
    renderPage();
    fillAndSubmit();
    await waitFor(() => expect(screen.getByText("Home")).toBeInTheDocument());
  });

  it("shows an error alert when registration fails", async () => {
    authService.registerWithEmail.mockRejectedValue(
      new Error("Email already in use."),
    );
    renderPage();
    fillAndSubmit();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Email already in use.",
      ),
    );
  });
});
