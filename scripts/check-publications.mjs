#!/usr/bin/env node
/**
 * check-publications - the gate for the `publications/` lane (docs/publications-lane.md).
 *
 * Why this exists: a publication is the one artifact in this registry that is written
 * for readers OUTSIDE it. It leaves as a Medium story and a self-contained page, and once
 * pasted it cannot be recalled. The pipeline that produces one (research, draft, check)
 * runs an agent over untrusted web pages, and a human approves the result. That human
 * judges quality; this gate checks only what a machine can check without judgement, so
 * an approval is never spent on a dangling citation, an undated source, a "we" the
 * standard forbids, a page that phones home, or a `[TODO]` that survived the edit.
 *
 * Mechanical rules, nothing else (quality is the human's, by design):
 *   shape          the fixed per-publication file set, and nothing outside it; every
 *                  medium/story.html image is `figures/NN-<name>.png`, the render of a
 *                  listed `figures/NN-<name>.svg`. The lane is text-only: the PNG renders
 *                  are derived, regenerated from the SVGs, and never required here
 *   schema         publication.json is `publication/1`: closed keys, types, no null
 *   slug           the `slug` field equals its directory name, kebab-case
 *   citations      every `[n]` in post.md, post.html and medium/story.html - and every
 *                  claim - resolves to a source `n`; post.md cites at least once
 *   sources        every source has a well-formed date and a well-formed http(s) URL
 *   source-mix     at least 8 sources, 3 primary, 1 counter
 *   figures        every figure has a caption and a source list that resolves, and every
 *                  SVG under figures/ is a listed figure (an unlisted one has no caption)
 *   first-person   no I / my / me / we / our in prose, outside code and quotations
 *   self-contained post.html (and the figures, and the Medium story) fetch nothing:
 *                  no http(s) src, no external stylesheet or script, no CSS url()/@import
 *   placeholders   no lorem ipsum, no `[TODO]`-style bracket placeholders, no `{{holes}}`
 *   privacy        no machine home path in any file (AGENTS.md: roots stay local)
 *   critique       the optional `critique` block (who reviewed the draft, what was decided)
 *                  is well-formed and its counts add up; when the optional critique/
 *                  directory is present, every review finding has exactly one disposition
 *                  with a reason, every disposition names a finding that exists, and the
 *                  block's counts match the dispositions. Mechanics only: whether a
 *                  disposition's reason is a GOOD reason is the approving human's call.
 *
 * Asserts its own detectors on planted positives before reading the lane: a scan for
 * things that must NOT match reports the same "clean" whether the lane is clean or the
 * pattern is dead, and only a planted hit tells them apart.
 *
 * Usage:
 *   node scripts/check-publications.mjs                  # the whole lane
 *   node scripts/check-publications.mjs --root <dir>     # another lane root (fixtures)
 *   node scripts/check-publications.mjs <dir> [<dir>..]  # specific publication directories
 *
 * Exits 0 clean, 1 on findings, 2 when it could not run (no lane, an empty lane, a
 * broken detector). Reporting nothing is not the same as finding nothing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

export const SCHEMA = 'publication/1';
export const MIN_SOURCES = 8;
export const MIN_PRIMARY = 3;
export const MIN_COUNTER = 1;
export const MAX_TAGS = 5;

/**
 * Files every publication carries. figures/ is required only when figures are listed;
 * medium/figures/ (PNG renders) is never required - the registry is text-only.
 */
export const REQUIRED_FILES = [
  'publication.json', 'post.html', 'post.md', 'SOURCES.md',
  'medium/story.html', 'medium/tags.txt', 'medium/README.md',
];
const TOP_ENTRIES = new Set(['publication.json', 'post.html', 'post.md', 'SOURCES.md', 'figures', 'medium', 'critique']);
const TOP_DIRS = new Set(['figures', 'medium', 'critique']);
const MEDIUM_ENTRIES = new Set(['story.html', 'tags.txt', 'README.md', 'figures']);
/** The optional critique/ directory holds exactly these two files, both required when it exists. */
export const CRITIQUE_FILES = ['reviews.json', 'dispositions.json'];
// Lane-root files that are not publications: the generated index and an optional readme.
export const LANE_ROOT_FILES = new Set(['index.json', 'README.md']);

export const FIGURE_FILE_RE = /^figures\/\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.svg$/;
const FIGURE_NAME_RE = /^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.svg$/;
const MEDIUM_FIGURE_RE = /^(\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*)\.png$/;
// The one image reference medium/story.html may carry: a relative PNG render, by name.
const STORY_IMAGE_RE = /^figures\/(\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*)\.png$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const CHECK_KEY_RE = /^[a-z][a-zA-Z0-9]*(?:-[a-z0-9]+)*$/;

const TOP_KEYS = ['schema', 'slug', 'title', 'subtitle', 'topic', 'date', 'readMinutes', 'status', 'standard', 'sources', 'claims', 'figures', 'check', 'run'];
const TOPIC_KEYS = new Set(['kind', 'bundle', 'subject', 'text', 'angle']);
const STANDARD_KEYS = ['recipe', 'version', 'bundle'];
const SOURCE_KEYS = ['n', 'url', 'title', 'publisher', 'date', 'primary', 'counter', 'took'];
const CLAIM_KEYS = ['text', 'source'];
const FIGURE_KEYS = ['file', 'caption', 'sources'];
const RUN_KEYS = new Set(['id', 'model', 'effort', 'costUsd']);
// Optional top-level keys: present only when the producing run had them. `critique` is
// written by every pipeline run since the critique step landed; an imported post that
// predates the step carries none.
const OPTIONAL_TOP_KEYS = ['critique'];

// ---- the critique contract (docs/publications-lane.md, "The critique record")
export const CRITIQUE = {
  maxRounds: 2,
  minReviewers: 1,
  maxReviewers: 8,
  engines: ['claude', 'codex', 'grok', 'agy'],
  efforts: ['low', 'medium', 'high', 'xhigh', 'max'],
  outcomes: ['completed', 'unavailable', 'timed-out', 'errored', 'seat-limit'],
  decisions: ['keep', 'rewrite', 'research'],
  verdicts: ['publish', 'revise', 'rework'],
  kinds: ['factual', 'format', 'engagement', 'insight', 'voice'],
  severities: ['blocker', 'major', 'minor'],
  dispositions: ['accepted', 'rejected', 'deferred'],
};
const CRITIQUE_KEYS = ['rounds', 'reviewers', 'findings', 'decision'];
const REVIEWER_KEYS = new Set(['id', 'engine', 'model', 'effort', 'outcome', 'costUsd']);
const COUNT_KEYS = ['total', 'accepted', 'rejected', 'deferred'];
const REVIEW_KEYS = ['reviewer', 'round', 'model', 'effort', 'verdict', 'summary', 'findings'];
const FINDING_KEYS = ['id', 'kind', 'severity', 'location', 'claim', 'evidence', 'suggestion'];
const DISPOSITION_KEYS = new Set(['reviewer', 'round', 'findingId', 'disposition', 'reason', 'action']);

