// Deterministic tests for extraction, ICU expansion and the glob matcher.
//
// `node --test "skills/native-copy/tests/*.mjs"` - builtins only, no install, no network.
// Extraction is where coverage is won or lost silently: a string the extractor never
// yields is a string no rule ever sees, and the gate still prints green.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { walkJson, extractJson, extractCode, extractMarkdown, classify, isClassNameLike, decodeEntities } from '../scripts/lib/extract.mjs';
import { expandIcu } from '../scripts/lib/icu.mjs';
import { matchGlob, expandSources, staticPrefix } from '../scripts/lib/glob.mjs';
import { lintRecords } from '../scripts/lib/rules.mjs';
import { contractFor } from '../scripts/lib/contract.mjs';

const NBSP = ' ';
const EM = '—';

// ------------------------------------------------------------------ JSON catalogs

const CATALOG = `{
  "landing": {
    "title": "Hiring, done right",
    "voice": {
      "transcript": [
        "You shipped a React app for a school project ${EM} what broke first?",
        { "speaker": "Candidate", "line": "The build ${EM} it always is." },
        ["nested", "array inside an array"]
      ]
    },
    "count": 3,
    "flag": true
  }
}
`;

test('JSON: arrays and objects inside arrays are walked, with key paths and lines', () => {
  const leaves = walkJson(CATALOG);
  const keys = leaves.map((l) => l.key);
  assert.deepEqual(keys, [
    'landing.title',
    'landing.voice.transcript[0]',
    'landing.voice.transcript[1].speaker',
    'landing.voice.transcript[1].line',
    'landing.voice.transcript[2][0]',
    'landing.voice.transcript[2][1]',
  ]);
  assert.equal(leaves.find((l) => l.key === 'landing.voice.transcript[0]').line, 6);
  assert.equal(leaves.find((l) => l.key === 'landing.voice.transcript[1].line').line, 7);
});

test('JSON: the banned character inside an array reaches the rules (the fleet gate that skipped arrays missed it)', () => {
  const recs = extractJson(CATALOG, 'messages/en.json');
  const findings = lintRecords(recs, contractFor({ dash: { emDash: 'ban' } })).filter((f) => f.rule === 'EN-DASH' && f.severity === 'error');
  assert.deepEqual(findings.map((f) => f.key).sort(), ['landing.voice.transcript[0]', 'landing.voice.transcript[1].line']);
});

test('JSON: non-string leaves are skipped, and invalid JSON throws instead of yielding zero strings', () => {
  assert.equal(extractJson('{"a": 1, "b": null, "c": "Real text"}', 'x.json').length, 1);
  assert.throws(() => walkJson('{"a": "unterminated}'));
  assert.throws(() => walkJson('{"a": "x",}'));
});

// ------------------------------------------------------------------ ICU

test('ICU: a placeholder becomes a neutral sample, never a deletion', () => {
  assert.equal(expandIcu('Hi {name}, welcome back.').text, 'Hi Alex, welcome back.');
  assert.equal(expandIcu('{count} rounds here').text, '3 rounds here');
  assert.equal(expandIcu('Hi {{name}}!').text, 'Hi Alex!');
});

test('ICU: plural takes `other` for the primary text and renders each branch as a variant', () => {
  const r = expandIcu('{count, plural, one {# column} other {# columns}}');
  assert.equal(r.text, '3 columns');
  assert.ok(r.variants.includes('1 column'));
  const sel = expandIcu('{role, select, admin {Admins can edit} other {You can view}}');
  assert.equal(sel.text, 'You can view');
  assert.ok(sel.variants.includes('Admins can edit'));
});

test('ICU: rich-text tags are stripped keeping inner text; empty tags are sampled; quoting and malformed input degrade honestly', () => {
  assert.equal(expandIcu('Read the <b>terms</b> first.').text, 'Read the terms first.');
  assert.equal(expandIcu('Sources in <path></path> render live.').text, 'Sources in Alex render live.');
  assert.equal(expandIcu("Don't use '{braces}' here").text, "Don't use {braces} here");
  const broken = expandIcu('{count, plural, one {# item} other {# items}');
  assert.ok(broken.icuError);
  assert.ok(!broken.text.includes('{count'), broken.text);
});

test('classify: fewer than 5 words or no terminal punctuation is a fragment', () => {
  assert.equal(classify('Save changes'), 'fragment');
  assert.equal(classify('This one has five words but no stop'), 'fragment');
  assert.equal(classify('This is a complete sentence here.'), 'sentence');
});

// ------------------------------------------------------------------ TS / TSX

const TSX = `import Link from "next/link";
import { cn } from "@/lib/utils";

const CHANNELS = [
  { name: "Google Ads", level: { cs: "živá synchronizace", en: "live sync" } },
];

const T = {
  cs: { heroTitle: "Stůjte pevně." },
  en: {
    heroTitle: "Stand adamant.",
    heroStart: "Start",
    heroLeft: \`\${count} seats left in this cohort\`,
  },
} as const;

export default function Hero({ user }) {
  console.log("debug message with spaces");
  return (
    <section className="relative isolate overflow-hidden border-b">
      <h1 className={cn("text-4xl font-semibold", big && "lg:text-6xl")}>
        Welcome to <strong>Acme</strong> today
      </h1>
      <p>{t("hero.subhead")}</p>
      <p>Hello {user.name}, welcome back&nbsp;&mdash; again.</p>
      <img src="/a.png" alt="A team reviewing a hiring plan" />
      <Link href="https://example.com/docs">Read the docs</Link>
    </section>
  );
}
`;

