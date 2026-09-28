import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { protectMock } = vi.hoisted(() => ({ protectMock: vi.fn() }));

vi.mock("@/features/auth/components/sign-out-control", () => ({
  SignOutControl: () => <div data-testid="sign-out-control" />,
}));
vi.mock("@clerk/nextjs/server", () => ({
  auth: { protect: protectMock },
}));
vi.mock("@/components/shell/application-navigation", () => ({
  ApplicationNavigation: () => <nav aria-label="Workspace navigation" />,
}));

import ApplicationLayout from "@/app/(application)/layout";

describe("ApplicationLayout", () => {
  it("protects the application shell before rendering its content", async () => {
    const page = await ApplicationLayout({
      children: <p>Protected content</p>,
    });

    render(page);

    expect(protectMock).toHaveBeenCalledOnce();
    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(screen.getAllByTestId("sign-out-control")).toHaveLength(2);
  });
});
