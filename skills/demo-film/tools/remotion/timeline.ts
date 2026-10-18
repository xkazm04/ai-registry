// The film's one clock. Every frame number the film, the checks and the render gates use is
// derived here and only here, as a pure function of (script, manifest, take, balance).
//
// Erasable TypeScript only: Node imports this file directly (check.mjs, tests) and Remotion
// bundles it unchanged.
import {
  type AudioManifest,
  type Balance,
  type FilmBeat,
  type FilmScript,
  type Moment,
  type Take,
  type TakeBeat,
  holdMs,
  momentsFor,
} from '../src/contract.ts';

export const FPS = 30;
/** Sound leads picture at chapter turns: the turn beat's voice starts this many frames early. */
export const LEAD_FRAMES = 15;
/** Music sits this much further down while any voice clip plays. */
export const DUCK_DB = 9;
export const DUCK_RAMP_MS = 150;
export const MUSIC_DEFAULT_DB = -18;
export const MUSIC_FADE_IN_MS = 300;
export const MUSIC_FADE_OUT_MS = 1000;
export const TRANSITION_DEFAULT_MS = 500;
/** Default length of a moment anchored at "end" without its own durMs. */
export const END_MOMENT_DEFAULT_MS = 1500;
/** The whoosh is spotted so its peak lands on the cut. */
export const WHOOSH_LEAD_MS = 350;

/** Between-beat transitions; declared as a moment on the incoming beat. */
export const TRANSITIONS = ['WhipPan', 'ZoomThrough', 'MaskWipe'] as const;
/** Treatments that transform the footage itself (picture lane). */
export const PICTURE_TREATMENTS = ['ZoomToRect', 'DeviceFrame'] as const;
/** Treatments drawn over the footage, mapped into screen space (motion lane). */
export const OVERLAY_TREATMENTS = ['CursorSpotlight', 'ClickRipple'] as const;
/** Components that anchor to a logged take rect through props.selector. */
export const RECT_COMPONENTS = ['Callout', 'ZoomToRect'] as const;
/** Components that only make sense over footage. */
export const FOOTAGE_COMPONENTS = ['Callout', 'ZoomToRect', 'DeviceFrame', 'CursorSpotlight', 'ClickRipple'] as const;

export type Role = 'plate' | 'hero' | 'picture' | 'overlay' | 'transition';

export type TTransition = {
  momentId: string;
  component: string;
  /** Frames on EACH side of the cut: the outgoing beat animates out over its last `half`
   *  frames, the incoming beat animates in over its first `half`. No overlap, no frames added. */
  half: number;
  props: Record<string, unknown>;
};

export type TFootage = {
  src: string;
  /** First source frame (composition fps) of this beat's take window. */
  trimBefore: number;
  /** Frames of real footage in the window; past this the last frame is held (freeze). */
  availFrames: number;
};

export type TBeat = {
  id: string;
  index: number;
  chapter: string;
  line: string;
  holdMs: number;
  /** Film-clock ms at the beat's picture start. */
  startMs: number;
  startFrame: number;
  durFrames: number;
  endFrame: number;
  chapterTurn: boolean;
  estimated: boolean;
  capture: boolean;
  footage?: TFootage;
  takeBeat?: TakeBeat;
  transitionIn?: TTransition;
  transitionOut?: TTransition;
};

export type TMoment = {
  id: string;
  beatId: string;
  beatIndex: number;
  kind: Moment['kind'];
  role: Role;
  component: string;
  tier: number;
  props: Record<string, unknown>;
  claim?: string;
  /** ms into the beat */
  atMs: number;
  durMs: number;
  startFrame: number;
  durFrames: number;
  startsAtBeatStart: boolean;
  endsAtBeatEnd: boolean;
};

export type TVoice = { beatId: string; file: string; ms: number; from: number; durFrames: number; leadFrames: number };
export type TMusic = {
  cueId: string;
  file: string;
  ms: number;
  gainDb: number;
  from: number;
  /** Frame (absolute) of the cue's `to` edge; the fade-out starts here or earlier at film end. */
  toFrame: number;
  durFrames: number;
  fadeInFrames: number;
  fadeOutStart: number;
  fadeOutFrames: number;
};
export type TFx = { kind: 'whoosh'; from: number; beatId: string; component: string };

