// ZoomToRect: punch in on a logged rect (max 1.6x, 600 ms on the StyleLock ease), hold with a
// barely-there push, release. Geometry: camera.ts zoomAt(); the picture lane applies it to the
// footage and the overlays map through it. props: { selector, scale? (<= 1.6), release?: boolean,
// isolate?: boolean (cut the footage to the element on the ground), pad? (isolate margin, px) }
import type { ReactNode } from 'react';
import type { Zoom } from '../camera.ts';

export function ZoomLayer({ z, children, radius = 0 }: { z: Zoom; children: ReactNode; radius?: number }) {
  const layer = (
    <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${z.tx}px, ${z.ty}px) scale(${z.s})` }}>{children}</div>
  );
  if (!z.clip) return layer;
  const c = z.clip;
  return (
    <div style={{ position: 'absolute', inset: 0, clipPath: `inset(${c.top}px ${c.right}px ${c.bottom}px ${c.left}px round ${radius}px)` }}>{layer}</div>
  );
}

/** Registry entry: drawn by the picture lane. */
export function ZoomToRect() {
  return null;
}
