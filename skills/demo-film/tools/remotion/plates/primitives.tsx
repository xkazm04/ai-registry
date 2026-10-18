// Small frame-pure building blocks the plates share: a masked line reveal, the logo, a rule.
import type { CSSProperties, ReactNode } from 'react';
import { Img } from 'remotion';
import type { Style } from '../style.ts';

/**
 * Text that rises through a mask. `p` 0..1 is the entrance, `out` 0..1 the exit (leaves upward).
 * The mask has a little bottom padding so descenders are never clipped.
 */
export function Mask({ p, out = 0, children, style, pad = 0.18 }: { p: number; out?: number; children: ReactNode; style?: CSSProperties; pad?: number }) {
  const y = (1 - p) * 108 - out * 108;
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: `${pad}em`, marginBottom: `-${pad}em`, ...style }}>
      <span style={{ display: 'inline-block', transform: `translateY(${y}%)`, willChange: 'transform' }}>{children}</span>
    </span>
  );
}

/** The StyleLock logo, revealed by a circular mask (p 0..1). */
export function Logo({ s, size, p = 1, style }: { s: Style; size: number; p?: number; style?: CSSProperties }) {
  const r = Math.max(0, Math.min(1, p)) * 75;
  return (
    <div style={{ width: size, height: size, clipPath: `circle(${r}% at 50% 50%)`, ...style }}>
      <Img src={s.logo} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
    </div>
  );
}

/** A rule that draws from its origin (p 0..1). */
export function Rule({ p, color, width, height = 4, origin = 'left', style }: { p: number; color: string; width: number; height?: number; origin?: 'left' | 'right' | 'center'; style?: CSSProperties }) {
  return <div style={{ width, height, background: color, transform: `scaleX(${p})`, transformOrigin: origin, ...style }} />;
}

/** Small spaced caps used for kickers and labels: the body face, never the display face. */
export function capsStyle(s: Style, size = 22): CSSProperties {
  return { fontFamily: s.body, fontSize: size, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: s.muted };
}

export const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
export const str = (v: unknown): string | undefined => (typeof v === 'string' && v.length > 0 ? v : undefined);
