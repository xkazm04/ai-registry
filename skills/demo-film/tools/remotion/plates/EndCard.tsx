// EndCard: the mark opens, the closing line rises, the call to action opens from its centre,
// the address settles last. Centred, nothing else on the card.
// props: { line, cta?, url? }
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import type { MomentProps } from '../context.tsx';
import { alpha, prog, useStyle } from '../style.ts';
import { Logo, Mask, str } from './primitives.tsx';

export function EndCard({ props }: MomentProps) {
  const f = useCurrentFrame();
  const s = useStyle();
  const logoP = prog(f, 0, 18, s.ease);
  const lineP = prog(f, 8, 18, s.ease);
  const ctaP = prog(f, 18, 18, s.ease);
  const urlP = prog(f, 26, 16, s.ease);
  const cta = str(props.cta);
  const url = str(props.url);

  return (
    <AbsoluteFill style={{ background: s.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Logo s={s} size={132} p={logoP} style={{ transform: `scale(${0.9 + 0.1 * logoP})`, marginBottom: 56 }} />
      <div style={{ fontFamily: s.display, fontWeight: 600, fontSize: 88, color: s.fg, letterSpacing: '-0.025em', lineHeight: 1.05, textAlign: 'center', maxWidth: 1400 }}>
        <Mask p={lineP}>{str(props.line) ?? ''}</Mask>
      </div>
      {cta ? (
        <div
          style={{
            marginTop: 64,
            background: s.accent,
            color: s.bg,
            fontFamily: s.body,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: '0.01em',
            padding: '22px 46px',
            borderRadius: 999,
            clipPath: `inset(0 ${(1 - ctaP) * 50}% 0 ${(1 - ctaP) * 50}% round 999px)`,
          }}
        >
          <Mask p={prog(f, 24, 14, s.ease)}>{cta}</Mask>
        </div>
      ) : null}
      {url ? (
        <div style={{ marginTop: 30, fontFamily: s.body, fontSize: 24, color: alpha(s.fg, 0.55), letterSpacing: '0.04em', opacity: urlP, transform: `translateY(${(1 - urlP) * 10}px)` }}>{url}</div>
      ) : null}
    </AbsoluteFill>
  );
}
