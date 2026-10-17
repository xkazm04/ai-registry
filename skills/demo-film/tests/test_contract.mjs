// The wire contract, pinned: the fixture script parses with its defaults, and the timing and
// identity helpers every tool shares behave as the design brief says.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  AudioManifest, FilmScript, MAX_TIER, Take, clipHashInput, estimateMs, holdMs, momentsFor,
} from '../tools/src/contract.ts';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/film/film.json', import.meta.url), 'utf8'));

test('the fixture film parses and gains the contract defaults', () => {
  const s = FilmScript.parse(fixture);
  assert.equal(s.fps, 30);
  assert.deepEqual(s.size, { w: 1920, h: 1080 });
  assert.equal(s.breathMs, 350);
  assert.equal(s.voice.model, 'eleven_multilingual_v2');
  assert.equal(s.voice.role, 'narrator');
  assert.deepEqual(s.beats[2].moments, undefined, 'absent stays absent');
  assert.deepEqual(s.beats[0].moments[0].props, { text: 'Haggle' });
});

test('the script rejects what the contract forbids', () => {
  assert.equal(FilmScript.safeParse({ ...fixture, fps: 60 }).success, false);
  assert.equal(FilmScript.safeParse({ ...fixture, beats: [] }).success, false);
  const fourCues = { cues: [1, 2, 3, 4].map((i) => ({ ...fixture.music.cues[0], id: `c${i}` })) };
  assert.equal(FilmScript.safeParse({ ...fixture, music: fourCues }).success, false, 'max 3 cues');
  const badTier = structuredClone(fixture);
  badTier.beats[0].moments[0].tier = 4;
  assert.equal(FilmScript.safeParse(badTier).success, false);
});

test('estimateMs is 15 characters per second, rounded', () => {
  assert.equal(estimateMs(''), 0);
  assert.equal(estimateMs('x'.repeat(15)), 1000);
  assert.equal(estimateMs('x'.repeat(32)), 2133);
});

test('holdMs = max(clip or estimate, settle) + breath', () => {
  const beat = { id: 'b', chapter: 'c', line: 'x'.repeat(30), settleMs: 1000 };
  assert.equal(holdMs(beat, 350), 2000 + 350, 'estimate wins over settle');
  assert.equal(holdMs(beat, 350, 2500), 2500 + 350, 'a measured clip replaces the estimate');
  assert.equal(holdMs({ ...beat, settleMs: 4000 }, 350, 2500), 4000 + 350, 'settle wins when longer');
});

test('momentsFor filters by the balance tier ceiling', () => {
  const s = FilmScript.parse(fixture);
  const trade = s.beats[1];
  assert.deepEqual(MAX_TIER, { overlay: 1, sandwich: 2, led: 3 });
  assert.deepEqual(momentsFor(trade, 'overlay').map((m) => m.id), []);
  assert.deepEqual(momentsFor(trade, 'sandwich').map((m) => m.id), ['trade-zoom']);
  assert.deepEqual(momentsFor(trade, 'led').map((m) => m.id), ['trade-zoom', 'trade-stat']);
  assert.deepEqual(momentsFor(s.beats[2], 'led'), []);
});

test('clipHashInput changes with every field that changes the audio', () => {
  const voice = FilmScript.parse(fixture).voice;
  const base = clipHashInput('hello', voice, 'v1');
  assert.notEqual(clipHashInput('hello!', voice, 'v1'), base, 'line');
  assert.notEqual(clipHashInput('hello', voice, 'v2'), base, 'voice id');
  assert.notEqual(clipHashInput('hello', { ...voice, model: 'eleven_v4' }, 'v1'), base, 'model');
  for (const k of ['stability', 'similarity', 'style']) {
    const v = { ...voice, settings: { ...voice.settings, [k]: voice.settings[k] + 0.1 } };
    assert.notEqual(clipHashInput('hello', v, 'v1'), base, k);
  }
  assert.equal(clipHashInput('hello', voice, 'v1'), base, 'deterministic');
});

test('AudioManifest defaults and integer-ms rule', () => {
  assert.deepEqual(AudioManifest.parse({ clips: {} }), { clips: {}, music: {}, estimated: [] });
  assert.equal(AudioManifest.safeParse({ clips: { a: { file: 'audio/a.mp3', ms: 1.5, hash: 'h' } } }).success, false);
  assert.equal(AudioManifest.safeParse({ clips: { a: { file: 'audio/a.mp3', ms: 0, hash: 'h' } } }).success, false);
});

test('Take parses a minimal record and refuses null for an absent value', () => {
  const take = { video: 'take/take.webm', width: 1920, height: 1080, fps: 30, offsetUncertaintyMs: 40, beats: [{ id: 'trade', startMs: 0, endMs: 4000 }] };
  const t = Take.parse(take);
  assert.deepEqual(t.beats[0].rects, {});
  assert.deepEqual(t.beats[0].clicks, []);
  assert.equal(Take.safeParse({ ...take, beats: [{ ...take.beats[0], error: null }] }).success, false);
});
