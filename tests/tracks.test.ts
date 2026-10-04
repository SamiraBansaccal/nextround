import { describe, expect, it } from "vitest";
import { findTech } from "@/lib/interview/bank";
import { parseTopic, topicTechs, topicValue, TRACKS, UNTRACKED } from "@/lib/interview/tracks";

describe("practice tracks", () => {
  it("only lists technologies of the question bank, and every bank technology is in a track", () => {
    for (const track of TRACKS) for (const id of track.techs) expect(findTech(id), `${track.id}: ${id}`).toBeDefined();
    expect(UNTRACKED.map((t) => t.id)).toEqual([]);
    expect(new Set(TRACKS.map((t) => t.id)).size).toBe(TRACKS.length);
  });

  it("reads and writes topics, and refuses unknown ones", () => {
    const docker = parseTopic("tech:docker");
    expect(docker && topicTechs(docker).map((t) => t.id)).toEqual(["docker"]);
    expect(docker && topicValue(docker)).toBe("tech:docker");
    expect(parseTopic("track:devops") && topicTechs(parseTopic("track:devops")!).length).toBeGreaterThan(5);
    expect(parseTopic("track:nope")).toBeNull();
    expect(parseTopic("tech:nope")).toBeNull();
    expect(parseTopic(null)).toBeNull();
  });
});
