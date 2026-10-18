// ZoomToRect: punch in on a logged rect (max 1.6x, 600 ms on the StyleLock ease), hold with a
// barely-there push, release. Geometry: camera.ts zoomAt(); the picture lane applies it to the
// footage and the overlays map through it. props: { selector, scale? (<= 1.6), release?: boolean }
import type { ReactNode } from 'react';
import type { Zoom } from '../camera.ts';

export function ZoomLayer({ z, children }: { z: Zoom; children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${z.tx}px, ${z.ty}px) scale(${z.s})` }}>{children}</div>
  );
}

/** Registry entry: drawn by the picture lane. */
export function ZoomToRect() {
  return null;
}
