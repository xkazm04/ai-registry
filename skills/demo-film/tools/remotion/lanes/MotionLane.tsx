// Motion lane: every moment of the balance in its beat-relative Sequence - footage overlays
// (cursor, spotlight, ripples) first, then plates, then heroes - wrapped in the same transition look
// as the picture, plus the MaskWipe panels above everything.
import { AbsoluteFill, Sequence } from 'remotion';
import { displayRect, takeToScreen } from '../camera.ts';
import { useFilm, type ComponentMap, type MomentCtx } from '../context.tsx';
import { useStyle, type Style } from '../style.ts';
import type { TBeat, Timeline, TMoment } from '../timeline.ts';
import type { Take } from '../../src/contract.ts';
import { TransitionWrap, WipePanel } from '../transitions/index.tsx';

const ORDER: Record<string, number> = { overlay: 0, plate: 1, hero: 2 };

export function momentCtx(tl: Timeline, take: Take | undefined, beat: TBeat, m: TMoment, s: Style): MomentCtx {
  return {
    moment: m,
    beat,
    timeline: tl,
    take,
    takeBeat: beat.takeBeat,
    durFrames: m.durFrames,
    enters: m.props.enter === true || !m.startsAtBeatStart || !beat.transitionIn,
    exits: m.props.exit === true || (!m.endsAtBeatEnd && m.props.exit !== false),
    rect: (sel) => displayRect(take, beat.takeBeat, sel),
    toScreen: (p, local) => takeToScreen(tl, take, beat, m.startFrame + local, p, s.ease),
    record: (key) => {
      for (let i = beat.index; i >= 0; i--) {
        const r = tl.beats[i].takeBeat?.record;
        if (r && key in r) return r[key];
      }
      return undefined;
    },
  };
}

export function MotionLane({ components }: { components: ComponentMap }) {
  const { timeline, take } = useFilm();
  const s = useStyle();
  return (
    <AbsoluteFill>
      {timeline.beats.map((b) => {
        const ms = timeline.moments
          .filter((m) => m.beatIndex === b.index && (m.role === 'overlay' || m.role === 'plate' || m.role === 'hero'))
          .sort((a, c) => (ORDER[a.role] ?? 9) - (ORDER[c.role] ?? 9));
        if (!ms.length) return null;
        return (
          <Sequence key={b.id} name={`motion:${b.id}`} from={b.startFrame} durationInFrames={b.durFrames}>
            <TransitionWrap beat={b} lane="motion">
              {ms.map((m) => {
                const C = components[m.component];
                if (!C) throw new Error(`demo-film: unknown component "${m.component}" (moment ${m.id}); not in the library or @film/local`);
                return (
                  <Sequence key={m.id} name={`${m.component}:${m.id}`} from={m.startFrame - b.startFrame} durationInFrames={m.durFrames}>
                    <C props={m.props} ctx={momentCtx(timeline, take, b, m, s)} />
                  </Sequence>
                );
              })}
            </TransitionWrap>
          </Sequence>
        );
      })}
      {timeline.beats
        .filter((b) => b.transitionIn?.component === 'MaskWipe')
        .map((b) => (
          <Sequence key={`wipe-${b.id}`} name={`MaskWipe:${b.id}`} from={b.startFrame - b.transitionIn!.half} durationInFrames={2 * b.transitionIn!.half}>
            <WipePanel beat={b} />
          </Sequence>
        ))}
    </AbsoluteFill>
  );
}
