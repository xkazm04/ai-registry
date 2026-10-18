// StyleLock -> the only design tokens any plate, treatment or transition may use.
// Palette, two typefaces (display + body; mono only for code-ish meta), radius and the easing
// curve all come from the film's StyleLock. Nothing here reads a clock.
import { createContext, useContext } from 'react';
import { Easing, interpolate } from 'remotion';
import type { StyleLock } from '../src/contract.ts';

export type Style = {
  bg: string;
  fg: string;
  accent: string;
  accent2: string;
  muted: string;
  display: string;
  body: string;
  mono: string;
  radius: number;
  /** The film's easing curve (StyleLock.easing as a cubic bezier). */
  ease: (t: number) => number;
  /** Same curve, used for exits: mirrored so things leave the way they arrived. */
  easeIn: (t: number) => number;
  /** Absolute media URL for a path relative to the film directory. */
  media: (rel: string) => string;
  logo: string;
};

const stack = (family: string, fallback: string) => `"${family.replace(/"/g, '')}", ${fallback}`;

export function makeStyle(lock: StyleLock, media: (rel: string) => string): Style {
  const [x1, y1, x2, y2] = lock.easing;
  const ease = Easing.bezier(x1, y1, x2, y2);
  return {
    ...lock.palette,
    display: stack(lock.fonts.display, '"Segoe UI", system-ui, sans-serif'),
    body: stack(lock.fonts.body, '"Segoe UI", system-ui, sans-serif'),
    mono: stack(lock.fonts.mono, 'Consolas, ui-monospace, monospace'),
    radius: lock.radius,
    ease,
    easeIn: (t: number) => 1 - ease(1 - t),
    media,
    logo: media(lock.logo),
  };
}

export const StyleContext = createContext<Style | null>(null);
export function useStyle(): Style {
  const s = useContext(StyleContext);
  if (!s) throw new Error('demo-film: useStyle() outside <Film>');
  return s;
}

/** Eased 0..1 progress of `frame` through [start, start+dur). */
export function prog(frame: number, start: number, dur: number, ease: (t: number) => number): number {
  if (dur <= 0) return frame >= start ? 1 : 0;
  return ease(interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
}

/**
 * Entrance and exit of a moment that lasts `durFrames`. `enter` rises 0->1 from `delay`;
 * `exit` rises 0->1 over the last `outFrames` when the moment exits on its own (not cut away).
 */
export function life(
  frame: number,
  durFrames: number,
  s: Style,
  o: { delay?: number; inFrames?: number; outFrames?: number; exits?: boolean } = {},
): { enter: number; exit: number } {
  const inF = o.inFrames ?? 18;
  const outF = Math.min(o.outFrames ?? 12, Math.floor(durFrames / 3));
  const enter = prog(frame, o.delay ?? 0, inF, s.ease);
  const exit = o.exits ? prog(frame, durFrames - outF, outF, s.easeIn) : 0;
  return { enter, exit };
}

/** #rgb / #rrggbb -> rgba() with alpha. Other colour syntaxes pass through via color-mix. */
export function alpha(color: string, a: number): string {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!m) return `color-mix(in srgb, ${color} ${Math.round(a * 100)}%, transparent)`;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Mix two colours (a toward b by t) with CSS color-mix; deterministic, no runtime parsing. */
export const mix = (a: string, b: string, t: number): string =>
  `color-mix(in srgb, ${a} ${Math.round((1 - t) * 1000) / 10}%, ${b})`;

/** Layout grid shared by every plate: 1920x1080, generous margins, one baseline. */
export const GRID = { w: 1920, h: 1080, margin: 160, top: 132, bottom: 132 } as const;
