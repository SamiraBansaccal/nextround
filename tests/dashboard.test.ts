import { describe, expect, it } from "vitest";
import { dashboardGreeting } from "@/lib/dashboard";

describe("dashboard greeting (Brussels time)", () => {
  it("says good morning before noon in Brussels, even when UTC is still the previous hour", () => {
    // 2026-10-04 07:30 UTC = 09:30 in Brussels (UTC+2 in October)
    expect(dashboardGreeting("Samira", new Date("2026-10-04T07:30:00Z"))).toEqual({ eyebrow: "SUNDAY 4 OCTOBER", title: "Good morning, Samira" });
  });
  it("switches to afternoon and evening", () => {
    expect(dashboardGreeting("Sam", new Date("2026-10-04T12:00:00Z")).title).toBe("Good afternoon, Sam"); // 14:00
    expect(dashboardGreeting("Sam", new Date("2026-10-04T17:30:00Z")).title).toBe("Good evening, Sam"); // 19:30
  });
  it("speaks the site's language", () => {
    expect(dashboardGreeting("Samira", new Date("2026-10-04T07:30:00Z"), "fr")).toEqual({ eyebrow: "DIMANCHE 4 OCTOBRE", title: "Bonjour Samira" });
  });
});
