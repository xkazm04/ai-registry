// Fixture consumer heroes, injected through the @film/local alias. Imports the kit through @film/kit.
import { useCurrentFrame } from 'remotion';
import { alpha, capsStyle, prog, useStyle, type ComponentMap, type MomentProps } from '@film/kit';

/** A small "sample data" tag pinned top-right while footage is on screen. */
export function SampleBadge({ ctx }: MomentProps) {
  const f = useCurrentFrame();
  const s = useStyle();
  const p = ctx.beat.transitionIn ? prog(f, 0, 12, s.ease) : 1;
  return (
    <div style={{ position: 'absolute', top: 44, right: 56, opacity: p, display: 'flex', alignItems: 'center', gap: 10, ...capsStyle(s, 16), color: alpha(s.fg, 0.7) }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: s.accent }} />
      Preview · sample data
    </div>
  );
}

export const components: ComponentMap = { SampleBadge };
