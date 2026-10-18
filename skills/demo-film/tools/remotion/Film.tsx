// The film: one composition, lanes in fixed order picture -> motion -> voice -> music -> fx,
// every number from buildTimeline(). Input props are the wire contract plus where media lives.
//
// Media: `baseDir` is the URL the film directory is served from. render.mjs serves the film dir
// over a loopback HTTP server and passes `http://127.0.0.1:<port>/`; OffthreadVideo, Html5Audio and
// Img all fetch from it (works with bundle()+renderMedia on Windows without copying media into the
// bundle). Any other value is treated as a folder inside the bundle's public dir (staticFile).
import { zColor } from '@remotion/zod-types';
import { useMemo } from 'react';
import { AbsoluteFill, staticFile, type CalculateMetadataFunction } from 'remotion';
import { z } from 'zod';
import { AudioManifest, Balance, FilmScript, StyleLock, Take } from '../src/contract.ts';
import { FilmContext } from './context.tsx';
import { FxLane, MusicLane, VoiceLane } from './lanes/AudioLanes.tsx';
import { MotionLane } from './lanes/MotionLane.tsx';
import { PictureLane } from './lanes/PictureLane.tsx';
import { components } from './registry.ts';
import { StyleContext, makeStyle } from './style.ts';
import { buildTimeline } from './timeline.ts';

const Palette = z.object({ bg: zColor(), fg: zColor(), accent: zColor(), accent2: zColor(), muted: zColor() });

export const FilmProps = z.object({
  script: FilmScript.extend({ style: StyleLock.extend({ palette: Palette }) }),
  manifest: AudioManifest,
  take: Take.optional(),
  balance: Balance,
  baseDir: z.string(),
  /** Procedural sound effects render.mjs made (paths relative to the film dir). */
  fx: z.object({ whoosh: z.string().optional() }).optional(),
});
export type FilmProps = z.infer<typeof FilmProps>;

export function mediaResolver(baseDir: string): (rel: string) => string {
  return (rel: string) => {
    if (/^(https?:|data:|blob:)/.test(rel)) return rel;
    const clean = rel.replace(/\\/g, '/').replace(/^\.\//, '');
    if (/^https?:\/\//.test(baseDir)) return new URL(clean.split('/').map(encodeURIComponent).join('/'), baseDir.endsWith('/') ? baseDir : `${baseDir}/`).href;
    return staticFile(baseDir ? `${baseDir.replace(/\/$/, '')}/${clean}` : clean);
  };
}

export const calculateFilmMetadata: CalculateMetadataFunction<FilmProps> = ({ props }) => {
  const tl = buildTimeline(props);
  return { durationInFrames: Math.max(1, tl.totalFrames), fps: tl.fps, width: tl.width, height: tl.height };
};

export function Film(props: FilmProps) {
  const timeline = useMemo(() => buildTimeline(props), [props]);
  const style = useMemo(() => makeStyle(props.script.style, mediaResolver(props.baseDir)), [props.script.style, props.baseDir]);
  const film = useMemo(() => ({ timeline, take: props.take }), [timeline, props.take]);
  return (
    <StyleContext.Provider value={style}>
      <FilmContext.Provider value={film}>
        <AbsoluteFill style={{ background: style.bg, fontFamily: style.body, color: style.fg, overflow: 'hidden' }}>
          <PictureLane />
          <MotionLane components={components} />
          <VoiceLane />
          <MusicLane />
          <FxLane whoosh={props.fx?.whoosh} />
        </AbsoluteFill>
      </FilmContext.Provider>
    </StyleContext.Provider>
  );
}
