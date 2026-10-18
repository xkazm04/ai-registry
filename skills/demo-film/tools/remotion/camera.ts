// Footage camera: the pure geometry of ZoomToRect and DeviceFrame at a frame, and the mapping of a
// take point (video px) to the screen. The picture lane draws with these numbers; the motion lane
// anchors callouts, cursor and ripples with the SAME numbers, so overlays never drift off footage.
import type { Take, TakeBeat } from '../src/contract.ts';

export type Rect = { x: number; y: number; w: number; h: number };
import type { TBeat, Timeline, TMoment } from './timeline.ts';

export const W = 1920;
export const H = 1080;
export const ZOOM_MAX = 1.6;
/** 600 ms at 30 fps: the punch-in and the release. */
export const ZOOM_EASE_FRAMES = 18;
export const DEVICE = { scale: 0.78, bar: 46, perspective: 2600, enterFrames: 22 } as const;

export type Pt = { x: number; y: number };
/** `clip`: the screen-space window footage is cut to (isolate), as insets from each edge in px. */
export type Zoom = { s: number; tx: number; ty: number; clip?: { top: number; right: number; bottom: number; left: number } };
export type Device = { amt: number; scale: number; bar: number; rx: number; ry: number };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lin = (frame: number, a: number, len: number) => (len <= 0 ? (frame >= a ? 1 : 0) : clamp((frame - a) / len, 0, 1));

/** Video px -> composition px for this take. */
export function displayScale(take: Pick<Take, 'width' | 'height'> | undefined): number {
  return take && take.width > 0 ? W / take.width : 1;
}

export function displayRect(take: Take | undefined, tb: TakeBeat | undefined, selector: unknown): Rect | undefined {
  if (!tb || typeof selector !== 'string') return undefined;
  const r = tb.rects[selector];
  if (!r) return undefined;
  const k = displayScale(take);
  return { x: r.x * k, y: r.y * k, w: r.w * k, h: r.h * k };
}

const momentsOf = (tl: Timeline, beat: TBeat, component: string): TMoment[] =>
  tl.moments.filter((m) => m.beatIndex === beat.index && m.component === component);

/** ZoomToRect at an absolute frame. Identity outside every zoom window. */
export function zoomAt(tl: Timeline, take: Take | undefined, beat: TBeat, frame: number, ease: (t: number) => number): Zoom {
  for (const m of momentsOf(tl, beat, 'ZoomToRect')) {
    const local = frame - m.startFrame;
    if (local < 0 || local >= m.durFrames) continue;
    const r = displayRect(take, beat.takeBeat, m.props.selector);
    if (!r) continue;
    const easeF = Math.min(ZOOM_EASE_FRAMES, Math.floor(m.durFrames / 3));
    const release = m.props.release !== false;
    const pin = ease(lin(local, 0, easeF));
    const pout = release ? ease(lin(local, m.durFrames - easeF, easeF)) : 0;
    const amt = pin * (1 - pout);
    const max = Math.min(ZOOM_MAX, typeof m.props.scale === 'number' ? m.props.scale : ZOOM_MAX);
    const fit = Math.min((W * 0.52) / Math.max(1, r.w), (H * 0.52) / Math.max(1, r.h));
    // a slow push while holding keeps the frame alive without a second move for the eye
    const hold = lin(local, easeF, m.durFrames - 2 * easeF);
    const S = clamp(fit, 1.15, max) * (1 - 0.025 + 0.025 * hold);
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const isolate = m.props.isolate === true;
    // full-bleed footage may not pan past its own edge; an isolated element sits on the ground, so it
    // is centred whatever corner of the take it came from
    const Tx = isolate ? W / 2 - cx * S : clamp(W / 2 - cx * S, W - W * S, 0);
    const Ty = isolate ? H / 2 - cy * S : clamp(H / 2 - cy * S, H - H * S, 0);
    const z: Zoom = { s: 1 + (S - 1) * amt, tx: Tx * amt, ty: Ty * amt };
    if (isolate) {
      // isolate: the footage is cut to the element (plus a margin) from the first frame, so whatever
      // surrounds it in the take never shows; the cut element then lifts from its place to the centre
      const pad = typeof m.props.pad === 'number' ? m.props.pad : 18;
      const x0 = r.x * z.s + z.tx - pad;
      const y0 = r.y * z.s + z.ty - pad;
      const x1 = (r.x + r.w) * z.s + z.tx + pad;
      const y1 = (r.y + r.h) * z.s + z.ty + pad;
      z.clip = { top: Math.max(0, y0), left: Math.max(0, x0), right: Math.max(0, W - x1), bottom: Math.max(0, H - y1) };
    }
    return z;
  }
  return { s: 1, tx: 0, ty: 0 };
}