// ------------------------------------------------------------------ text extraction
// Every removal keeps the newlines it removes, so a line number reported against the
// stripped text is the line number in the file.

const keepNewlines = (m) => m.replace(/[^\n]/g, '');
const blank = (m) => m.replace(/[^\n]/g, ' ');

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ldquo: '“', rdquo: '”',
  lsquo: '‘', rsquo: '’', mdash: '—', ndash: '–', hellip: '…', laquo: '«', raquo: '»',
};
export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function removeElements(html, tags) {
  let s = html.replace(/<!--[\s\S]*?-->/g, keepNewlines);
  for (const tag of tags) s = s.replace(new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}\\s*>`, 'gi'), keepNewlines);
  return s;
}

/** HTML -> visible text with code, scripts and styles removed. Quotations are kept. */
export function htmlText(html) {
  const s = removeElements(html, ['script', 'style', 'pre', 'code', 'template']);
  return decodeEntities(s.replace(/<[^>]*>/g, (m) => ' ' + keepNewlines(m)));
}

/** Markdown with fenced code, inline code and HTML comments removed. Quotations kept. */
export function markdownText(md) {
  return md
    .replace(/<!--[\s\S]*?-->/g, keepNewlines)
    .replace(/^(\s*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\2[^\n]*$/gm, keepNewlines)
    .replace(/`[^`\n]+`/g, ' ');
}

/** Remove quoted spans: curly double quotes, guillemets and straight double quotes. */
export function stripQuotations(s) {
  return s
    .replace(/“[^”]*”/g, blank)
    .replace(/«[^»]*»/g, blank)
    .replace(/"[^"\n]{0,400}"/g, ' ');
}

/** Prose of an HTML document: no code, no quotations, no URLs. */
export function htmlProse(html) {
  const s = removeElements(html, ['script', 'style', 'pre', 'code', 'template', 'blockquote', 'q']);
  const text = decodeEntities(s.replace(/<[^>]*>/g, (m) => ' ' + keepNewlines(m)));
  return stripQuotations(text.replace(/https?:\/\/\S+/g, ' '));
}

/** Prose of a markdown document: no code, no blockquotes, no quotations, no URLs. */
export function markdownProse(md) {
  const s = markdownText(md)
    .replace(/^[ \t]*>.*$/gm, ' ')
    .replace(/\]\([^)\n]*\)/g, '] ')
    .replace(/https?:\/\/\S+/g, ' ');
  return stripQuotations(s);
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;
const around = (text, index, len) =>
  text.slice(Math.max(0, index - 30), index + len + 30).replace(/\s+/g, ' ').trim();

// ------------------------------------------------------------------ detectors

// `I` is matched case-sensitively and not inside `I/O`; the rest case-insensitively.
// Unicode letter classes keep a word boundary honest next to non-ASCII text.
const FIRST_PERSON = [
  /(?<![\p{L}\p{N}_/])I(?![\p{L}\p{N}_/])/gu,
  /(?<![\p{L}\p{N}_])(?:my|me|we|our)(?![\p{L}\p{N}_])/giu,
];
export function firstPersonHits(prose) {
  const hits = [];
  for (const re of FIRST_PERSON) {
    re.lastIndex = 0;
    for (const m of prose.matchAll(re)) {
      hits.push({ word: m[0], line: lineOf(prose, m.index), context: around(prose, m.index, m[0].length) });
    }
  }
  return hits.sort((a, b) => a.line - b.line);
}

const CITATION_RE = /\[(\d+)\]/g;
// A grouped citation `[1, 5]` or a range `[3-7]` is not the lane format: one `[n]` per
// source, so every reference is individually resolvable.
const GROUPED_CITATION_RE = /\[\d+\s*(?:[,;]\s*\d+|[-–—]\s*\d+)[^\]\n]*\]/g;
export function citationsIn(text) {
  const found = [];
  for (const m of text.matchAll(CITATION_RE)) found.push({ n: Number(m[1]), line: lineOf(text, m.index) });
  const grouped = [];
  for (const m of text.matchAll(GROUPED_CITATION_RE)) grouped.push({ text: m[0], line: lineOf(text, m.index) });
  return { found, grouped };
}

const PLACEHOLDERS = [
  { re: /\blorem\b|\bipsum dolor\b/gi, what: 'lorem ipsum' },
  {
    re: /\[(?:TODO|TBD|TBA|TK|XXX+|FIXME|PLACEHOLDER|CITATION NEEDED|CITE|SOURCE|SOURCES|LINK|URL|IMAGE|IMG|FIGURE|CHART|DATE|NAME|TITLE|AUTHOR|NUMBER|n|\?+|…|\.\.\.)\]/gi,
    what: 'a bracket placeholder',
  },
  { re: /\[(?:insert|add|your|replace)\b[^\]\n]{0,80}\]/gi, what: 'a bracket placeholder' },
  { re: /\{\{[^{}\n]{0,80}\}\}/g, what: 'a template hole' },
];
export function placeholderHits(text) {
  const hits = [];
  for (const { re, what } of PLACEHOLDERS) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) hits.push({ what, text: m[0], line: lineOf(text, m.index) });
  }
  return hits.sort((a, b) => a.line - b.line);
}

