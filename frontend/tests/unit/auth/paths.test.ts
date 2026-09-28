import { describe, expect, it } from "vitest";
import { safeReturnTo } from "@/features/auth/paths";

describe("safeReturnTo", () => {
  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil",
    "/login",
    "/meetings-evil",
    "/settings\nother",
  ])("rejects %s", (value) => {
    expect(safeReturnTo(value)).toBe("/meetings");
  });

  it("retains internal protected page intent", () => {
    expect(safeReturnTo("/settings?tab=profile#account")).toBe(
      "/settings?tab=profile#account",
    );
  });

  it("rejects duplicate query values", () => {
    expect(safeReturnTo(["/settings", "//evil.example"])).toBe("/meetings");
  });
});
