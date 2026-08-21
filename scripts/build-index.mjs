#!/usr/bin/env node
/**
 * build-index — emit `knowledge/<domain>/index.json` for every bundle.
 *
 * The index is what makes a bundle usable WITHOUT reading 965 markdown files:
 * one document per domain listing every subject, its techniques, the laws those
 * techniques cite, and its applications. An agent selecting knowledge to consult
 * reads this; a tool building a UI reads this; a human reads the markdown.
 *
 * ## What this deliberately does NOT emit
 *
 * The consumer this was ported from (personas' `scripts/census/build-paths-index.mjs`)
 * emits three artifacts. Only one of them can exist here:
 *
 * | artifact | built from | belongs |
 * | --- | --- | --- |
 * | `subject-index` | frontmatter structure | **here** — it describes the standard |
 * | `law-index` evidence lists | `evidence:` paths | consumer — cites one tree's files |
 * | `router` (evidence glob → subject) | `evidence:` paths | consumer — it IS the evidence layer |
 *
 * A published bundle carries no evidence (`docs/rkb-profile.md` §5), so a router
 * built here would be an empty file pretending to be an index. The law index
 * still ships, minus its evidence lists: which techniques cite a law is a fact
 * about the standard; which files witness it is a fact about a codebase.
 *
 * Usage:
 *   node scripts/build-index.mjs            # write
 *   node scripts/build-index.mjs --check    # verify freshness, write nothing (CI)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTaxonomy, walkSubjects } from './lib/taxonomy.mjs';
import { sameIgnoringNewlines } from './lib/bundle-hash.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANE = path.join(ROOT, 'knowledge');
const check = process.argv.includes('--check');

/**
 * The frontmatter subset bundles use: scalars, `- ` block lists, `[]` and
 * `[a, b]` inline lists, with a trailing ` # comment` stripped. Anything richer
 * is a bundle defect `check-bundles.mjs` fails on, not something to accommodate.
 */
