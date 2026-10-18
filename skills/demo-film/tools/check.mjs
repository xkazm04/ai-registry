#!/usr/bin/env node
// demo-film check: everything that can be proven from source before a frame is rendered.
//
//   node tools/check.mjs <film-dir> --balance overlay|sandwich|led [--json]
//
// 1. seek-stability lint over tools/remotion/** and <film-dir>/local/** (frames render out of order:
//    no state, effects, CSS animation, clocks or unseeded randomness on the render path)
// 2. collisions from source: two plates overlapping on one beat; a moment outliving its beat; a rect
//    component naming a selector absent from the take; footage components on a pure motion beat;
//    an unknown component; the film longer than script.maxMs
// 3. promise ledger: a moment with a `claim` sits in a capture beat or the beat right before one
// 4. take errors: any take beat with `error` fails (the recorder already failed; the film is diagnostic)
// Exit 0 when clean, 1 with the list otherwise. Importable: runCheck() and the rule functions.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { AudioManifest, FilmScript, MAX_TIER, Take, momentsFor } from './src/contract.ts';
import { FOOTAGE_COMPONENTS, RECT_COMPONENTS, buildTimeline, momentWindow, roleOf } from './remotion/timeline.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
export const KIT_REMOTION = path.join(here, 'remotion');
export const LIBRARY = [
  'TitleSlam', 'KineticClaim', 'StatCounter', 'Callout', 'LowerThird', 'EndCard',
  'ZoomToRect', 'DeviceFrame', 'CursorSpotlight', 'ClickRipple', 'WhipPan', 'ZoomThrough', 'MaskWipe',
];

// ---- 1. seek-stability lint (ported from stat-reel packages/compositions/src/seek-stability.test.ts)
export const FORBIDDEN = [
  { name: 'CSS transition', re: /\btransition\s*:/ },
  { name: 'CSS animation', re: /\banimation\s*:/ },
  { name: '@keyframes', re: /@keyframes/ },
  { name: 'useEffect', re: /\buseEffect\b/ },
  { name: 'useLayoutEffect', re: /\buseLayoutEffect\b/ },
  { name: 'useState', re: /\buseState\b/ },
  { name: 'useReducer', re: /\buseReducer\b/ },
  { name: 'Math.random', re: /\bMath\.random\b/ },
  { name: 'Date.now', re: /\bDate\.now\b/ },
  { name: 'new Date()', re: /\bnew Date\(\s*\)/ },
  { name: 'performance.now', re: /\bperformance\.now\b/ },
  { name: 'requestAnimationFrame', re: /\brequestAnimationFrame\b/ },
  { name: 'setTimeout/setInterval', re: /\bset(Timeout|Interval)\s*\(/ },
];

export function sourceFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) return f === 'node_modules' ? [] : sourceFiles(p);
    return /\.(ts|tsx|js|jsx|mjs)$/.test(f) && !/\.test\.[jt]sx?$/.test(f) && !f.endsWith('.d.ts') ? [p] : [];
  });
}

/** Strip comments so documentation may name what it forbids. */
export const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'`\\])\/\/.*$/gm, '$1');

export function lintSources(dirs) {
  const hits = [];
  for (const f of dirs.flatMap(sourceFiles)) {
    const lines = stripComments(readFileSync(f, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      for (const rule of FORBIDDEN) if (rule.re.test(line)) hits.push(`${f}:${i + 1} ${rule.name}: ${line.trim()}`);
    });
  }
  return hits;
}

// ---- 2. collisions from source
/** Names a film's local/ exports (best effort, from source text): `export function X`, `export const X`, keys of `components`. */
export function localNames(localDir) {
  const names = new Set();
  for (const f of sourceFiles(localDir)) {
    const src = stripComments(readFileSync(f, 'utf8'));
    for (const m of src.matchAll(/export\s+(?:function|const|class)\s+([A-Z][A-Za-z0-9_]*)/g)) names.add(m[1]);
    const block = /components[^=]*=\s*\{([\s\S]*?)\}/.exec(src);
    if (block) for (const m of block[1].matchAll(/([A-Z][A-Za-z0-9_]*)\s*[:,}]?/g)) names.add(m[1]);
  }
  return names;
}

export function collisions({ script, take, balance, timeline, localDir }) {
  const errors = [];
  const tl = timeline ?? buildTimeline({ script, take, balance });
  const known = new Set([...LIBRARY, ...(localDir ? localNames(localDir) : [])]);
  script.beats.forEach((b, i) => {
    const beat = tl.beats[i];
    const ms = momentsFor(b, balance);
    const windows = ms.map((m) => ({ m, ...momentWindow(m, beat.holdMs) }));
    for (const { m, atMs, durMs } of windows) {
      if (!known.has(m.component)) errors.push(`unknown component: ${b.id}/${m.id} uses "${m.component}" (not in the library or ${localDir ? 'local/' : 'a local/ dir'})`);
      if (roleOf(m) !== 'transition' && atMs + durMs > beat.holdMs)
        errors.push(`moment outlives its beat: ${b.id}/${m.id} ends at ${atMs + durMs} ms, beat holds ${beat.holdMs} ms`);
      if (roleOf(m) === 'transition' && i === 0) errors.push(`transition on the first beat: ${b.id}/${m.id} has nothing to cut from`);
      if (FOOTAGE_COMPONENTS.includes(m.component) && !b.capture)
        errors.push(`footage component on a pure motion beat: ${b.id}/${m.id} (${m.component})`);
      if (RECT_COMPONENTS.includes(m.component) && b.capture) {
        const sel = m.props?.selector;
        const tb = take?.beats.find((t) => t.id === b.id);
        if (typeof sel !== 'string') errors.push(`${m.component} without props.selector: ${b.id}/${m.id}`);
        else if (tb && !tb.rects[sel]) errors.push(`selector absent from take rects: ${b.id}/${m.id} -> "${sel}" (logged: ${Object.keys(tb.rects).join(', ') || 'none'})`);
      }
    }
    // overlaps: two plates at once, or the same treatment twice at once
    for (let x = 0; x < windows.length; x++)
      for (let y = x + 1; y < windows.length; y++) {
        const A = windows[x];
        const B = windows[y];
        const overlap = A.atMs < B.atMs + B.durMs && B.atMs < A.atMs + A.durMs;
        if (!overlap) continue;
        if (A.m.kind === 'plate' && B.m.kind === 'plate')
          errors.push(`plates overlap: ${b.id}/${A.m.id} [${A.atMs}-${A.atMs + A.durMs}] and ${B.m.id} [${B.atMs}-${B.atMs + B.durMs}] ms`);
        else if (A.m.kind === 'treatment' && A.m.component === B.m.component && roleOf(A.m) !== 'transition')
          errors.push(`${A.m.component} twice at once: ${b.id}/${A.m.id} and ${B.m.id}`);
      }
  });
  if (tl.totalMs > script.maxMs) errors.push(`film runs ${tl.totalMs} ms > script.maxMs ${script.maxMs} ms`);
  return errors;
}

