import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import PatternListPage from "../../../src/pages/pattern/PatternListPage";
import * as patternService from "../../../src/services/patternService";
import { useAuth } from "../../../src/context/AuthContext.jsx";

vi.mock("../../../src/services/patternService");
vi.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: vi.fn(),
}));

const PATTERNS = [
  {
    id: "1",
    title: "Cozy Scarf",
    status: "CONFIRMED",
    craft: "KNITTING",
    cover_image_path: null,
  },
  {
    id: "2",
    title: "Summer Top",
    status: "IMPORTED",
    craft: "CROCHET",
    cover_image_path: null,
  },
];

function renderPage(user = { uid: "u1", email: "a@b.com" }) {
  useAuth.mockReturnValue({ user });

  const router = createMemoryRouter(
    [
      { path: "/", element: <PatternListPage /> },
      { path: "/patterns/:id/translation", element: <div>Translation</div> },
      { path: "/patterns/:id/confirm", element: <div>Confirm</div> },
    ],
    { initialEntries: ["/"] },
  );
  render(<RouterProvider router={router} />);
}

describe("PatternListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { uid: "u1", email: "a@b.com" } });
  });

  it("shows a loading spinner while fetching", () => {
    patternService.getPatterns.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("stays in loading state while auth is still initializing (user === undefined)", () => {
    patternService.getPatterns.mockReturnValue(new Promise(() => {}));
    renderPage(undefined);

    // Spinner must be visible; patterns must not appear
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Cozy Scarf")).not.toBeInTheDocument();
  });

  it("renders a card for each pattern after loading", async () => {
    patternService.getPatterns.mockResolvedValue(PATTERNS);
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Cozy Scarf")).toBeInTheDocument(),
    );
    expect(screen.getByText("Summer Top")).toBeInTheDocument();
  });

  it("shows the empty state when there are no patterns", async () => {
    patternService.getPatterns.mockResolvedValue([]);
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("No patterns yet")).toBeInTheDocument(),
    );
  });

  it("shows an error alert when the fetch fails", async () => {
    patternService.getPatterns.mockRejectedValue(new Error("Network error"));
    renderPage();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Network error"),
    );
  });

  it("hides the spinner after loading completes", async () => {
    patternService.getPatterns.mockResolvedValue(PATTERNS);
    renderPage();

    await waitFor(() =>
      expect(screen.queryByRole("status")).not.toBeInTheDocument(),
    );
  });
});
