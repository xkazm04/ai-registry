#!/usr/bin/env node
// Bundle integrity — the gate for the `knowledge/` lane.
//
// Ported from the producing repo's own hierarchy gate, minus the two checks that cannot
// live here and must not be silently dropped:
//
//   * evidence existence — those pointers name files in a consumer's tree, which this
//     repository does not contain. The check keeps its teeth in the consumer's CI, where
//     the code is. What this gate enforces instead is the LEAK rule: a published file may
//     not carry evidence keys at all (see docs/rkb-profile.md §5).
//   * legacy corpus mapping — bookkeeping between a consumer's old documents and these
//     subjects. Consumer-side by definition.
//
// THE INSTRUMENT IS ASSERTED BEFORE THE RESULT. A checker that walks zero files and exits
// 0 reports "clean" when it means "blind". Every input this gate depends on is proven
// present before any finding is reported, and an empty walk is FATAL, not green.
//
// Zero dependencies on purpose: a knowledge registry that needs an install step before it
// can be validated is a registry people validate less often.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Derived from this file's own location, never hardcoded — a gate that only runs on one
// machine is not a gate.
const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');

const failures = [];
const notes = [];
const fail = (msg) => failures.push(msg);

// ---------------------------------------------------------------- inputs
if (!fs.existsSync(KNOWLEDGE)) {
  console.error(`FATAL: no knowledge/ lane at ${KNOWLEDGE}`);
  console.error('This gate cannot run. Failing loudly rather than reporting a green tree.');
  process.exit(2);
}