// Anything the page would FETCH. Navigation (`<a href>`) is fine; a fetch is a network
// dependency, a tracking vector, and a page that breaks offline.
const NET = '(?:https?:)?\\/\\/';
const FETCH_LINK_REL = /\b(?:stylesheet|preload|modulepreload|prefetch|icon|manifest|import)\b/i;
export function networkRefs(html, { svg = false } = {}) {
  const hits = [];
  const add = (what, m) => hits.push({ what, text: m[0].slice(0, 120), line: lineOf(html, m.index) });
  for (const m of html.matchAll(new RegExp(`\\b(?:src|srcset|poster)\\s*=\\s*(["']?)\\s*[^"'>]*?${NET}`, 'gi'))) add('a network src', m);
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const href = /\bhref\s*=\s*(["']?)([^"'\s>]*)\1/i.exec(tag);
    if (href && new RegExp(`^${NET}`, 'i').test(href[2]) && FETCH_LINK_REL.test(tag)) add('an external stylesheet or resource link', m);
  }
  for (const m of html.matchAll(new RegExp(`@import\\s+(?:url\\(\\s*)?["']?\\s*${NET}`, 'gi'))) add('a CSS @import', m);
  for (const m of html.matchAll(new RegExp(`url\\(\\s*["']?\\s*${NET}`, 'gi'))) add('a CSS url()', m);
  if (svg) {
    for (const m of html.matchAll(new RegExp(`<(?:image|use|feImage|script)\\b[^>]*\\b(?:xlink:)?href\\s*=\\s*["']\\s*${NET}`, 'gi'))) add('an external SVG reference', m);
    for (const m of html.matchAll(/<script\b/gi)) add('a script in an SVG figure', m);
  }
  return hits;
}

/**
 * The images of medium/story.html. The lane is text-only: figures are canonical as SVG
 * under figures/, and Medium needs PNG, so the story names a PNG render of a listed
 * figure - `figures/NN-<name>.png` for a listed `figures/NN-<name>.svg` - whether or not
 * that render sits in the registry (it is derived, and regenerated from the SVG when the
 * story is pasted). Every other src is a finding: another relative path, an absolute path,
 * a data: URI, or a render of a figure nobody listed. A network src (anything with `//`)
 * is skipped here because networkRefs already reports it under `self-contained`, and one
 * defect is reported once. `listed` is the set of listed `figures/NN-<name>.svg` paths.
 * Returns [{src, line, message}].
 */
export function storyImageProblems(story, listed) {
  const out = [];
  const IMG_SRC = /<img\b[^>]*?(?<![\w-])src\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;
  for (const m of story.matchAll(IMG_SRC)) {
    const src = m[1] ?? m[2] ?? m[3];
    if (src.includes('//')) continue;
    let rel = src.trim();
    try { rel = decodeURI(rel); } catch { /* keep the raw src */ }
    const line = lineOf(story, m.index);
    const png = STORY_IMAGE_RE.exec(rel);
    if (!png) out.push({ src, line, message: `image ${src} is not figures/NN-<name>.png, the relative PNG render of a listed figure` });
    else if (!listed.has(`figures/${png[1]}.svg`)) out.push({ src, line, message: `image ${src} renders figures/${png[1]}.svg, which publication.json figures does not list` });
  }
  return out;
}

// Same shape as check-public-paths.mjs (which cannot be imported without running it):
// a user-profile path on Windows or POSIX, unless the user segment is a placeholder.
const PROFILE = [
  /(?<![A-Za-z])[A-Za-z]:[\\/]{1,2}Users[\\/]{1,2}([^\\/\s`'"<>|:*?]+)[\\/]/g,
  /(?<![\w.~:-])\/(?:home|Users)\/([^/\s`'"<>|:*?]+)\//g,
];
const PATH_PLACEHOLDER = new Set(['me', 'you', 'x', 'y', 'user', 'username', 'name', 'example', 'public', 'default']);
export function machinePathHits(text) {
  const hits = [];
  for (const re of PROFILE) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      const who = m[1].replace(/^<|>$/g, '').toLowerCase();
      if (m[1].startsWith('<') || PATH_PLACEHOLDER.has(who)) continue;
      hits.push({ text: m[0], line: lineOf(text, m.index) });
    }
  }
  return hits;
}

export const isIsoDate = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
/** A source date: a year, a year-month, or a full date - as precise as the page states. */
export const isSourceDate = (s) => {
  if (typeof s !== 'string') return false;
  if (/^\d{4}$/.test(s)) return true;
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(s)) return true;
  return isIsoDate(s);
};
export const isWebUrl = (s) => {
  if (typeof s !== 'string' || /\s/.test(s)) return false;
  try {
    const u = new URL(s);
    return (u.protocol === 'http:' || u.protocol === 'https:') && /\.[a-z]{2,}$/i.test(u.hostname);
  } catch { return false; }
};

// ------------------------------------------------------------------ the critique record

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const isCount = (v) => Number.isInteger(v) && v >= 0;

/**
 * The critique record, checked mechanically. `block` is publication.json's `critique`
 * (undefined when absent). `files` is undefined when there is no critique/ directory,
 * otherwise `{ reviews, dispositions }` as parsed - a file that is missing or did not
 * parse is passed as undefined (the caller reports it) and the cross-checks that need it
 * are skipped rather than reported twice. Returns [{rule, file, message}].
 *
 * The block is the record; the directory is its optional detail. So the block may stand
 * alone, but the directory never may: a directory with no block is review evidence for a
 * decision nobody recorded.
 */
