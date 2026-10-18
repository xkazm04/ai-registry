// KineticClaim: 2-6 words. Each word rises through its mask on a stagger, arriving light;
// then the weight shifts: the emphasis word swells to the heavy cut in the accent colour while
// the rest settle to regular. One move per word, then stillness so the line can be read.
// props: { text, emphasis?: number | string, align?: 'left' | 'center', cover?: boolean, kicker? }
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { MomentProps } from '../context.tsx';
import { GRID, life, prog, useStyle } from '../style.ts';
import { Mask, Rule, capsStyle, str } from './primitives.tsx';

export function KineticClaim({ props, ctx }: MomentProps) {
  const f = useCurrentFrame();
  const s = useStyle();
  const words = (str(props.text) ?? '').split(/\s+/).filter(Boolean).slice(0, 6);
  const emph =
    typeof props.emphasis === 'number'
      ? props.emphasis
      : typeof props.emphasis === 'string'
        ? words.findIndex((w) => w.toLowerCase().replace(/[^\p{L}\p{N}$]/gu, '') === String(props.emphasis).toLowerCase())
        : words.length - 1;
  const center = props.align === 'center';
  const cover = props.cover !== false && ctx.beat.capture;
  const { exit } = life(f, ctx.durFrames, s, { exits: ctx.exits, outFrames: 12 });

  const stagger = 3;
  const landed = 8 + words.length * stagger + 6;
  const shift = prog(f, landed, 16, s.ease);
  const size = words.length <= 3 ? 184 : 150;
  // a plate that covers footage opens with a wipe from the bottom and closes the same way
  const wipeIn = cover && ctx.enters ? prog(f, 0, 12, s.ease) : 1;
  const wipe = Math.min(wipeIn, 1 - exit);
  const kicker = str(props.kicker);

  return (
    <AbsoluteFill style={{ clipPath: cover ? `inset(${(1 - wipe) * 100}% 0 0 0)` : undefined }}>
      {cover ? <AbsoluteFill style={{ background: s.bg }} /> : null}
      <AbsoluteFill style={{ padding: `0 ${GRID.margin}px`, justifyContent: 'center', alignItems: center ? 'center' : 'flex-start' }}>
        {kicker ? (
          <div style={{ ...capsStyle(s, 22), marginBottom: 36 }}>
            <Mask p={prog(f, 2, 14, s.ease)} out={exit}>{kicker}</Mask>
          </div>
        ) : null}
        <div
          style={{
            fontFamily: s.display,
            fontSize: size,
            lineHeight: 1.04,
            letterSpacing: '-0.028em',
            color: s.fg,
            maxWidth: 1480,
            textAlign: center ? 'center' : 'left',
          }}
        >
          {words.map((w, i) => {
            const p = prog(f, 6 + i * stagger, 16, s.ease);
            const isE = i === emph;
            const weight = Math.round(interpolate(shift, [0, 1], [300, isE ? 700 : 400]));
            const out = exit > 0 ? prog(f, ctx.durFrames - 12 + Math.min(i, 4), 10, s.easeIn) : 0;
            return (
              <span key={i}>
                <Mask p={p} out={out}>
                  <span style={{ fontWeight: weight, color: isE ? interpolateColor(shift, s.fg, s.accent) : s.fg }}>{w}</span>
                </Mask>
                {i < words.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </div>
        <Rule p={prog(f, landed + 6, 18, s.ease) * (1 - exit)} color={s.accent} width={160} height={6} origin={center ? 'center' : 'left'} style={{ marginTop: 48 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

const interpolateColor = (t: number, a: string, b: string) => `color-mix(in srgb, ${a} ${Math.round((1 - t) * 100)}%, ${b})`;
