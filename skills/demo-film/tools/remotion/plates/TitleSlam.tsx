// TitleSlam: logo + title. The mark opens through a circular mask, the title lines rise through
// their masks on a tight stagger and the whole block lands with a short scale settle ("slam"),
// then holds still. props: { title, kicker?, meta?, cover? }
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import type { MomentProps } from '../context.tsx';
import { GRID, alpha, life, prog, useStyle } from '../style.ts';
import { Logo, Mask, Rule, capsStyle, str } from './primitives.tsx';

export function TitleSlam({ props, ctx }: MomentProps) {
  const f = useCurrentFrame();
  const s = useStyle();
  const title = str(props.title) ?? '';
  const kicker = str(props.kicker);
  const meta = str(props.meta);
  const lines = title.split('\n');
  const { exit } = life(f, ctx.durFrames, s, { exits: ctx.exits, outFrames: 14 });

  const logoP = prog(f, 0, 16, s.ease);
  const kickP = prog(f, 6, 16, s.ease);
  const slam = prog(f, 8, 26, s.ease);
  const ruleP = prog(f, 20, 22, s.ease);
  const metaP = prog(f, 24, 18, s.ease);
  const size = lines.length > 1 ? 150 : 176;

  return (
    <AbsoluteFill style={{ background: props.cover === false ? undefined : s.bg }}>
      <AbsoluteFill style={{ padding: `0 ${GRID.margin}px`, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 54, opacity: 1 - exit }}>
          <Logo s={s} size={88} p={logoP} style={{ transform: `scale(${0.86 + 0.14 * logoP})` }} />
          {kicker ? (
            <div style={capsStyle(s, 24)}>
              <Mask p={kickP} out={exit}>{kicker}</Mask>
            </div>
          ) : null}
        </div>
        <div
          style={{
            fontFamily: s.display,
            fontSize: size,
            fontWeight: 700,
            lineHeight: 0.96,
            color: s.fg,
            letterSpacing: `${-0.012 - 0.022 * slam}em`,
            transform: `scale(${1.045 - 0.045 * slam})`,
            transformOrigin: 'left center',
          }}
        >
          {lines.map((line, i) => (
            <div key={i}>
              <Mask p={prog(f, 8 + i * 4, 18, s.ease)} out={exit > 0 ? prog(f, ctx.durFrames - 14 + i * 2, 12, s.easeIn) : 0}>
                {line}
              </Mask>
            </div>
          ))}
        </div>
        <Rule p={ruleP * (1 - exit)} color={s.accent} width={240} height={6} style={{ marginTop: 56 }} />
      </AbsoluteFill>
      {meta ? (
        <div
          style={{
            position: 'absolute',
            left: GRID.margin,
            bottom: 72,
            right: GRID.margin,
            display: 'flex',
            justifyContent: 'space-between',
            ...capsStyle(s, 18),
            color: alpha(s.fg, 0.42),
            opacity: metaP * (1 - exit),
          }}
        >
          <span>{meta}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{String(ctx.beat.index + 1).padStart(2, '0')}</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
}
