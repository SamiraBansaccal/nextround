// Generates an interviewer's avatar material with the ElevenLabs Image & Video API and voices API.
// (ElevenLabs "Avatars" have no API yet, so the identity is carried by the prepared references and a
// fixed "set still": the character in its setting, framed like a webcam. Every clip starts from it.)
//
//   npm run avatars:el -- set <id>                 the set still (1 image generation)
//   npm run avatars:el -- voice <id> [preview#]    design the voice (3 previews), save one as a voice
//   npm run avatars:el -- say <id> <name> <text>   text to speech with the character's voice
//   npm run avatars:el -- clip <id> <clip-id> [audio-name]   one clip from characters/<id>/clip-plan.json
//   npm run avatars:el -- test <id>                the test set: still, voice, 4 short clips
// Needs ELEVENLABS_API_KEY (Pro plan or above, with the Image & Video permission). Outputs and ids
// are stored under characters/<id>/ (elevenlabs.json keeps generation and voice ids).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { findInterviewer } from "@/lib/interviewers";
import { CHARACTER_PACKS } from "@/lib/interviewers/flavor";

if (existsSync(".env")) process.loadEnvFile(".env");
const KEY = process.env.ELEVENLABS_API_KEY;
const API = "https://api.elevenlabs.io";
const DRY = process.env.DRY_RUN === "1"; // print the requests, spend nothing

interface State { setStill?: string; voiceId?: string; generations: Record<string, string> }
const dir = (id: string) => `characters/${id}`;
const stateOf = (id: string): State => (existsSync(`${dir(id)}/elevenlabs.json`) ? JSON.parse(readFileSync(`${dir(id)}/elevenlabs.json`, "utf8")) : { generations: {} });
const saveState = (id: string, s: State) => DRY || writeFileSync(`${dir(id)}/elevenlabs.json`, JSON.stringify(s, null, 1) + "\n");

async function call(path: string, body?: unknown): Promise<Response> {
  if (!KEY && !DRY) throw new Error("ELEVENLABS_API_KEY is not set (cloud environment variables, or .env on your machine).");
  if (DRY) {
    const shown = JSON.stringify(body, (k, v) => (k === "content_base64" ? `<${Math.round(String(v).length * 0.75 / 1024)} KB>` : v));
    console.log(`DRY ${body ? "POST" : "GET"} ${path} ${shown?.slice(0, 900) ?? ""}`);
    return new Response(JSON.stringify({ id: "dry", status: "completed", content_url: "", previews: [] }));
  }
  const response = await fetch(`${API}${path}`, {
    method: body ? "POST" : "GET",
    headers: { "xi-api-key": KEY!, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`${path}: ${response.status} ${(await response.text()).slice(0, 400)}`);
  return response;
}

const inline = (file: string) => ({
  type: "inline_base64",
  content_base64: DRY && !existsSync(file) ? "" : readFileSync(file).toString("base64"),
  mime_type: file.endsWith(".mp3") ? "audio/mpeg" : file.endsWith(".wav") ? "audio/wav" : "image/png",
});

/** Submits a generation, waits for it, downloads the result. */
async function generate(kind: "image" | "video", body: object, out: string): Promise<string> {
  const { id } = (await (await call(`/v1/flows/${kind}`, body)).json()) as { id: string };
  if (DRY) return id;
  process.stdout.write(`${out}: generating (${id})`);
  for (let waited = 0; waited < 20 * 60; waited += 6) {
    await new Promise((r) => setTimeout(r, 6000));
    const g = (await (await call(`/v1/flows/${kind}/${id}`)).json()) as { status: string; content_url?: string; error_message?: string };
    if (g.status === "completed") {
      writeFileSync(out, Buffer.from(await (await fetch(g.content_url!)).arrayBuffer()));
      console.log(" done");
      return id;
    }
    if (g.status === "failed") throw new Error(`${out}: generation failed (not charged): ${g.error_message}`);
    process.stdout.write(".");
  }
  throw new Error(`${out}: still not done after 20 minutes (generation ${id}).`);
}

function interviewer(id: string) {
  const i = findInterviewer(id);
  if (!i) throw new Error(`Unknown interviewer: ${id}`);
  return i;
}

async function setStill(id: string) {
  const i = interviewer(id);
  const perf = existsSync(`${dir(id)}/performance.json`) ? JSON.parse(readFileSync(`${dir(id)}/performance.json`, "utf8")) : {};
  const refs = [`${dir(id)}/master_reference.png`, ...[1, 2, 3, 4].map((n) => `${dir(id)}/references/reference_0${n}.png`).filter(existsSync)];
  const prompt =
    `${i.name}, exactly as in the reference images (same design, proportions, colours, outfit${perf.look ? `: ${perf.look}` : ""}, same art style), ` +
    `as a job interviewer on a video call, ${perf.setting ?? "seated at a desk in an office"}. ` +
    `Webcam framing: 16:9, chest-up, centred, facing the camera, eyes looking at the camera, neutral closed-mouth expression, hands resting. ` +
    `Soft even lighting, background in the same art style, slightly simpler than the character. No text, no logo, no watermark, nobody else.`;
  const s = stateOf(id);
  s.setStill = await generate("image", { model_id: "gemini-3-pro-image", prompt, aspect_ratio: "16:9", resolution: "2K", images: refs.map(inline) }, `${dir(id)}/set_still.png`);
  saveState(id, s);
}

async function voice(id: string, pick?: number) {
  const i = interviewer(id);
  mkdirSync(`${dir(id)}/voice`, { recursive: true });
  const s = stateOf(id);
  const description =
    `Voice of a cartoon character: ${i.voice.style}. Personality: ${i.personality}; speaks with ${i.vocabulary.toLowerCase()} vocabulary. ` +
    `A job interviewer. Original voice, clear diction, studio quality, works in English and French.`;
  const pack = CHARACTER_PACKS[id];
  const lines = pack ? Object.values(pack).flat().map((l) => l.en) : [];
  const text = [...lines, "Tell me about a project you are proud of, and what you would do differently today. Take your time, I'm listening."].join(" ").slice(0, 900).padEnd(110, ".");
  const design = (await (await call("/v1/text-to-voice/design", { voice_description: description, text, model_id: "eleven_multilingual_ttv_v2", guidance_scale: 4 })).json()) as {
    previews: { generated_voice_id: string; audio_base_64: string }[];
  };
  if (DRY) return;
  design.previews.forEach((p, n) => writeFileSync(`${dir(id)}/voice/preview_${n + 1}.mp3`, Buffer.from(p.audio_base_64, "base64")));
  const chosen = design.previews[(pick ?? 1) - 1];
  if (!chosen) return;
  const created = (await (await call("/v1/text-to-voice", { voice_name: `NextRound - ${i.name}`, voice_description: description, generated_voice_id: chosen.generated_voice_id, labels: { app: "nextround", interviewer: id } })).json()) as { voice_id: string };
  s.voiceId = created.voice_id;
  saveState(id, s);
  console.log(`${id}: voice ${created.voice_id} (preview ${pick ?? 1} of ${design.previews.length}, all in ${dir(id)}/voice/)`);
}

async function say(id: string, name: string, text: string) {
  const s = stateOf(id);
  if (!s.voiceId && !DRY) throw new Error(`${id}: no voice yet, run: voice ${id}`);
  if (DRY) return void (await call(`/v1/text-to-speech/${s.voiceId}`, { text }));
  mkdirSync(`${dir(id)}/audio`, { recursive: true });
  const audio = await call(`/v1/text-to-speech/${s.voiceId}?output_format=mp3_44100_128`, { text, model_id: "eleven_multilingual_v2" });
  writeFileSync(`${dir(id)}/audio/${name}.mp3`, Buffer.from(await audio.arrayBuffer()));
  writeFileSync(`${dir(id)}/audio/${name}.txt`, text + "\n");
}

const seconds = (file: string) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }));

