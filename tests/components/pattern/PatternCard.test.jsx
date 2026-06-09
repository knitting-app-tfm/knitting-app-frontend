import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import PatternCard from "../../../src/components/pattern/PatternCard";
import * as patternService from "../../../src/services/patternService";

vi.mock("../../../src/services/patternService");

const BASE_PATTERN = {
  id: "1",
  title: "My Pattern",
  status: "CONFIRMED",
  craft: "KNITTING",
  cover_image_path: null,
};

function renderCard(pattern = BASE_PATTERN) {
  const router = createMemoryRouter(
    [
      { path: "/", element: <PatternCard pattern={pattern} /> },
      { path: "/patterns/:id/translation", element: <div>Translation</div> },
      { path: "/patterns/:id/confirm", element: <div>Confirm</div> },
    ],
    { initialEntries: ["/"] },
  );
  render(<RouterProvider router={router} />);
}

describe("PatternCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title, craft badge, and status badge", () => {
    renderCard();

    expect(screen.getByText("My Pattern")).toBeInTheDocument();
    expect(screen.getByText("Knitting")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("renders the Edit link pointing to the confirm page", () => {
    renderCard();

    const editLink = screen.getByRole("link", { name: /edit/i });
    expect(editLink).toBeInTheDocument();
    expect(editLink.getAttribute("href")).toBe("/patterns/1/confirm");
  });

  it("does not render a View original link", () => {
    renderCard();

    expect(
      screen.queryByRole("link", { name: /view original/i }),
    ).not.toBeInTheDocument();
  });

  it("enables View translated button when status is CONFIRMED", () => {
    renderCard({ ...BASE_PATTERN, status: "CONFIRMED" });

    expect(
      screen.getByRole("button", { name: /view translated/i }),
    ).not.toBeDisabled();
  });

  it("enables View translated button when status is TOKENIZED", () => {
    renderCard({ ...BASE_PATTERN, status: "TOKENIZED" });

    expect(
      screen.getByRole("button", { name: /view translated/i }),
    ).not.toBeDisabled();
  });

  it("disables View translated button when status is IMPORTED", () => {
    renderCard({ ...BASE_PATTERN, status: "IMPORTED" });

    const btn = screen.getByRole("button", { name: /view translated/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("title", "Confirm the pattern first");
  });

  it("shows spinner while translating and navigates on success", async () => {
    const tokens = [{ type: "text", value: "k2tog" }];
    patternService.translatePattern.mockResolvedValue(tokens);

    renderCard();

    fireEvent.click(screen.getByRole("button", { name: /view translated/i }));

    expect(screen.getByText("Translating…")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("Translation")).toBeInTheDocument(),
    );
  });

  it("shows an error message when translation fails", async () => {
    patternService.translatePattern.mockRejectedValue(
      new Error("Translation failed"),
    );

    renderCard();

    fireEvent.click(screen.getByRole("button", { name: /view translated/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Translation failed"),
    );
  });

  it("shows placeholder when there is no cover image", () => {
    renderCard({ ...BASE_PATTERN, cover_image_path: null });

    expect(document.querySelector(".pc__placeholder")).toBeInTheDocument();
    expect(document.querySelector(".pc__img")).not.toBeInTheDocument();
  });

  it("shows an img when a cover image path is provided", () => {
    renderCard({
      ...BASE_PATTERN,
      cover_image_path: "http://example.com/cover.jpg",
    });

    const img = screen.getByRole("img", { name: "My Pattern" });
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("http://example.com/cover.jpg");
  });

  it("resolves a slash-prefixed relative cover image path against the API base URL", () => {
    renderCard({ ...BASE_PATTERN, cover_image_path: "/media/cover.jpg" });

    const img = screen.getByRole("img", { name: "My Pattern" });
    expect(img.src).toBe("http://localhost:8000/media/cover.jpg");
  });

  it("prepends a slash when the relative cover image path has no leading slash", () => {
    renderCard({ ...BASE_PATTERN, cover_image_path: "media/cover.jpg" });

    const img = screen.getByRole("img", { name: "My Pattern" });
    expect(img.src).toBe("http://localhost:8000/media/cover.jpg");
  });

  it("hides the broken img and reveals the placeholder when the image fails to load", () => {
    renderCard({
      ...BASE_PATTERN,
      cover_image_path: "http://example.com/cover.jpg",
    });

    const img = screen.getByRole("img", { name: "My Pattern" });
    fireEvent.error(img);

    expect(img.style.display).toBe("none");
  });

  it("omits craft badge when craft is null", () => {
    renderCard({ ...BASE_PATTERN, craft: null });

    expect(screen.queryByText("Knitting")).not.toBeInTheDocument();
    expect(screen.queryByText("Crochet")).not.toBeInTheDocument();
  });

  it("renders crochet craft badge", () => {
    renderCard({ ...BASE_PATTERN, craft: "CROCHET" });

    expect(screen.getByText("Crochet")).toBeInTheDocument();
  });

  it("falls back to the raw craft value when it is not in the labels map", () => {
    renderCard({ ...BASE_PATTERN, craft: "WEAVING" });

    expect(screen.getByText("WEAVING")).toBeInTheDocument();
  });

  it("falls back to the raw status value when it is not in the labels map", () => {
    renderCard({ ...BASE_PATTERN, status: "PENDING" });

    expect(screen.getByText("PENDING")).toBeInTheDocument();
  });
});