export type Timeline = {
  fps: number;
  width: number;
  height: number;
  balance: Balance;
  totalFrames: number;
  totalMs: number;
  beats: TBeat[];
  moments: TMoment[];
  voice: TVoice[];
  music: TMusic[];
  /** Absolute [from, to) frame spans during which some voice clip plays. */
  voiceSpans: [number, number][];
  fx: TFx[];
  /** Non-fatal notes found while building (missing files, clamped values). check.mjs reports them. */
  notes: string[];
};

export const msToFrames = (ms: number, fps = FPS): number => Math.round((ms * fps) / 1000);
export const framesToMs = (f: number, fps = FPS): number => Math.round((f * 1000) / fps);

export function roleOf(m: Pick<Moment, 'kind' | 'component'>): Role {
  if ((TRANSITIONS as readonly string[]).includes(m.component)) return 'transition';
  if (m.kind === 'treatment') {
    if ((PICTURE_TREATMENTS as readonly string[]).includes(m.component)) return 'picture';
    return 'overlay';
  }
  return m.kind === 'hero' ? 'hero' : 'plate';
}

/** Resolve a moment's window inside its beat (ms). Pure; exported for the collision checks. */
export function momentWindow(m: Moment, hold: number): { atMs: number; durMs: number } {
  if (roleOf(m) === 'transition') return { atMs: 0, durMs: m.durMs ?? TRANSITION_DEFAULT_MS };
  if (m.at === 'end') {
    const dur = m.durMs ?? Math.min(END_MOMENT_DEFAULT_MS, hold);
    return { atMs: hold - dur, durMs: dur };
  }
  const at = typeof m.at === 'number' ? m.at : 0;
  return { atMs: at, durMs: m.durMs ?? Math.max(1, hold - at) };
}

export type TimelineInput = {
  script: FilmScript;
  manifest?: AudioManifest;
  take?: Take;
  balance: Balance;
};