/** DeviceFrame at an absolute frame; amt 0 = full-bleed footage, 1 = framed window. */
export function deviceAt(tl: Timeline, beat: TBeat, frame: number, ease: (t: number) => number): Device {
  for (const m of momentsOf(tl, beat, 'DeviceFrame')) {
    const local = frame - m.startFrame;
    if (local < 0 || local >= m.durFrames) continue;
    const enters = m.props.enter === true || !m.startsAtBeatStart;
    const exits = m.props.exit === true || !m.endsAtBeatEnd;
    const ef = Math.min(DEVICE.enterFrames, Math.floor(m.durFrames / 3));
    const pin = enters ? ease(lin(local, 0, ef)) : 1;
    const pout = exits ? ease(lin(local, m.durFrames - ef, ef)) : 0;
    const amt = pin * (1 - pout);
    const tilt = m.props.tilt === false ? 0 : m.props.tilt === 'right' ? -1 : 1;
    // tilt settles across the whole window: the screen turns toward the viewer as the line lands
    const settle = ease(lin(local, 0, m.durFrames));
    const ry = tilt * (9 - 6 * settle) * amt;
    const rx = (5 - 3 * settle) * amt * (tilt === 0 ? 0 : 1);
    return { amt, scale: 1 - (1 - DEVICE.scale) * amt, bar: DEVICE.bar * amt, rx, ry };
  }
  return { amt: 0, scale: 1, bar: 0, rx: 0, ry: 0 };
}

/** The CSS transform for the device window (origin: its centre). Mirrors project() exactly. */
export function deviceTransform(d: Device): string {
  return `perspective(${DEVICE.perspective}px) rotateX(${d.rx}deg) rotateY(${d.ry}deg) scale(${d.scale})`;
}

/** Map a content point (composition px of the full-bleed footage) through zoom + device to screen px. */
export function project(p: Pt, z: Zoom, d: Device): Pt & { k: number } {
  const zx = p.x * z.s + z.tx;
  const zy = p.y * z.s + z.ty;
  if (d.amt === 0 && d.scale === 1) return { x: zx, y: zy, k: z.s };
  // window: W x (H + bar), content below the bar, centred on the screen
  const winH = H + d.bar;
  let x = (zx - W / 2) * d.scale;
  let y = (zy + d.bar - winH / 2) * d.scale;
  const ay = (d.ry * Math.PI) / 180;
  const ax = (d.rx * Math.PI) / 180;
  // rotateY then rotateX (CSS applies the right-most transform first)
  const x1 = x * Math.cos(ay);
  const z1 = -x * Math.sin(ay);
  const y2 = y * Math.cos(ax) - z1 * Math.sin(ax);
  const z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
  const w = 1 - z2 / DEVICE.perspective;
  x = x1 / w;
  y = y2 / w;
  return { x: x + W / 2, y: y + H / 2, k: (z.s * d.scale) / w };
}

/** Screen point for a take point (video px) on this beat at an absolute frame. */
export function takeToScreen(tl: Timeline, take: Take | undefined, beat: TBeat, frame: number, p: Pt, ease: (t: number) => number): Pt & { k: number } {
  return project(p, zoomAt(tl, take, beat, frame, ease), deviceAt(tl, beat, frame, ease));
}
