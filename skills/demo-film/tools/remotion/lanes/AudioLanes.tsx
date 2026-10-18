// Sound lanes, in the fixed order voice -> music -> fx. Every volume is a pure function of frame
// computed in timeline.ts (musicGain: bed level, 9 dB duck under any voice with 150 ms ramps, fades).
import { Html5Audio, Sequence } from 'remotion';
import { useFilm } from '../context.tsx';
import { useStyle } from '../style.ts';
import { msToFrames, musicGain } from '../timeline.ts';

export function VoiceLane() {
  const { timeline } = useFilm();
  const s = useStyle();
  return (
    <>
      {timeline.voice.map((v) => (
        <Sequence key={v.beatId} name={`voice:${v.beatId}`} from={v.from} durationInFrames={v.durFrames} layout="none">
          <Html5Audio src={s.media(v.file)} />
        </Sequence>
      ))}
    </>
  );
}

export function MusicLane() {
  const { timeline } = useFilm();
  const s = useStyle();
  return (
    <>
      {timeline.music.map((c) => (
        <Sequence key={c.cueId} name={`music:${c.cueId}`} from={c.from} durationInFrames={c.durFrames} layout="none">
          <Html5Audio src={s.media(c.file)} volume={(f: number) => musicGain(c, timeline.voiceSpans, c.from + f, timeline.fps)} />
        </Sequence>
      ))}
    </>
  );
}

/** fx: a procedural whoosh (render.mjs synthesises it with ffmpeg) on each motion transition. */
export function FxLane({ whoosh }: { whoosh?: string }) {
  const { timeline } = useFilm();
  const s = useStyle();
  if (!whoosh) return null;
  return (
    <>
      {timeline.fx.map((x) => (
        <Sequence key={`${x.kind}-${x.beatId}`} name={`fx:${x.kind}:${x.beatId}`} from={x.from} durationInFrames={msToFrames(900)} layout="none">
          <Html5Audio src={s.media(whoosh)} volume={x.component === 'MaskWipe' ? 0.12 : 0.18} />
        </Sequence>
      ))}
    </>
  );
}
