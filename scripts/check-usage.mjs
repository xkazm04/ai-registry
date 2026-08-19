#!/usr/bin/env node
/**
 * check-usage — the gate for the `usage/` lane (docs/usage-lane.md).
 *
 * Two jobs, and the second is the important one.
 *
 * 1. Shape: schema id, required fields, filename/contributor agreement,
 *    non-negative integer counts, skill names that actually exist in this repo.
 *
 * 2. **Privacy.** This registry is public and the usage lane is contributed to
 *    by many installations. The rule "counts and nothing else" cannot rest on
 *    every contributor remembering it — one leaked absolute path in one file is
 *    permanent in git history. So path-shaped, URL-shaped and email-shaped
 *    values are REJECTED here, and a usage file may carry no keys beyond the
 *    ones the spec names.
 *
 * Exits non-zero on any finding. Asserts its inputs: an unreadable lane is
 * reported as such rather than passing as "nothing wrong".
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANE = path.join(ROOT, 'usage');
const SKILLS = path.join(ROOT, 'skills');

const SCHEMA = 'rkb-usage/1';
const TOP_KEYS = new Set(['schema', 'contributor', 'app', 'generatedAt', 'windowDays', 'skills']);
const ENTRY_KEYS = new Set(['invokes', 'lastUsed']);
const CONTRIBUTOR_RE = /^[a-z0-9][a-z0-9-]*$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})$/;

// Deliberately blunt. A false positive costs one renamed contributor id; a false
// negative puts someone's home directory in a public repo forever.
const LEAKY = [
  { re: /[A-Za-z]:[\\/]/, what: 'a Windows path' },
  { re: /(^|[\s"'])\/(?:home|users|Users|var|etc|opt|tmp)\//, what: 'a POSIX path' },
  { re: /\.\.[\\/]/, what: 'a relative path escape' },
  { re: /https?:\/\//i, what: 'a URL' },
  { re: /[\w.+-]+@[\w-]+\.[\w.]+/, what: 'an email address' },
];

const failures = [];
const fail = (msg) => failures.push(msg);

if (!fs.existsSync(LANE)) {
  // Not an error: a registry with no contributors yet is a legitimate state.
  console.log('usage lane: absent — no installation has contributed counts yet.');
  process.exit(0);
}

let files;
try {
  files = fs.readdirSync(LANE).filter((f) => f.endsWith('.json')).sort();
} catch (e) {
  console.error(`check-usage FATAL: usage/ exists but cannot be read (${e.message}).`);
  console.error('Reporting nothing is not the same as finding nothing — refusing to exit 0.');
  process.exit(2);
}

const knownSkills = fs.existsSync(SKILLS)
  ? new Set(fs.readdirSync(SKILLS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name))
  : new Set();

let totalSkills = 0;

for (const file of files) {
  const rel = `usage/${file}`;
  const stem = file.replace(/\.json$/, '');
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(path.join(LANE, file), 'utf8'));
  } catch (e) {
    fail(`${rel}: not valid JSON (${e.message})`);
    continue;
  }

  // -- privacy first: scan the RAW text, so a leak in an unexpected key is still
  //    caught even though unknown keys are rejected below.
  const raw = fs.readFileSync(path.join(LANE, file), 'utf8');
  for (const { re, what } of LEAKY) {
    const hit = raw.match(re);
    if (hit) {
      fail(
        `${rel}: contains ${what} (${JSON.stringify(hit[0].slice(0, 60))}). ` +
          'A usage file carries counts and nothing else — this repository is public.',
      );
    }
  }

  if (doc.schema !== SCHEMA) fail(`${rel}: schema must be "${SCHEMA}", found ${JSON.stringify(doc.schema)}`);
  for (const k of Object.keys(doc)) {
    if (!TOP_KEYS.has(k)) fail(`${rel}: unexpected top-level key "${k}" — the spec names ${[...TOP_KEYS].join(', ')}`);
  }
  if (typeof doc.contributor !== 'string' || !CONTRIBUTOR_RE.test(doc.contributor)) {
    fail(`${rel}: contributor must match ${CONTRIBUTOR_RE} — found ${JSON.stringify(doc.contributor)}`);
  } else if (doc.contributor !== stem) {
    // Filename IS the identity. Without this, two installations can both write
    // `contributor: "team-a"` into different files and double-count.
    fail(`${rel}: contributor "${doc.contributor}" does not match the filename stem "${stem}"`);
  }
  if (typeof doc.app !== 'string' || !doc.app.trim()) fail(`${rel}: app is required`);
  if (typeof doc.generatedAt !== 'string' || !ISO_RE.test(doc.generatedAt)) {
    fail(`${rel}: generatedAt must be ISO-8601 — found ${JSON.stringify(doc.generatedAt)}`);
  }
  if (!Number.isInteger(doc.windowDays) || doc.windowDays <= 0) {
    fail(`${rel}: windowDays must be a positive integer — found ${JSON.stringify(doc.windowDays)}`);
  }

  if (doc.skills === null || typeof doc.skills !== 'object' || Array.isArray(doc.skills)) {
    fail(`${rel}: skills must be an object of name → { invokes }`);
    continue;
  }
  for (const [name, entry] of Object.entries(doc.skills)) {
    totalSkills += 1;
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      fail(`${rel}: skills["${name}"] must be an object`);
      continue;
    }
    for (const k of Object.keys(entry)) {
      if (!ENTRY_KEYS.has(k)) fail(`${rel}: skills["${name}"] has unexpected key "${k}"`);
    }
    if (!Number.isInteger(entry.invokes) || entry.invokes < 0) {
      fail(`${rel}: skills["${name}"].invokes must be a non-negative integer — found ${JSON.stringify(entry.invokes)}`);
    }
    if (entry.lastUsed !== undefined && !ISO_RE.test(String(entry.lastUsed))) {
      fail(`${rel}: skills["${name}"].lastUsed must be ISO-8601`);
    }
    // A count for a skill this registry does not publish is not fatal — the skill
    // may have been renamed or removed while an installation still reports it —
    // but it must be visible, because it is silently dropped from the aggregate.
    if (knownSkills.size > 0 && !knownSkills.has(name)) {
      console.warn(`  note: ${rel} reports "${name}", which this registry does not publish — dropped from the aggregate.`);
    }
  }
}

console.log(`usage lane: ${files.length} contributor file(s) · ${totalSkills} skill entries`);

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error('');
  process.exit(1);
}
console.log('usage lane OK — counts only, one file per contributor.');
