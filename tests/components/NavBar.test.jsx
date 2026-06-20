import { vi, describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "../../src/components/NavBar";
import { useAuth } from "../../src/context/AuthContext.jsx";

vi.mock("../../src/context/AuthContext.jsx", () => ({
  useAuth: vi.fn(),
}));

function renderNavBar() {
  render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("NavBar", () => {
  it("renders the Dictionary link for unauthenticated users", () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    renderNavBar();
    expect(
      screen.getByRole("link", { name: "Dictionary" }),
    ).toBeInTheDocument();
  });

  it("does not render My patterns when the user is unauthenticated", () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    renderNavBar();
    expect(
      screen.queryByRole("link", { name: "My patterns" }),
    ).not.toBeInTheDocument();
  });

  it("renders My patterns only when the user is authenticated", () => {
    useAuth.mockReturnValue({
      user: { email: "user@example.com", displayName: "Alice" },
      logout: vi.fn(),
    });
    renderNavBar();
    expect(
      screen.getByRole("link", { name: "My patterns" }),
    ).toBeInTheDocument();
  });

  it("renders Log in and Register links when unauthenticated", () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    renderNavBar();
    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
  });

  it("does not render Log in or Register when authenticated", () => {
    useAuth.mockReturnValue({
      user: { email: "user@example.com", displayName: "Alice" },
      logout: vi.fn(),
    });
    renderNavBar();
    expect(
      screen.queryByRole("link", { name: "Log in" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Register" }),
    ).not.toBeInTheDocument();
  });

  it("renders Profile link when the user is authenticated and the menu is opened", () => {
    useAuth.mockReturnValue({
      user: { email: "user@example.com", displayName: "Alice" },
      logout: vi.fn(),
    });
    renderNavBar();
    fireEvent.click(screen.getByRole("button", { name: /alice/i }));
    expect(
      screen.getByRole("menuitem", { name: /profile/i }),
    ).toBeInTheDocument();
  });

  it("closes the dropdown when the Profile link is clicked", () => {
    useAuth.mockReturnValue({
      user: { email: "user@example.com", displayName: "Alice" },
      logout: vi.fn(),
    });
    renderNavBar();
    fireEvent.click(screen.getByRole("button", { name: /alice/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /profile/i }));
    expect(
      screen.queryByRole("menuitem", { name: /profile/i }),
    ).not.toBeInTheDocument();
  });

  it("renders logout option when the user is authenticated and the menu is opened", () => {
    useAuth.mockReturnValue({
      user: { email: "user@example.com", displayName: "Alice" },
      logout: vi.fn(),
    });
    renderNavBar();
    fireEvent.click(screen.getByRole("button", { name: /alice/i }));
    expect(
      screen.getByRole("menuitem", { name: /log out/i }),
    ).toBeInTheDocument();
  });

  it("calls logout when the Log out button is clicked", async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    useAuth.mockReturnValue({
      user: { email: "user@example.com", displayName: "Alice" },
      logout,
    });
    renderNavBar();
    fireEvent.click(screen.getByRole("button", { name: /alice/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("menuitem", { name: /log out/i }));
    });
    expect(logout).toHaveBeenCalledOnce();
  });

  it("uses the email prefix as display name when displayName is null", () => {
    useAuth.mockReturnValue({
      user: { email: "alice@example.com", displayName: null },
      logout: vi.fn(),
    });
    renderNavBar();
    expect(screen.getByRole("button", { name: /alice/i })).toBeInTheDocument();
  });

  it('falls back to "User" when both displayName and email are null', () => {
    useAuth.mockReturnValue({
      user: { email: null, displayName: null },
      logout: vi.fn(),
    });
    renderNavBar();
    expect(screen.getByRole("button", { name: /user/i })).toBeInTheDocument();
  });

  it("renders nothing in the user section while auth is initialising (user === undefined)", () => {
    useAuth.mockReturnValue({ user: undefined, logout: vi.fn() });
    renderNavBar();
    expect(
      screen.queryByRole("link", { name: "Log in" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Register" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the dropdown open when a mousedown occurs inside the user menu", () => {
    useAuth.mockReturnValue({
      user: { email: "user@example.com", displayName: "Alice" },
      logout: vi.fn(),
    });
    renderNavBar();

    const btn = screen.getByRole("button", { name: /alice/i });
    fireEvent.click(btn);
    expect(
      screen.getByRole("menuitem", { name: /log out/i }),
    ).toBeInTheDocument();

    fireEvent.mouseDown(btn);
    expect(
      screen.getByRole("menuitem", { name: /log out/i }),
    ).toBeInTheDocument();
  });

  it("closes the dropdown when a mousedown occurs outside the user menu", () => {
    useAuth.mockReturnValue({
      user: { email: "user@example.com", displayName: "Alice" },
      logout: vi.fn(),
    });
    renderNavBar();

    fireEvent.click(screen.getByRole("button", { name: /alice/i }));
    expect(
      screen.getByRole("menuitem", { name: /log out/i }),
    ).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(
      screen.queryByRole("menuitem", { name: /log out/i }),
    ).not.toBeInTheDocument();
  });
});
