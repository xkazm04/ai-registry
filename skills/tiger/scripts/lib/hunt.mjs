// Pure half of tiger: the hunt table, seat prompts, proposal parsing, the anonymised pool
// and anchor checks. Nothing here spawns a process, so tests/ import it with `node --test`.

const SKIP = /(^|\/)(node_modules|dist|build|out|target|vendor|coverage|\.next|\.turbo|\.venv|__pycache__|\.git|\.ai|tiger|\.claude|\.agents|\.github)(\/|$)/;
const NOISE = /(\.lock|lock\.json|lock\.yaml|\.min\.[a-z]+|\.map|\.snap|\.svg|\.png|\.jpe?g|\.gif|\.webp|\.ico|\.woff2?|\.ttf|\.pdf|\.mp[34]|\.wav|\.glb|\.gltf|\.bin|\.onnx|\.csv|\.jsonl)$/i;
const CODE = /\.(m?[jt]sx?|cjs|py|rs|go|java|kt|swift|cs|cpp|cc|c|h|hpp|rb|php|vue|svelte|astro|sql|dart|lua|gd|ex|exs|scala|zig)$/i;
const TEST = /(^|\/)(tests?|__tests__|spec|e2e)(\/|$)|\.(test|spec)\.[a-z]+$|_test\.(go|py|rs)$|^test_.*\.py$/i;

export const isCode = (f) => CODE.test(f) && !SKIP.test(f) && !NOISE.test(f);
export const isTest = (f) => TEST.test(f);

/** Every directory prefix of a path, shallowest first, up to `max` segments. */
export function prefixes(file, max = 4) {
  const parts = file.split('/').slice(0, -1);
  const out = [];
  for (let i = 1; i <= Math.min(max, parts.length); i += 1) out.push(parts.slice(0, i).join('/'));
  return out;
}

/**
 * Candidate feature areas from tracked files and their recent history.
 * files: [{ path, bytes }]; touches: Map(path -> { commits, last_days }) for the window.
 * An area is a directory holding >= minFiles code files and <= maxShare of all code; a parent
 * is dropped when one child carries >= 80% of its recent commits (the child is the real area).
 */
// Directory names that hold features rather than being one. Such a directory is an area only
// when it has fewer than two candidate children (then it is the feature).
const CONTAINERS = new Set(['src', 'app', 'lib', '_lib', 'libs', 'packages', 'apps', 'components', '_components', 'modules', 'features', 'api', 'routes', 'pages', 'services', 'utils', 'helpers', 'shared', 'common', 'core', 'internal', 'pkg', 'crates', 'scripts', 'server', 'client', 'web', 'ui']);

export function huntAreas(files, touches, { minFiles = 6, maxShare = 0.25, depth = 4, top = 12 } = {}) {
  const code = files.filter((f) => isCode(f.path) && !isTest(f.path));
  const tests = files.filter((f) => isCode(f.path) && isTest(f.path));
  const total = code.length || 1;
  const areas = new Map();
  for (const f of code) {
    const t = touches.get(f.path);
    for (const p of prefixes(f.path, depth)) {
      const a = areas.get(p) ?? { area: p, files: 0, tests: 0, kb: 0, commits: 0, hot_files: 0, last_days: null };
      a.files += 1;
      a.kb += (f.bytes ?? 0) / 1024;
      if (t) {
        a.commits += t.commits;
        a.hot_files += 1;
        a.last_days = a.last_days == null ? t.last_days : Math.min(a.last_days, t.last_days);
      }
      areas.set(p, a);
    }
  }
  // co-located tests only: a mirrored __tests__ tree says nothing reliable about which area it covers
  for (const f of tests) for (const p of prefixes(f.path, depth)) if (areas.has(p)) areas.get(p).tests += 1;
  let list = [...areas.values()].filter((a) => a.files >= minFiles && a.files / total <= maxShare);
  const keep = new Set(list.map((a) => a.area));
  for (const a of list) {
    const kids = list.filter((b) => b.area.startsWith(`${a.area}/`) && b.area.split('/').length === a.area.split('/').length + 1);
    if (a.commits > 0 && kids.some((k) => k.commits >= 0.8 * a.commits)) keep.delete(a.area);
    if (CONTAINERS.has(a.area.split('/').at(-1)) && kids.length >= 2) keep.delete(a.area);
  }
  list = list.filter((a) => keep.has(a.area));
  const maxC = Math.max(1, ...list.map((a) => a.commits));
  const maxKb = Math.max(1, ...list.map((a) => a.kb));
  for (const a of list) {
    a.kb = Math.round(a.kb);
    a.share = Math.round((a.files / total) * 1000) / 10;
    a.test_ratio = Math.round((a.tests / a.files) * 100) / 100;
    // heat: where the work has gone lately, weighted by mass. Evidence for the caller, not a verdict.
    a.heat = Math.round((0.65 * (a.commits / maxC) + 0.35 * Math.sqrt(a.kb / maxKb)) * 100);
  }
  return list.sort((x, y) => y.heat - x.heat || y.commits - x.commits).slice(0, top);
}

