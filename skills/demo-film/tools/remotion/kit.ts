// @film/kit: what a consumer hero (film/local/*.tsx) may import from the kit. Style tokens,
// frame-pure easing helpers, the shared primitives and the moment types; nothing stateful.
export { useStyle, prog, life, alpha, mix, GRID, type Style } from './style.ts';
export { useFilm, type MomentProps, type MomentCtx, type ComponentMap } from './context.tsx';
export { Mask, Logo, Rule, capsStyle, num, str } from './plates/primitives.tsx';
export { formatNumber } from './plates/StatCounter.tsx';
export { msToFrames, FPS } from './timeline.ts';
