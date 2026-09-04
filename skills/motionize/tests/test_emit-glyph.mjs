// Deterministic tests for the pure core of tools/emit-glyph.mjs.
//
// `node --test skills/motionize/tests` — no install, no network, no fixtures on disk.
// This file imports ONLY `svgToGlyphData`, which is pure and depends on nothing but
// `fs`/`path` at module scope; the vectorizer (@neplex/vectorizer) and svgo live in
// trace.mjs and trace-set.mjs and are never pulled in here. A test tier that needs
// `npm install` to run is a test tier nobody runs.
//
// What is worth pinning is not "does it parse an SVG" but the three judgments the
// function makes that a reader would otherwise have to re-derive from the comments:
//
//  1. THE WRITER AGREEMENT. emit-glyph.mjs and trace-set.mjs both emit the component
//     data, and they have disagreed before — this one exported a bare array plus a
//     separate `_VIEWBOX` const while the other emitted `{ viewBox, data }`, so a
//     single-glyph trace produced a module no consumer could feed to the component
//     that consumed the set-traced ones. The comment at emit-glyph.mjs records the
//     fix; nothing enforced it. trace-set.mjs scrapes this function's output with two
//     regexes, so those regexes ARE the contract, and the last test here reads them
//     out of trace-set.mjs rather than restating them.
//  2. DEMOTE BY COLOUR, NEVER BY GEOMETRY. A full-canvas rect is not automatically
//     the background: the tracer sometimes lays the darkest layer down first as an
//     exact canvas rect and paints the page over it, so there the rect IS the
//     line-work. Demoting on geometry makes every outline disappear.
//  3. NOTHING IS DROPPED. Surface regions are RECOLORED to `var(--background)`, not
//     removed — the stacked output relies on them painting over accents to carve the
//     line gaps, and they follow the theme for free.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { svgToGlyphData } from '../tools/emit-glyph.mjs';

const TOOLS = new URL('../tools/', import.meta.url);

