// check.mjs rules: collisions from source, promise ledger, take errors. No render, no network.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FilmScript, Take } from '../tools/src/contract.ts';
import { collisions, promiseLedger, takeErrors } from '../tools/check.mjs';

const base = {
  title: 't', voice: { settings: { stability: 0.5, similarity: 0.7, style: 0 } }, maxMs: 60000,
  style: { palette: { bg: '#000', fg: '#fff', accent: '#fc0', accent2: '#0cf', muted: '#888' }, fonts: { display: 'A', body: 'B', mono: 'C' }, logo: 'l.svg', radius: 8, easing: [0.2, 1, 0.3, 1] },
};
const film = (beats, extra = {}) => FilmScript.parse({ ...base, ...extra, beats });
const take = Take.parse({ video: 'v.mp4', width: 1920, height: 1080, fps: 30, offsetUncertaintyMs: 0, beats: [{ id: 'b', startMs: 0, endMs: 4000, rects: { '#a': { x: 1, y: 1, w: 10, h: 10 } } }] });
const plate = (id, at, durMs, extra = {}) => ({ id, tier: 1, kind: 'plate', component: 'LowerThird', at, durMs, ...extra });
const cap = { beat: 'b' };

test('two plates overlapping on one beat collide; back-to-back do not', () => {
  const s = film([{ id: 'b', chapter: 'c', line: 'x', settleMs: 4000, capture: cap, moments: [plate('p1', 0, 2000), plate('p2', 1500, 1000)] }]);
  assert.ok(collisions({ script: s, take, balance: 'led' }).some((e) => e.startsWith('plates overlap') && e.includes('p1') && e.includes('p2')));
  const ok = film([{ id: 'b', chapter: 'c', line: 'x', settleMs: 4000, capture: cap, moments: [plate('p1', 0, 2000), plate('p2', 2000, 1000)] }]);
  assert.deepEqual(collisions({ script: ok, take, balance: 'led' }), []);
});

test('overlap only counts moments included at the balance', () => {
  const s = film([{ id: 'b', chapter: 'c', line: 'x', settleMs: 4000, capture: cap, moments: [plate('p1', 0, 2000), plate('p2', 500, 1000, { tier: 3 })] }]);
  assert.deepEqual(collisions({ script: s, take, balance: 'overlay' }), []);
  assert.equal(collisions({ script: s, take, balance: 'led' }).length, 1);
});

test('a moment outliving its beat fails', () => {
  const s = film([{ id: 'b', chapter: 'c', line: 'x', settleMs: 2000, capture: cap, moments: [plate('long', 1000, 5000)] }]);
  assert.ok(collisions({ script: s, take, balance: 'led' }).some((e) => e.startsWith('moment outlives its beat') && e.includes('long')));
});

test('Callout / ZoomToRect naming a selector absent from the take rects fails', () => {
  const s = film([{ id: 'b', chapter: 'c', line: 'x', settleMs: 3000, capture: cap, moments: [
    { id: 'c1', tier: 1, kind: 'plate', component: 'Callout', props: { selector: '#missing', label: 'x' } },
    { id: 'z1', tier: 1, kind: 'treatment', component: 'ZoomToRect', props: { selector: '#a' } },
  ] }]);
  const e = collisions({ script: s, take, balance: 'led' });
  assert.ok(e.some((x) => x.includes('selector absent') && x.includes('#missing')));
  assert.ok(!e.some((x) => x.includes('z1')));
});

test('footage components on a pure motion beat, unknown components, a transition on beat 1, total > maxMs', () => {
  const s = film([
    { id: 'm', chapter: 'c', line: 'x', settleMs: 3000, moments: [
      { id: 'w', tier: 1, kind: 'treatment', component: 'WhipPan' },
      { id: 'd', tier: 1, kind: 'treatment', component: 'DeviceFrame' },
      { id: 'u', tier: 1, kind: 'hero', component: 'Nope' },
    ] },
  ], { maxMs: 1000 });
  const e = collisions({ script: s, take, balance: 'led' });
  assert.ok(e.some((x) => x.startsWith('footage component on a pure motion beat') && x.includes('DeviceFrame')));
  assert.ok(e.some((x) => x.startsWith('unknown component') && x.includes('Nope')));
  assert.ok(e.some((x) => x.startsWith('transition on the first beat')));
  assert.ok(e.some((x) => x.startsWith('film runs')));
});

test('promise ledger: a claim needs footage in its beat or the next', () => {
  const claim = (id) => ({ id, tier: 1, kind: 'plate', component: 'KineticClaim', claim: 'it works', props: { text: 'it works' } });
  const s = film([
    { id: 'a', chapter: 'c', line: 'x', settleMs: 1000, moments: [claim('before')] },
    { id: 'b', chapter: 'c', line: 'x', settleMs: 1000, capture: cap, moments: [claim('in')] },
    { id: 'c', chapter: 'c', line: 'x', settleMs: 1000, moments: [claim('after')] },
  ]);
  const e = promiseLedger(s, 'led');
  assert.equal(e.length, 1);
  assert.ok(e[0].includes('after'));
});

test('take errors fail the check; a missing take with capture beats fails', () => {
  const s = film([{ id: 'b', chapter: 'c', line: 'x', settleMs: 1000, capture: cap }]);
  assert.deepEqual(takeErrors(s, take), []);
  const bad = Take.parse({ ...take, beats: [{ ...take.beats[0], error: 'EXPECT banner missing' }] });
  assert.ok(takeErrors(s, bad)[0].includes('EXPECT banner missing'));
  assert.ok(takeErrors(s, undefined)[0].startsWith('no take'));
});
