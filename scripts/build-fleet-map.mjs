#!/usr/bin/env node
/**
 * build-fleet-map — the map of context maps, and its inverse.
 *
 * ## The gap this closes
 *
 * `build-registry-map.mjs` joins ONE project's contexts to the registry's subjects, so it can
 * say where a project deviates from a standard it already has a context for. It cannot say
 * what a project has NO context for, because a subject with no matching context never
 * appears in the join. That second kind of gap - a capability the corpus models and a
 * project of this purpose lacks entirely - is a direction, not a deviation, and until this
 * script nothing in the registry could see one.
 *
 * This reads every project's `.ai/registry-map.json`, `.ai/manifest.yaml` (purpose, domains,
 * and the `scope:` block) and optional `.ai/directions/ledger.jsonl`, plus every bundle's
 * `index.json`, and writes two files:
 *
 *   librarian/fleet-map.json  - projects -> groups -> contexts -> governing subjects (the
 *                               overview), and subjects -> projects present / absent with a
 *                               classification per absence (the inverse index)
 *   librarian/fleet-map.md    - the same, readable
 *
 * ## Absence is a hypothesis until scope says otherwise
 *
 * A subject a project lacks is a candidate direction ONLY if the project's declared scope
 * admits it. Classification per (subject, absent project), first match wins:
 *
 *   out-of-domain   the project's manifest domains do not include the subject's bundle
 *   out-of-scope    the scope block lists the subject, its category or its subcategory
 *   declined        the project's directions ledger declined it (reason carried)
 *   deferred        the ledger deferred it
 *   accepted        the ledger accepted it - a direction in flight, not a candidate
 *   candidate       everything else - the list the intake direction pass reads
 *
 * The script never invents scope. A project with no `scope:` block classifies every absence
 * inside its domains as `candidate` and the summary says `scope: missing`, which is the
 * instruction to write one.
 *
 * Public-safe by construction: slugs, group and context names, states, counts, and each
 * context's PROJECT-RELATIVE paths (the registry map already stores them that way). Never
 * an absolute path - a row carrying one is dropped and counted in `problems`, because the
 * same file is read on several devices whose roots differ (projects.json declares the root
 * per machine; the map must not). No hosts, no evidence strings - those stay in the
 * project's own map.
 *
 * Zero dependencies. Asserts its inputs before it reports.
 *
 *   node scripts/build-fleet-map.mjs            # write both files
 *   node scripts/build-fleet-map.mjs --check    # exit 1 if librarian/fleet-map.json is stale
 *   node scripts/build-fleet-map.mjs --json     # print the JSON to stdout instead of writing
 *
 * Exit 2: the fleet cannot be resolved on this machine (no .machine.local.json) or no
 * project carries a registry map - nothing to build from, which is different from a map
 * with zero candidates.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFleet } from './lib/projects.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const TO_STDOUT = args.includes('--json');
const OUT_JSON = path.join(ROOT, 'librarian', 'fleet-map.json');
const OUT_MD = path.join(ROOT, 'librarian', 'fleet-map.md');
const SCHEMA = 'rkb-fleet-map/1';
const PRESENT_CONFIDENCE = new Set(['strong', 'probable']);
const ABSOLUTE = /^([A-Za-z]:[\\/]|[\\/]|~)/; // a device-specific path; never published

const readJson = (p) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
};
const readText = (p) => {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
};

// ---------------------------------------------------------------------------
// A deliberately small YAML reader: only what the manifest's `scope:` block and
// `purpose:` line need. Scalars, inline lists `[a, b]`, block lists `- item`,
// one level of nesting under `scope:`. Anything else is ignored, never guessed.
// ---------------------------------------------------------------------------
function unquote(s) {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
  return t;
}
function parseInlineList(s) {
  const inner = s.trim().replace(/^\[/, '').replace(/\]$/, '');
  return inner.split(',').map((x) => unquote(x)).filter(Boolean);
}
function readScope(text) {
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => /^scope:\s*$/.test(l));
  if (start < 0) return null;
  const scope = {};
  let key = null;
  for (let i = start + 1; i < lines.length; i++) {
    const raw = lines[i];
    if (/^\S/.test(raw)) break;                 // next top-level key
    const line = raw.replace(/\s+#.*$/, '');     // trailing comment
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const kv = line.match(/^\s{2}([a-zA-Z_]+):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      const val = kv[2].trim();
      if (val.startsWith('[')) scope[key] = parseInlineList(val);
      else if (val === '') scope[key] = [];
      else scope[key] = unquote(val);
      continue;
    }
    const item = line.match(/^\s{4,}-\s+(.*)$/);
    if (item && key && Array.isArray(scope[key])) scope[key].push(unquote(item[1]));
  }
  return scope;
}
function readPurpose(text) {
  const m = text?.match(/^\s*purpose:\s*(.+)$/m);
  return m ? unquote(m[1]) : null;
}

// ---------------------------------------------------------------------------
// Registry side: every bundle's subjects.
// ---------------------------------------------------------------------------
function loadSubjects() {
  const subjects = new Map(); // "bundle/slug" -> { bundle, slug, category, subcategory }
  const knowledge = path.join(ROOT, 'knowledge');
  for (const bundle of fs.readdirSync(knowledge, { withFileTypes: true })) {
    if (!bundle.isDirectory()) continue;
    const idx = readJson(path.join(knowledge, bundle.name, 'index.json'));
    if (!idx?.subjects) continue;
    const entries = Array.isArray(idx.subjects) ? idx.subjects : Object.entries(idx.subjects).map(([slug, v]) => ({ slug, ...v }));
    for (const s of entries) {
      if (!s.slug) continue;
      subjects.set(`${bundle.name}/${s.slug}`, {
        bundle: bundle.name,
        slug: s.slug,
        category: s.category ?? null,
        subcategory: s.subcategory ?? null,
        techniques: Array.isArray(s.techniques) ? s.techniques.length : 0,
      });
    }
  }
  return subjects;
}

// ---------------------------------------------------------------------------
// Project side.
// ---------------------------------------------------------------------------
function loadLedger(checkout) {
  const p = path.join(checkout, '.ai', 'directions', 'ledger.jsonl');
  const text = readText(p);
  if (!text) return [];
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try { rows.push(JSON.parse(line)); } catch { /* a bad line is skipped, never guessed */ }
  }
  return rows;
}