async function clip(id: string, clipId: string, audioName?: string) {
  const plan = JSON.parse(readFileSync(`${dir(id)}/clip-plan.json`, "utf8")) as { id: string; seconds: number; loop: boolean; voice: boolean; prompt: string }[];
  const c = plan.find((p) => p.id === clipId);
  if (!c) throw new Error(`${id}: no clip "${clipId}" in clip-plan.json`);
  const still = `${dir(id)}/set_still.png`;
  if (!existsSync(still) && !DRY) throw new Error(`${id}: no set still yet, run: set ${id}`);
  mkdirSync(`${dir(id)}/clips`, { recursive: true });
  const out = `${dir(id)}/clips/${clipId}${audioName ? `--${audioName}` : ""}.mp4`;
  const common = { model_id: "bytedance-seedance-v2", aspect_ratio: "16:9", resolution: "720p", generate_audio: false };
  let body: object;
  if (c.voice) {
    if (!audioName) throw new Error(`${clipId} is a speaking clip: give the audio name (from: say ${id} <name> <text>)`);
    const audio = `${dir(id)}/audio/${audioName}.mp3`;
    const length = DRY ? 4 : Math.min(10, Math.max(3, Math.ceil(seconds(audio) + 0.6)));
    // Audio references cannot be combined with start/end frames: the still and the master are subject references.
    body = { ...common, prompt: c.prompt, duration_secs: length, images: [inline(still), inline(`${dir(id)}/master_reference.png`)], audios: [inline(audio)] };
  } else {
    // Starts (and, for loops, ends) on the set still: every clip chains with every other.
    body = { ...common, prompt: c.prompt, duration_secs: c.seconds, start_frame: inline(still), ...(c.loop ? { end_frame: inline(still) } : {}) };
  }
  const s = stateOf(id);
  s.generations[out] = await generate("video", body, out);
  saveState(id, s);
  if (c.voice && !DRY) {
    // Put the exact TTS audio on the clip (lip-sync was driven by it), so what you hear is the real voice.
    const tmp = `${out}.tmp.mp4`;
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", out, "-i", `${dir(id)}/audio/${audioName}.mp3`, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-shortest", tmp]);
    execFileSync("mv", [tmp, out]);
  }
}

async function test(id: string) {
  const s = stateOf(id);
  if (!existsSync(`${dir(id)}/set_still.png`) || DRY) await setStill(id);
  if (!s.voiceId || DRY) await voice(id);
  const pack = CHARACTER_PACKS[id];
  const greeting = [pack?.greetings?.[0]?.fr, pack?.openers?.[0]?.fr?.replace(/\{([^|}]*)\|[^}]*\}/g, "$1")].filter(Boolean).join(" ");
  await say(id, "greeting-fr", greeting || "Bonjour. Asseyez-vous, nous allons commencer.");
  for (const c of ["idle-breathing", "listen-nod", "react-satisfaction"]) await clip(id, c);
  await clip(id, "speak-neutral", "greeting-fr");
}

const [command, id, ...rest] = process.argv.slice(2);
if (!id) {
  console.error("Usage: npm run avatars:el -- set|voice|say|clip|test <id> …");
  process.exit(1);
}
if (command === "set") await setStill(id);
else if (command === "voice") await voice(id, rest[0] ? Number(rest[0]) : undefined);
else if (command === "say") await say(id, rest[0], rest.slice(1).join(" "));
else if (command === "clip") await clip(id, rest[0], rest[1]);
else if (command === "test") await test(id);
else console.error(`Unknown command: ${command}`);
