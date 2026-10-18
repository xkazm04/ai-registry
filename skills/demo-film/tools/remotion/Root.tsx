import { Composition } from 'remotion';
import { Film, FilmProps, calculateFilmMetadata } from './Film.tsx';

/** Studio placeholder only; render.mjs always passes real props. */
const defaultProps: FilmProps = {
  script: {
    title: 'demo-film',
    fps: 30,
    size: { w: 1920, h: 1080 },
    voice: { role: 'narrator', model: 'eleven_multilingual_v2', settings: { stability: 0.5, similarity: 0.75, style: 0.2 } },
    breathMs: 350,
    maxMs: 10000,
    style: {
      palette: { bg: '#0b1416', fg: '#f3efe6', accent: '#e3b341', accent2: '#1f8a84', muted: '#8aa09e' },
      fonts: { display: 'Bahnschrift', body: 'Segoe UI', mono: 'Cascadia Mono' },
      logo: 'logo.svg',
      radius: 14,
      easing: [0.22, 1, 0.36, 1],
    },
    beats: [
      { id: 'open', chapter: 'open', line: 'A film compiled from one script.', settleMs: 2000, moments: [{ id: 't', tier: 1, kind: 'plate', component: 'TitleSlam', props: { title: 'demo-film', kicker: 'kit' } }] },
    ],
  },
  manifest: { clips: {}, music: {}, estimated: ['open'] },
  balance: 'sandwich',
  baseDir: '',
};

export function Root() {
  return (
    <Composition
      id="Film"
      component={Film}
      schema={FilmProps}
      defaultProps={defaultProps}
      calculateMetadata={calculateFilmMetadata}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={1}
    />
  );
}
