import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RavelryLoginButton from "../../../src/components/auth/RavelryLoginButton";

describe("RavelryLoginButton", () => {
  it("renders a link with the correct Ravelry login URL", () => {
    render(<RavelryLoginButton />);
    const link = screen.getByRole("link", { name: "Continue with Ravelry" });
    expect(link).toHaveAttribute(
      "href",
      `${import.meta.env.VITE_API_URL}/auth/ravelry/login`,
    );
  });
});
