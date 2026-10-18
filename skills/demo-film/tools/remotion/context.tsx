// What every library component and consumer hero receives. Context carries values only
// (no state); every number in it is derived from props by timeline.ts / camera.ts.
import { createContext, useContext, type ComponentType } from 'react';
import type { Take, TakeBeat } from '../src/contract.ts';
import type { TBeat, Timeline, TMoment } from './timeline.ts';
import type { Pt, Rect } from './camera.ts';

export type FilmCtx = {
  timeline: Timeline;
  take?: Take;
};
export const FilmContext = createContext<FilmCtx | null>(null);
export function useFilm(): FilmCtx {
  const c = useContext(FilmContext);
  if (!c) throw new Error('demo-film: useFilm() outside <Film>');
  return c;
}

export type MomentCtx = {
  moment: TMoment;
  beat: TBeat;
  timeline: Timeline;
  take?: Take;
  takeBeat?: TakeBeat;
  /** Frames this moment lasts (useCurrentFrame() inside a moment runs 0..durFrames-1). */
  durFrames: number;
  /** True when the moment should animate in (it does not open its beat on a cut). */
  enters: boolean;
  /** True when the moment should animate out (it ends before its beat, or props.exit). */
  exits: boolean;
  /** A logged take rect in composition px (full-bleed footage), or undefined. */
  rect: (selector: string) => Rect | undefined;
  /** Screen px of a full-bleed content point at a local frame, through zoom + device frame. k = scale there. */
  toScreen: (p: Pt, localFrame: number) => Pt & { k: number };
  /** A value from the run record: this beat's record, else the nearest earlier beat that has the key. */
  record: (key: string) => unknown;
};

export type MomentProps<P = Record<string, unknown>> = { props: P; ctx: MomentCtx };
export type MomentComponent = ComponentType<MomentProps<any>>;
export type ComponentMap = Record<string, MomentComponent>;
