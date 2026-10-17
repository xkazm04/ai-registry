// The demo-film wire contract: the one place the script, narration manifest and take
// record are typed. narrate/music, the Remotion film and every consumer capture
// adapter read these shapes and nothing else. Erasable TypeScript only, so Node runs
// it directly (type stripping) and Remotion bundles it unchanged.
//
// Conventions: an absent value is an omitted key, never null or 0. Durations are
// integer milliseconds. Coordinates are video pixels of the take.
import { z } from 'zod';

export const Tier = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type Tier = z.infer<typeof Tier>;

/** overlay ~15% motion, sandwich ~30%, led ~60%: one script, three renders. */
export const Balance = z.enum(['overlay', 'sandwich', 'led']);
export type Balance = z.infer<typeof Balance>;
export const MAX_TIER: Record<Balance, Tier> = { overlay: 1, sandwich: 2, led: 3 };

export const Moment = z.object({
  id: z.string(),
  tier: Tier,
  kind: z.enum(['plate', 'hero', 'treatment']),
  /** Plate/treatment name from the kit library, or an export of the consumer's @film/local. */
  component: z.string(),
  props: z.record(z.string(), z.unknown()).default({}),
  /** A capability claim this moment makes; the promise ledger needs footage to back it. */
  claim: z.string().optional(),
  /** "start" | "end" of the beat, or ms into the beat. Default "start". */
  at: z.union([z.literal('start'), z.literal('end'), z.number().int().nonnegative()]).optional(),
  /** Default: to the end of the beat. */
  durMs: z.number().int().positive().optional(),
});
export type Moment = z.infer<typeof Moment>;

export const FilmBeat = z.object({
  id: z.string(),
  chapter: z.string(),
  /** The spoken line, written for the ear. */
  line: z.string(),
  /** Minimum time the picture needs to be legible. */
  settleMs: z.number().int().nonnegative(),
  /** Absent = a pure motion beat (no footage). */
  capture: z
    .object({
      /** The consumer's own beat id that the capture adapter drives. */
      beat: z.string(),
      /** Selectors whose rendered rects the adapter logs for this beat. */
      targets: z.array(z.string()).optional(),
    })
    .optional(),
  moments: z.array(Moment).optional(),
});
export type FilmBeat = z.infer<typeof FilmBeat>;

export const Edge = z.object({ beat: z.string(), edge: z.enum(['start', 'end']) });
export const MusicCue = z.object({
  id: z.string(),
  from: Edge,
  to: Edge,
  prompt: z.string(),
  /** Bed level before ducking. Default -18. */
  gainDb: z.number().optional(),
});
export type MusicCue = z.infer<typeof MusicCue>;

export const StyleLock = z.object({
  palette: z.object({ bg: z.string(), fg: z.string(), accent: z.string(), accent2: z.string(), muted: z.string() }),
  fonts: z.object({ display: z.string(), body: z.string(), mono: z.string() }),
  /** Path relative to the script file. */
  logo: z.string(),
  radius: z.number().nonnegative(),
  easing: z.tuple([z.number(), z.number(), z.number(), z.number()]),
});
export type StyleLock = z.infer<typeof StyleLock>;

export const VoiceSpec = z.object({
  role: z.string().default('narrator'),
  voiceId: z.string().optional(),
  model: z.string().default('eleven_multilingual_v2'),
  settings: z.object({ stability: z.number(), similarity: z.number(), style: z.number() }),
});
export type VoiceSpec = z.infer<typeof VoiceSpec>;

export const FilmScript = z.object({
  title: z.string(),
  fps: z.literal(30).default(30),
  size: z.object({ w: z.number().int(), h: z.number().int() }).default({ w: 1920, h: 1080 }),
  voice: VoiceSpec,
  breathMs: z.number().int().nonnegative().default(350),
  maxMs: z.number().int().positive(),
  music: z.object({ cues: z.array(MusicCue).max(3) }).optional(),
  style: StyleLock,
  beats: z.array(FilmBeat).min(1),
});
export type FilmScript = z.infer<typeof FilmScript>;

/** narrate/music output: <film>/audio/manifest.json */
export const Clip = z.object({ file: z.string(), ms: z.number().int().positive(), hash: z.string() });
export const AudioManifest = z.object({
  clips: z.record(z.string(), Clip),
  music: z.record(z.string(), Clip).default({}),
  /** Beat ids whose timing is an estimate (no current clip). */
  estimated: z.array(z.string()).default([]),
});
export type AudioManifest = z.infer<typeof AudioManifest>;

export const Rect = z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() });
export const TakeBeat = z.object({
  id: z.string(),
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().nonnegative(),
  rects: z.record(z.string(), Rect).default({}),
  clicks: z.array(z.object({ x: z.number(), y: z.number(), atMs: z.number().int().nonnegative() })).default([]),
  /** Values reduced from the run (figures a plate may show). */
  record: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional(),
});
export type TakeBeat = z.infer<typeof TakeBeat>;

/** capture adapter output: <film>/take/take.json. Beat ids are FilmBeat ids. */
export const Take = z.object({
  video: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  fps: z.number(),
  offsetUncertaintyMs: z.number().int().nonnegative(),
  beats: z.array(TakeBeat),
});
export type Take = z.infer<typeof Take>;

/** Spoken-length estimate used when a beat has no current clip. */
export const ESTIMATE_CPS = 15;
export function estimateMs(line: string): number {
  return Math.round((line.length / ESTIMATE_CPS) * 1000);
}

/** holdMs = max(clipMs ?? estimate, settleMs) + breathMs, timed from the beat's action start. */
export function holdMs(beat: FilmBeat, breathMs: number, clipMs?: number): number {
  return Math.max(clipMs ?? estimateMs(beat.line), beat.settleMs) + breathMs;
}

export function momentsFor(beat: FilmBeat, balance: Balance): Moment[] {
  return (beat.moments ?? []).filter((m) => m.tier <= MAX_TIER[balance]);
}

/** Clip identity: a clip belongs to its line only while this hash matches. */
export function clipHashInput(line: string, voice: VoiceSpec, voiceId: string): string {
  const s = voice.settings;
  return [line, voiceId, voice.model, s.stability, s.similarity, s.style].join('|');
}
