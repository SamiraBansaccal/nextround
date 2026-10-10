import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Who may use the app (lib/server/auth.ts, ADR 0028): for now the owner only, recognised by the GitHub account
// linked through OAuth (numeric id OWNER_GITHUB_ID). Anyone else signed in is sent to the not-invited page before
// any data is read; nobody signed in is refused.

let session: { user: Record<string, unknown> } | null = null;
let linkedGithubIds: string[] = [];

vi.mock("@/lib/server/neon-auth", () => ({ neonAuth: () => ({ getSession: async () => ({ data: session }) }) }));
vi.mock("@/lib/db", () => ({
  getDb: () => ({
    select: () => ({ from: () => ({ where: () => ({ limit: async () => linkedGithubIds.map((accountId) => ({ accountId })) }) }) }),
  }),
}));
vi.mock("@/lib/profile/github", () => ({ githubLoginForId: async () => "octo-owner" }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT ${path}`);
  },
}));

const OWNER_GITHUB_ID = "4242";

async function loadAuth(ownerGithubId = OWNER_GITHUB_ID) {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "postgresql://test");
  vi.stubEnv("NEON_AUTH_BASE_URL", "https://auth.example.test/neondb/auth");
  vi.stubEnv("NEON_AUTH_COOKIE_SECRET", "a-test-cookie-secret-of-32-characters!");
  vi.stubEnv("APP_ENCRYPTION_KEY", "key");
  vi.stubEnv("OWNER_GITHUB_ID", ownerGithubId);
  return import("@/lib/server/auth");
}

const signIn = (user: Partial<{ id: string; name: string; email: string; emailVerified: boolean; image: string | null }> = {}) => {
  session = { user: { id: "8a6e0c1e-0000-4000-8000-000000000001", name: "Ada Lovelace", email: "ada@example.com", emailVerified: true, image: null, ...user } };
};

beforeEach(() => {
  session = null;
  linkedGithubIds = [];
});
afterEach(() => vi.unstubAllEnvs());

describe("access", () => {
  it("lets the owner in, recognised by the GitHub account linked to the session", async () => {
    signIn();
    linkedGithubIds = [OWNER_GITHUB_ID];
    const auth = await loadAuth();
    await expect(auth.requireUserId()).resolves.toBe("8a6e0c1e-0000-4000-8000-000000000001");
    const account = await auth.getAccount();
    expect(account).toMatchObject({ isOwner: true, githubLogin: "octo-owner", displayName: "Ada", fullName: "Ada Lovelace" });
  });

  it("sends any other signed-in account to the not-invited page before it reads data", async () => {
    signIn();
    linkedGithubIds = ["9999"]; // a GitHub account, but not the owner's
    const auth = await loadAuth();
    await expect(auth.requireUserId()).rejects.toThrow(`REDIRECT ${auth.NOT_INVITED_PATH}`);
    await expect(auth.getAccount()).rejects.toThrow("REDIRECT");
  });

  it("does not take a Google account with the owner's name or address for the owner", async () => {
    signIn({ name: "Owner", email: "owner@example.com" });
    linkedGithubIds = []; // signed in with Google: no GitHub account linked
    const auth = await loadAuth();
    expect(await auth.getAccess()).toMatchObject({ isOwner: false, allowed: false });
  });

  it("refuses everyone when no owner is configured (fail closed)", async () => {
    signIn();
    linkedGithubIds = [OWNER_GITHUB_ID];
    const auth = await loadAuth("");
    expect(await auth.getAccess()).toMatchObject({ isOwner: false, allowed: false });
  });

  it("refuses a request without a session", async () => {
    const auth = await loadAuth();
    expect(await auth.getAccess()).toBeNull();
    await expect(auth.requireUserId()).rejects.toBeInstanceOf(auth.UnauthorizedError);
  });
});