export function critiqueFindings(block, files) {
  const out = [];
  const P = 'publication.json';
  const RV = 'critique/reviews.json';
  const DS = 'critique/dispositions.json';
  const fail = (file, message) => out.push({ rule: 'critique', file, message });
  const enumFail = (file, at, v, set) => fail(file, `${at} must be one of ${set.join(' | ')}, got ${JSON.stringify(v)}`);
  const hasDir = files !== undefined;

  if (block === undefined) {
    if (hasDir) fail('critique', 'critique/ exists but publication.json carries no `critique` block - the directory details a record that is not there');
    return out;
  }
  if (!isObj(block)) { fail(P, 'critique must be an object'); return out; }
  for (const k of Object.keys(block)) if (!CRITIQUE_KEYS.includes(k)) fail(P, `critique: unknown key "${k}"`);
  for (const k of CRITIQUE_KEYS) if (!(k in block)) fail(P, `critique: missing required key "${k}"`);

  const roundsOk = Number.isInteger(block.rounds) && block.rounds >= 1 && block.rounds <= CRITIQUE.maxRounds;
  if ('rounds' in block && !roundsOk) fail(P, `critique.rounds must be an integer from 1 to ${CRITIQUE.maxRounds}, got ${JSON.stringify(block.rounds)}`);
  const maxRound = roundsOk ? block.rounds : CRITIQUE.maxRounds;

  const declared = new Map();
  if ('reviewers' in block) {
    const rs = block.reviewers;
    if (!Array.isArray(rs)) fail(P, 'critique.reviewers must be an array');
    else {
      if (rs.length < CRITIQUE.minReviewers || rs.length > CRITIQUE.maxReviewers) {
        fail(P, `critique.reviewers holds ${rs.length} reviewer(s); ${CRITIQUE.minReviewers} to ${CRITIQUE.maxReviewers} allowed`);
      }
      rs.forEach((r, i) => {
        const at = `critique.reviewers[${i}]`;
        if (!isObj(r)) { fail(P, `${at} must be an object`); return; }
        for (const k of Object.keys(r)) if (!REVIEWER_KEYS.has(k)) fail(P, `${at}: unknown key "${k}"`);
        if (!(typeof r.id === 'string' && SLUG_RE.test(r.id))) fail(P, `${at}.id must be a kebab-case slug, got ${JSON.stringify(r.id)}`);
        else if (declared.has(r.id)) fail(P, `${at}.id "${r.id}" is declared twice - reviewer ids are unique`);
        else declared.set(r.id, r);
        if (!CRITIQUE.engines.includes(r.engine)) enumFail(P, `${at}.engine`, r.engine, CRITIQUE.engines);
        if (!nonEmpty(r.model)) fail(P, `${at}.model must be a non-empty model id`);
        if (!CRITIQUE.efforts.includes(r.effort)) enumFail(P, `${at}.effort`, r.effort, CRITIQUE.efforts);
        if (!CRITIQUE.outcomes.includes(r.outcome)) enumFail(P, `${at}.outcome`, r.outcome, CRITIQUE.outcomes);
        if ('costUsd' in r && !(typeof r.costUsd === 'number' && Number.isFinite(r.costUsd) && r.costUsd >= 0)) {
          fail(P, `${at}.costUsd, when present, must be a non-negative number (omit it when the CLI reports none)`);
        }
      });
    }
  }

  let counts = null;
  if ('findings' in block) {
    const f = block.findings;
    if (!isObj(f)) fail(P, 'critique.findings must be an object of counts');
    else {
      for (const k of Object.keys(f)) if (!COUNT_KEYS.includes(k)) fail(P, `critique.findings: unknown key "${k}"`);
      const bad = COUNT_KEYS.filter((k) => !isCount(f[k]));
      for (const k of bad) fail(P, `critique.findings.${k} must be a non-negative integer, got ${JSON.stringify(f[k])}`);
      if (bad.length === 0) {
        counts = f;
        if (f.total !== f.accepted + f.rejected + f.deferred) {
          fail(P, `critique.findings.total is ${f.total} but accepted + rejected + deferred is ${f.accepted + f.rejected + f.deferred}`);
        }
      }
    }
  }
  if ('decision' in block && !CRITIQUE.decisions.includes(block.decision)) enumFail(P, 'critique.decision', block.decision, CRITIQUE.decisions);

  if (!hasDir) return out;
  const { reviews, dispositions } = files;

  // ---- reviews.json: one object per (reviewer, round), findings keyed reviewer#round#id
  const findingDisposed = new Map();
  if (reviews !== undefined) {
    if (!Array.isArray(reviews)) fail(RV, 'must be a JSON array of review objects');
    else {
      const reviewed = new Set();
      const seenReview = new Set();
      reviews.forEach((rv, i) => {
        const at = `[${i}]`;
        if (!isObj(rv)) { fail(RV, `${at} must be an object`); return; }
        for (const k of Object.keys(rv)) if (!REVIEW_KEYS.includes(k)) fail(RV, `${at}: unknown key "${k}"`);
        for (const k of REVIEW_KEYS) if (!(k in rv)) fail(RV, `${at}: missing "${k}"`);
        const who = typeof rv.reviewer === 'string' ? rv.reviewer : null;
        if (who === null) fail(RV, `${at}.reviewer must be a reviewer id`);
        else if (!declared.has(who)) fail(RV, `${at}.reviewer "${who}" is not declared in publication.json critique.reviewers`);
        else reviewed.add(who);
        const roundOk = Number.isInteger(rv.round) && rv.round >= 1 && rv.round <= maxRound;
        if (!roundOk) fail(RV, `${at}.round must be an integer from 1 to ${maxRound} (critique.rounds), got ${JSON.stringify(rv.round)}`);
        if (who !== null && roundOk) {
          const key = `${who}#${rv.round}`;
          if (seenReview.has(key)) fail(RV, `${at}: a second review by "${who}" in round ${rv.round} - one review per reviewer per round`);
          seenReview.add(key);
        }
        if ('model' in rv && !nonEmpty(rv.model)) fail(RV, `${at}.model must be a non-empty model id`);
        if ('effort' in rv && !CRITIQUE.efforts.includes(rv.effort)) enumFail(RV, `${at}.effort`, rv.effort, CRITIQUE.efforts);
        if ('verdict' in rv && !CRITIQUE.verdicts.includes(rv.verdict)) enumFail(RV, `${at}.verdict`, rv.verdict, CRITIQUE.verdicts);
        if ('summary' in rv && !nonEmpty(rv.summary)) fail(RV, `${at}.summary must be a non-empty string`);
        if (!('findings' in rv)) return;
        if (!Array.isArray(rv.findings)) { fail(RV, `${at}.findings must be an array (empty when the reviewer found nothing)`); return; }
        const ids = new Set();
        rv.findings.forEach((fd, j) => {
          const fat = `${at}.findings[${j}]`;
          if (!isObj(fd)) { fail(RV, `${fat} must be an object`); return; }
          for (const k of Object.keys(fd)) if (!FINDING_KEYS.includes(k)) fail(RV, `${fat}: unknown key "${k}"`);
          for (const k of FINDING_KEYS) if (!(k in fd)) fail(RV, `${fat}: missing "${k}"`);
          if (!nonEmpty(fd.id)) fail(RV, `${fat}.id must be a non-empty string`);
          else if (ids.has(fd.id)) fail(RV, `${fat}.id "${fd.id}" repeats within one review`);
          else {
            ids.add(fd.id);
            if (who !== null && roundOk) findingDisposed.set(JSON.stringify([who, rv.round, fd.id]), { who, round: rv.round, id: fd.id, n: 0 });
          }
          if ('kind' in fd && !CRITIQUE.kinds.includes(fd.kind)) enumFail(RV, `${fat}.kind`, fd.kind, CRITIQUE.kinds);
          if ('severity' in fd && !CRITIQUE.severities.includes(fd.severity)) enumFail(RV, `${fat}.severity`, fd.severity, CRITIQUE.severities);
          for (const k of ['location', 'claim', 'suggestion']) if (k in fd && !nonEmpty(fd[k])) fail(RV, `${fat}.${k} must be a non-empty string`);
          if ('evidence' in fd) {
            if (!Array.isArray(fd.evidence)) fail(RV, `${fat}.evidence must be an array of URLs (empty when the finding cites none)`);
            else fd.evidence.forEach((u, k) => {
              if (!isWebUrl(u)) fail(RV, `${fat}.evidence[${k}] ${JSON.stringify(u)} is not a well-formed http(s) URL`);
            });
          }
        });
      });
      for (const [id, r] of declared) {
        if (r.outcome === 'completed' && !reviewed.has(id)) fail(RV, `reviewer "${id}" is recorded as completed but has no review`);
      }
    }
  }

  // ---- dispositions.json: exactly one per finding, each with a reason
  if (dispositions !== undefined) {
    if (!Array.isArray(dispositions)) fail(DS, 'must be a JSON array of disposition objects');
    else {
      const tally = { accepted: 0, rejected: 0, deferred: 0 };
      const canResolve = Array.isArray(reviews);
      dispositions.forEach((d, i) => {
        const at = `[${i}]`;
        if (!isObj(d)) { fail(DS, `${at} must be an object`); return; }
        for (const k of Object.keys(d)) if (!DISPOSITION_KEYS.has(k)) fail(DS, `${at}: unknown key "${k}"`);
        for (const k of ['reviewer', 'round', 'findingId', 'disposition', 'reason']) if (!(k in d)) fail(DS, `${at}: missing "${k}"`);
        if (CRITIQUE.dispositions.includes(d.disposition)) tally[d.disposition] += 1;
        else if ('disposition' in d) enumFail(DS, `${at}.disposition`, d.disposition, CRITIQUE.dispositions);
        if ('reason' in d && !nonEmpty(d.reason)) fail(DS, `${at}.reason is empty - every disposition says why`);
        if ('action' in d && !nonEmpty(d.action)) fail(DS, `${at}.action, when present, must be a non-empty string (omit it when nothing was done)`);
        if (!canResolve) return;
        const hit = findingDisposed.get(JSON.stringify([d.reviewer, d.round, d.findingId]));
        if (!hit) {
          fail(DS, `${at} disposes of finding ${JSON.stringify(d.findingId)} by ${JSON.stringify(d.reviewer)} in round ${JSON.stringify(d.round)}, which is not in reviews.json`);
        } else hit.n += 1;
      });
      if (canResolve) {
        for (const { who, round, id, n } of findingDisposed.values()) {
          if (n === 1) continue;
          fail(DS, n === 0
            ? `finding "${id}" by "${who}" in round ${round} has no disposition - every finding is accepted, rejected or deferred`
            : `finding "${id}" by "${who}" in round ${round} has ${n} dispositions - exactly one`);
        }
      }
      if (counts) {
        if (counts.total !== dispositions.length) fail(P, `critique.findings.total is ${counts.total} but dispositions.json records ${dispositions.length}`);
        for (const k of CRITIQUE.dispositions) {
          if (counts[k] !== tally[k]) fail(P, `critique.findings.${k} is ${counts[k]} but dispositions.json records ${tally[k]} ${k}`);
        }
      }
    }
  }
  return out;
}

