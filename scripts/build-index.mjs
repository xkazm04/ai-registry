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

  const catFile = path.join(base, 'categories.json');
  const categories = fs.existsSync(catFile)
    ? JSON.parse(fs.readFileSync(catFile, 'utf8'))
    : { categories: [], subjects: {} };
  const catOf = categories.subjects || {};

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

  const slugs = fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const slug of slugs) {
    const dir = path.join(base, slug);
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
      // Emitted only where an author wrote one; an empty string would look like
      // a considered "never".
      const useWhen = typeof t.use_when === 'string' ? t.use_when : null;
      if (useWhen) entry.use_when = useWhen;
      techniques.push(entry);

      for (const law of cited) {
        (laws[law] ||= { statement: lawStmt[law] || null, techniques: [] }).techniques.push(
          `${slug}/${tslug}`,
        );
      }
    }

    const applications = mdFiles(path.join(dir, 'applications')).map((af) => {
      const a = frontmatter(path.join(dir, 'applications', af));
      return {
        stack: a.stack || af.split('--')[0],
        technique: a.technique || '',
        file: `knowledge/${domain}/${slug}/applications/${af}`,
      };
    });

    subjects[slug] = {
      category: catOf[slug] || 'uncategorized',
      status: gp.status || 'unknown',
      file: `knowledge/${domain}/${slug}/${slug}.md`,
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
    categories: (categories.categories || []).map((c) => c.id),
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
    if (prev !== next) {
      stale += 1;
      console.error(
        `stale: knowledge/${domain}/index.json does not match the bundle. ` +
          'Run `node scripts/build-index.mjs` and commit the result.',
      );
    }
  } else if (prev !== next) {
    fs.writeFileSync(out, next);
  }

  const m = index.meta;
  console.log(
    `${domain}: ${m.subjects} subjects · ${m.techniques} techniques · ` +
      `${m.applications} applications · ${m.laws} laws cited`,
  );
}

if (check && stale > 0) process.exit(1);
console.log(check ? '\nindex is current' : '\nindex written');
