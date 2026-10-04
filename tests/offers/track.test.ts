import { describe, expect, it } from "vitest";
import { offerTechIds, offerTrack } from "@/lib/offers/track";

describe("offer track", () => {
  it("finds the technologies of the stack and the title", () => {
    expect(offerTechIds(["Docker", "Kubernetes", "docker"], "DevOps Engineer (Terraform)")).toEqual(["docker", "kubernetes", "terraform"]);
  });

  it("picks the track holding most technologies, common tools counting half", () => {
    expect(offerTrack(["Java", "Spring Boot", "SQL", "Docker", "Git"], "Développeur Java junior")).toBe("java");
    expect(offerTrack(["Java", "Docker", "Git"], "Backend developer")).toBe("java");
    expect(offerTrack(["React", "TypeScript", "Docker"], null)).toBe("web");
    expect(offerTrack(["Docker", "Kubernetes", "Terraform", "Python"], "Cloud engineer")).toBe("devops");
  });

  it("weighs the title: a Python developer using Docker and Kubernetes is a Python offer", () => {
    expect(offerTrack(["Docker", "Kubernetes"], "Python developer")).toBe("languages");
  });

  it("uses foundations only when nothing else is named, and null when nothing is", () => {
    expect(offerTrack(["unit testing", "Scrum"], null)).toBe("foundations");
    expect(offerTrack([], "Stagiaire administratif")).toBeNull();
  });
});
