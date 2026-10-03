import { describe, expect, it } from "vitest";
import { formatDay } from "@/lib/dates";

describe("formatDay (Brussels time)", () => {
  it("gives the Brussels calendar day, not the UTC one", () => {
    // 23:30 UTC on 3 October = 01:30 on 4 October in Brussels (UTC+2)
    expect(formatDay(new Date("2026-10-03T23:30:00Z"))).toBe("2026-10-04");
    // winter time (UTC+1): 23:30 UTC on 14 December = 00:30 on 15 December
    expect(formatDay(new Date("2026-12-14T23:30:00Z"))).toBe("2026-12-15");
    expect(formatDay(new Date("2026-10-04T10:00:00Z"))).toBe("2026-10-04");
  });
});
