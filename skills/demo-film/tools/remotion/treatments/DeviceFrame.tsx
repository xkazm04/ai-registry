// DeviceFrame: footage inside a styled window on the StyleLock ground, with an optional slow
// perspective tilt that settles toward the viewer. Geometry lives in camera.ts (deviceAt) so the
// overlays use the same numbers. props: { tilt?: false | 'left' | 'right', title?: string, enter?, exit? }
import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { DEVICE, H, W, deviceTransform, type Device } from '../camera.ts';
import { alpha, mix, type Style } from '../style.ts';

export function DeviceWindow({ d, s, title, children }: { d: Device; s: Style; title?: string; children: ReactNode }) {
  const winH = H + d.bar;
  const r = s.radius * 1.4 * d.amt;
  const chrome = mix(s.bg, s.fg, 0.1);
  return (
    <AbsoluteFill style={{ background: s.bg }}>
      {/* the ground: a quiet lift behind the window, nothing more */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at 50% 46%, ${mix(s.bg, s.fg, 0.06)} 0%, ${s.bg} 100%)`, opacity: d.amt }} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: (H - winH) / 2,
          width: W,
          height: winH,
          transformOrigin: '50% 50%',
          transform: deviceTransform(d),
          borderRadius: r / Math.max(0.01, d.scale),
          overflow: 'hidden',
          boxShadow: d.amt > 0 ? `0 ${80 * d.amt}px ${160 * d.amt}px ${alpha('#000000', 0.5 * d.amt)}, 0 0 0 ${2 / d.scale}px ${alpha(s.fg, 0.1 * d.amt)}` : undefined,
          background: chrome,
        }}
      >
        <div style={{ height: d.bar, background: chrome, display: 'flex', alignItems: 'center', padding: '0 26px', gap: 12, opacity: d.amt, overflow: 'hidden' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: alpha(s.fg, 0.2) }} />
          ))}
          {title ? (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', marginRight: 78 }}>
              <div style={{ fontFamily: s.body, fontSize: 19, color: alpha(s.fg, 0.55), background: alpha(s.bg, 0.55), padding: '5px 28px', borderRadius: 8, letterSpacing: '0.02em' }}>{title}</div>
            </div>
          ) : null}
        </div>
        <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden' }}>{children}</div>
      </div>
    </AbsoluteFill>
  );
}

/** Registry entry: the picture lane draws DeviceFrame; the motion lane has nothing to add. */
export function DeviceFrame() {
  return null;
}

export const DEVICE_SPEC = DEVICE;