const bundles = fs.readdirSync(KNOWLEDGE, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

if (bundles.length === 0) {
  console.error('FATAL: knowledge/ holds zero bundles. THE READER IS BROKEN, or the lane is empty —');
  console.error('either way this gate has checked nothing and will not claim success.');
  process.exit(2);
}

// Minimal YAML-subset frontmatter parser: scalars, `- item` lists, inline [a, b], trailing
// ` # comment` stripped. Anything fancier than that in a frontmatter block is a contract
// violation anyway, and a real YAML parser would accept things this profile forbids.
const parseFrontmatter = (raw) => {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  const fm = {};
  let currentKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && currentKey) {
      fm[currentKey].push(item[1].replace(/\s+#.*$/, '').trim());
      continue;
    }
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, valRaw] = kv;
    const val = valRaw.replace(/\s+#.*$/, '').trim();
    if (val === '') { fm[key] = []; currentKey = key; }
    else if (val === '[]') { fm[key] = []; currentKey = null; }
    else if (val.startsWith('[')) {
      fm[key] = val.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
      currentKey = null;
    } else { fm[key] = val.replace(/^["']|["']$/g, ''); currentKey = null; }
  }
  return { fm, body: raw.slice(m[0].length) };
};

const LAYERS = new Set(['golden-path', 'technique', 'application']);
const STATUSES = new Set(['draft', 'forged', 'reconciled', 'transplant-tested']);
const STACKS = new Set(['react', 'rust', 'sql', 'node', 'process']);

// The evidence keys that must never appear in a published file (rkb-profile §5).
const LEAK_KEYS = ['evidence', 'counter_evidence', 'deviations'];

// Purity denylists per domain. The upper two layers must survive transplant to an
// unrelated codebase, and these patterns are the statically checkable floor of that —
// NOT the test itself, which is handing the document to an agent elsewhere.
//
// A list is a FLOOR: extend it when a leak slips past, never narrow it to make a document
// pass.
const PURITY_PROFILES = {
  software: [
    [/\b(?:src|src-tauri|scripts|docs)\//, 'repo path'],
    [/\.(?:tsx?|rs|mjs|cjs|jsx)\b/, 'source-file extension'],
    [/\b(?:React|Tauri|Rust|TypeScript|JavaScript|Zustand|Tailwind|Vite|Vitest|SQLite|PostgreSQL|Postgres|Personas|UnifiedTable|ESLint|Zod)\b/, 'stack/product identifier'],
  ],
  // Craft domains: the analogue of a repo path is a project asset id; the analogue of a
  // framework name is a tool product name.
  media: [
    [/\b(?:assets|projects|renders|footage)\//, 'project asset path'],
    [/\.(?:mp4|mov|prproj|aep|psd|wav)\b/, 'asset file extension'],
    [/\b(?:Premiere|Resolve|After Effects|Photoshop|Blender|Midjourney|Runway|Gravitone)\b/, 'tool/product identifier'],
  ],
  // Applied when a bundle declares no profile: the domain-independent core only.
  generic: [
    [/\b(?:src|src-tauri|scripts)\//, 'repo path'],
    [/\.(?:tsx?|rs|mjs|cjs|jsx)\b/, 'source-file extension'],
  ],
};

let conceptFiles = 0;
let linksChecked = 0;
const stats = [];

for (const domain of bundles) {
  const dir = path.join(KNOWLEDGE, domain);
  const st = { domain, subjects: 0, techniques: 0, applications: 0, categories: 0 };

  // ---- bundle metadata (OKF index.md)
  const indexFile = path.join(dir, 'index.md');
  let purity = PURITY_PROFILES.generic;
  if (!fs.existsSync(indexFile)) {
    fail(`knowledge/${domain}/index.md is missing — an OKF bundle declares itself`);
  } else {
    const parsed = parseFrontmatter(fs.readFileSync(indexFile, 'utf8'));
    if (!parsed) fail(`knowledge/${domain}/index.md: missing frontmatter block`);
    else {
      const { fm } = parsed;
      if (!fm.okf_version) fail(`knowledge/${domain}/index.md: no okf_version — required for OKF validity`);
      if (fm.okf_bundle_name && fm.okf_bundle_name !== domain) {
        fail(`knowledge/${domain}/index.md: okf_bundle_name "${fm.okf_bundle_name}" ≠ folder "${domain}"`);
      }
      if (fm.purity) {
        if (!PURITY_PROFILES[fm.purity]) fail(`knowledge/${domain}/index.md: unknown purity profile "${fm.purity}"`);
        else purity = PURITY_PROFILES[fm.purity];
      } else {
        notes.push(`knowledge/${domain}: no purity profile declared — generic denylist applied`);
      }
    }
  }

  // ---- laws
  const lawAnchors = new Set();
  const lawsFile = path.join(dir, '_laws.md');
  if (fs.existsSync(lawsFile)) {
    for (const m of fs.readFileSync(lawsFile, 'utf8').matchAll(/<a id="([^"]+)"><\/a>/g)) lawAnchors.add(m[1]);
    if (lawAnchors.size === 0) fail(`knowledge/${domain}/_laws.md exists but declares zero anchors — techniques cannot cite laws`);
  }

  const subjectDirs = fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  st.subjects = subjectDirs.length;
  if (subjectDirs.length === 0) fail(`knowledge/${domain}/ holds zero subjects`);

  // ---- categories.json (optional per bundle; fully gated when present)
  const catsFile = path.join(dir, 'categories.json');
  if (fs.existsSync(catsFile)) {
    let cats = null;
    try { cats = JSON.parse(fs.readFileSync(catsFile, 'utf8')); }
    catch (err) { fail(`knowledge/${domain}/categories.json does not parse: ${err.message}`); }
    if (cats) {
      const ids = new Set((cats.categories ?? []).map((c) => c.id));
      if (ids.size === 0) fail(`knowledge/${domain}/categories.json declares zero categories`);
      const orders = (cats.categories ?? []).map((c) => c.order);
      if (new Set(orders).size !== orders.length) {
        fail(`knowledge/${domain}/categories.json: duplicate order values — order is the display sequence and must be unique`);
      }
      const assigned = cats.subjects ?? {};
      for (const [slug, cat] of Object.entries(assigned)) {
        if (!subjectDirs.includes(slug)) fail(`knowledge/${domain}/categories.json assigns "${slug}", which has no folder`);
        if (!ids.has(cat)) fail(`knowledge/${domain}/categories.json assigns "${slug}" to unknown category "${cat}"`);
      }
      for (const slug of subjectDirs) {
        if (!(slug in assigned)) fail(`knowledge/${domain}/${slug}/ has no categories.json entry — it would not appear in a graph`);
      }
      st.categories = ids.size;
    }
  } else {
    notes.push(`knowledge/${domain}: no categories.json — graph consumers will group by nothing`);
  }

  const readNode = (file, expect) => {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = parseFrontmatter(raw);
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (!parsed) { fail(`${rel}: missing frontmatter block`); return null; }
    conceptFiles++;
    const { fm, body } = parsed;

    // OKF: `type` is the one required field.
    if (!fm.type) fail(`${rel}: no \`type\` — required by OKF for every concept document`);
    else if (!LAYERS.has(fm.type)) fail(`${rel}: unknown type "${fm.type}"`);
    else if (fm.type !== expect) fail(`${rel}: type "${fm.type}" but location says "${expect}"`);

    // This profile's `layer` must agree with `type` where both are present — two spellings
    // of one fact drift the moment only one is edited.
    if (fm.layer && fm.layer !== fm.type) {
      fail(`${rel}: layer "${fm.layer}" ≠ type "${fm.type}" — one fact, two fields, already disagreeing`);
    }
    if (fm.status && !STATUSES.has(fm.status)) fail(`${rel}: unknown status "${fm.status}"`);

    // The leak gate: evidence keys never publish.
    for (const k of LEAK_KEYS) {
      if (k in fm) {
        fail(`${rel}: published frontmatter declares "${k}" — evidence belongs in the consumer's gitignored overlay (rkb-profile §5)`);
      }
    }

    if (expect === 'golden-path' || expect === 'technique') {
      for (const [re, what] of purity) {
        const hit = body.match(re);
        if (hit) fail(`${rel}: body purity — contains ${what} "${hit[0]}"; this layer must transplant unchanged`);
      }
    }
    return fm;
  };

  for (const slug of subjectDirs) {
    const sdir = path.join(dir, slug);
    const gpFile = path.join(sdir, `${slug}.md`);
    if (!fs.existsSync(gpFile)) { fail(`knowledge/${domain}/${slug}/ has no ${slug}.md golden path`); continue; }
    const gp = readNode(gpFile, 'golden-path');
    if (!gp) continue;
    if (gp.subject !== slug) fail(`knowledge/${domain}/${slug}/${slug}.md: subject "${gp.subject}" ≠ folder "${slug}"`);

    // techniques: declared set ↔ files on disk, identical. `technique@owner` entries
    // reference another subject's technique and must resolve THERE and not exist locally.
    const techDir = path.join(sdir, 'techniques');
    const onDisk = new Set(fs.existsSync(techDir)
      ? fs.readdirSync(techDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
      : []);
    const declared = Array.isArray(gp.techniques) ? gp.techniques : [];
    const declaredLocal = new Set();
    for (const t of declared) {
      const shared = t.match(/^([a-z0-9-]+)@([a-z0-9-]+)$/);
      if (shared) {
        const [, tech, owner] = shared;
        if (!fs.existsSync(path.join(dir, owner, 'techniques', `${tech}.md`))) {
          fail(`knowledge/${domain}/${slug}/${slug}.md: shared technique "${t}" — no ${owner}/techniques/${tech}.md`);
        }
        if (onDisk.has(tech)) {
          fail(`knowledge/${domain}/${slug}/${slug}.md: "${t}" declared shared but techniques/${tech}.md also exists locally — one owner (rkb-profile §4)`);
        }
        continue;
      }
      declaredLocal.add(t);
      if (!onDisk.has(t)) fail(`knowledge/${domain}/${slug}/${slug}.md: declares technique "${t}" but techniques/${t}.md does not exist`);
    }
    for (const t of onDisk) {
      if (!declaredLocal.has(t)) fail(`knowledge/${domain}/${slug}/techniques/${t}.md exists but ${slug}.md does not declare it — links hold in both directions`);
    }
    st.techniques += onDisk.size;

    for (const t of onDisk) {
      const fm = readNode(path.join(techDir, `${t}.md`), 'technique');
      if (!fm) continue;
      if (fm.subject !== slug) fail(`knowledge/${domain}/${slug}/techniques/${t}.md: subject "${fm.subject}" ≠ "${slug}"`);
      if (fm.technique !== t) fail(`knowledge/${domain}/${slug}/techniques/${t}.md: technique "${fm.technique}" ≠ filename "${t}"`);
      for (const law of Array.isArray(fm.laws) ? fm.laws : []) {
        if (!lawAnchors.has(law)) fail(`knowledge/${domain}/${slug}/techniques/${t}.md: cites unknown law "${law}"`);
      }
      for (const sw of Array.isArray(fm.shared_with) ? fm.shared_with : []) {
        if (!subjectDirs.includes(sw)) fail(`knowledge/${domain}/${slug}/techniques/${t}.md: shared_with "${sw}" is not a subject in this bundle`);
      }
    }

    const appDir = path.join(sdir, 'applications');
    if (fs.existsSync(appDir)) {
      for (const f of fs.readdirSync(appDir).filter((f) => f.endsWith('.md'))) {
        const fm = readNode(path.join(appDir, f), 'application');
        st.applications++;
        if (!fm) continue;
        if (fm.subject !== slug) fail(`knowledge/${domain}/${slug}/applications/${f}: subject "${fm.subject}" ≠ "${slug}"`);
        if (!STACKS.has(fm.stack)) fail(`knowledge/${domain}/${slug}/applications/${f}: unknown stack "${fm.stack}"`);
        if (!onDisk.has(fm.technique)) fail(`knowledge/${domain}/${slug}/applications/${f}: technique "${fm.technique}" not in this subject's techniques/`);
        const expectName = `${fm.stack}--${fm.technique}.md`;
        if (f !== expectName) fail(`knowledge/${domain}/${slug}/applications/${f}: filename should be "${expectName}" (rkb-profile §2)`);
      }
    }
  }

  stats.push(st);
}

// ---- every relative markdown link inside the lane resolves
//
// Fenced blocks and inline code are stripped first: a regex written in prose is not a
// hyperlink, and a gate that fires on correct content is worse than no gate, because the
// first fix anyone reaches for is deleting the gate.
const stripCode = (s) => s
  .replace(/```[\s\S]*?```/g, (m) => '\n'.repeat((m.match(/\n/g) ?? []).length))
  .replace(/`[^`\n]*`/g, '');

const walk = (d, out = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.md') && !e.name.startsWith('.')) out.push(p);
  }
  return out;
};

for (const f of walk(KNOWLEDGE)) {
  const src = stripCode(fs.readFileSync(f, 'utf8'));
  for (const m of src.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    let target = m[1];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    target = target.split('#')[0];
    if (!target) continue;
    linksChecked++;
    if (!fs.existsSync(path.resolve(path.dirname(f), target))) {
      fail(`${path.relative(ROOT, f).replace(/\\/g, '/')} links to "${m[1]}", which does not exist`);
    }
  }
}

if (conceptFiles === 0) {
  console.error('FATAL: zero concept documents parsed across all bundles. THE PARSER IS BROKEN.');
  process.exit(2);
}
if (linksChecked === 0) {
  console.error('FATAL: zero markdown links found. THE LINK MATCHER IS BROKEN.');
  process.exit(2);
}

// ---------------------------------------------------------------- report
for (const s of stats) {
  console.log(
    `${s.domain}: ${s.subjects} subjects · ${s.techniques} techniques · ${s.applications} applications` +
    (s.categories ? ` · ${s.categories} categories` : ''),
  );
}
console.log(`${conceptFiles} concept documents · ${linksChecked} links checked`);
console.log('NOT checked here: evidence resolution (consumer-side, by design — rkb-profile §5)');
console.log('NOT checkable statically: the live transplant test — only it promotes status to transplant-tested');
for (const n of notes) console.log(`  note: ${n}`);

if (failures.length) {
  console.error(`\nbundle integrity FAILED — ${failures.length} problem(s):\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('bundle integrity OK');
