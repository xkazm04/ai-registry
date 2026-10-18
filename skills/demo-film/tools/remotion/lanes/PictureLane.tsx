// Picture lane: per beat, the take footage (trimmed to the hold; the last frame held when the take
// window is shorter - drawn, never skipped) through ZoomToRect and DeviceFrame, or the StyleLock
// ground for a pure motion beat.
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, useCurrentFrame } from 'remotion';
import { H, W, deviceAt, zoomAt } from '../camera.ts';
import { useFilm } from '../context.tsx';
import { capsStyle } from '../plates/primitives.tsx';
import { useStyle } from '../style.ts';
import type { TBeat } from '../timeline.ts';
import { DeviceWindow } from '../treatments/DeviceFrame.tsx';
import { ZoomLayer } from '../treatments/ZoomToRect.tsx';
import { TransitionWrap } from '../transitions/index.tsx';

function Footage({ beat }: { beat: TBeat }) {
  const local = useCurrentFrame();
  const s = useStyle();
  const fo = beat.footage;
  if (!fo) {
    // diagnostic slate: a capture beat without footage must be visible, never silently skipped
    return (
      <AbsoluteFill style={{ background: s.bg, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...capsStyle(s, 28), color: s.accent }}>no take for beat {beat.id}</div>
      </AbsoluteFill>
    );
  }
  return (
    <Freeze frame={fo.availFrames - 1} active={local >= fo.availFrames}>
      <OffthreadVideo src={s.media(fo.src)} trimBefore={fo.trimBefore} muted style={{ width: W, height: H, objectFit: 'cover', display: 'block' }} />
    </Freeze>
  );
}

function BeatPicture({ beat }: { beat: TBeat }) {
  const local = useCurrentFrame();
  const s = useStyle();
  const { timeline, take } = useFilm();
  if (!beat.capture) return <AbsoluteFill style={{ background: s.bg }} />;
  const frame = beat.startFrame + local;
  const z = zoomAt(timeline, take, beat, frame, s.ease);
  const d = deviceAt(timeline, beat, frame, s.ease);
  const dm = timeline.moments.find((m) => m.beatIndex === beat.index && m.component === 'DeviceFrame' && frame >= m.startFrame && frame < m.startFrame + m.durFrames);
  const footage = (
    <ZoomLayer z={z}>
      <Footage beat={beat} />
    </ZoomLayer>
  );
  if (d.amt <= 0) return <AbsoluteFill style={{ background: s.bg, overflow: 'hidden' }}>{footage}</AbsoluteFill>;
  return (
    <DeviceWindow d={d} s={s} title={typeof dm?.props.title === 'string' ? dm.props.title : undefined}>
      {footage}
    </DeviceWindow>
  );
}

export function PictureLane() {
  const { timeline } = useFilm();
  return (
    <AbsoluteFill>
      {timeline.beats.map((b) => (
        <Sequence key={b.id} name={`picture:${b.id}`} from={b.startFrame} durationInFrames={b.durFrames}>
          <TransitionWrap beat={b} lane="picture">
            <BeatPicture beat={b} />
          </TransitionWrap>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
