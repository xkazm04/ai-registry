// StatCounter: one number counting up to a value from props or the take record, in tabular
// figures so the digits never jitter, with a single bar that fills in step with the count.
// props: { value?: number, record?: string (key in the run record), from?: number, max?: number,
//          prefix?, suffix?, decimals?, label, note?, cover? }
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import type { MomentProps } from '../context.tsx';
import { GRID, alpha, life, prog, useStyle } from '../style.ts';
import { Mask, capsStyle, num, str } from './primitives.tsx';

export function formatNumber(v: number, decimals = 0): string {
  const fixed = Math.abs(v).toFixed(decimals);
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${v < 0 ? '-' : ''}${grouped}${frac ? `.${frac}` : ''}`;
}

export function StatCounter({ props, ctx }: MomentProps) {
  const f = useCurrentFrame();
  const s = useStyle();
  const value = num(props.value) ?? num(typeof props.record === 'string' ? ctx.record(props.record) : undefined) ?? 0;
  const from = num(props.from) ?? 0;
  const max = num(props.max) ?? value;
  const decimals = num(props.decimals) ?? 0;
  const prefix = str(props.prefix) ?? '';
  const suffix = str(props.suffix) ?? '';
  const cover = props.cover !== false;
  const { exit } = life(f, ctx.durFrames, s, { exits: ctx.exits, outFrames: 12 });

  const count = prog(f, 6, 34, s.ease);
  const shown = from + (value - from) * count;
  const rounded = Math.round(shown * 10 ** decimals) / 10 ** decimals;
  const labelP = prog(f, 0, 16, s.ease);
  const fill = max > 0 ? Math.max(0, Math.min(1, shown / max)) : 0;
  const barIn = prog(f, 2, 14, s.ease);
  const note = str(props.note);

  return (
    <AbsoluteFill style={{ background: cover ? s.bg : undefined }}>
      <AbsoluteFill style={{ padding: `0 ${GRID.margin}px`, justifyContent: 'center' }}>
        <div style={{ ...capsStyle(s, 24), marginBottom: 18 }}>
          <Mask p={labelP} out={exit}>{str(props.label) ?? ''}</Mask>
        </div>
        <div style={{ fontFamily: s.display, color: s.fg, fontWeight: 600, fontSize: 280, lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums lining-nums', display: 'flex', alignItems: 'flex-start' }}>
          <Mask p={prog(f, 4, 16, s.ease)} out={exit} pad={0.06}>
            {prefix ? <span style={{ fontSize: '0.42em', color: s.accent, marginRight: '0.06em', display: 'inline-block', verticalAlign: 'top', marginTop: '0.2em', lineHeight: 1, fontWeight: 500 }}>{prefix}</span> : null}
            {formatNumber(rounded, decimals)}
            {suffix ? <span style={{ fontSize: '0.36em', color: s.muted, marginLeft: '0.12em', fontWeight: 500 }}>{suffix}</span> : null}
          </Mask>
        </div>
        <div style={{ position: 'relative', width: 760, height: 6, marginTop: 44, background: alpha(s.fg, 0.12), transform: `scaleX(${barIn * (1 - exit)})`, transformOrigin: 'left' }}>
          <div style={{ position: 'absolute', inset: 0, background: s.accent, transform: `scaleX(${fill})`, transformOrigin: 'left' }} />
        </div>
        {note ? (
          <div style={{ fontFamily: s.body, fontSize: 30, color: s.muted, marginTop: 28 }}>
            <Mask p={prog(f, 30, 16, s.ease)} out={exit}>{note}</Mask>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