test('TSX: dictionary strings keyed by path, non-English locale branches skipped', () => {
  const recs = extractCode(TSX, 'Hero.tsx');
  const byKey = Object.fromEntries(recs.map((r) => [r.key, r.text]));
  assert.equal(byKey['T.en.heroTitle'], 'Stand adamant.');
  assert.equal(byKey['T.en.heroStart'], 'Start', 'a one-word value in a dictionary shape still counts');
  assert.equal(byKey['T.en.heroLeft'], '3 seats left in this cohort');
  assert.equal(byKey['CHANNELS[0].level.en'], 'live sync');
  assert.ok(!recs.some((r) => /Stůjte|živá/.test(r.text)), 'cs branch must not be linted as English');
});

test('TSX: JSX text joins inline children; entities decode to the rendered character; prose attributes are read; code strings are not', () => {
  const recs = extractCode(TSX, 'Hero.tsx');
  const texts = recs.map((r) => r.text);
  assert.ok(texts.includes('Welcome to Acme today'));
  assert.equal(recs.find((r) => r.text === 'Welcome to Acme today').tag, 'h1');
  // &nbsp; is a real no-break space in rendered copy; whitespace collapsing must not erase it
  assert.ok(texts.includes(`Hello Alex, welcome back${NBSP}${EM} again.`), texts.map((t) => JSON.stringify(t)).join(' | '));
  assert.ok(recs.some((r) => r.key === '<img alt>' && r.text === 'A team reviewing a hiring plan'));
  assert.ok(texts.includes('Read the docs'));
  for (const bad of ['next/link', 'debug message with spaces', 'text-4xl font-semibold', 'relative isolate overflow-hidden border-b', 'hero.subhead', 'Google Ads']) {
    assert.ok(!texts.includes(bad), `should not extract ${bad}`);
  }
});

test('TSX: a line number points at the string', () => {
  const recs = extractCode(TSX, 'Hero.tsx');
  assert.equal(recs.find((r) => r.key === 'T.en.heroTitle').line, 11);
});

test('isClassNameLike: utility classes yes, hyphenated prose no', () => {
  assert.equal(isClassNameLike('mt-5 max-w-lg text-lg leading-relaxed'), true);
  assert.equal(isClassNameLike('hover:bg-brand-400 active:scale-[0.99]'), true);
  assert.equal(isClassNameLike('ad-copy checks'), false);
  assert.equal(isClassNameLike('Start free trial'), false);
});

test('decodeEntities: named and numeric', () => {
  assert.equal(decodeEntities('a&nbsp;b &mdash; &#8217; &#x2026;'), `a${NBSP}b ${EM} ’ …`);
});

// ------------------------------------------------------------------ Markdown / MDX

const MDX = `---
title: "Not linted: frontmatter"
---
import { Chart } from "../components/Chart";

## Pricing that scales

We bill per seat. See [the pricing page](/pricing) or run \`npm run seed\` first.

\`\`\`bash
echo "not prose in a fence"
\`\`\`

<Chart data={data} />

- First item of a list
- Second item with a price of 10&nbsp;USD
`;

test('MDX: frontmatter, fences, import lines and tag-only lines skipped; prose kept with tags', () => {
  const recs = extractMarkdown(MDX, 'post.mdx');
  const texts = recs.map((r) => `${r.tag}:${r.text}`);
  assert.deepEqual(texts, [
    'h2:Pricing that scales',
    'p:We bill per seat. See the pricing page or run code first.',
    'li:First item of a list',
    `li:Second item with a price of 10${NBSP}USD`,
  ]);
  assert.equal(recs[0].line, 6);
});

// ------------------------------------------------------------------ glob

test('glob: ** spans zero or more directories; * stays in a segment; braces and ? work', () => {
  assert.equal(matchGlob('src/**/*.tsx', 'src/a/b/C.tsx'), true);
  assert.equal(matchGlob('src/**/*.tsx', 'src/C.tsx'), true);
  assert.equal(matchGlob('src/*.tsx', 'src/a/C.tsx'), false);
  assert.equal(matchGlob('messages/{en,en-GB}.json', 'messages/en-GB.json'), true);
  assert.equal(matchGlob('messages/{en,en-GB}.json', 'messages/cs.json'), false);
  assert.equal(matchGlob('docs/?.md', 'docs/a.md'), true);
  assert.equal(staticPrefix('src/components/**/*.tsx'), 'src/components');
});

test('expandSources: first source claims a file, exclude wins, per-source counts are reported', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'native-copy-glob-'));
  try {
    fs.mkdirSync(path.join(dir, 'src', 'x'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'node_modules', 'pkg'), { recursive: true });
    for (const f of ['src/a.tsx', 'src/x/b.tsx', 'src/x/b.test.tsx', 'node_modules/pkg/c.tsx']) fs.writeFileSync(path.join(dir, f), '');
    const { files, perSource } = expandSources(dir, [{ path: 'src/**/*.tsx', kind: 'jsx' }, { path: 'src/a.tsx', kind: 'ts-module' }], ['**/*.test.tsx']);
    assert.deepEqual(files.map((f) => `${f.file}:${f.kind}`), ['src/a.tsx:jsx', 'src/x/b.tsx:jsx']);
    assert.deepEqual(perSource, [2, 1]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
