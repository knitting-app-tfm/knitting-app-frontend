import { vi, describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginForm from "../../../src/components/auth/LoginForm";

function fillForm({ email = "", password = "" } = {}) {
  if (email)
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: email },
    });
  if (password)
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: password },
    });
}

describe("LoginForm", () => {
  it("disables the submit button when all fields are empty", () => {
    render(<LoginForm onSubmit={vi.fn()} loading={false} error={null} />);

    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
  });

  it("shows an error when email is empty on submit", () => {
    const { container } = render(
      <LoginForm onSubmit={vi.fn()} loading={false} error={null} />,
    );

    fillForm({ password: "password123" });
    fireEvent.submit(container.querySelector("form"));

    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveClass("is-invalid");
  });

  it("shows an error when email format is invalid", () => {
    render(<LoginForm onSubmit={vi.fn()} loading={false} error={null} />);

    fillForm({ email: "not-an-email", password: "password123" });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      screen.getByText("Please enter a valid email address"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveClass("is-invalid");
  });

  it("shows an error when password is empty on submit", () => {
    const { container } = render(
      <LoginForm onSubmit={vi.fn()} loading={false} error={null} />,
    );

    fillForm({ email: "test@example.com" });
    fireEvent.submit(container.querySelector("form"));

    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveClass("is-invalid");
  });

  it("calls onSubmit with email and password when the form is valid", () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} loading={false} error={null} />);

    fillForm({ email: "test@example.com", password: "password123" });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("does not call onSubmit when validation fails", () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} loading={false} error={null} />);

    fillForm({ email: "not-an-email", password: "password123" });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows the server error alert when error prop is set", () => {
    render(
      <LoginForm
        onSubmit={vi.fn()}
        loading={false}
        error="Incorrect email or password."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Incorrect email or password.",
    );
  });

  it("disables the button and shows spinner while loading", () => {
    render(<LoginForm onSubmit={vi.fn()} loading={true} error={null} />);

    fillForm({ email: "test@example.com", password: "password123" });

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("Signing in…")).toBeInTheDocument();
  });
});