// The path shape the function's own matcher requires: fill before d, self-closing.
const svgOf = (paths, { w = 1024, h = 1024 } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`
  + paths.map((p) => `<path fill="${p.fill}" d="${p.d}"/>`).join('')
  + '</svg>';

const FULL = 'M0 0 L1024 0 L1024 1024 L0 1024 Z';
const SMALL = 'M500 500 L520 500 L520 520 L500 520 Z';
const CORNER = 'M20 20 L60 20 L60 60 L20 60 Z';

// ------------------------------------------------------------------ geometry
test('viewBox comes from the viewBox attribute', () => {
  const out = svgToGlyphData(svgOf([{ fill: '#123456', d: SMALL }], { w: 800, h: 600 }), { name: 'G' });
  assert.match(out.ts, /viewBox: "0 0 800 600"/);
});

test('width/height stand in when there is no viewBox, and 1024 when there is neither', () => {
  const wh = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">'
    + `<path fill="#123456" d="${SMALL}"/></svg>`;
  assert.match(svgToGlyphData(wh, { name: 'G' }).ts, /viewBox: "0 0 640 480"/);

  const bare = `<svg><path fill="#123456" d="${SMALL}"/></svg>`;
  assert.match(svgToGlyphData(bare, { name: 'G' }).ts, /viewBox: "0 0 1024 1024"/);
});

// ------------------------------------------------------------------ demotion
test('a full-canvas WHITE path is recolored to var(--background), not dropped', () => {
  const out = svgToGlyphData(svgOf([
    { fill: '#FFFFFF', d: FULL },
    { fill: '#0D1F51', d: CORNER },
  ]), { name: 'G' });
  const data = JSON.parse(/data: (\[.*\]) \};/s.exec(out.ts)[1]);
  assert.equal(out.elements, 2, 'both paths survive');
  assert.equal(out.dropped, 0, 'the writer drops nothing — surface regions carve line gaps');
  assert.equal(data[0].fill, 'var(--background)');
  assert.equal(data[1].fill, '#0D1F51', 'dark line-work is not surface: navy has a bright blue channel');
});

test('a full-canvas SATURATED path keeps its fill — demote by colour, never by geometry', () => {
  // The regression this guards: VTracer sometimes lays the darkest quantized layer
  // down first as an exact canvas rect and paints the page over it. Demoting on
  // "covers the canvas" alone would erase the line-work in that whole class of art.
  const out = svgToGlyphData(svgOf([{ fill: '#F4B214', d: FULL }]), { name: 'G' });
  const data = JSON.parse(/data: (\[.*\]) \};/s.exec(out.ts)[1]);
  assert.equal(data[0].fill, '#F4B214');
});

test('a SMALL surface path keeps its fill — sparks and thin holes are not the background', () => {
  const out = svgToGlyphData(svgOf([{ fill: '#FFFFFF', d: SMALL }]), { name: 'G' });
  const data = JSON.parse(/data: (\[.*\]) \};/s.exec(out.ts)[1]);
  assert.equal(data[0].fill, '#FFFFFF');
});

test('surfaceFill "from>to" repaints only the LARGE regions of that colour', () => {
  const out = svgToGlyphData(
    svgOf([{ fill: '#F4B214', d: FULL }, { fill: '#F4B214', d: SMALL }]),
    { name: 'G', surfaceFill: '#F4B214>#7C3AED' },
  );
  const data = JSON.parse(/data: (\[.*\]) \};/s.exec(out.ts)[1]);
  assert.equal(data[0].fill, '#7C3AED', 'the hero slab is repainted');
  assert.equal(data[1].fill, '#F4B214', 'droplets keep the accent, so it stays sparse');
});

test('surfaceFill matches by RGB distance, because the tracer quantizes one slab into many hexes', () => {
  // #F2B012 is 4 units from #F4B214 in RGB space: an exact match would never fire.
  const near = svgToGlyphData(svgOf([{ fill: '#F2B012', d: FULL }]), { name: 'G', surfaceFill: '#F4B214' });
  assert.match(near.ts, /"fill":"var\(--background\)"/);

  const far = svgToGlyphData(
    svgOf([{ fill: '#F2B012', d: FULL }]),
    { name: 'G', surfaceFill: '#F4B214', surfaceTolerance: 1 },
  );
  assert.match(far.ts, /"fill":"#F2B012"/, 'a tight tolerance must not sweep up a neighbour');
});

// ------------------------------------------------------------------ ordering
test('delay is a 0..1 reveal coordinate, radial by default and angular on request', () => {
  const paths = [{ fill: '#111111', d: 'M512 512 L520 520 Z' }, { fill: '#222222', d: CORNER }];
  const radial = JSON.parse(/data: (\[.*\]) \};/s.exec(svgToGlyphData(svgOf(paths), { name: 'G' }).ts)[1]);
  for (const p of radial) {
    assert.ok(p.delay >= 0 && p.delay <= 1, `delay ${p.delay} is outside 0..1`);
  }
  assert.equal(radial[0].delay, 0, 'a path anchored at the centre reveals first');
  assert.ok(radial[1].delay > radial[0].delay, 'the reveal radiates center-out');

  const angular = JSON.parse(
    /data: (\[.*\]) \};/s.exec(svgToGlyphData(svgOf(paths), { name: 'G', order: 'angular' }).ts)[1],
  );
  assert.notDeepEqual(angular.map((p) => p.delay), radial.map((p) => p.delay));
});

test('paint order is preserved — delay drives timing only', () => {
  // Reordering would hide colored fills behind the navy the tracer stacks under them.
  const fills = ['#0D1F51', '#F4B214', '#7C3AED'];
  const out = svgToGlyphData(svgOf(fills.map((f, i) => ({ fill: f, d: `M${100 + i * 10} ${100 + i * 10} L${120 + i * 10} ${100 + i * 10} Z` }))), { name: 'G' });
  const data = JSON.parse(/data: (\[.*\]) \};/s.exec(out.ts)[1]);
  assert.deepEqual(data.map((p) => p.fill), fills);
});

// ------------------------------------------------------------------ the writer agreement
test('the emitted module is a single TracedGlyph object, not a bare array plus a viewBox const', () => {
  const out = svgToGlyphData(svgOf([{ fill: '#123456', d: SMALL }]), { name: 'NETWORK_GLYPH' });
  assert.match(out.ts, /^export const NETWORK_GLYPH: TracedGlyph = \{ viewBox: "0 0 1024 1024", data: \[.*\] \};$/m);
  assert.doesNotMatch(out.ts, /_VIEWBOX/, 'the separate viewBox const is the shape consumers could not feed to the component');
  assert.match(out.ts, /AUTO-GENERATED/, 'a generated module must say so');
});

test('trace-set.mjs can still scrape this writer — the two emitters agree', () => {
  // trace-set.mjs calls svgToGlyphData with name "_TMP" and pulls the viewBox and the
  // data array back out of the emitted module with two regexes. Those regexes are the
  // contract between the two writers, so they are READ from the file rather than
  // restated here: a scraper that stops matching is the bug, and a copy of it in this
  // test would agree with the assertion while disagreeing with the tool.
  const src = readFileSync(fileURLToPath(new URL('trace-set.mjs', TOOLS)), 'utf8');
  const literalOf = (varName) => {
    const m = new RegExp(`const ${varName} = (/.*/[a-z]*)\\.exec\\(ts\\)`).exec(src);
    assert.ok(m, `trace-set.mjs no longer scrapes \`${varName}\` out of the emitted module — the contract moved`);
    const lit = m[1];
    const end = lit.lastIndexOf('/');
    return new RegExp(lit.slice(1, end), lit.slice(end + 1));
  };

  const { ts } = svgToGlyphData(svgOf([{ fill: '#123456', d: SMALL }], { w: 800, h: 600 }), { name: '_TMP' });

  const viewBoxHit = literalOf('viewBox').exec(ts);
  assert.ok(viewBoxHit, "trace-set.mjs's viewBox scraper found nothing in emit-glyph's output");
  assert.equal(viewBoxHit[1], '0 0 800 600');

  const dataHit = literalOf('data').exec(ts);
  assert.ok(dataHit, "trace-set.mjs's data scraper found nothing in emit-glyph's output");
  const parsed = JSON.parse(dataHit[1]);
  assert.equal(parsed.length, 1);
  assert.deepEqual(Object.keys(parsed[0]).sort(), ['d', 'delay', 'fill']);
});