function frontmatter(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  let key = null;
  for (const raw of m[1].split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const li = raw.match(/^\s*-\s+(.*)$/);
    if (li && key) {
      out[key].push(li[1].replace(/\s+#.*$/, '').trim());
      continue;
    }
    const kv = raw.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    key = kv[1];
    const v = kv[2].trim();
    if (v === '') out[key] = [];
    else if (v === '[]') { out[key] = []; key = null; }
    else if (v.startsWith('[') && v.endsWith(']')) {
      out[key] = v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
      key = null;
    } else { out[key] = v.replace(/\s+#.*$/, '').trim(); key = null; }
  }
  return out;
}

const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const mdFiles = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('.')).sort()
    : [];

function buildBundle(domain) {
  const base = path.join(LANE, domain);

  // The taxonomy is the authority on grouping AND on location. Reading it through the
  // same module the gate uses is deliberate: a resolver that disagreed with the gate's
  // would produce an index that describes a tree nobody has.
  const { taxonomy, errors: txErrors, subjects: declared } = loadTaxonomy(base, domain);
  if (txErrors.length) {
    console.error(`build-index FATAL: ${domain}'s taxonomy is not usable —`);
    for (const e of txErrors) console.error(`  ${e}`);
    console.error('Refusing to write an index built on a broken taxonomy. Run check-bundles.mjs.');
    process.exit(2);
  }
  const { found } = walkSubjects(base);

  // Law statements: anchor id → first paragraph beneath it.
  const lawStmt = {};
  const lawsFile = path.join(base, '_laws.md');
  if (fs.existsSync(lawsFile)) {
    const txt = fs.readFileSync(lawsFile, 'utf8');
    for (const m of txt.matchAll(/<a id="([^"]+)"><\/a>\s*([^\n]*)\n+([^\n]+(?:\n[^\n#][^\n]*)*)/g)) {
      lawStmt[m[1]] = m[3].replace(/\s+/g, ' ').trim();
    }
  }

  const subjects = {};
  const laws = {};

  const slugs = [...found.keys()].sort();

  for (const slug of slugs) {
    const at = found.get(slug); // where it IS, at this bundle's current layout
    const dir = path.join(base, at);
    const gpFile = path.join(dir, `${slug}.md`);
    if (!fs.existsSync(gpFile)) continue;
    const gp = frontmatter(gpFile);

    const techniques = [];
    for (const tf of mdFiles(path.join(dir, 'techniques'))) {
      const t = frontmatter(path.join(dir, 'techniques', tf));
      const tslug = t.technique || tf.replace(/\.md$/, '');
      const cited = asList(t.laws);
      const entry = {
        slug: tslug,
        status: t.status || null,
        laws: cited,
        shared_with: asList(t.shared_with),
      };
      // `use_when` is OKF's consult trigger — the field an agent selects on.
      // Emitted only where an author wrote one; an empty value would look like
      // a considered "never". The frontmatter parser returns list-valued fields
      // as ARRAYS (both `[a, b]` and block `- item` forms) — the original
      // string-only check here counted every well-formed use_when as absent
      // and reported 0/267 over a corpus that was actually at 267/267
      // (measured 2026-08-19; the instrument was asserted before the result,
      // and the instrument was wrong).
      const useWhen = Array.isArray(t.use_when)
        ? t.use_when.filter(Boolean)
        : typeof t.use_when === 'string' && t.use_when.trim() ? [t.use_when.trim()] : null;
      if (useWhen && useWhen.length) entry.use_when = useWhen;
      techniques.push(entry);

      for (const law of cited) {
        (laws[law] ||= { statement: lawStmt[law] || null, techniques: [] }).techniques.push(
          `${slug}/${tslug}`,
        );
      }
    }

    const applications = mdFiles(path.join(dir, 'applications')).map((af) => {
      const a = frontmatter(path.join(dir, 'applications', af));
      const entry = {
        stack: a.stack || af.split('--')[0],
        technique: a.technique || '',
        file: `knowledge/${domain}/${at}/applications/${af}`,
      };
      // Currency, emitted so a consumer can see how old a claim is without opening it —
      // the whole point of an index is not having to. `verified_on` is required by the
      // gate; the other two are present only where somebody could state them truthfully.
      if (a.verified_on) entry.verified_on = a.verified_on;
      if (a.verified_against) entry.verified_against = a.verified_against;
      if (a.refresh_by) entry.refresh_by = a.refresh_by;
      return entry;
    });

    const placed = declared.get(slug);
    subjects[slug] = {
      category: placed?.category ?? 'uncategorized',
      // Null where the category is flat. Additive: a reader that predates the taxonomy
      // work sees the same `category` it always did and ignores this.
      subcategory: placed?.subcategory ?? null,
      status: gp.status || 'unknown',
      file: `knowledge/${domain}/${at}/${slug}.md`,
      techniques,
      applications,
    };
  }

  const meta = {
    generated_by: 'scripts/build-index.mjs',
    bundle: domain,
    source: `knowledge/${domain}/ (frontmatter only)`,
    subjects: Object.keys(subjects).length,
    techniques: Object.values(subjects).reduce((n, s) => n + s.techniques.length, 0),
    applications: Object.values(subjects).reduce((n, s) => n + s.applications.length, 0),
    laws: Object.keys(laws).length,
    categories: (taxonomy.categories || []).map((c) => c.id),
    // Where the bytes sit: "flat" = subjects directly under the bundle, "nested" = at
    // their taxonomy path. A consumer that renders the tree needs to know which, and a
    // consumer that only reads slugs can ignore it — identity never moves.
    layout: taxonomy.layout,
    // `use_when` is what a consult lane selects on. Reported as a number so
    // the gap is observed rather than assumed away by anything built on top
    // of this index. (The earlier "0/624 — written nowhere yet" note was made
    // through a string-only check that could not see list-valued fields; see
    // the counter above. software-engineering genuinely carries none yet.)
    use_when_coverage: `${Object.values(subjects).reduce(
      (n, s) => n + s.techniques.filter((t) => t.use_when).length,
      0,
    )}/${Object.values(subjects).reduce((n, s) => n + s.techniques.length, 0)}`,
    // Stated in-band so nobody mistakes this for a complete picture of the
    // corpus and quietly builds an evidence feature on top of an index that
    // structurally cannot carry it.
    excludes: 'evidence, counter_evidence, deviations — consumer-side (docs/rkb-profile.md §5)',
  };

  return { meta, subjects, laws };
}

if (!fs.existsSync(LANE)) {
  console.error('build-index FATAL: no knowledge/ lane. Nothing to index — refusing to exit 0.');
  process.exit(2);
}

const domains = fs
  .readdirSync(LANE, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

if (domains.length === 0) {
  console.error('build-index FATAL: knowledge/ contains no bundles. Refusing to report success.');
  process.exit(2);
}

let stale = 0;
for (const domain of domains) {
  const index = buildBundle(domain);
  if (index.meta.subjects === 0) {
    console.error(`build-index FATAL: bundle "${domain}" yielded zero subjects.`);
    process.exit(2);
  }

  const out = path.join(LANE, domain, 'index.json');
  const next = `${JSON.stringify(index, null, 1)}\n`;
  const prev = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;

  if (check) {
    // Compared ignoring newlines: a Windows checkout hands the working tree CRLF while
    // this script writes LF, and a freshness verdict must not depend on which platform
    // cloned the repo. Same rule the bundle digest already runs on.
    if (prev === null || !sameIgnoringNewlines(prev, next)) {
      stale += 1;
      console.error(
        `stale: knowledge/${domain}/index.json does not match the bundle. ` +
          'Run `node scripts/build-index.mjs` and commit the result.',
      );
    }
    // Write only when the CONTENT changed. Rewriting a file whose sole difference is
    // its line endings would churn the working tree on every run on Windows.
  } else if (prev === null || !sameIgnoringNewlines(prev, next)) {
    fs.writeFileSync(out, next);
  }

  const m = index.meta;
  console.log(
    `${domain}: ${m.subjects} subjects · ${m.techniques} techniques · ` +
      `${m.applications} applications · ${m.laws} laws cited · ` +
      `use_when ${m.use_when_coverage}`,
  );
}

if (check && stale > 0) process.exit(1);
console.log(check ? '\nindex is current' : '\nindex written');