// ------------------------------------------------------------------ self-assertion
/**
 * Plant one positive per detector and require it to fire, and one negative per
 * exclusion and require it to stay quiet. Returns the list of broken detectors.
 */
export function selfTest() {
  const broken = [];
  const expect = (name, ok) => { if (!ok) broken.push(name); };
  expect('first-person "we"', firstPersonHits(markdownProse('Here we measured it.')).length === 1);
  expect('first-person "I"', firstPersonHits(htmlProse('<p>Then I counted.</p>')).length === 1);
  expect('first-person skips quotations', firstPersonHits(markdownProse('The report says “we use the same tokenizer”.')).length === 0);
  expect('first-person skips code', firstPersonHits(markdownProse('Run `we --help` first.\n\n```\nmy_var = 1\n```\n')).length === 0);
  expect('first-person skips I/O', firstPersonHits(markdownProse('An I/O-bound step.')).length === 0);
  expect('citations', citationsIn('as shown [3] and [12].').found.length === 2);
  expect('grouped citations', citationsIn('as shown [3, 4].').grouped.length === 1);
  expect('placeholder [TODO]', placeholderHits('Finish this [TODO].').length === 1);
  expect('placeholder lorem', placeholderHits('Lorem ipsum dolor sit amet.').length >= 1);
  expect('placeholder skips a citation', placeholderHits('see [7]').length === 0);
  expect('network src', networkRefs('<img src="https://x.example/a.png">').length === 1);
  expect('network stylesheet', networkRefs('<link rel="stylesheet" href="https://x.example/a.css">').length === 1);
  expect('network skips anchors', networkRefs('<a href="https://x.example/">x</a>').length === 0);
  const listedSvg = new Set(['figures/01-a-chart.svg']);
  expect('story image: a render of a listed figure', storyImageProblems('<img src="figures/01-a-chart.png">', listedSvg).length === 0);
  expect('story image: a render of an unlisted figure', storyImageProblems('<img src="figures/02-other.png">', listedSvg).length === 1);
  expect('story image: any other relative src', storyImageProblems('<img src="figures/01-a-chart.svg">', listedSvg).length === 1);
  expect('machine path', machinePathHits('saved under C:\\Users\\kazda\\notes\\x.md').length === 1);
  expect('source date', isSourceDate('2025-11') && isSourceDate('2026-10-05') && !isSourceDate('Oct 2025'));
  expect('web url', isWebUrl('https://arxiv.org/abs/2305.13707') && !isWebUrl('SOURCES.md'));
  // The critique cross-check: a clean planted record stays quiet, and the same record
  // with its one disposition pointed at a finding that does not exist must fire.
  const block = {
    rounds: 1, decision: 'keep',
    reviewers: [{ id: 'r1', engine: 'claude', model: 'm', effort: 'high', outcome: 'completed' }],
    findings: { total: 1, accepted: 1, rejected: 0, deferred: 0 },
  };
  const reviews = [{
    reviewer: 'r1', round: 1, model: 'm', effort: 'high', verdict: 'revise', summary: 's',
    findings: [{ id: 'f1', kind: 'factual', severity: 'minor', location: 'l', claim: 'c', evidence: [], suggestion: 's' }],
  }];
  const disposition = (findingId) => [{ reviewer: 'r1', round: 1, findingId, disposition: 'accepted', reason: 'r' }];
  expect('critique clean record', critiqueFindings(block, { reviews, dispositions: disposition('f1') }).length === 0);
  expect('critique unknown finding', critiqueFindings(block, { reviews, dispositions: disposition('f9') }).length >= 1);
  return broken;
}

// ------------------------------------------------------------------ one publication

function findNulls(v, at, out) {
  if (v === null) { out.push(at); return; }
  if (Array.isArray(v)) v.forEach((x, i) => findNulls(x, `${at}[${i}]`, out));
  else if (isObj(v)) for (const [k, x] of Object.entries(v)) findNulls(x, at ? `${at}.${k}` : k, out);
}

function stringsIn(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => stringsIn(x, out));
  else if (isObj(v)) Object.values(v).forEach((x) => stringsIn(x, out));
  return out;
}

