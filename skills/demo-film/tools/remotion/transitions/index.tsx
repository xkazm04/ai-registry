// Between-beat transitions. Each is split at the cut: the outgoing beat animates OUT over its last
// `half` frames and the incoming beat animates IN over its first `half` frames, so no frames are
// added and the clock stays the timeline's. p is closeness to the cut (0 far, 1 at the cut).
//   WhipPan     directional motion blur along x, accelerating into the cut, decelerating out
//   ZoomThrough push into the outgoing picture, arrive into the incoming one
//   MaskWipe    an accent panel with a slanted edge sweeps over the cut
// The default between beats is a hard cut.
import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { W } from '../camera.ts';
import { useStyle, type Style } from '../style.ts';
import { transitionProgress, type TBeat, type TTransition } from '../timeline.ts';

type Look = { style: CSSProperties; blurX: number };

const dirOf = (t: TTransition) => (t.props.direction === 'right' ? -1 : 1);

function look(t: TTransition, p: number, side: 'out' | 'in', s: Style): Look {
  switch (t.component) {
    case 'WhipPan': {
      const d = dirOf(t);
      const k = Math.pow(p, 2.2);
      const x = (side === 'out' ? -1 : 1) * d * W * 0.38 * k;
      return { style: { transform: `translateX(${x}px)` }, blurX: 110 * p * p };
    }
    case 'ZoomThrough': {
      const k = Math.pow(p, 2.4);
      const scale = side === 'out' ? 1 + 1.3 * k : 1 - 0.2 * k;
      return { style: { transform: `scale(${scale})`, filter: `blur(${16 * p * p}px)` }, blurX: 0 };
    }
    case 'MaskWipe': {
      // content drifts with the panel so the cut reads as one move
      const e = side === 'out' ? s.easeIn(p) : s.ease(p);
      const x = (side === 'out' ? -1 : 1) * 70 * e;
      return { style: { transform: `translateX(${x}px)` }, blurX: 0 };
    }
    default:
      return { style: {}, blurX: 0 };
  }
}

/** Wraps one lane's beat content with that beat's transition look at this frame. */
export function TransitionWrap({ beat, lane, children }: { beat: TBeat; lane: string; children: ReactNode }) {
  const local = useCurrentFrame();
  const s = useStyle();
  const frame = beat.startFrame + local;
  const tp = transitionProgress(beat, frame);
  const active = tp.out ? look(tp.out.t, tp.out.p, 'out', s) : tp.in ? look(tp.in.t, tp.in.p, 'in', s) : undefined;
  if (!active) return <AbsoluteFill>{children}</AbsoluteFill>;
  const id = `df-whip-${lane}-${beat.index}`;
  const blur = Math.round(active.blurX * 10) / 10;
  return (
    <AbsoluteFill>
      {blur > 0 ? (
        <svg width={0} height={0} style={{ position: 'absolute' }}>
          <filter id={id} x="-30%" y="0" width="160%" height="100%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${blur} 0`} edgeMode="duplicate" />
          </filter>
        </svg>
      ) : null}
      <AbsoluteFill style={{ ...active.style, ...(blur > 0 ? { filter: `url(#${id})` } : {}) }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
}

/** The MaskWipe panel, drawn above both lanes across the cut. Mounted for 2*half frames around it. */
export function WipePanel({ beat }: { beat: TBeat }) {
  const local = useCurrentFrame();
  const s = useStyle();
  const t = beat.transitionIn;
  if (!t) return null;
  const frame = beat.startFrame - t.half + local;
  const S = 220;
  const B = 34;
  let main = '';
  let band = '';
  if (frame < beat.startFrame) {
    const p = (frame - (beat.startFrame - t.half) + 1) / t.half;
    const e = -S - B + (W + S + B) * s.easeIn(p);
    main = `polygon(-10px 0, ${e + S}px 0, ${e}px 100%, -10px 100%)`;
    band = `polygon(${e + S}px 0, ${e + S + B}px 0, ${e + B}px 100%, ${e}px 100%)`;
  } else {
    const p = 1 - (frame - beat.startFrame + 1) / t.half;
    const e = -S + (W + S + B) * s.ease(1 - p);
    main = `polygon(${e + S}px 0, ${W + 10}px 0, ${W + 10}px 100%, ${e}px 100%)`;
    band = `polygon(${e + S - B}px 0, ${e + S}px 0, ${e}px 100%, ${e - B}px 100%)`;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: s.accent2, clipPath: band }} />
      <AbsoluteFill style={{ background: s.accent, clipPath: main }} />
    </AbsoluteFill>
  );
}

/** Registry entries (the lanes draw transitions; a moment never renders one directly). */
export const WhipPan = () => null;
export const ZoomThrough = () => null;
export const MaskWipe = () => null;
