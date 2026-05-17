import { vi, describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RegisterForm from "../../../src/components/auth/RegisterForm";

function fillForm({ email = "", password = "", username = "" } = {}) {
  if (email)
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: email },
    });
  if (password)
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: password },
    });
  if (username)
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: username },
    });
}

describe("RegisterForm", () => {
  it("disables the submit button when all fields are empty", () => {
    render(<RegisterForm onSubmit={vi.fn()} loading={false} error={null} />);

    expect(screen.getByRole("button", { name: "Register" })).toBeDisabled();
  });

  it("shows an error when email format is invalid", () => {
    render(<RegisterForm onSubmit={vi.fn()} loading={false} error={null} />);

    fillForm({
      email: "not-an-email",
      password: "password123",
      username: "testuser",
    });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(
      screen.getByText("Please enter a valid email address."),
    ).toBeInTheDocument();
  });

  it("shows an error when password is less than 8 characters", () => {
    render(<RegisterForm onSubmit={vi.fn()} loading={false} error={null} />);

    fillForm({
      email: "test@example.com",
      password: "short",
      username: "testuser",
    });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(
      screen.getByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
  });

  it("calls onSubmit with email, password and username when the form is valid", () => {
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} loading={false} error={null} />);

    fillForm({
      email: "test@example.com",
      password: "password123",
      username: "testuser",
    });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
      username: "testuser",
    });
  });

  it("shows the server error alert when error prop is set", () => {
    render(
      <RegisterForm
        onSubmit={vi.fn()}
        loading={false}
        error="Email already registered"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Email already registered",
    );
  });

  it("shows the username already taken error when the server returns it", () => {
    render(
      <RegisterForm
        onSubmit={vi.fn()}
        loading={false}
        error="Username already taken"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Username already taken",
    );
  });

  it("shows an error when username is only whitespace", () => {
    render(<RegisterForm onSubmit={vi.fn()} loading={false} error={null} />);

    fillForm({
      email: "test@example.com",
      password: "password123",
      username: "   ",
    });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(screen.getByText("Username is required.")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toHaveClass("is-invalid");
  });

  it("disables the button and shows spinner while loading", () => {
    render(<RegisterForm onSubmit={vi.fn()} loading={true} error={null} />);

    fillForm({
      email: "test@example.com",
      password: "password123",
      username: "testuser",
    });

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("Registering…")).toBeInTheDocument();
  });
});