const read = (file) => {
  try { return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n'); } catch { return null; }
};

const listDir = (dir) => {
  try { return fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
};

/**
 * Validate one publication directory. `name` is the directory's own name (the slug it
 * must carry). Returns { findings: [{rule, file, message}], warnings: [...] }.
 */
export function validatePublication(dir, name = path.basename(dir)) {
  const findings = [];
  const warnings = [];
  const fail = (rule, file, message) => findings.push({ rule, file, message });
  const warn = (rule, file, message) => warnings.push({ rule, file, message });

  // ---- shape
  if (!SLUG_RE.test(name)) fail('slug', '', `directory name "${name}" is not a kebab-case slug`);
  const top = listDir(dir);
  if (!top) { fail('shape', '', 'not a readable directory'); return { findings, warnings }; }
  for (const e of top) {
    if (!TOP_ENTRIES.has(e.name)) fail('shape', e.name, 'not part of the fixed publication shape (docs/publications-lane.md)');
    else if (TOP_DIRS.has(e.name) !== e.isDirectory()) fail('shape', e.name, e.isDirectory() ? 'must be a file' : 'must be a directory');
  }
  for (const f of REQUIRED_FILES) if (!fs.existsSync(path.join(dir, f))) fail('shape', f, 'required file is missing');
  const svgOnDisk = [];
  const figEntries = listDir(path.join(dir, 'figures'));
  if (figEntries) {
    for (const e of figEntries) {
      if (e.isFile() && FIGURE_NAME_RE.test(e.name)) svgOnDisk.push(`figures/${e.name}`);
      else fail('shape', `figures/${e.name}`, 'figures/ holds only NN-<name>.svg files');
    }
  }
  const mediumPngs = [];
  const medEntries = listDir(path.join(dir, 'medium'));
  if (medEntries) {
    for (const e of medEntries) {
      if (!MEDIUM_ENTRIES.has(e.name)) fail('shape', `medium/${e.name}`, 'not part of the Medium package shape');
    }
    // medium/figures/ is optional and never required: the PNG renders are derived from
    // figures/*.svg and live in the pipeline's run directory. When present it holds only
    // renders of listed figures (the stem check runs once publication.json is read).
    const mfig = listDir(path.join(dir, 'medium', 'figures'));
    if (mfig) {
      for (const e of mfig) {
        const png = e.isFile() ? MEDIUM_FIGURE_RE.exec(e.name) : null;
        if (png) mediumPngs.push(png[1]);
        else fail('shape', `medium/figures/${e.name}`, 'medium/figures/ holds only NN-<name>.png renders');
      }
    }
  }
  // critique/ is optional and closed: exactly reviews.json and dispositions.json.
  const critEntries = fs.existsSync(path.join(dir, 'critique')) && fs.statSync(path.join(dir, 'critique')).isDirectory()
    ? listDir(path.join(dir, 'critique')) : null;
  let critiqueFiles;
  if (critEntries) {
    for (const e of critEntries) {
      if (!(e.isFile() && CRITIQUE_FILES.includes(e.name))) fail('shape', `critique/${e.name}`, `critique/ holds exactly ${CRITIQUE_FILES.join(' and ')}`);
    }
    critiqueFiles = {};
    for (const f of CRITIQUE_FILES) {
      const rel = `critique/${f}`;
      const text = read(path.join(dir, 'critique', f));
      if (text === null) { fail('shape', rel, 'required when critique/ exists'); continue; }
      let value;
      try { value = JSON.parse(text); } catch (e) { fail('critique', rel, `does not parse (${e.message})`); continue; }
      const nulls = [];
      findNulls(value, '', nulls);
      for (const at of nulls) fail('critique', rel, `${at || '(root)'} is null - omit an absent value, never write null`);
      critiqueFiles[f === 'reviews.json' ? 'reviews' : 'dispositions'] = value;
    }
  }

  // ---- schema
  const raw = read(path.join(dir, 'publication.json'));
  let pub = null;
  if (raw !== null) {
    try { pub = JSON.parse(raw); } catch (e) { fail('schema', 'publication.json', `does not parse (${e.message})`); }
  }
  const P = 'publication.json';
  if (pub !== null && !isObj(pub)) { fail('schema', P, 'must be a JSON object'); pub = null; }
  const sourceNs = new Set();
  const listedFigures = new Set();
  if (pub) {
    const nulls = [];
    findNulls(pub, '', nulls);
    for (const at of nulls) fail('schema', P, `${at} is null - omit an absent value, never write null`);
    for (const k of Object.keys(pub)) if (!TOP_KEYS.includes(k) && !OPTIONAL_TOP_KEYS.includes(k)) fail('schema', P, `unknown key "${k}"`);
    for (const k of TOP_KEYS) if (!(k in pub)) fail('schema', P, `missing required key "${k}"`);
    if ('schema' in pub && pub.schema !== SCHEMA) fail('schema', P, `schema must be "${SCHEMA}", got ${JSON.stringify(pub.schema)}`);
    if ('slug' in pub) {
      if (typeof pub.slug !== 'string' || !SLUG_RE.test(pub.slug)) fail('slug', P, `slug ${JSON.stringify(pub.slug)} is not kebab-case`);
      else if (pub.slug !== name) fail('slug', P, `slug "${pub.slug}" does not match its directory "${name}"`);
    }
    for (const k of ['title', 'subtitle']) if (k in pub && !nonEmpty(pub[k])) fail('schema', P, `${k} must be a non-empty string`);
    if ('date' in pub && !isIsoDate(pub.date)) fail('schema', P, `date must be YYYY-MM-DD, got ${JSON.stringify(pub.date)}`);
    if ('readMinutes' in pub && !(Number.isInteger(pub.readMinutes) && pub.readMinutes >= 1 && pub.readMinutes <= 180)) {
      fail('schema', P, 'readMinutes must be an integer between 1 and 180');
    }
    if ('status' in pub && pub.status !== 'approved') fail('schema', P, `status must be "approved" - a publication lands only after the human gate; got ${JSON.stringify(pub.status)}`);

    if ('topic' in pub) {
      const t = pub.topic;
      if (!isObj(t)) fail('schema', P, 'topic must be an object');
      else {
        for (const k of Object.keys(t)) if (!TOPIC_KEYS.has(k)) fail('schema', P, `topic: unknown key "${k}"`);
        if (!nonEmpty(t.text)) fail('schema', P, 'topic.text must be a non-empty string');
        if ('angle' in t && !nonEmpty(t.angle)) fail('schema', P, 'topic.angle, when present, must be a non-empty string');
        if (t.kind === 'subject') {
          for (const k of ['bundle', 'subject']) if (!(typeof t[k] === 'string' && SLUG_RE.test(t[k]))) fail('schema', P, `topic.${k} must be a slug when kind is "subject"`);
        } else if (t.kind === 'free') {
          for (const k of ['bundle', 'subject']) if (k in t) fail('schema', P, `topic.${k} must be omitted when kind is "free"`);
        } else fail('schema', P, `topic.kind must be "subject" or "free", got ${JSON.stringify(t.kind)}`);
      }
    }

    if ('standard' in pub) {
      const s = pub.standard;
      if (!isObj(s)) fail('schema', P, 'standard must be an object');
      else {
        for (const k of Object.keys(s)) if (!STANDARD_KEYS.includes(k)) fail('schema', P, `standard: unknown key "${k}"`);
        if (!(typeof s.recipe === 'string' && SLUG_RE.test(s.recipe))) fail('schema', P, 'standard.recipe must be a recipe slug');
        if (!(typeof s.version === 'string' && SEMVER_RE.test(s.version))) fail('schema', P, 'standard.version must be a semver string');
        if (!(typeof s.bundle === 'string' && SLUG_RE.test(s.bundle))) fail('schema', P, 'standard.bundle must be a bundle slug');
      }
    }

    if ('sources' in pub) {
      if (!Array.isArray(pub.sources)) fail('schema', P, 'sources must be an array');
      else {
        pub.sources.forEach((src, i) => {
          const at = `sources[${i}]`;
          if (!isObj(src)) { fail('schema', P, `${at} must be an object`); return; }
          for (const k of Object.keys(src)) if (!SOURCE_KEYS.includes(k)) fail('schema', P, `${at}: unknown key "${k}"`);
          // A missing date or url is reported by the `sources` rule below, by name.
          for (const k of ['n', 'title', 'publisher', 'primary', 'counter', 'took']) if (!(k in src)) fail('schema', P, `${at}: missing "${k}"`);
          if (src.n !== i + 1) fail('schema', P, `${at}: n must be ${i + 1} (sources are numbered 1..N in order), got ${JSON.stringify(src.n)}`);
          else sourceNs.add(src.n);
          for (const k of ['title', 'publisher', 'took']) if (k in src && !nonEmpty(src[k])) fail('schema', P, `${at}: ${k} must be a non-empty string`);
          for (const k of ['primary', 'counter']) if (k in src && typeof src[k] !== 'boolean') fail('schema', P, `${at}: ${k} must be true or false`);
          const label = `source ${src.n ?? i + 1}`;
          if (!('date' in src)) fail('sources', P, `${label} has no date`);
          else if (!isSourceDate(src.date)) fail('sources', P, `${label}: date ${JSON.stringify(src.date)} is not YYYY, YYYY-MM or YYYY-MM-DD`);
          if (!('url' in src)) fail('sources', P, `${label} has no url`);
          else if (!isWebUrl(src.url)) fail('sources', P, `${label}: url ${JSON.stringify(src.url)} is not a well-formed http(s) URL`);
        });
        const n = pub.sources.length;
        const primary = pub.sources.filter((s) => isObj(s) && s.primary === true).length;
        const counter = pub.sources.filter((s) => isObj(s) && s.counter === true).length;
        if (n < MIN_SOURCES) fail('source-mix', P, `${n} source(s); at least ${MIN_SOURCES} required`);
        if (primary < MIN_PRIMARY) fail('source-mix', P, `${primary} primary source(s); at least ${MIN_PRIMARY} required`);
        if (counter < MIN_COUNTER) fail('source-mix', P, `${counter} counter-evidence source(s); at least ${MIN_COUNTER} required`);
      }
    }

    if ('claims' in pub) {
      if (!Array.isArray(pub.claims)) fail('schema', P, 'claims must be an array');
      else pub.claims.forEach((c, i) => {
        const at = `claims[${i}]`;
        if (!isObj(c)) { fail('schema', P, `${at} must be an object`); return; }
        for (const k of Object.keys(c)) if (!CLAIM_KEYS.includes(k)) fail('schema', P, `${at}: unknown key "${k}"`);
        if (!nonEmpty(c.text)) fail('schema', P, `${at}: text must be a non-empty string`);
        if (!Number.isInteger(c.source)) fail('schema', P, `${at}: source must be a source number`);
        else if (!sourceNs.has(c.source)) fail('citations', P, `${at} cites source ${c.source}, which does not exist`);
      });
    }

    if ('figures' in pub) {
      if (!Array.isArray(pub.figures)) fail('schema', P, 'figures must be an array');
      else pub.figures.forEach((fg, i) => {
        const at = `figures[${i}]`;
        if (!isObj(fg)) { fail('schema', P, `${at} must be an object`); return; }
        for (const k of Object.keys(fg)) if (!FIGURE_KEYS.includes(k)) fail('schema', P, `${at}: unknown key "${k}"`);
        if (typeof fg.file !== 'string' || !FIGURE_FILE_RE.test(fg.file)) fail('shape', P, `${at}: file must be figures/NN-<name>.svg, got ${JSON.stringify(fg.file)}`);
        else {
          if (listedFigures.has(fg.file)) fail('figures', P, `${at}: ${fg.file} is listed twice`);
          listedFigures.add(fg.file);
          if (!fs.existsSync(path.join(dir, fg.file))) fail('shape', fg.file, `listed in ${at} but missing`);
        }
        if (!nonEmpty(fg.caption)) fail('figures', P, `${at} (${fg.file ?? '?'}) has no caption`);
        if (!Array.isArray(fg.sources) || fg.sources.length === 0) fail('figures', P, `${at} (${fg.file ?? '?'}) has no source list`);
        else for (const n of fg.sources) {
          if (!Number.isInteger(n)) fail('figures', P, `${at}: source list entries must be source numbers, got ${JSON.stringify(n)}`);
          else if (!sourceNs.has(n)) fail('figures', P, `${at} cites source ${n}, which does not exist`);
        }
      });
    }
    for (const f of svgOnDisk) if (!listedFigures.has(f)) fail('figures', f, 'is not listed in publication.json figures, so it has no caption or source list');
    if (Array.isArray(pub.figures)) {
      for (const stem of mediumPngs) {
        if (!listedFigures.has(`figures/${stem}.svg`)) fail('shape', `medium/figures/${stem}.png`, `renders figures/${stem}.svg, which publication.json figures does not list`);
      }
    }

    if ('check' in pub) {
      const c = pub.check;
      if (!isObj(c) || Object.keys(c).length === 0) fail('schema', P, 'check must be a non-empty object of dimension -> "pass" | "fail"');
      else for (const [k, v] of Object.entries(c)) {
        if (!CHECK_KEY_RE.test(k)) fail('schema', P, `check: "${k}" is not a dimension name`);
        if (v !== 'pass' && v !== 'fail') fail('schema', P, `check.${k} must be "pass" or "fail", got ${JSON.stringify(v)}`);
      }
    }

    if ('run' in pub) {
      const r = pub.run;
      if (!isObj(r)) fail('schema', P, 'run must be an object');
      else {
        for (const k of Object.keys(r)) if (!RUN_KEYS.has(k)) fail('schema', P, `run: unknown key "${k}"`);
        for (const k of ['id', 'model', 'effort']) if (!nonEmpty(r[k])) fail('schema', P, `run.${k} must be a non-empty string`);
        if ('costUsd' in r && !(typeof r.costUsd === 'number' && Number.isFinite(r.costUsd) && r.costUsd >= 0)) {
          fail('schema', P, 'run.costUsd, when present, must be a non-negative number (omit it when the CLI reports none)');
        }
      }
    }

    for (const s of stringsIn(pub)) for (const h of placeholderHits(s)) fail('placeholders', P, `${h.what}: ${JSON.stringify(h.text)}`);
  }

  // ---- critique: the block and its optional directory. Without a readable
  // publication.json there is no block to hold the directory to; schema already failed.
  if (pub) for (const f of critiqueFindings(pub.critique, critiqueFiles)) findings.push(f);
  const haveSources = pub && Array.isArray(pub.sources);

  // ---- the post, in its three renderings
  const md = read(path.join(dir, 'post.md'));
  const html = read(path.join(dir, 'post.html'));
  const story = read(path.join(dir, 'medium', 'story.html'));
  const cited = new Set();
  const renderings = [
    ['post.md', md, markdownText, markdownProse],
    ['post.html', html, htmlText, htmlProse],
    ['medium/story.html', story, htmlText, htmlProse],
  ];
  for (const [file, text, visible, prose] of renderings) {
    if (text === null) continue;
    const v = visible(text);
    const { found, grouped } = citationsIn(v);
    for (const g of grouped) fail('citations', `${file}:${g.line}`, `${g.text} groups sources; write one [n] per source`);
    if (haveSources) {
      for (const c of found) {
        cited.add(c.n);
        if (!sourceNs.has(c.n)) fail('citations', `${file}:${c.line}`, `[${c.n}] does not resolve to a source (sources are 1..${pub.sources.length})`);
      }
    }
    if (file === 'post.md' && found.length === 0) fail('citations', file, 'cites no source - every claim the post makes is anchored by an [n]');
    for (const h of firstPersonHits(prose(text))) fail('first-person', `${file}:${h.line}`, `"${h.word}" in prose: …${h.context}…`);
    for (const h of placeholderHits(v)) fail('placeholders', `${file}:${h.line}`, `${h.what}: ${JSON.stringify(h.text)}`);
  }
  if (haveSources) {
    for (const s of pub.sources) if (isObj(s) && Number.isInteger(s.n) && !cited.has(s.n)) warn('citations', P, `source ${s.n} is listed but never cited in the post`);
  }

  // ---- self-contained
  if (html !== null) for (const h of networkRefs(html)) fail('self-contained', `post.html:${h.line}`, `${h.what}: ${h.text}`);
  for (const f of svgOnDisk) {
    const svg = read(path.join(dir, f));
    if (svg === null) continue;
    if (!/<svg\b[\s\S]*<\/svg>\s*$/.test(svg)) fail('shape', f, 'is not an SVG document');
    for (const h of networkRefs(svg, { svg: true })) fail('self-contained', `${f}:${h.line}`, `${h.what}: ${h.text}`);
  }
  if (story !== null) {
    for (const m of story.matchAll(/<script\b/gi)) fail('self-contained', `medium/story.html:${lineOf(story, m.index)}`, 'the Medium story carries no scripts');
    for (const h of networkRefs(story)) fail('self-contained', `medium/story.html:${h.line}`, `${h.what}: ${h.text}`);
    // Without a readable figures list there is nothing to resolve against; schema failed.
    if (pub && Array.isArray(pub.figures)) {
      for (const h of storyImageProblems(story, listedFigures)) fail('shape', `medium/story.html:${h.line}`, h.message);
    }
  }

  // ---- medium/tags.txt
  const tags = read(path.join(dir, 'medium', 'tags.txt'));
  if (tags !== null) {
    const lines = tags.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0 || lines.length > MAX_TAGS) fail('shape', 'medium/tags.txt', `holds ${lines.length} tag(s); Medium takes 1 to ${MAX_TAGS}`);
    if (new Set(lines.map((l) => l.toLowerCase())).size !== lines.length) fail('shape', 'medium/tags.txt', 'repeats a tag');
  }

  // ---- placeholders in the remaining prose files
  for (const f of ['SOURCES.md', 'medium/README.md', 'medium/tags.txt']) {
    const t = read(path.join(dir, f));
    if (t === null) continue;
    for (const h of placeholderHits(markdownText(t))) fail('placeholders', `${f}:${h.line}`, `${h.what}: ${JSON.stringify(h.text)}`);
  }

  // ---- privacy, over every text file in the publication
  const texts = ['publication.json', 'post.html', 'post.md', 'SOURCES.md', 'medium/story.html', 'medium/tags.txt', 'medium/README.md', ...svgOnDisk,
    ...(critEntries ? CRITIQUE_FILES.map((f) => `critique/${f}`) : [])];
  for (const f of texts) {
    const t = read(path.join(dir, f));
    if (t === null) continue;
    for (const h of machinePathHits(t)) fail('privacy', `${f}:${h.line}`, `machine home path ${JSON.stringify(h.text)} - write a relative path or a placeholder`);
  }

  return { findings, warnings };
}

// ------------------------------------------------------------------ the lane

/** Validate every publication under a lane root. Throws when the lane cannot be read. */
export function validateLane(laneRoot) {
  const entries = listDir(laneRoot);
  if (!entries) throw new Error(`no lane at ${laneRoot}`);
  const findings = [];
  const warnings = [];
  const slugs = [];
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    if (!e.isDirectory()) {
      if (!LANE_ROOT_FILES.has(e.name)) findings.push({ rule: 'shape', file: e.name, message: 'a publication is a directory: publications/<slug>/' });
      continue;
    }
    slugs.push(e.name);
    const r = validatePublication(path.join(laneRoot, e.name), e.name);
    for (const f of r.findings) findings.push({ ...f, file: `${e.name}/${f.file}`.replace(/\/$/, '') });
    for (const w of r.warnings) warnings.push({ ...w, file: `${e.name}/${w.file}`.replace(/\/$/, '') });
  }
  return { slugs: slugs.sort(), findings, warnings };
}