function scopeExcludes(scope, subj) {
  if (!scope) return false;
  const subjectKeys = new Set(scope.out_of_scope_subjects ?? []);
  const categoryKeys = new Set(scope.out_of_scope_categories ?? []);
  if (subjectKeys.has(`${subj.bundle}/${subj.slug}`)) return true;
  if (subj.category && categoryKeys.has(`${subj.bundle}/${subj.category}`)) return true;
  if (subj.subcategory && categoryKeys.has(`${subj.bundle}/${subj.category}/${subj.subcategory}`)) return true;
  return false;
}

function buildProject(slug, project, subjects) {
  const checkout = project.path;
  const manifestText = readText(path.join(checkout, '.ai', 'manifest.yaml'));
  const map = readJson(path.join(checkout, '.ai', 'registry-map.json'));
  const scope = readScope(manifestText);
  const ledger = loadLedger(checkout);
  const domains = project.domains ?? [];

  const groups = {};
  const present = new Map(); // "bundle/slug" -> { contexts: n, states: {state: n} }
  let weaklyGoverned = 0;
  let absolutePathsDropped = 0;
  if (map?.contexts) {
    for (const ctx of map.contexts) {
      const g = ctx.group ?? '(ungrouped)';
      groups[g] ??= [];
      const governing = [];
      for (const s of ctx.subjects ?? []) {
        if (!PRESENT_CONFIDENCE.has(s.confidence)) continue;
        const key = `${s.bundle}/${s.subject}`;
        governing.push({ subject: key, state: s.state ?? 'unknown' });
        const row = present.get(key) ?? { contexts: 0, states: {} };
        row.contexts += 1;
        row.states[s.state ?? 'unknown'] = (row.states[s.state ?? 'unknown'] ?? 0) + 1;
        present.set(key, row);
      }
      if (governing.length === 0) weaklyGoverned += 1;
      const paths = (ctx.paths ?? []).filter((p) => {
        if (ABSOLUTE.test(p)) { absolutePathsDropped += 1; return false; }
        return true;
      });
      groups[g].push({ name: ctx.name, paths, pathsMissing: (ctx.pathsMissing ?? []).filter((p) => !ABSOLUTE.test(p)).length, subjects: governing });
    }
  }

  const ledgerBySubject = new Map();
  for (const row of ledger) {
    if (!row.subject) continue;
    const key = row.bundle ? `${row.bundle}/${row.subject}` : row.subject;
    ledgerBySubject.set(key, row); // last row wins: the ledger is chronological
  }

  return {
    slug,
    purpose: readPurpose(manifestText),
    domains,
    scope: scope
      ? { does: scope.does ?? [], does_not: scope.does_not ?? [], out_of_scope_categories: scope.out_of_scope_categories ?? [], out_of_scope_subjects: scope.out_of_scope_subjects ?? [] }
      : null,
    hasMap: Boolean(map?.contexts),
    mapGeneratedAt: map?.generatedAt ?? null,
    stats: {
      contexts: map?.contexts?.length ?? 0,
      groups: Object.keys(groups).length,
      governingSubjects: present.size,
      weaklyGoverned,
      ledgerRows: ledger.length,
      absolutePathsDropped,
    },
    relPath: project.relPath ?? null,
    groups,
    _present: present,
    _ledger: ledgerBySubject,
    _scope: scope,
  };
}