export function buildTimeline({ script, manifest, take, balance }: TimelineInput): Timeline {
  const fps = script.fps ?? FPS;
  const notes: string[] = [];
  const clips = manifest?.clips ?? {};
  const estimatedSet = new Set(manifest?.estimated ?? []);

  // 1. picture clock: cumulative ms rounded once per edge, so frame drift never accumulates
  const beats: TBeat[] = [];
  let cumMs = 0;
  script.beats.forEach((b: FilmBeat, index: number) => {
    const clip = clips[b.id];
    const estimated = !clip || estimatedSet.has(b.id);
    const hold = holdMs(b, script.breathMs, estimated ? undefined : clip.ms);
    const startFrame = msToFrames(cumMs, fps);
    const endFrame = msToFrames(cumMs + hold, fps);
    const prev = script.beats[index - 1];
    const beat: TBeat = {
      id: b.id,
      index,
      chapter: b.chapter,
      line: b.line,
      holdMs: hold,
      startMs: cumMs,
      startFrame,
      durFrames: Math.max(1, endFrame - startFrame),
      endFrame,
      chapterTurn: index > 0 && prev !== undefined && prev.chapter !== b.chapter,
      estimated,
      capture: Boolean(b.capture),
    };
    if (b.capture) {
      const tb = take?.beats.find((t) => t.id === b.id);
      if (tb) {
        beat.takeBeat = tb;
        beat.footage = {
          src: take!.video,
          trimBefore: msToFrames(tb.startMs, fps),
          availFrames: Math.max(1, msToFrames(tb.endMs - tb.startMs, fps)),
        };
        if (beat.footage.availFrames < beat.durFrames)
          notes.push(`beat ${b.id}: take window ${tb.endMs - tb.startMs} ms < hold ${hold} ms, last frame held ${beat.durFrames - beat.footage.availFrames} frames`);
      } else {
        notes.push(`beat ${b.id}: capture beat has no take beat`);
      }
    }
    beats.push(beat);
    cumMs += hold;
  });
  const totalFrames = beats.length ? beats[beats.length - 1].endFrame : 0;

  // 2. moments in this balance, resolved to absolute frames
  const moments: TMoment[] = [];
  script.beats.forEach((b, index) => {
    const beat = beats[index];
    for (const m of momentsFor(b, balance)) {
      const role = roleOf(m);
      const w = momentWindow(m, beat.holdMs);
      if (role === 'transition') {
        if (index === 0) {
          notes.push(`beat ${b.id}: transition ${m.id} on the first beat has nothing to cut from; ignored`);
          continue;
        }
        const prev = beats[index - 1];
        const want = Math.max(2, msToFrames(w.durMs, fps));
        // each half fits inside both beats (at most half of either beat)
        const half = Math.max(1, Math.min(Math.round(want / 2), Math.floor(prev.durFrames / 2), Math.floor(beat.durFrames / 2)));
        const t: TTransition = { momentId: m.id, component: m.component, half, props: m.props ?? {} };
        beat.transitionIn = t;
        prev.transitionOut = t;
        moments.push({
          id: m.id, beatId: b.id, beatIndex: index, kind: m.kind, role, component: m.component, tier: m.tier,
          props: m.props ?? {}, ...(m.claim ? { claim: m.claim } : {}),
          atMs: 0, durMs: w.durMs, startFrame: beat.startFrame - half, durFrames: 2 * half,
          startsAtBeatStart: true, endsAtBeatEnd: false,
        });
        continue;
      }
      const relStart = Math.min(beat.durFrames - 1, Math.max(0, msToFrames(w.atMs, fps)));
      const relEnd = Math.min(beat.durFrames, Math.max(relStart + 1, msToFrames(w.atMs + w.durMs, fps)));
      moments.push({
        id: m.id, beatId: b.id, beatIndex: index, kind: m.kind, role, component: m.component, tier: m.tier,
        props: m.props ?? {}, ...(m.claim ? { claim: m.claim } : {}),
        atMs: w.atMs, durMs: w.durMs,
        startFrame: beat.startFrame + relStart, durFrames: relEnd - relStart,
        startsAtBeatStart: relStart === 0, endsAtBeatEnd: relEnd === beat.durFrames,
      });
    }
  });

  // 3. voice: at the beat's picture start; at a chapter turn it leads by LEAD_FRAMES,
  //    clamped so it never starts before the previous clip has finished (voice never overlaps voice)
  const voice: TVoice[] = [];
  for (const beat of beats) {
    const clip = clips[beat.id];
    if (!clip || beat.estimated) continue;
    const prevVoice = voice[voice.length - 1];
    const prevEnd = prevVoice ? prevVoice.from + prevVoice.durFrames : 0;
    let lead = beat.chapterTurn ? LEAD_FRAMES : 0;
    lead = Math.max(0, Math.min(lead, beat.startFrame - prevEnd));
    if (beat.chapterTurn && lead < LEAD_FRAMES) notes.push(`beat ${beat.id}: chapter-turn lead clamped to ${lead} frames (previous line still speaking)`);
    voice.push({ beatId: beat.id, file: clip.file, ms: clip.ms, from: beat.startFrame - lead, durFrames: Math.max(1, Math.ceil((clip.ms * fps) / 1000)), leadFrames: lead });
  }
  const voiceSpans = mergeSpans(voice.map((v) => [v.from, v.from + v.durFrames] as [number, number]));

  // 4. music cues from structural edges
  const music: TMusic[] = [];
  const edgeFrame = (e: { beat: string; edge: 'start' | 'end' }): number | undefined => {
    const b = beats.find((x) => x.id === e.beat);
    return b ? (e.edge === 'start' ? b.startFrame : b.endFrame) : undefined;
  };
  for (const cue of script.music?.cues ?? []) {
    const from = edgeFrame(cue.from);
    const to = edgeFrame(cue.to);
    if (from === undefined || to === undefined) {
      notes.push(`music ${cue.id}: edge names an unknown beat`);
      continue;
    }
    const file = manifest?.music?.[cue.id];
    if (!file) {
      notes.push(`music ${cue.id}: no file in the manifest; cue is silent`);
      continue;
    }
    const fadeOutFrames = msToFrames(MUSIC_FADE_OUT_MS, fps);
    const fileFrames = Math.floor((file.ms * fps) / 1000);
    const end = Math.min(totalFrames, to + fadeOutFrames, from + fileFrames);
    const fadeOutStart = Math.max(from, Math.min(to, end - fadeOutFrames));
    music.push({
      cueId: cue.id, file: file.file, ms: file.ms, gainDb: cue.gainDb ?? MUSIC_DEFAULT_DB,
      from, toFrame: to, durFrames: Math.max(1, end - from),
      fadeInFrames: msToFrames(MUSIC_FADE_IN_MS, fps), fadeOutStart, fadeOutFrames: Math.max(1, end - fadeOutStart),
    });
  }

  // 5. fx: a whoosh whose peak sits on every motion transition's cut
  const fx: TFx[] = [];
  for (const beat of beats) {
    if (!beat.transitionIn) continue;
    fx.push({ kind: 'whoosh', from: Math.max(0, beat.startFrame - msToFrames(WHOOSH_LEAD_MS, fps)), beatId: beat.id, component: beat.transitionIn.component });
  }

  return {
    fps, width: script.size.w, height: script.size.h, balance,
    totalFrames, totalMs: cumMs, beats, moments, voice, music, voiceSpans, fx, notes,
  };
}

