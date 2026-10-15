import { beforeEach, describe, expect, it, vi } from "vitest";
const { success, error, info } = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}));
vi.mock("goey-toast", () => ({
  gooeyToast: { success, error, info, dismiss: vi.fn() },
}));
import { toast } from "@/lib/notifications";

describe("shared action notifications", () => {
  beforeEach(() => vi.clearAllMocks());
  it("keeps a short error heading and the entire message in the expanded description", () => {
    const message = "Email or password is incorrect.";
    toast.error(message);
    expect(error).toHaveBeenCalledWith(
      "Unable to continue",
      expect.objectContaining({ description: message }),
    );
    expect(error.mock.calls[0][1]).not.toHaveProperty("icon");
  });
  it("retains full informational copy instead of putting it in the fixed-height pill", () => {
    const message =
      "If this address needs verification, a new link is on its way.";
    toast.info(message);
    expect(info).toHaveBeenCalledWith(
      "Information",
      expect.objectContaining({ description: message }),
    );
  });
});