function classifyAbsence(project, subj) {
  if (!project.domains.includes(subj.bundle)) return { classification: 'out-of-domain' };
  if (scopeExcludes(project._scope, subj)) return { classification: 'out-of-scope' };
  const row = project._ledger.get(`${subj.bundle}/${subj.slug}`);
  if (row?.decision === 'declined') return { classification: 'declined', reason: row.reason ?? null, date: row.date ?? null };
  if (row?.decision === 'deferred') return { classification: 'deferred', reason: row.reason ?? null, date: row.date ?? null };
  if (row?.decision === 'accepted') return { classification: 'accepted', date: row.date ?? null };
  return { classification: 'candidate' };
}

// ---------------------------------------------------------------------------
// Build.
// ---------------------------------------------------------------------------
function build() {
  const fleet = loadFleet(ROOT);
  if (!fleet?.projects || Object.keys(fleet.projects).length === 0) {
    console.error('build-fleet-map: no fleet resolvable on this machine (projects.json + .machine.local.json)');
    process.exit(2);
  }
  const subjects = loadSubjects();
  if (subjects.size === 0) {
    console.error('build-fleet-map: no bundle index found under knowledge/ - run build-index.mjs first');
    process.exit(2);
  }

  const projects = {};
  for (const [slug, p] of Object.entries(fleet.projects)) {
    if (!p.exists) continue;
    projects[slug] = buildProject(slug, p, subjects);
  }
  const withMaps = Object.values(projects).filter((p) => p.hasMap);
  if (withMaps.length === 0) {
    console.error('build-fleet-map: no project carries .ai/registry-map.json - run build-registry-map.mjs on at least one');
    process.exit(2);
  }

  const inverse = {};
  const summary = {};
  for (const p of Object.values(projects)) {
    summary[p.slug] = { contexts: p.stats.contexts, governingSubjects: p.stats.governingSubjects, scope: p.scope ? 'declared' : 'missing', candidate: 0, 'out-of-scope': 0, declined: 0, deferred: 0, accepted: 0, 'out-of-domain': 0 };
  }
  for (const [key, subj] of [...subjects.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const row = { bundle: subj.bundle, category: subj.category, subcategory: subj.subcategory, techniques: subj.techniques, present: [], absent: [] };
    for (const p of Object.values(projects)) {
      if (!p.hasMap) continue;
      const pr = p._present.get(key);
      if (pr) {
        row.present.push({ project: p.slug, contexts: pr.contexts, states: pr.states });
      } else {
        const c = classifyAbsence(p, subj);
        row.absent.push({ project: p.slug, ...c });
        summary[p.slug][c.classification] += 1;
      }
    }
    inverse[key] = row;
  }

  for (const p of Object.values(projects)) { delete p._present; delete p._ledger; delete p._scope; }

  return {
    schema: SCHEMA,
    _note: 'GENERATED by ai-registry/scripts/build-fleet-map.mjs - the map of context maps (projects -> groups -> contexts -> governing subjects) and its inverse (subjects -> projects present / absent, each absence classified against the project\'s declared scope and its directions ledger). Context paths are RELATIVE to the project root; the root per device is projects.json machines.<name>.root, and a project\'s relPath is that device\'s checkout path under it. Never an absolute path. Regenerate, do not edit.',
    generatedAt: new Date().toISOString().slice(0, 10),
    machine: fleet.machine ?? null,
    projects,
    subjects: inverse,
    summary,
  };
}

function stable(obj) {
  const { generatedAt, ...rest } = obj;
  return JSON.stringify(rest);
}

// ---------------------------------------------------------------------------
// Markdown.
// ---------------------------------------------------------------------------
function renderMd(map) {
  const out = [];
  out.push('# Fleet map', '');
  out.push(`GENERATED by \`scripts/build-fleet-map.mjs\` on ${map.generatedAt}. The map of context maps and its inverse. Every path is relative to its project's root (the root per device is \`projects.json\`); the JSON carries each context's paths, this page carries counts. Regenerate, do not edit; see [\`docs/fleet-map.md\`](../docs/fleet-map.md) for what each column means and how a candidate becomes a direction proposal.`, '');
  out.push('## Summary', '');
  out.push('| Project | Contexts | Governing subjects | Scope | Candidate | Out of scope | Declined | Deferred | Accepted | Out of domain |');
  out.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const [slug, s] of Object.entries(map.summary)) {
    out.push(`| \`${slug}\` | ${s.contexts} | ${s.governingSubjects} | ${s.scope} | **${s.candidate}** | ${s['out-of-scope']} | ${s.declined} | ${s.deferred} | ${s.accepted} | ${s['out-of-domain']} |`);
  }
  out.push('', 'A `candidate` is a subject the project has no context for, inside its declared domains, that its scope does not exclude and its directions ledger has not decided. It is a hypothesis for the intake direction pass, never a finding. A project whose scope reads `missing` has every in-domain absence counted as a candidate; the number is the instruction to write the scope block.', '');

  for (const [slug, p] of Object.entries(map.projects)) {
    out.push(`## \`${slug}\``, '');
    out.push(`**Purpose:** ${p.purpose ?? '(no purpose line in manifest)'}  `);
    out.push(`**Domains:** ${p.domains.map((d) => `\`${d}\``).join(', ') || '(none declared)'}  `);
    out.push(`**Map:** ${p.hasMap ? `${p.stats.contexts} contexts in ${p.stats.groups} groups, ${p.stats.governingSubjects} governing subjects, ${p.stats.weaklyGoverned} weakly governed (generated ${p.mapGeneratedAt})` : 'none - run build-registry-map.mjs'}`, '');
    if (p.scope) {
      out.push('**Scope.** Does: ' + (p.scope.does.length ? p.scope.does.join('; ') : '(unstated)') + '. Does not: ' + (p.scope.does_not.length ? p.scope.does_not.join('; ') : '(unstated)') + '.');
      if (p.scope.out_of_scope_categories.length || p.scope.out_of_scope_subjects.length) {
        out.push(`Excluded by list: ${[...p.scope.out_of_scope_categories, ...p.scope.out_of_scope_subjects].map((x) => `\`${x}\``).join(', ')}.`);
      }
      out.push('');
    } else {
      out.push('**Scope:** missing - every in-domain absence below is counted as a candidate until the manifest carries a `scope:` block.', '');
    }
    if (p.hasMap) {
      out.push('| Group | Contexts | Subjects governing the group (state counts) |');
      out.push('| --- | --- | --- |');
      for (const [g, ctxs] of Object.entries(p.groups).sort(([a], [b]) => a.localeCompare(b))) {
        const tally = {};
        for (const c of ctxs) for (const s of c.subjects) {
          tally[s.subject] ??= { n: 0, states: {} };
          tally[s.subject].n += 1;
          tally[s.subject].states[s.state] = (tally[s.subject].states[s.state] ?? 0) + 1;
        }
        const top = Object.entries(tally).sort(([, a], [, b]) => b.n - a.n).slice(0, 6)
          .map(([k, v]) => {
            const dev = v.states.deviation ? ` ${v.states.deviation}dev` : '';
            const con = v.states.conformant ? ` ${v.states.conformant}ok` : '';
            return `\`${k.split('/')[1]}\`×${v.n}${dev}${con}`;
          });
        out.push(`| ${g} | ${ctxs.length} | ${top.join(', ') || '-'} |`);
      }
      out.push('');
      const candidates = Object.entries(map.subjects)
        .filter(([, row]) => row.absent.some((a) => a.project === slug && a.classification === 'candidate'))
        .map(([key, row]) => ({ key, category: row.category, subcategory: row.subcategory }));
      out.push(`### Candidate directions for \`${slug}\` (${candidates.length})`, '');
      if (candidates.length === 0) out.push('None.', '');
      else {
        const byCat = {};
        for (const c of candidates) {
          const cat = `${c.key.split('/')[0]}/${c.category ?? '?'}${c.subcategory ? '/' + c.subcategory : ''}`;
          (byCat[cat] ??= []).push(c.key.split('/')[1]);
        }
        for (const [cat, slugs] of Object.entries(byCat).sort(([a], [b]) => a.localeCompare(b))) {
          out.push(`- \`${cat}\`: ${slugs.map((s) => `\`${s}\``).join(', ')}`);
        }
        out.push('');
      }
    }
  }

  out.push('## Subjects with no context in any mapped project', '');
  const orphans = Object.entries(map.subjects).filter(([, r]) => r.present.length === 0);
  out.push(`${orphans.length} of ${Object.keys(map.subjects).length} subjects govern no context in any mapped project. Per subject, the projects for which it is a candidate:`, '');
  for (const [key, r] of orphans) {
    const cands = r.absent.filter((a) => a.classification === 'candidate').map((a) => `\`${a.project}\``);
    out.push(`- \`${key}\` (${r.techniques}t) -> ${cands.length ? cands.join(', ') : 'no candidate project (out of domain or scope everywhere)'}`);
  }
  out.push('');
  return out.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
