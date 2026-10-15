import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PasswordInput } from "@/components/ui/password-input";

vi.mock("@/lib/notifications", () => ({ toast: { info: vi.fn() } }));

describe("password visibility animation lifecycle", () => {
  it("can show, hide and show again without animating an unmounted icon", () => {
    const view = render(
      <PasswordInput
        id="password"
        aria-label="Password"
        defaultValue="Example-test-password"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveValue(
      "Example-test-password",
    );
    view.unmount();
  });
});
