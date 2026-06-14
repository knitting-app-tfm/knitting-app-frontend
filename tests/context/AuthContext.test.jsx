import { vi, describe, it, expect, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../src/context/AuthContext.jsx";

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("../../src/services/firebase", () => ({
  auth: {},
}));

import { onAuthStateChanged, signOut } from "firebase/auth";

function TestConsumer() {
  const { user } = useAuth();
  if (user === undefined) return <div data-testid="state">loading</div>;
  if (user === null) return <div data-testid="state">logged-out</div>;
  return <div data-testid="state">{user.email}</div>;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("AuthProvider", () => {
  it("renders children correctly", () => {
    onAuthStateChanged.mockReturnValue(() => {});
    render(
      <AuthProvider>
        <div>Child content</div>
      </AuthProvider>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("useAuth returns undefined while Firebase is still resolving", () => {
    onAuthStateChanged.mockReturnValue(() => {});
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("loading");
  });

  it("useAuth returns the user object after Firebase resolves with a user", async () => {
    let firebaseCallback;
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      firebaseCallback = cb;
      return () => {};
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      firebaseCallback({ email: "test@example.com" });
    });

    expect(screen.getByTestId("state")).toHaveTextContent("test@example.com");
  });

  it("useAuth returns null after logout (Firebase calls back with null)", async () => {
    let firebaseCallback;
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      firebaseCallback = cb;
      return () => {};
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      firebaseCallback({ email: "test@example.com" });
    });
    expect(screen.getByTestId("state")).toHaveTextContent("test@example.com");

    await act(async () => {
      firebaseCallback(null);
    });
    expect(screen.getByTestId("state")).toHaveTextContent("logged-out");
  });

  it("logout calls signOut with the auth instance", () => {
    onAuthStateChanged.mockReturnValue(() => {});
    signOut.mockResolvedValue(undefined);

    function LogoutButton() {
      const { logout } = useAuth();
      return <button onClick={logout}>Logout</button>;
    }

    render(
      <AuthProvider>
        <LogoutButton />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(signOut).toHaveBeenCalledWith({});
  });
});
