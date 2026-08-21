#!/usr/bin/env node
/**
 * check-signals — the gate for the `signals/` lane (docs/signals-lane.md).
 *
 * Same two jobs as check-usage.mjs, and the second is again the important one.
 *
 * 1. Shape: schema id, required fields, filename/contributor agreement, closed key sets,
 *    non-negative integer counts, and slugs that resolve to real bundles/subjects here.
 *
 * 2. **Privacy.** This lane exists so an installation can report that its tree moved
 *    WITHOUT disclosing anything about its tree. That guarantee cannot rest on every
 *    contributor remembering it, so path-shaped, URL-shaped and email-shaped values are
 *    rejected outright and no key outside the spec is accepted.
 *
 * The subject-resolution checks are WARNINGS, not failures. A registry that renames a
 * subject must not turn every installation's next commit red - the contributor cannot fix
 * a rename that happened here, and a hard failure would teach them to stop reporting,
 * which costs more than the stale slug does.
 *
 * Exits non-zero on any shape or privacy finding. An unreadable lane exits 2: reporting
 * nothing is not the same as finding nothing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANE = path.join(ROOT, 'signals');
const KNOWLEDGE = path.join(ROOT, 'knowledge');

const SCHEMA = 'rkb-signals/1';
const TOP_KEYS = new Set(['schema', 'contributor', 'app', 'generatedAt', 'windowDays', 'stack', 'bundles']);
const BUNDLE_KEYS = new Set(['consults', 'deviations', 'citations']);
const CITATION_KEYS = new Set(['resolved', 'moved', 'gone']);
const CONTRIBUTOR_RE = /^[a-z0-9][a-z0-9-]*$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
// `<subject>/<stack>--<technique>` — the application's identity, by slug. Never a path:
// a subject's folder moves when the taxonomy does, its slug does not.
const CITATION_ID_RE = /^([a-z0-9][a-z0-9-]*)\/([a-z0-9][a-z0-9-]*--[a-z0-9][a-z0-9-]*)$/;
const VERSION_RE = /^\d+(?:\.\d+){0,3}$/;

// Same denylist as the usage lane, and deliberately just as blunt. A false positive costs
// one renamed contributor id; a false negative puts a private tree's shape in a public
// repository forever.
const LEAKY = [
  { re: /[A-Za-z]:[\\/]/, what: 'a Windows path' },
  { re: /(^|[\s"'])\/(?:home|users|Users|var|etc|opt|tmp)\//, what: 'a POSIX path' },
  { re: /\.\.[\\/]/, what: 'a relative path escape' },
  { re: /https?:\/\//i, what: 'a URL' },
  { re: /[\w.+-]+@[\w-]+\.[\w.]+/, what: 'an email address' },
];

const failures = [];
const notes = [];
const fail = (msg) => failures.push(msg);

if (!fs.existsSync(LANE)) {
  // A registry nobody reports to yet is a legitimate state, not an error.
  console.log('signals lane: absent — no installation has contributed currency signals yet.');
  console.log('Bundle currency therefore reads UNKNOWN, not current (docs/signals-lane.md).');
  process.exit(0);
}

let files;
try {
  files = fs.readdirSync(LANE).filter((f) => f.endsWith('.json')).sort();
} catch (e) {
  console.error(`check-signals FATAL: signals/ exists but cannot be read (${e.message}).`);
  console.error('Reporting nothing is not the same as finding nothing — refusing to exit 0.');
  process.exit(2);
}

// The corpus this lane's slugs are checked against. Built by SLUG, not by path, so it
// keeps working at any nesting depth.
const bundles = new Map(); // domain -> { subjects:Set, applications:Set }
if (fs.existsSync(KNOWLEDGE)) {
  for (const d of fs.readdirSync(KNOWLEDGE, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const subjects = new Set();
    const applications = new Set();
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!e.isDirectory() || e.name.startsWith('.')) continue;
        const p = path.join(dir, e.name);
        if (fs.existsSync(path.join(p, `${e.name}.md`))) {
          subjects.add(e.name);
          const aDir = path.join(p, 'applications');
          if (fs.existsSync(aDir)) {
            for (const f of fs.readdirSync(aDir).filter((x) => x.endsWith('.md'))) {
              applications.add(`${e.name}/${f.replace(/\.md$/, '')}`);
            }
          }
        } else {
          walk(p); // a category or subcategory folder
        }
      }
    };
    walk(path.join(KNOWLEDGE, d.name));
    bundles.set(d.name, { subjects, applications });
  }
}

let entries = 0;

for (const file of files) {
  const rel = `signals/${file}`;
  const stem = file.replace(/\.json$/, '');
  const full = path.join(LANE, file);

  const raw = fs.readFileSync(full, 'utf8');
  // Privacy first, over the RAW text: a leak in an unexpected key must be caught even
  // though unknown keys are rejected below.
  for (const { re, what } of LEAKY) {
    const hit = raw.match(re);
    if (hit) {
      fail(
        `${rel}: contains ${what} (${JSON.stringify(hit[0].slice(0, 60))}). ` +
          'A signals file carries counts and slugs — this repository is public.',
      );
    }
  }

  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (e) {
    fail(`${rel}: not valid JSON (${e.message})`);
    continue;
  }

  if (doc.schema !== SCHEMA) fail(`${rel}: schema must be "${SCHEMA}", found ${JSON.stringify(doc.schema)}`);
  for (const k of Object.keys(doc)) {
    if (!TOP_KEYS.has(k)) fail(`${rel}: unexpected top-level key "${k}" — the spec names ${[...TOP_KEYS].join(', ')}`);
  }
  if (typeof doc.contributor !== 'string' || !CONTRIBUTOR_RE.test(doc.contributor)) {
    fail(`${rel}: contributor must match ${CONTRIBUTOR_RE} — found ${JSON.stringify(doc.contributor)}`);
  } else if (doc.contributor !== stem) {
    fail(`${rel}: contributor "${doc.contributor}" does not match the filename stem "${stem}"`);
  }
  if (typeof doc.app !== 'string' || !doc.app.trim()) fail(`${rel}: app is required`);
  if (typeof doc.generatedAt !== 'string' || !ISO_RE.test(doc.generatedAt)) {
    fail(`${rel}: generatedAt must be ISO-8601 — found ${JSON.stringify(doc.generatedAt)}`);
  }
  if (!Number.isInteger(doc.windowDays) || doc.windowDays <= 0) {
    fail(`${rel}: windowDays must be a positive integer — found ${JSON.stringify(doc.windowDays)}`);
  }

  // -- stack
  if (doc.stack === null || typeof doc.stack !== 'object' || Array.isArray(doc.stack)) {
    fail(`${rel}: stack must be an object of capability → version`);
  } else {
    for (const [cap, version] of Object.entries(doc.stack)) {
      if (!SLUG_RE.test(cap)) fail(`${rel}: stack key "${cap}" is not a kebab-case slug`);
      const v = typeof version === 'number' ? String(version) : version;
      if (typeof v !== 'string' || !VERSION_RE.test(v)) {
        fail(`${rel}: stack["${cap}"] must be a version like 19 or "1.79" — found ${JSON.stringify(version)}`);
      }
    }
  }

  // -- bundles
  if (doc.bundles === null || typeof doc.bundles !== 'object' || Array.isArray(doc.bundles)) {
    fail(`${rel}: bundles must be an object of bundle name → observations`);
    continue;
  }

  const count = (where, value) => {
    if (!Number.isInteger(value) || value < 0) {
      fail(`${rel}: ${where} must be a non-negative integer — found ${JSON.stringify(value)}`);
      return false;
    }
    entries += 1;
    return true;
  };

  for (const [bundleName, obs] of Object.entries(doc.bundles)) {
    const known = bundles.get(bundleName);
    if (bundles.size > 0 && !known) {
      notes.push(`${rel} reports on bundle "${bundleName}", which this registry does not publish`);
    }
    if (obs === null || typeof obs !== 'object' || Array.isArray(obs)) {
      fail(`${rel}: bundles["${bundleName}"] must be an object`);
      continue;
    }
    for (const k of Object.keys(obs)) {
      if (!BUNDLE_KEYS.has(k)) {
        fail(`${rel}: bundles["${bundleName}"] has unexpected key "${k}" — the spec names ${[...BUNDLE_KEYS].join(', ')}`);
      }
    }

    for (const which of ['consults', 'deviations']) {
      const map = obs[which];
      if (map === undefined) continue;
      if (map === null || typeof map !== 'object' || Array.isArray(map)) {
        fail(`${rel}: bundles["${bundleName}"].${which} must be an object of subject slug → count`);
        continue;
      }
      for (const [slug, n] of Object.entries(map)) {
        if (!SLUG_RE.test(slug)) {
          fail(`${rel}: ${which} key "${slug}" is not a bare subject slug — never a path (docs/signals-lane.md)`);
          continue;
        }
        count(`bundles["${bundleName}"].${which}["${slug}"]`, n);
        if (known && !known.subjects.has(slug)) {
          notes.push(`${rel} reports ${which} for "${bundleName}/${slug}", which has no subject here`);
        }
      }
    }

    const cites = obs.citations;
    if (cites === undefined) continue;
    if (cites === null || typeof cites !== 'object' || Array.isArray(cites)) {
      fail(`${rel}: bundles["${bundleName}"].citations must be an object`);
      continue;
    }
    for (const [id, verdict] of Object.entries(cites)) {
      if (!CITATION_ID_RE.test(id)) {
        fail(`${rel}: citation key "${id}" must be <subject>/<stack>--<technique>, by slug and never a path`);
        continue;
      }
      if (verdict === null || typeof verdict !== 'object' || Array.isArray(verdict)) {
        fail(`${rel}: citations["${id}"] must be an object of ${[...CITATION_KEYS].join(' / ')} counts`);
        continue;
      }
      for (const k of Object.keys(verdict)) {
        if (!CITATION_KEYS.has(k)) {
          fail(
            `${rel}: citations["${id}"] has unexpected key "${k}" — the verdict is counts only; ` +
              'WHICH anchors vanished is a fact about one tree and stays there',
          );
        }
      }
      for (const k of CITATION_KEYS) {
        if (verdict[k] !== undefined) count(`citations["${id}"].${k}`, verdict[k]);
      }
      if (known && !known.applications.has(id)) {
        notes.push(`${rel} reports citations for "${bundleName}/${id}", which has no application here`);
      }
    }
  }
}

console.log(`signals lane: ${files.length} contributor file(s) · ${entries} counted observation(s)`);
for (const n of notes) console.warn(`  note: ${n} — dropped from any aggregate.`);

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error('');
  process.exit(1);
}
console.log('signals lane OK — counts and slugs only, one file per contributor.');
