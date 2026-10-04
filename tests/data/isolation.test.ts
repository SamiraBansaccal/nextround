import { beforeAll, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/tests/helpers/test-db";

// Data isolation check: user B must not be able to read or modify user A's data,
// even when B knows (or guesses) the id of A's row.

let testDb: Awaited<ReturnType<typeof createTestDb>>;
vi.mock("@/lib/db", () => ({ getDb: () => testDb }));

const { createFact, deleteFact, getFact, listFacts, updateFact } = await import("@/lib/data/facts");

const USER_A = "user_alice";
const USER_B = "user_bob";

describe("data isolation between users", () => {
  let factOfA: Awaited<ReturnType<typeof createFact>>;

  beforeAll(async () => {
    testDb = await createTestDb();
    factOfA = await createFact(USER_A, {
      type: "project",
      text: "Built a weather app in React",
      source: "manual",
    });
  });

  it("A can read their own fact", async () => {
    expect(await getFact(USER_A, factOfA.id)).toMatchObject({ id: factOfA.id, userId: USER_A });
  });

  it("B cannot read A's fact by id", async () => {
    expect(await getFact(USER_B, factOfA.id)).toBeNull();
  });

  it("B's list does not contain A's fact", async () => {
    expect(await listFacts(USER_B)).toEqual([]);
  });

  it("B cannot modify A's fact by id", async () => {
    expect(await updateFact(USER_B, factOfA.id, { text: "hacked", validated: true })).toBeNull();
    const unchanged = await getFact(USER_A, factOfA.id);
    expect(unchanged).toMatchObject({ text: "Built a weather app in React", validated: false });
  });

  it("B cannot delete A's fact by id", async () => {
    expect(await deleteFact(USER_B, factOfA.id)).toBe(false);
    expect(await getFact(USER_A, factOfA.id)).not.toBeNull();
  });

  it("a malformed id is rejected without querying", async () => {
    expect(await getFact(USER_A, "1 OR 1=1")).toBeNull();
    expect(await deleteFact(USER_A, "../../etc")).toBe(false);
  });

  it("A can still modify and delete their own fact", async () => {
    expect(await updateFact(USER_A, factOfA.id, { validated: true })).toMatchObject({ validated: true });
    expect(await deleteFact(USER_A, factOfA.id)).toBe(true);
  });
});