/**
 * Feature areas from a context map (context-map.json): one row per group, the union of its
 * contexts' file_paths, plus how many declared use cases (user flows) its contexts serve.
 * Reach is a value signal git cannot give: a group every major flow runs through outranks a
 * busy group no flow names.
 *
 * Two shapes are read: a flat `contexts[]` whose entries carry `group`, and a nested
 * `groups[].contexts[]` whose group is the parent's `name` (measured 2026-10-15 on firetv: the
 * nested map printed an empty groups table, and the hunt fell back to directory areas).
 */
export function contextsOf(contextMap) {
  const flat = (contextMap?.contexts ?? []).map((c) => ({ ...c }));
  const nested = (contextMap?.groups ?? []).flatMap((g) => (g?.contexts ?? []).map((c) => ({ ...c, group: c.group ?? g.name ?? g.title })));
  return [...flat, ...nested];
}

export function huntGroups(contextMap, touches, bytesOf = () => 0, { top = 12 } = {}) {
  const contexts = contextsOf(contextMap);
  const useCases = contextMap?.use_cases ?? [];
  const groups = new Map();
  for (const c of contexts) {
    const g = c.group ?? '(ungrouped)';
    const row = groups.get(g) ?? { group: g, contexts: [], files: new Set(), use_cases: new Set(), major: new Set() };
    row.contexts.push(c.name);
    for (const f of c.file_paths ?? []) row.files.add(String(f).replace(/\\/g, '/'));
    groups.set(g, row);
  }
  const ctxGroup = new Map(contexts.map((c) => [c.name, c.group ?? '(ungrouped)']));
  for (const u of useCases) {
    for (const name of u.contexts ?? []) {
      const row = groups.get(ctxGroup.get(name));
      if (!row) continue;
      row.use_cases.add(u.slug ?? u.name);
      if (u.tier === 'major') row.major.add(u.slug ?? u.name);
    }
  }
  const rows = [...groups.values()].map((r) => {
    let commits = 0; let hot = 0; let last = null; let kb = 0;
    for (const f of r.files) {
      kb += bytesOf(f) / 1024;
      const t = touches.get(f);
      if (!t) continue;
      commits += t.commits; hot += 1;
      last = last == null ? t.last_days : Math.min(last, t.last_days);
    }
    return { group: r.group, contexts: r.contexts.length, files: r.files.size, hot_files: hot, commits, kb: Math.round(kb), last_days: last, use_cases: r.use_cases.size, major_use_cases: [...r.major] };
  });
  const maxC = Math.max(1, ...rows.map((r) => r.commits));
  const maxKb = Math.max(1, ...rows.map((r) => r.kb));
  const maxU = Math.max(1, ...rows.map((r) => r.use_cases + r.major_use_cases.length));
  for (const r of rows) {
    r.heat = Math.round((0.45 * (r.commits / maxC) + 0.2 * Math.sqrt(r.kb / maxKb) + 0.35 * ((r.use_cases + r.major_use_cases.length) / maxU)) * 100);
  }
  return rows.sort((x, y) => y.heat - x.heat || y.commits - x.commits).slice(0, top);
}

/** `git log --name-only --format=@@%ct` output -> Map(path -> { commits, last_days }). */
export function parseTouches(logText, nowS = Math.floor(Date.now() / 1000)) {
  const m = new Map();
  let ts = null;
  for (const line of logText.split(/\r?\n/)) {
    if (line.startsWith('@@')) { ts = Number(line.slice(2)); continue; }
    const f = line.trim();
    if (!f || ts == null) continue;
    const days = Math.max(0, Math.round((nowS - ts) / 86400));
    const t = m.get(f) ?? { commits: 0, last_days: days };
    t.commits += 1;
    t.last_days = Math.min(t.last_days, days);
    m.set(f, t);
  }
  return m;
}

// ------------------------------------------------------------------ proposals

