import { describe, expect, it } from "vitest";
import { offerTechIds, primaryTrack } from "@/lib/offers/track";

describe("offer track", () => {
  it("finds the technologies of the stack and the title", () => {
    expect(offerTechIds(["Docker", "Kubernetes", "docker"], "DevOps Engineer (Terraform)")).toEqual(["docker", "kubernetes", "terraform"]);
  });

  it("picks the track holding most technologies", () => {
    expect(primaryTrack(["java", "spring", "sql", "docker"])).toBe("java");
    expect(primaryTrack(["react", "typescript", "docker"])).toBe("web");
    expect(primaryTrack(["docker", "kubernetes", "python"])).toBe("devops");
  });

  it("uses foundations only when nothing else is named, and null when nothing is", () => {
    expect(primaryTrack(["testing", "agile"])).toBe("foundations");
    expect(primaryTrack(["testing", "python"])).toBe("languages");
    expect(primaryTrack([])).toBeNull();
  });
});