const map = build();

if (TO_STDOUT) {
  process.stdout.write(JSON.stringify(map, null, 1) + '\n');
  process.exit(0);
}
if (CHECK) {
  const existing = readJson(OUT_JSON);
  if (!existing || stable(existing) !== stable(map)) {
    console.error('stale: librarian/fleet-map.json does not match the fleet. Run `node scripts/build-fleet-map.mjs`.');
    process.exit(1);
  }
  console.log('fleet map up to date');
  process.exit(0);
}
fs.writeFileSync(OUT_JSON, JSON.stringify(map, null, 1) + '\n');
fs.writeFileSync(OUT_MD, renderMd(map));
const mapped = Object.values(map.projects).filter((p) => p.hasMap).length;
console.log(`fleet map written: ${mapped} mapped project(s), ${Object.keys(map.subjects).length} subjects`);
for (const [slug, s] of Object.entries(map.summary)) {
  console.log(`  ${slug.padEnd(12)} contexts=${String(s.contexts).padStart(4)} governing=${String(s.governingSubjects).padStart(4)} scope=${s.scope.padEnd(8)} candidate=${String(s.candidate).padStart(4)} out-of-scope=${s['out-of-scope']} declined=${s.declined} deferred=${s.deferred} out-of-domain=${s['out-of-domain']}`);
}