export const KINDS = ['deepen', 'extend', 'connect', 'leap'];
export const EFFORTS = ['S', 'M', 'L'];

const fencedJson = (text) => {
  const blocks = [...String(text).matchAll(/```(?:json)?\s*\n([\s\S]*?)```/g)].map((m) => m[1]);
  for (const b of blocks.reverse()) { try { return JSON.parse(b); } catch { /* next */ } }
  const s = String(text);
  const i = s.indexOf('{"proposals"');
  if (i >= 0) { try { return JSON.parse(s.slice(i, s.lastIndexOf('}') + 1)); } catch { /* none */ } }
  return null;
};

/**
 * A seat's final message -> { proposals, ratings, problems }. A malformed proposal is kept with a
 * problem note rather than dropped: the caller sees what the seat meant, the ledger sees the defect.
 */
export function parseSeatOutput(text) {
  const v = fencedJson(text);
  if (!v || typeof v !== 'object') return { proposals: [], ratings: [], problems: ['no JSON block with "proposals" in the final message'] };
  const problems = [];
  const proposals = (Array.isArray(v.proposals) ? v.proposals : []).map((p, i) => {
    const out = {
      title: String(p.title ?? '').slice(0, 120),
      kind: KINDS.includes(p.kind) ? p.kind : 'extend',
      outcome: String(p.outcome ?? ''),
      builds_on: String(p.builds_on ?? ''),
      mechanism: String(p.mechanism ?? ''),
      anchors: (Array.isArray(p.anchors) ? p.anchors : []).map(String).slice(0, 12),
      evidence: String(p.evidence ?? ''),
      effort: EFFORTS.includes(String(p.effort).toUpperCase()) ? String(p.effort).toUpperCase() : 'M',
      risk: String(p.risk ?? ''),
      verify: String(p.verify ?? ''),
      why_groundbreaking: String(p.why_groundbreaking ?? ''),
      parents: (Array.isArray(p.parents) ? p.parents : []).map(String),
    };
    if (!out.title) problems.push(`proposal ${i + 1}: no title`);
    if (!out.verify) problems.push(`proposal ${i + 1}: no verify check`);
    if (!out.anchors.length) problems.push(`proposal ${i + 1}: no anchors`);
    if (!KINDS.includes(p.kind)) problems.push(`proposal ${i + 1}: kind "${p.kind}" is not ${KINDS.join('|')}`);
    return out;
  }).filter((p) => p.title);
  const ratings = (Array.isArray(v.ratings) ? v.ratings : [])
    .map((r) => ({ id: String(r.id ?? ''), score: Number(r.score), why: String(r.why ?? '') }))
    .filter((r) => /^P\d+$/.test(r.id) && r.score >= 1 && r.score <= 10);
  if (!proposals.length && !ratings.length) problems.push('JSON block parsed but held no proposals or ratings');
  return { proposals, ratings, problems };
}