export function mergeSpans(spans: [number, number][]): [number, number][] {
  const s = [...spans].sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const [a, b] of s) {
    const last = out[out.length - 1];
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

export const dbToGain = (db: number): number => Math.pow(10, db / 20);

/** 0..1: how far the music is ducked at an absolute frame (150 ms ramps around each voice span). */
export function duckAmount(spans: [number, number][], frame: number, fps = FPS): number {
  const ramp = (DUCK_RAMP_MS * fps) / 1000;
  let d = 0;
  for (const [a, b] of spans) {
    let v = 0;
    if (frame >= a && frame < b) v = 1;
    else if (frame < a && frame >= a - ramp) v = 1 - (a - frame) / ramp;
    else if (frame >= b && frame < b + ramp) v = 1 - (frame - b) / ramp;
    if (v > d) d = v;
  }
  return d;
}

/** Linear gain of a music cue at an absolute frame: bed level, voice duck, cue fades. */
export function musicGain(cue: TMusic, spans: [number, number][], frame: number, fps = FPS): number {
  const local = frame - cue.from;
  if (local < 0 || local >= cue.durFrames) return 0;
  const fadeIn = cue.fadeInFrames > 0 ? Math.min(1, local / cue.fadeInFrames) : 1;
  const fadeOut = frame < cue.fadeOutStart ? 1 : Math.max(0, 1 - (frame - cue.fadeOutStart) / cue.fadeOutFrames);
  const db = cue.gainDb - DUCK_DB * duckAmount(spans, frame, fps);
  return dbToGain(db) * fadeIn * fadeOut;
}

/** Progress (0..1) of a beat's outgoing / incoming transition at an absolute frame. */
export function transitionProgress(beat: TBeat, frame: number): { out?: { t: TTransition; p: number }; in?: { t: TTransition; p: number } } {
  const r: { out?: { t: TTransition; p: number }; in?: { t: TTransition; p: number } } = {};
  if (beat.transitionIn) {
    const p = (frame - beat.startFrame + 1) / beat.transitionIn.half;
    if (frame >= beat.startFrame && p <= 1) r.in = { t: beat.transitionIn, p: 1 - p };
  }
  if (beat.transitionOut) {
    const s = beat.endFrame - beat.transitionOut.half;
    if (frame >= s && frame < beat.endFrame) r.out = { t: beat.transitionOut, p: (frame - s + 1) / beat.transitionOut.half };
  }
  return r;
}
