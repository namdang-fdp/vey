import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
const { info, location } = vi.hoisted(() => ({
  info: vi.fn(),
  location: { pathname: "/login" },
}));
vi.mock("next/navigation", () => ({ usePathname: () => location.pathname }));
vi.mock("@/lib/notifications", () => ({ toast: { info } }));
import { NavigationFeedback } from "@/components/feedback/navigation-feedback";

describe("navigation feedback", () => {
  beforeEach(() => {
    info.mockClear();
    location.pathname = "/login";
  });
  it("announces completed in-app navigation once without toasting every render", () => {
    const view = render(<NavigationFeedback />);
    expect(info).not.toHaveBeenCalled();
    location.pathname = "/register";
    view.rerender(<NavigationFeedback />);
    expect(info).toHaveBeenCalledWith("Create account is now open.", {
      title: "Create account",
    });
    view.rerender(<NavigationFeedback />);
    expect(info).toHaveBeenCalledTimes(1);
  });
});
