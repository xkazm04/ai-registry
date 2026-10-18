// LowerThird: an accent bar grows, a quiet panel opens from it, title and subtitle rise
// through their masks. Sits on the grid's bottom-left; leaves the way it came.
// props: { title, subtitle? }
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import type { MomentProps } from '../context.tsx';
import { GRID, alpha, life, prog, useStyle } from '../style.ts';
import { Mask, str } from './primitives.tsx';

export function LowerThird({ props, ctx }: MomentProps) {
  const f = useCurrentFrame();
  const s = useStyle();
  const { exit } = life(f, ctx.durFrames, s, { exits: ctx.exits, outFrames: 14 });
  const bar = prog(f, 0, 12, s.ease);
  const panel = prog(f, 6, 18, s.ease);
  const t = prog(f, 10, 16, s.ease);
  const st = prog(f, 14, 16, s.ease);
  const outBar = exit > 0 ? prog(f, ctx.durFrames - 8, 8, s.easeIn) : 0;
  const outPanel = exit;
  const subtitle = str(props.subtitle);

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: GRID.margin - 40, bottom: 96, display: 'flex', alignItems: 'stretch' }}>
        <div style={{ width: 6, background: s.accent, transform: `scaleY(${bar * (1 - outBar)})`, transformOrigin: 'bottom' }} />
        <div
          style={{
            background: alpha(s.bg, 0.9),
            padding: '22px 40px 24px 30px',
            clipPath: `inset(0 ${(1 - panel * (1 - outPanel)) * 100}% 0 0)`,
            borderRadius: `0 ${s.radius}px ${s.radius}px 0`,
          }}
        >
          <div style={{ fontFamily: s.display, fontWeight: 600, fontSize: 46, color: s.fg, letterSpacing: '-0.015em', lineHeight: 1.1 }}>
            <Mask p={t} out={exit}>{str(props.title) ?? ''}</Mask>
          </div>
          {subtitle ? (
            <div style={{ fontFamily: s.body, fontSize: 26, color: s.muted, marginTop: 8, lineHeight: 1.2 }}>
              <Mask p={st} out={exit}>{subtitle}</Mask>
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
}