// ---- 3. promise ledger
export function promiseLedger(script, balance) {
  const errors = [];
  script.beats.forEach((b, i) => {
    for (const m of momentsFor(b, balance)) {
      if (!m.claim) continue;
      const next = script.beats[i + 1];
      if (b.capture || next?.capture) continue;
      errors.push(`unbacked claim: ${b.id}/${m.id} claims "${m.claim}" but neither its beat nor the next one shows footage`);
    }
  });
  return errors;
}

// ---- 4. take errors
export function takeErrors(script, take) {
  const errors = [];
  const capture = script.beats.filter((b) => b.capture);
  if (!capture.length) return errors;
  if (!take) return [`no take: ${capture.length} capture beat(s) but take/take.json is missing`];
  for (const tb of take.beats) if (tb.error) errors.push(`take error in beat ${tb.id}: ${tb.error}`);
  for (const b of capture) if (!take.beats.some((t) => t.id === b.id)) errors.push(`capture beat ${b.id} has no take beat`);
  for (const tb of take.beats) if (tb.endMs < tb.startMs) errors.push(`take beat ${tb.id}: endMs < startMs`);
  return errors;
}

// ---- loading
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

export function loadFilm(filmDir) {
  const dir = path.resolve(filmDir);
  const scriptPath = path.join(dir, 'film.json');
  if (!existsSync(scriptPath)) throw new Error(`no film.json in ${dir}`);
  const script = FilmScript.parse(readJson(scriptPath));
  const warnings = [];
  const manifestPath = path.join(dir, 'audio', 'manifest.json');
  let manifest;
  if (existsSync(manifestPath)) manifest = AudioManifest.parse(readJson(manifestPath));
  else {
    manifest = AudioManifest.parse({ clips: {}, estimated: script.beats.map((b) => b.id) });
    warnings.push('no audio/manifest.json: every beat timed by estimate (run narrate.mjs)');
  }
  const takePath = path.join(dir, 'take', 'take.json');
  const take = existsSync(takePath) ? Take.parse(readJson(takePath)) : undefined;
  return { dir, script, manifest, take, warnings, localDir: path.join(dir, 'local') };
}

export function runCheck(filmDir, balance) {
  if (!(balance in MAX_TIER)) throw new Error(`--balance must be one of ${Object.keys(MAX_TIER).join('|')}`);
  const film = loadFilm(filmDir);
  const { script, manifest, take, localDir } = film;
  const timeline = buildTimeline({ script, manifest, take, balance });
  const lint = lintSources([KIT_REMOTION, localDir]).map((h) => `seek lint: ${h}`);
  const errors = [
    ...lint,
    ...collisions({ script, take, balance, timeline, localDir }),
    ...promiseLedger(script, balance),
    ...takeErrors(script, take),
  ];
  const warnings = [...film.warnings, ...timeline.notes];
  for (const v of [...Object.values(manifest.clips), ...Object.values(manifest.music)])
    if (!existsSync(path.join(film.dir, v.file))) errors.push(`missing audio file: ${v.file}`);
  if (take && !existsSync(path.join(film.dir, take.video))) errors.push(`missing take video: ${take.video}`);
  return { ok: errors.length === 0, errors, warnings, timeline, film };
}

function main(argv) {
  const args = argv.slice(2);
  const filmDir = args.find((a) => !a.startsWith('--'));
  const bi = args.indexOf('--balance');
  const balance = bi >= 0 ? args[bi + 1] : undefined;
  if (!filmDir || !balance) {
    console.error('usage: node tools/check.mjs <film-dir> --balance overlay|sandwich|led [--json]');
    return 2;
  }
  const r = runCheck(filmDir, balance);
  if (args.includes('--json')) {
    console.log(JSON.stringify({ ok: r.ok, errors: r.errors, warnings: r.warnings, totalMs: r.timeline.totalMs }, null, 2));
  } else {
    for (const w of r.warnings) console.log(`  warn  ${w}`);
    for (const e of r.errors) console.log(`  FAIL  ${e}`);
    console.log(`check ${balance}: ${r.ok ? 'ok' : `${r.errors.length} failure(s)`} (${r.timeline.beats.length} beats, ${r.timeline.moments.length} moments, ${(r.timeline.totalMs / 1000).toFixed(2)} s)`);
  }
  return r.ok ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) process.exitCode = main(process.argv);
