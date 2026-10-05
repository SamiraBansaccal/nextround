import { describe, expect, it } from "vitest";
import { accessRequestMail } from "@/lib/access/notify";
import { accessRequestSchema } from "@/lib/access/request-form";

// Asking for access to an invite-only instance: what the public form accepts, and the email the owner gets.

describe("the request access form", () => {
  it("accepts an email address, tidied up, with an optional name and message", () => {
    expect(accessRequestSchema.parse({ email: "  Alex@Example.COM " })).toEqual({ email: "alex@example.com", name: "", message: "", website: "" });
    expect(accessRequestSchema.parse({ email: "a@b.co", name: " Alex ", message: " Hi! " })).toMatchObject({ name: "Alex", message: "Hi!" });
  });

  it("refuses anything that is not an email address, and texts that are too long", () => {
    for (const email of ["", "alex", "alex@", "@example.com", "alex example@x.com"]) expect(accessRequestSchema.safeParse({ email }).success, email).toBe(false);
    expect(accessRequestSchema.safeParse({ email: "a@b.co", message: "x".repeat(501) }).success).toBe(false);
    expect(accessRequestSchema.safeParse({ email: "a@b.co", name: "x".repeat(81) }).success).toBe(false);
  });

  it("keeps the hidden field robots fill in, so the request can be ignored", () => {
    expect(accessRequestSchema.parse({ email: "a@b.co", website: "http://spam.example" }).website).toBe("http://spam.example");
  });
});

describe("the email to the owner", () => {
  it("says who asks, with the way to answer, in plain text", () => {
    const mail = accessRequestMail({ email: "alex@example.com", name: "Alex", message: "From the 42 promo" }, "https://nextround.example");
    expect(mail.subject).toBe("NextRound: access request from alex@example.com");
    expect(mail.text).toContain("Alex (alex@example.com) asks for access to NextRound.");
    expect(mail.text).toContain("Message: From the 42 promo");
    expect(mail.text).toContain("https://nextround.example/settings");
    expect(mail.text).toContain("npm run clerk:signup -- allow alex@example.com");
    expect(mail.text).toContain("demande l'accès à NextRound");
  });

  it("gives no link when the site's address is not configured (never one taken from the request)", () => {
    const mail = accessRequestMail({ email: "alex@example.com", name: "", message: "" }, null);
    expect(mail.text).toContain('To answer: Settings, "Access requests"\n');
    expect(mail.text).not.toContain("http");
  });

  it("leaves out the lines the person did not fill in", () => {
    const mail = accessRequestMail({ email: "alex@example.com", name: "", message: "" }, "https://nextround.example");
    expect(mail.text.startsWith("alex@example.com asks for access")).toBe(true);
    expect(mail.text).not.toContain("Name:");
    expect(mail.text).not.toContain("Message:");
  });
});
