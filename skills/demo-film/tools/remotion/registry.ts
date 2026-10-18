// The single component map moments reference by name: the kit library, with the consumer's
// @film/local heroes merged over it (a local export of the same name replaces the library entry
// in the motion lane). Picture treatments and transitions are drawn by the lanes; their entries
// exist so a name is always resolvable.
import * as local from '@film/local';
import type { ComponentMap } from './context.tsx';
import { Callout } from './plates/Callout.tsx';
import { EndCard } from './plates/EndCard.tsx';
import { KineticClaim } from './plates/KineticClaim.tsx';
import { LowerThird } from './plates/LowerThird.tsx';
import { StatCounter } from './plates/StatCounter.tsx';
import { TitleSlam } from './plates/TitleSlam.tsx';
import { ClickRipple, CursorSpotlight } from './treatments/CursorSpotlight.tsx';
import { DeviceFrame } from './treatments/DeviceFrame.tsx';
import { ZoomToRect } from './treatments/ZoomToRect.tsx';
import { MaskWipe, WhipPan, ZoomThrough } from './transitions/index.tsx';

export const library: ComponentMap = {
  TitleSlam,
  KineticClaim,
  StatCounter,
  Callout,
  LowerThird,
  EndCard,
  ZoomToRect,
  DeviceFrame,
  CursorSpotlight,
  ClickRipple,
  WhipPan,
  ZoomThrough,
  MaskWipe,
};

const mod = local as unknown as { components?: ComponentMap; default?: ComponentMap };
export const localComponents: ComponentMap = mod.components ?? mod.default ?? {};
export const components: ComponentMap = { ...library, ...localComponents };
