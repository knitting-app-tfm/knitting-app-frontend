import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import PatternTranslationPage from "../../../src/pages/pattern/PatternTranslationPage";

function renderPage(id = "42", state = undefined) {
  const router = createMemoryRouter(
    [
      {
        path: "/patterns/:id/translation",
        element: <PatternTranslationPage />,
      },
    ],
    { initialEntries: [{ pathname: `/patterns/${id}/translation`, state }] },
  );
  render(<RouterProvider router={router} />);
}

describe("PatternTranslationPage", () => {
  it("shows the correct token count from location state", () => {
    renderPage("42", { tokens: [1, 2, 3] });

    expect(
      screen.getByText("Translation view coming soon. Received 3 tokens."),
    ).toBeInTheDocument();
  });

  it("uses singular 'token' when exactly one token is received", () => {
    renderPage("42", { tokens: [1] });

    expect(
      screen.getByText("Translation view coming soon. Received 1 token."),
    ).toBeInTheDocument();
  });

  it("defaults to 0 tokens when rendered without location state", () => {
    renderPage("42");

    expect(
      screen.getByText("Translation view coming soon. Received 0 tokens."),
    ).toBeInTheDocument();
  });

  it("renders a breadcrumb link back to the pattern detail page", () => {
    renderPage("42", { tokens: [] });

    expect(screen.getByRole("link", { name: "Pattern" })).toHaveAttribute(
      "href",
      "/patterns/42",
    );
  });
});