function main() {
  const argv = process.argv.slice(2);
  const rootIdx = argv.indexOf('--root');
  const laneRoot = rootIdx === -1 ? path.join(ROOT, 'publications') : path.resolve(argv[rootIdx + 1] ?? '');
  const dirs = argv.filter((a, i) => !a.startsWith('--') && (rootIdx === -1 || i !== rootIdx + 1));
  if (rootIdx !== -1 && !argv[rootIdx + 1]) {
    console.error('check-publications FATAL: --root needs a directory.');
    process.exit(EXIT.FATAL);
  }

  const broken = selfTest();
  if (broken.length) {
    console.error(`check-publications FATAL: ${broken.length} detector(s) failed their planted case - ${broken.join('; ')}.`);
    console.error('THE SCANNER IS BROKEN - refusing to report a clean lane.');
    process.exit(EXIT.FATAL);
  }

  let result;
  if (dirs.length) {
    result = { slugs: [], findings: [], warnings: [] };
    for (const d of dirs) {
      const abs = path.resolve(d);
      if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
        console.error(`check-publications FATAL: ${d} is not a directory.`);
        process.exit(EXIT.FATAL);
      }
      const name = path.basename(abs);
      result.slugs.push(name);
      const r = validatePublication(abs, name);
      for (const f of r.findings) result.findings.push({ ...f, file: `${name}/${f.file}`.replace(/\/$/, '') });
      for (const w of r.warnings) result.warnings.push({ ...w, file: `${name}/${w.file}`.replace(/\/$/, '') });
    }
  } else {
    if (!fs.existsSync(laneRoot)) {
      console.error(`check-publications FATAL: no publications lane at ${path.relative(ROOT, laneRoot) || laneRoot}.`);
      console.error('Reporting nothing is not the same as finding nothing - refusing to exit 0.');
      process.exit(EXIT.FATAL);
    }
    result = validateLane(laneRoot);
    if (result.slugs.length === 0) {
      console.error('check-publications FATAL: the lane holds no publications/<slug>/ directory.');
      console.error('Reporting nothing is not the same as finding nothing - refusing to exit 0.');
      process.exit(EXIT.FATAL);
    }
  }

  for (const w of result.warnings) console.log(`  warn  ${w.rule.padEnd(14)} ${w.file}: ${w.message}`);
  if (result.findings.length) {
    for (const f of result.findings) console.error(`  FAIL  ${f.rule.padEnd(14)} ${f.file}: ${f.message}`);
    const rules = [...new Set(result.findings.map((f) => f.rule))].sort();
    console.error(`\ncheck-publications: ${result.findings.length} finding(s) across ${result.slugs.length} publication(s) - rules: ${rules.join(', ')}.`);
    console.error('The rules are mechanical and listed in docs/publications-lane.md. Fix the publication; never the rule.');
    process.exit(EXIT.VIOLATIONS);
  }
  console.log(`publications OK - ${result.slugs.length} publication(s) (${result.slugs.join(', ')}), ${result.warnings.length} warning(s).`);
  process.exit(EXIT.OK);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
