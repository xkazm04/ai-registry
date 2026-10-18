// Callout: a logged element gets an outline that draws around it, a leader that runs out to the
// free side, and a label that opens along the leader. Anchored through the same camera the
// footage uses, so it stays locked to the element under zoom and device tilt.
// props: { selector, label, note?, side?: 'left' | 'right' }
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import type { MomentProps } from '../context.tsx';
import { alpha, life, prog, useStyle } from '../style.ts';
import { Mask, str } from './primitives.tsx';

export function Callout({ props, ctx }: MomentProps) {
  const f = useCurrentFrame();
  const s = useStyle();
  const r = typeof props.selector === 'string' ? ctx.rect(props.selector) : undefined;
  if (!r) return null;
  const { exit } = life(f, ctx.durFrames, s, { exits: ctx.exits, outFrames: 10 });
  const pad = 10;
  const corners = [
    { x: r.x - pad, y: r.y - pad },
    { x: r.x + r.w + pad, y: r.y - pad },
    { x: r.x + r.w + pad, y: r.y + r.h + pad },
    { x: r.x - pad, y: r.y + r.h + pad },
  ].map((p) => ctx.toScreen(p, f));
  const midL = ctx.toScreen({ x: r.x - pad, y: r.y + r.h / 2 }, f);
  const midR = ctx.toScreen({ x: r.x + r.w + pad, y: r.y + r.h / 2 }, f);
  const side = props.side === 'left' || props.side === 'right' ? props.side : (midL.x + midR.x) / 2 > 960 ? 'left' : 'right';
  const anchor = side === 'right' ? midR : midL;
  const dir = side === 'right' ? 1 : -1;
  const lead = 120;
  const elbow = { x: anchor.x + dir * lead, y: anchor.y };

  const draw = prog(f, 0, 16, s.ease);
  const leadP = prog(f, 10, 12, s.ease);
  const labelP = prog(f, 16, 16, s.ease);
  const fade = 1 - exit;
  const path = `M ${corners.map((c) => `${c.x} ${c.y}`).join(' L ')} Z`;
  const label = str(props.label) ?? '';
  const note = str(props.note);

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={path} fill={alpha(s.accent, 0.08 * draw)} stroke={s.accent} strokeWidth={3} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
        <line x1={anchor.x} y1={anchor.y} x2={anchor.x + dir * lead * leadP} y2={anchor.y} stroke={s.accent} strokeWidth={3} />
        <circle cx={anchor.x} cy={anchor.y} r={6 * leadP} fill={s.accent} />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: elbow.y,
          left: side === 'right' ? elbow.x + 14 : undefined,
          right: side === 'left' ? 1920 - elbow.x + 14 : undefined,
          transform: 'translateY(-50%)',
          clipPath: side === 'right' ? `inset(-20% ${(1 - labelP) * 100}% -20% 0)` : `inset(-20% 0 -20% ${(1 - labelP) * 100}%)`,
          background: alpha(s.bg, 0.94),
          borderRadius: s.radius,
          padding: '18px 26px 18px 24px',
          boxShadow: `0 18px 48px ${alpha('#000000', 0.32)}`,
          borderLeft: side === 'right' ? `5px solid ${s.accent}` : undefined,
          borderRight: side === 'left' ? `5px solid ${s.accent}` : undefined,
          textAlign: side === 'left' ? 'right' : 'left',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ fontFamily: s.display, fontWeight: 600, fontSize: 34, color: s.fg, letterSpacing: '-0.01em' }}>
          <Mask p={labelP}>{label}</Mask>
        </div>
        {note ? (
          <div style={{ fontFamily: s.body, fontSize: 22, color: s.muted, marginTop: 6 }}>
            <Mask p={prog(f, 22, 14, s.ease)}>{note}</Mask>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