/** `path:12`, `path:12-30`, `path#L12` -> { file, from, to } or null (a bare path is file-only). */
export function parseAnchor(a) {
  const s = String(a).trim().replace(/^`|`$/g, '').replace(/^\.\//, '').replace(/\\/g, '/');
  const m = s.match(/^(.+?)(?::|#L)(\d+)(?:-L?(\d+))?$/);
  if (m) return { file: m[1], from: Number(m[2]), to: Number(m[3] ?? m[2]) };
  if (/^[\w.@/-]+\.[A-Za-z0-9]+$/.test(s) || /^[\w.@-]+\/[\w.@/-]+$/.test(s)) return { file: s, from: null, to: null };
  return null;
}

/** lineCount(file) -> number | null (null = no such file). Returns { ok, total, bad: [] }. */
export function checkAnchors(anchors, lineCount) {
  const bad = [];
  let ok = 0;
  for (const a of anchors) {
    const p = parseAnchor(a);
    if (!p) { bad.push(`${a} (not a path)`); continue; }
    const n = lineCount(p.file);
    if (n == null) { bad.push(`${a} (no such file at HEAD)`); continue; }
    if (p.from != null && (p.from < 1 || p.to > n)) { bad.push(`${a} (file has ${n} lines)`); continue; }
    ok += 1;
  }
  return { ok, total: anchors.length, bad };
}

/**
 * Seat results -> the pool. ids are global and stable in submission order (P01..), seats are
 * hidden behind letters the caller never needs; `seat` stays in pool.json for the ledger only.
 * prior: an existing pool (round 2 appends fusions after round-1 ids).
 */
export function buildPool(seatResults, prior = null) {
  const pool = prior ? structuredClone(prior) : { proposals: [], ratings: [], seats: {} };
  let n = pool.proposals.length;
  const letters = 'ABCDEFGHIJKLMNOP';
  for (const r of seatResults) {
    if (!pool.seats[r.seat]) pool.seats[r.seat] = { letter: letters[Object.keys(pool.seats).length], spec: r.spec };
    for (const p of r.proposals) {
      n += 1;
      pool.proposals.push({ id: `P${String(n).padStart(2, '0')}`, seat: r.seat, round: r.round, ...p });
    }
    for (const x of r.ratings) pool.ratings.push({ ...x, by: r.seat });
  }
  return pool;
}

/** Ratings from other seats only (a seat scoring its own idea is not a signal). */
export function peerScores(pool) {
  const by = new Map();
  const owner = new Map(pool.proposals.map((p) => [p.id, p.seat]));
  for (const r of pool.ratings) {
    if (!owner.has(r.id) || owner.get(r.id) === r.by) continue;
    const s = by.get(r.id) ?? [];
    s.push(r.score);
    by.set(r.id, s);
  }
  return Object.fromEntries([...by].map(([id, s]) => [id, { mean: Math.round((s.reduce((a, b) => a + b, 0) / s.length) * 10) / 10, n: s.length }]));
}

/** The caller's reading copy: no seat names, no letters, peer scores and anchor results inline. */
export function poolMarkdown(pool, { title = 'Tiger pool' } = {}) {
  const peers = peerScores(pool);
  const lines = [`# ${title}`, '', `${pool.proposals.length} proposals from ${Object.keys(pool.seats).length} seats. Seats are hidden; judge the idea, not the vendor.`, ''];
  for (const p of pool.proposals) {
    const peer = peers[p.id] ? ` - peers ${peers[p.id].mean}/10 (n=${peers[p.id].n})` : '';
    const anc = p.anchor_check ? ` - anchors ${p.anchor_check.ok}/${p.anchor_check.total}` : '';
    lines.push(`## ${p.id} - ${p.title}`, '', `\`${p.kind}\` \`effort ${p.effort}\` round ${p.round}${anc}${peer}${p.parents?.length ? ` - fuses ${p.parents.join(' + ')}` : ''}`, '');
    for (const [k, label] of [['outcome', 'Outcome'], ['builds_on', 'Builds on'], ['mechanism', 'Mechanism'], ['evidence', 'Evidence'], ['risk', 'Risk'], ['verify', 'Verify'], ['why_groundbreaking', 'Why it matters']]) {
      if (p[k]) lines.push(`- **${label}:** ${p[k]}`);
    }
    if (p.anchors?.length) lines.push(`- **Anchors:** ${p.anchors.map((a) => `\`${a}\``).join(', ')}`);
    if (p.anchor_check?.bad?.length) lines.push(`- **Anchor problems:** ${p.anchor_check.bad.join('; ')}`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

/** Per-seat numbers for the ledger. verdict: { kept: [ids], approved: [ids], landed: [ids] } (ids may be merged clusters' members). */
export function seatStats(pool, verdict = {}, records = {}) {
  const sets = Object.fromEntries(['kept', 'approved', 'landed'].map((k) => [k, new Set(verdict[k] ?? [])]));
  const peers = peerScores(pool);
  return Object.entries(pool.seats).map(([seat, s]) => {
    const mine = pool.proposals.filter((p) => p.seat === seat);
    const anchors = mine.reduce((a, p) => ({ ok: a.ok + (p.anchor_check?.ok ?? 0), total: a.total + (p.anchor_check?.total ?? 0) }), { ok: 0, total: 0 });
    const scored = mine.filter((p) => peers[p.id]);
    const rec = records[seat] ?? {};
    return {
      seat, spec: s.spec, outcome: rec.outcome ?? null, wall_s: rec.wall_s ?? null, cost_usd: rec.cost_usd ?? null,
      proposals: mine.length,
      anchors_ok: anchors.total ? Math.round((anchors.ok / anchors.total) * 100) : null,
      peer_mean: scored.length ? Math.round((scored.reduce((a, p) => a + peers[p.id].mean, 0) / scored.length) * 10) / 10 : null,
      kept: mine.filter((p) => sets.kept.has(p.id)).length,
      approved: mine.filter((p) => sets.approved.has(p.id)).length,
      landed: mine.filter((p) => sets.landed.has(p.id)).length,
    };
  });
}
