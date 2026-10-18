// CursorSpotlight + ClickRipple: a synthetic cursor glides along the take's logged clicks (or the
// centres of named rects), arriving just before each click; a soft vignette keeps the eye on it and
// a ripple marks the click. Drawn in screen space through the footage camera.
// CursorSpotlight props: { selectors?: string[], spotlight?: boolean (true), ripple?: boolean (true), radius?: number }
// ClickRipple props: { selectors?: string[] }  (ripples only)
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { displayScale } from '../camera.ts';
import type { MomentCtx, MomentProps } from '../context.tsx';
import { alpha, prog, useStyle, type Style } from '../style.ts';
import { msToFrames } from '../timeline.ts';
import type { Pt } from '../camera.ts';

type Waypoint = { p: Pt; at: number };

/** Waypoints in content px with moment-local frames; clicks first, else rect centres spaced evenly. */
export function waypoints(ctx: MomentCtx, selectors: unknown): Waypoint[] {
  const tb = ctx.takeBeat;
  const offset = ctx.moment.startFrame - ctx.beat.startFrame;
  const k = displayScale(ctx.take);
  if (tb && tb.clicks.length) {
    return tb.clicks
      .map((c) => ({ p: { x: c.x * k, y: c.y * k }, at: msToFrames(c.atMs) - offset }))
      .sort((a, b) => a.at - b.at);
  }
  const names = Array.isArray(selectors) ? selectors.filter((x): x is string => typeof x === 'string') : [];
  const rects = names.map((n) => ctx.rect(n)).filter((r): r is NonNullable<typeof r> => Boolean(r));
  return rects.map((r, i) => ({ p: { x: r.x + r.w / 2, y: r.y + r.h / 2 }, at: Math.round(((i + 1) * ctx.durFrames) / (rects.length + 1)) }));
}

/** Cursor position (content px) at a local frame: rests, then glides to arrive ARRIVE frames before each click. */
export function cursorAt(wps: Waypoint[], f: number, s: Style): Pt | undefined {
  if (!wps.length) return undefined;
  const ARRIVE = 6;
  const first = wps[0];
  let pos: Pt = { x: first.p.x + 180, y: first.p.y + 140 };
  let prevAt = Math.min(0, first.at - 30);
  for (const w of wps) {
    const start = Math.max(prevAt + 4, w.at - ARRIVE - 20);
    const t = prog(f, start, Math.max(1, w.at - ARRIVE - start), s.ease);
    pos = { x: pos.x + (w.p.x - pos.x) * t, y: pos.y + (w.p.y - pos.y) * t };
    if (f < w.at - ARRIVE) return pos;
    prevAt = w.at;
  }
  return pos;
}

function Ripples({ wps, ctx, s, f }: { wps: Waypoint[]; ctx: MomentCtx; s: Style; f: number }) {
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {wps.map((w, i) => {
        const local = f - w.at;
        if (local < 0 || local > 22) return null;
        const c = ctx.toScreen(w.p, f);
        return [0, 5].map((d) => {
          const t = prog(local, d, 16, s.ease);
          if (local < d) return null;
          return <circle key={`${i}-${d}`} cx={c.x} cy={c.y} r={10 + 54 * t * c.k} fill="none" stroke={d ? s.fg : s.accent} strokeOpacity={(1 - t) * (d ? 0.5 : 1)} strokeWidth={3} />;
        });
      })}
    </svg>
  );
}

function Arrow({ x, y, scale, s }: { x: number; y: number; scale: number; s: Style }) {
  return (
    <svg width={40} height={48} viewBox="0 0 20 24" style={{ position: 'absolute', left: x - 3, top: y - 2, transform: `scale(${scale})`, transformOrigin: '3px 2px', filter: `drop-shadow(0 6px 10px ${alpha('#000000', 0.35)})` }}>
      <path d="M1.5 1.5 L1.5 19 L6 14.6 L9.2 22 L12.4 20.6 L9.3 13.4 L15.6 13.4 Z" fill={s.fg} stroke={s.bg} strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
}

export function CursorSpotlight({ props, ctx }: MomentProps) {
  const f = useCurrentFrame();
  const s = useStyle();
  const wps = waypoints(ctx, props.selectors);
  const p = cursorAt(wps, f, s);
  if (!p) return null;
  const c = ctx.toScreen(p, f);
  const inP = prog(f, 0, 12, s.ease);
  const outP = ctx.exits ? prog(f, ctx.durFrames - 10, 10, s.easeIn) : 0;
  const vis = inP * (1 - outP);
  const radius = (typeof props.radius === 'number' ? props.radius : 260) * c.k;
  const press = wps.reduce((m, w) => Math.max(m, 1 - Math.min(1, Math.abs(f - w.at) / 4)), 0);
  return (
    <AbsoluteFill>
      {props.spotlight !== false ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle ${radius * 1.6}px at ${c.x}px ${c.y}px, transparent 0, transparent ${radius * 0.55}px, ${alpha(s.bg, 0.46)} ${radius * 1.6}px)`,
            opacity: vis,
          }}
        />
      ) : null}
      {props.ripple !== false ? <Ripples wps={wps} ctx={ctx} s={s} f={f} /> : null}
      <div style={{ opacity: vis }}>
        <Arrow x={c.x} y={c.y} scale={1 - 0.14 * press} s={s} />
      </div>
    </AbsoluteFill>
  );
}

export function ClickRipple({ props, ctx }: MomentProps) {
  const f = useCurrentFrame();
  const s = useStyle();
  return (
    <AbsoluteFill>
      <Ripples wps={waypoints(ctx, props.selectors)} ctx={ctx} s={s} f={f} />
    </AbsoluteFill>
  );
}
