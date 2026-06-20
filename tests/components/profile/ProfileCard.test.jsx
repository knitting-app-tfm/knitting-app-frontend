import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ProfileCard from "../../../src/components/profile/ProfileCard";
import * as apiClient from "../../../src/services/apiClient";

vi.mock("../../../src/services/apiClient");

function renderCard() {
  render(<ProfileCard />);
}

describe("ProfileCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading spinner while fetching", () => {
    apiClient.apiFetch.mockReturnValue(new Promise(() => {}));
    renderCard();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders username and email on successful fetch", async () => {
    apiClient.apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ username: "alice", email: "alice@example.com" }),
    });
    renderCard();

    await waitFor(() => expect(screen.getByText("alice")).toBeInTheDocument());
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("shows Logged in with Ravelry and hides the email field for Ravelry users", async () => {
    apiClient.apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ username: "ainapolo", email: null }),
    });
    renderCard();

    await waitFor(() =>
      expect(screen.getByText("ainapolo")).toBeInTheDocument(),
    );
    expect(screen.getByText("Logged in with Ravelry")).toBeInTheDocument();
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
  });

  it("hides the spinner after loading completes", async () => {
    apiClient.apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ username: "alice", email: "alice@example.com" }),
    });
    renderCard();

    await waitFor(() =>
      expect(screen.queryByRole("status")).not.toBeInTheDocument(),
    );
  });

  it("shows an error alert when the fetch returns a non-ok response", async () => {
    apiClient.apiFetch.mockResolvedValue({ ok: false });
    renderCard();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Failed to load profile.",
      ),
    );
  });

  it("shows an error alert when the fetch rejects", async () => {
    apiClient.apiFetch.mockRejectedValue(new Error("Network error"));
    renderCard();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Network error"),
    );
  });
});
