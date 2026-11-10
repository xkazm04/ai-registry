#!/usr/bin/env node
/**
 * census - fold Codex's read-only part census into one fleet-wide, checkable gap table.
 *
 *   node census.mjs collect --runs <dir> --roots <json-file> --out <census.json>
 *   node census.mjs apply-adjudication --census <census.json> --runs <adjudicate-dir> --out <census.json>
 *   node census.mjs apply-rejudge --census <census.json> --runs <rejudge-dir> --out <census.json>
 *   node census.mjs sample  --census <census.json> --per-project 5 --out <sample.json> [--salt <s>]
 *   node census.mjs report  --census <census.json> [--audit <audit.json>] [--no-vault]
 *   node census.mjs gate    --census <census.json> --audit <audit.json> --golden <score.json>
 *   node census.mjs golden-add --golden <file> --sample <sample.json> --audit <audit.json> [--truth <json>]
 *   node census.mjs golden-census --golden <file[,file]> --out <census.json>
 *   node census.mjs golden-score --golden <file[,file]> --census <census.json> --out <score.json>
 *
 * WHY: nobody knows how large the two-way gap is between the fleet and the registry: parts
 * rebuilt in every project against an existing standard, and parts the registry never heard
 * of. Codex can read all of it cheaply, but its output is an unproven judge's opinion. So
 * this script believes nothing it can check: every part must quote a line that really is at
 * the cited file (an unanchored part is dropped and counted), a sample goes to the Director,
 * and the report prints the audited error rate beside the counts it qualifies.
 *
 * Input layout: <runs>/<slug>/<context>/last.md, whose final fenced json block is
 * census-brief.md's contract. --roots maps slug to the tree that was read. A survey's text
 * is untrusted, so a cited path may not leave its root. A count here is what the census
 * saw, never the size of the true gap; contexts that returned nothing usable are listed.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { EXIT, installCrashDoor } from '../../../scripts/lib/exit-codes.mjs';
import { vaultRoot, writeNewNote } from './vault-ledger.mjs';

export const RELATIONS = Object.freeze(['consumes', 'reinvents', 'no-standard', 'better-than-standard']);
// Set only by a judging pass, never accepted from a survey. not-governed: a standard was alleged and does not
// apply, so this is local code. unverified: the judges could not back the claim, so it is neither a gap nor clear.
export const DERIVED = Object.freeze(['not-governed', 'unverified']);
// Fixed before the 1.3.0 results were seen. Tighter than the 30% that 1.2.0 passed by one row.
export const BAR = Object.freeze({ minAudited: 30, overall: 0.2, reinvents: 0.15, consumes: 0.25, minPerRelation: 8, golden: 0.85, goldenInbound: 0.9 });
export const REPEAT_THRESHOLD = 3;
// Closed on purpose. An `other` kind let a helper function and a game screen count as parts
// the registry lacks: 3 of 7 parts on the first real context (2026-11-09).
export const KINDS = Object.freeze(['table', 'list-or-feed', 'chart', 'form', 'modal-or-overlay', 'data-fetch-wrapper', 'api-client-wrapper', 'error-wrapper', 'auth-wrapper', 'cache-layer', 'render-optimization', 'background-job']);

/** Pure: the last fenced json block of a final message, or null. */
export function lastJsonBlock(text) {
  const blocks = [...String(text).matchAll(/```json\s*\n([\s\S]*?)```/g)];
  if (!blocks.length) return null;
  try { return JSON.parse(blocks[blocks.length - 1][1]); } catch { return null; }
}

const contained = (root, file) => {
  const target = path.resolve(root, file);
  const rel = path.relative(path.resolve(root), target);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel) ? target : null;
};

/** Does the quote sit at the cited line? exact (within 3 lines), moved (elsewhere in file), or missing. */
export function anchor(root, file, line, quote) {
  const q = String(quote ?? '').trim();
  if (!q || typeof file !== 'string') return 'missing';
  const target = contained(root, file);
  if (!target) return 'missing';
  let lines;
  try { lines = fs.readFileSync(target, 'utf8').split(/\r?\n/); } catch { return 'missing'; }
  const n = Number(line);
  for (let i = Math.max(0, n - 4); i < Math.min(lines.length, n + 3); i++) if (lines[i].includes(q)) return 'exact';
  return lines.some((l) => l.includes(q)) ? 'moved' : 'missing';
}

/**
 * Pure: was this file's content returned? True when at least half its substantial lines appear
 * in the output, null for a file too small to tell. ASCII lines only, and a share rather than
 * one probe line: Codex's PowerShell mangles characters like an em dash, and a single longest
 * line (often the one holding such a character) reported 20% of fully read files as unread.
 */
export function wasReturned(text, outputs) {
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length >= 12 && /^[\x20-\x7e]+$/.test(l));
  if (!lines.length) return null;
  return lines.filter((l) => outputs.includes(l)).length * 2 >= lines.length;
}

/** Pure: everything the shell commands of a Codex run returned. */
export function commandOutputs(eventsText) {
  const out = [];
  for (const line of String(eventsText).split('\n')) {
    if (!line.trim()) continue;
    try {
      const ev = JSON.parse(line);
      if (ev.type === 'item.completed' && ev.item?.type === 'command_execution') out.push(String(ev.item.aggregated_output ?? ''));
    } catch { /* a non-JSON line */ }
  }
  return out.join('\n');
}

/**
 * Files actually returned to Codex, judged from its chunk's command output. A file named
 * in a brief and never opened does not count: a run that finishes
 * clean over part of the code is the failure this exists to catch.
 */
export function coverageOf(root, manifest, slugDir) {
  let read = 0, missed = 0, trivial = 0;
  for (const chunk of manifest.chunks) {
    let outputs = '';
    try { outputs = commandOutputs(fs.readFileSync(path.join(slugDir, chunk.id, 'events.jsonl'), 'utf8')); } catch { /* never ran */ }
    for (const f of chunk.files) {
      let seen = null;
      try { seen = wasReturned(fs.readFileSync(path.join(root, f), 'utf8'), outputs); } catch { /* vanished */ }
      if (seen === null) trivial += 1;
      else if (seen) read += 1;
      else missed += 1;
    }
  }
  return { tracked: manifest.tracked, scoped: manifest.scoped, read, missed, trivial };
}

/**
 * Is a line Codex quoted from its judgment in the file? Letters and digits only, for the same
 * reason as normalizeRule: a quoted middle dot came back as a control character.
 */
export function quotedInFile(root, file, quote) {
  if (typeof root !== 'string') return false;
  const q = normalizeRule(quote);
  if (q.length < 8 || typeof file !== 'string') return false;
  const target = contained(root, file);
  if (!target) return false;
  try { return fs.readFileSync(target, 'utf8').split(/\r?\n/).some((l) => normalizeRule(l).includes(q)); } catch { return false; }
}

/** Read every run under <runs>. Pure over the filesystem it is given. */
export function collect(runs, roots) {
  const parts = [], unusable = [], coverage = {};
  let dropped = 0, invalid = 0;
  for (const slug of fs.readdirSync(runs).sort()) {
    const dir = path.join(runs, slug);
    if (!fs.statSync(dir).isDirectory() || !roots[slug]) continue;
    try { coverage[slug] = coverageOf(roots[slug], JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')), dir); } catch { /* no manifest */ }
    for (const context of fs.readdirSync(dir).sort()) {
      if (!fs.statSync(path.join(dir, context)).isDirectory()) continue;
      const lastFile = path.join(dir, context, 'last.md');
      let body = null;
      try { body = lastJsonBlock(fs.readFileSync(lastFile, 'utf8')); } catch { /* no result yet */ }
      if (!body || !Array.isArray(body.parts)) { unusable.push(`${slug}/${context}`); continue; }
      body.parts.forEach((p, i) => {
        if (!p || !KINDS.includes(p.kind) || !RELATIONS.includes(p.relation)) { invalid += 1; return; }
        // "Follows a standard" with no standard and no shared part behind it was a third of the first audit's errors.
        if (p.relation === 'consumes' && !p.subject && !p.builtOn) { invalid += 1; return; }
        const a = anchor(roots[slug], p.file, p.line, p.quote);
        if (a === 'missing') { dropped += 1; return; }
        parts.push({
          id: `${slug}:${context}:${i}`, project: slug, context, kind: String(p.kind), name: String(p.name ?? ''),
          file: p.file, line: p.line, quote: p.quote, stack: String(p.stack ?? 'unknown'), relation: p.relation,
          surveyRelation: p.relation, surveySubject: p.subject ?? null, subject: p.subject ?? null, builtOn: p.builtOn ? String(p.builtOn) : null, capabilities: Array.isArray(p.capabilities) ? p.capabilities.map(String) : [],
          missed: Array.isArray(p.missed) ? p.missed.map(String) : [], anchor: a,
        });
      });
    }
  }
  return { parts, unusable, dropped, invalid, coverage };
}

/** Pure: fold the second pass's verdicts into a census. A part with no verdict stays as it was and is counted. */
export function applyAdjudication(census, verdicts) {
  const byId = new Map(verdicts.filter((v) => v && ['reinvents', 'consumes', 'no-standard'].includes(v.verdict)).map((v) => [v.id, v]));
  const stats = { checked: 0, reinvents: 0, consumes: 0, kept: 0, unchecked: 0 };
  const parts = census.parts.map((p) => {
    if (p.relation !== 'no-standard') return p;
    const v = byId.get(p.id);
    if (!v) { stats.unchecked += 1; return p; }
    stats.checked += 1;
    if (v.verdict === 'no-standard') { stats.kept += 1; return { ...p, adjudicated: true }; }
    stats[v.verdict] += 1;
    return { ...p, relation: v.verdict, subject: v.standard ?? p.subject, missed: Array.isArray(v.missed) ? v.missed.map(String) : [], adjudicated: true };
  });
  return { ...census, parts, adjudication: stats };
}

/** Pure: text compared with markup and line wrapping removed, so a quoted rule survives reflow. */
// Letters and digits only: Codex's Windows shell turns an em dash into a hyphen or a question mark, so a true quote failed.
export const normalizeRule = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * Pure: has an accusation shown its harm? `trigger` must be an exact line where the input that causes
 * the harm originates, in the part's file or in `triggerFile`, and `harm` must say who is hurt. All
 * three wrong accusations in the 1.3.0 audit cited a real rule whose harm could not happen there: a
 * server-rendered table, a list bounded by concurrency, a seed script calling its own server.
 */
export function harmShown(p, v, codeFound) {
  if (typeof v?.trigger !== 'string' || typeof v?.harm !== 'string' || v.harm.trim().length < 12) return false;
  if (typeof v.guards !== 'string' || v.guards.trim().length < 12) return false;
  const file = typeof v.triggerFile === 'string' && v.triggerFile.trim() ? v.triggerFile.trim().replace(/\\/g, '/').replace(/:\d+$/, '') : p.file;
  return codeFound(p, v.trigger, file);
}
const harmOf = (v) => ({ guards: String(v.guards), trigger: String(v.trigger), triggerFile: v.triggerFile ? String(v.triggerFile) : null, harm: String(v.harm) });

/**
 * Pure: apply rejudge verdicts to `reinvents` parts. An upheld accusation must carry a rule
 * that `ruleFound(part, rule)` confirms is in the cited standard; one that cannot is not
 * believed. A part no verdict reached stays as it was and is counted, never silently cleared.
 */
export function applyRejudge(census, verdicts, ruleFound, codeFound) {
  const byId = new Map(verdicts.filter((v) => v && ['reinvents', 'follows', 'not-governed'].includes(v.verdict)).map((v) => [v.id, v]));
  const stats = { checked: 0, upheld: 0, follows: 0, notGoverned: 0, unbacked: 0, noHarm: 0, unchecked: 0 };
  const parts = census.parts.map((p) => {
    if (p.relation !== 'reinvents') return p;
    const v = byId.get(p.id);
    if (!v) { stats.unchecked += 1; return p; }
    stats.checked += 1;
    if (v.verdict === 'reinvents' && ruleFound(p, v.rule)) {
      if (!harmShown(p, v, codeFound)) {
        stats.noHarm += 1;
        return { ...p, relation: 'unverified', subject: null, missed: [], rejudged: 'no-harm', rejudgeWhy: v.why ? String(v.why) : null, accusedOf: p.subject };
      }
      stats.upheld += 1;
      return { ...p, missed: [String(v.rule)], rejudged: 'upheld', ...harmOf(v) };
    }
    if (v.verdict === 'follows') { stats.follows += 1; return { ...p, relation: 'consumes', missed: [], rejudged: 'follows' }; }
    const verdict = v.verdict === 'reinvents' ? 'unbacked' : 'not-governed';
    stats[verdict === 'unbacked' ? 'unbacked' : 'notGoverned'] += 1;
    return { ...p, relation: verdict === 'unbacked' ? 'unverified' : 'not-governed', subject: null, missed: [], rejudged: verdict, rejudgeWhy: v.why ? String(v.why) : null, accusedOf: p.subject };
  });
  return { ...census, parts, rejudge: stats };
}

const SEVERITY = ['reinvents', 'consumes', 'better-than-standard', 'no-standard'];

/**
 * Pure: one row per part. A part's definition and its callers can fall in different chunks, and 69 of
 * ascent's 1237 rows repeated another. The accusing row wins, so the judges still test it; a part
 * two surveys read differently is flagged, since that disagreement is free evidence.
 */
export function dedupe(census) {
  const groups = new Map();
  for (const p of census.parts) {
    const key = [p.project, p.file, p.kind, String(p.name).trim().toLowerCase()].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  let merged = 0, disputed = 0;
  const parts = [...groups.values()].map((rows) => {
    if (rows.length === 1) return rows[0];
    merged += rows.length - 1;
    const rank = (r) => { const i = SEVERITY.indexOf(r.relation); return i < 0 ? SEVERITY.length : i; };
    const [best] = [...rows].sort((a, b) => rank(a) - rank(b) || (a.anchor === 'exact' ? 0 : 1) - (b.anchor === 'exact' ? 0 : 1));
    const relations = [...new Set(rows.map((r) => r.relation))];
    if (relations.length > 1) disputed += 1;
    const alsoIds = rows.filter((r) => r !== best).map((r) => r.id);
    return relations.length > 1 ? { ...best, disputed: relations, alsoIds } : { ...best, alsoIds };
  });
  return { ...census, parts, deduped: { merged, disputed } };
}

// A framework primitive is not a shared part: one useMemo does not make a hook a consumer of anything.
const FRAMEWORK = /^(react|next|node:|vue|svelte)([/.:]|$)/i;
export const isSharedPart = (builtOn) => String(builtOn ?? '').split(/[;,+]/).map((x) => x.trim()).filter(Boolean).some((x) => !FRAMEWORK.test(x));

/**
 * Pure: apply confirm verdicts to `consumes` parts that name a standard. Following a standard
 * must now be shown, with a rule from the standard and a line from the code.
 */
export function applyConfirm(census, verdicts, ruleFound, codeFound) {
  const byId = new Map(verdicts.filter((v) => v && ['reinvents', 'follows', 'not-governed'].includes(v.verdict)).map((v) => [v.id, v]));
  const stats = { checked: 0, confirmed: 0, reinvents: 0, builtOn: 0, notGoverned: 0, unbacked: 0, noHarm: 0, unchecked: 0 };
  const parts = census.parts.map((p) => {
    if (p.relation !== 'consumes' || !p.subject) return p;
    const v = byId.get(p.id);
    if (!v) { stats.unchecked += 1; return p; }
    stats.checked += 1;
    const unbacked = () => { stats.unbacked += 1; return { ...p, relation: 'unverified', confirmed: 'unbacked', accusedOf: p.subject, rejudgeWhy: v.why ? String(v.why) : null }; };
    if (v.verdict === 'follows') {
      if (!ruleFound(p, v.rule, 'follow') || !codeFound(p, v.evidence)) return unbacked();
      stats.confirmed += 1;
      return { ...p, confirmed: 'follows', rule: String(v.rule), evidence: String(v.evidence) };
    }
    if (v.verdict === 'reinvents') {
      if (!ruleFound(p, v.rule)) return unbacked();
      if (!harmShown(p, v, codeFound)) { stats.noHarm += 1; return { ...p, relation: 'unverified', confirmed: 'no-harm', accusedOf: p.subject, rejudgeWhy: v.why ? String(v.why) : null }; }
      stats.reinvents += 1;
      return { ...p, relation: 'reinvents', missed: [String(v.rule)], rejudged: 'upheld', confirmed: 'breaks', ...harmOf(v) };
    }
    if (isSharedPart(p.builtOn)) { stats.builtOn += 1; return { ...p, subject: null, confirmed: 'built-on', accusedOf: p.subject }; }
    stats.notGoverned += 1;
    return { ...p, relation: 'not-governed', subject: null, confirmed: 'not-governed', accusedOf: p.subject, rejudgeWhy: v.why ? String(v.why) : null };
  });
  return { ...census, parts, confirm: stats };
}

/** Pure: a second, independent judgment on each upheld accusation. Only agreement keeps it. */
export function applyRepeat(census, verdicts, ruleFound, codeFound) {
  const byId = new Map(verdicts.filter((v) => v && v.id).map((v) => [v.id, v]));
  const stats = { checked: 0, agreed: 0, contested: 0, unchecked: 0 };
  const parts = census.parts.map((p) => {
    if (p.relation !== 'reinvents' || p.rejudged !== 'upheld') return p;
    const v = byId.get(p.id);
    if (!v || !['reinvents', 'follows', 'not-governed'].includes(v.verdict)) { stats.unchecked += 1; return p; }
    stats.checked += 1;
    if (v.verdict === 'reinvents' && ruleFound(p, v.rule) && harmShown(p, v, codeFound)) { stats.agreed += 1; return { ...p, repeated: 'agreed' }; }
    stats.contested += 1;
    return { ...p, relation: 'unverified', repeated: 'contested', contestedBy: v.verdict, accusedOf: p.subject, rejudgeWhy: v.why ? String(v.why) : null };
  });
  return { ...census, parts, repeat: stats };
}

/** Reads the batches of one pass. A pass that never ran returns nothing. */
export function loadVerdicts(dir) {
  const verdicts = [], targets = {};
  if (!fs.existsSync(dir)) return { verdicts, targets };
  for (const slug of fs.readdirSync(dir)) {
    const root = path.join(dir, slug);
    try { Object.assign(targets, JSON.parse(fs.readFileSync(path.join(root, 'targets.json'), 'utf8'))); } catch { /* adjudicate writes none */ }
    for (const batch of fs.readdirSync(root)) {
      try { verdicts.push(...(lastJsonBlock(fs.readFileSync(path.join(root, batch, 'last.md'), 'utf8'))?.verdicts ?? [])); } catch { /* targets.json, or a batch with no result */ }
    }
  }
  return { verdicts, targets };
}

/**
 * A rule counts only if it is in the cited standard's own files. A target is a list of
 * directories or files, or {follow, accuse}: an accusation may quote only the accuse list,
 * which is the cited technique's file when the claim named one. Without that, a judge asked
 * about pagination accused a correct table of a missing caption.
 */
export function makeRuleFound(targets) {
  const texts = new Map();
  const textOf = (where) => {
    if (!texts.has(where)) {
      const files = where.endsWith('.md') ? [where] : fs.readdirSync(where, { recursive: true }).filter((f) => String(f).endsWith('.md')).map((f) => path.join(where, String(f)));
      texts.set(where, files.map((file) => { try { return normalizeRule(fs.readFileSync(file, 'utf8')); } catch { return ''; } }).join('\n'));
    }
    return texts.get(where);
  };
  return (p, rule, use = 'accuse') => {
    const r = normalizeRule(rule);
    const t = targets[p.id];
    const places = t && !Array.isArray(t) && typeof t === 'object' ? t[use] : t;
    return r.length >= 20 && [places].flat().filter(Boolean).some((where) => textOf(where).includes(r));
  };
}

/** Pure: a golden row from an audited part. A disagreement needs the right answer stated. */
export function goldenRow(p, verdict, truth) {
  // An agreed abstention is a borderline part: it has no single answer, so its acceptable answers are recorded with it.
  if (verdict === 'agree' && p.relation === 'unverified' && !Array.isArray(truth)) throw new Error(`borderline ${p.id} needs its acceptable answers as truth`);
  // An agreed row may still carry a wider truth, when the audit found it borderline.
  const accept = verdict === 'agree' && !(p.relation === 'unverified') ? (Array.isArray(truth) && truth.length ? truth : [p.relation]) : truth;
  if (!Array.isArray(accept) || !accept.length) throw new Error(`no truth given for ${p.id}`);
  return { id: p.id, project: p.project, kind: p.kind, name: p.name, file: p.file, line: p.line, quote: p.quote, stack: p.stack, capabilities: p.capabilities ?? [], builtOn: p.builtOn ?? null, relation: p.surveyRelation ?? p.relation, subject: p.surveySubject ?? p.subject ?? null, missed: p.surveyMissed ?? p.missed ?? [], accept };
}

/** Pure: a census of golden rows as the survey first reported them, ready for the judging passes. */
export const goldenCensus = (rows) => ({ parts: rows.map(({ accept, ...r }) => ({ ...r, context: 'golden', anchor: 'exact', surveyRelation: r.relation, surveySubject: r.subject })), unusable: [], dropped: 0, invalid: 0, coverage: {} });

const NONE = ['no-standard', 'not-governed'];
const accepted = (relation, accept) => accept.includes(relation) || (NONE.includes(relation) && accept.some((a) => NONE.includes(a)));

/**
 * Pure: how the judging passes did on rows whose answer is known. An abstention is not a correct answer.
 * A row whose only recorded answer is `unverified` is borderline with no acceptable answers recorded: it
 * can only reward repeating an abstention, so it is set aside and counted, never scored.
 */
export function goldenScore(census, rows) {
  const final = new Map(census.parts.flatMap((p) => [[p.id, p], ...(p.alsoIds ?? []).map((id) => [id, p])]));
  const borderline = rows.filter((r) => r.accept.length === 1 && r.accept[0] === 'unverified');
  rows = rows.filter((r) => !borderline.includes(r));
  const out = { rows: rows.length, borderline: borderline.length, correct: 0, abstained: 0, wrong: [], inbound: 0, inboundCorrect: 0 };
  for (const r of rows) {
    const got = final.get(r.id)?.relation ?? 'missing';
    if (got === 'reinvents') { out.inbound += 1; if (r.accept.includes('reinvents')) out.inboundCorrect += 1; }
    if (accepted(got, r.accept)) out.correct += 1;
    else if (got === 'unverified') out.abstained += 1;
    else out.wrong.push({ id: r.id, got, accept: r.accept });
  }
  out.accuracy = rows.length ? out.correct / rows.length : 0;
  out.inboundPrecision = out.inbound ? out.inboundCorrect / out.inbound : null;
  return out;
}

/** Pure: does this census clear the bar? Every failure is named. */
export function evaluateGate(census, audit, golden, bar = BAR) {
  const rel = new Map(census.parts.map((p) => [p.id, p.relation]));
  const by = {};
  let audited = 0, wrong = 0;
  for (const [id, v] of Object.entries(audit ?? {})) {
    if (v !== 'agree' && v !== 'disagree') continue;
    const r = rel.get(id) ?? 'missing';
    const row = (by[r] ??= { audited: 0, wrong: 0 });
    row.audited += 1; audited += 1;
    if (v === 'disagree') { row.wrong += 1; wrong += 1; }
  }
  const failures = [];
  const rate = (r) => (r.audited ? r.wrong / r.audited : 0);
  if (audited < bar.minAudited) failures.push(`audited ${audited}, need ${bar.minAudited}`);
  if (audited && wrong / audited > bar.overall) failures.push(`overall ${wrong}/${audited} wrong, limit ${bar.overall * 100}%`);
  for (const r of ['reinvents', 'consumes']) {
    const row = by[r] ?? { audited: 0, wrong: 0 };
    if (row.audited < bar.minPerRelation) failures.push(`${r} audited ${row.audited}, need ${bar.minPerRelation}`);
    if (rate(row) > bar[r]) failures.push(`${r} ${row.wrong}/${row.audited} wrong, limit ${bar[r] * 100}%`);
  }
  if (!golden) failures.push('no golden score');
  else {
    if (golden.accuracy < bar.golden) failures.push(`golden accuracy ${(golden.accuracy * 100).toFixed(1)}%, need ${bar.golden * 100}%`);
    if (golden.inboundPrecision === null) failures.push('golden produced no inbound verdict');
    else if (golden.inboundPrecision < bar.goldenInbound) failures.push(`golden inbound precision ${(golden.inboundPrecision * 100).toFixed(1)}%, need ${bar.goldenInbound * 100}%`);
  }
  return { pass: failures.length === 0, audited, wrong, by, failures };
}

/** Pure: how each kind of part is put together. */
export function builtOnSummary(parts) {
  const out = {};
  for (const p of parts) {
    const r = (out[p.kind] ??= { kind: p.kind, parts: 0, scratch: 0, on: {} });
    r.parts += 1;
    if (p.builtOn) r.on[p.builtOn] = (r.on[p.builtOn] ?? 0) + 1;
    else r.scratch += 1;
  }
  return Object.values(out).sort((a, b) => b.parts - a.parts || a.kind.localeCompare(b.kind));
}

/** Pure: per-project direction counts. */
export function gaps(parts) {
  const out = {};
  for (const p of parts) {
    const g = (out[p.project] ??= { parts: 0, consumes: 0, inbound: 0, outbound: 0, local: 0, unverified: 0 });
    g.parts += 1;
    if (p.relation === 'consumes') g.consumes += 1;
    else if (p.relation === 'reinvents') g.inbound += 1;
    else if (p.relation === 'not-governed') g.local += 1;
    else if (p.relation === 'unverified') g.unverified += 1;
    else g.outbound += 1;
  }
  return out;
}

/**
 * Pure: the same kind of part on the same stack, in how many projects. Consumers of a
 * standard are excluded: this is the input to deciding what the registry should host.
 */
export function clusters(parts, threshold = REPEAT_THRESHOLD) {
  const map = new Map();
  for (const p of parts) {
    if (p.relation === 'consumes' || p.relation === 'unverified') continue;
    const key = `${p.kind}|${p.stack}`;
    const c = map.get(key) ?? { kind: p.kind, stack: p.stack, projects: new Set(), count: 0, capabilities: {} };
    c.projects.add(p.project);
    c.count += 1;
    for (const k of p.capabilities) c.capabilities[k] = (c.capabilities[k] ?? 0) + 1;
    map.set(key, c);
  }
  return [...map.values()]
    .map((c) => ({ ...c, projects: [...c.projects].sort(), sharedCandidate: c.projects.size >= threshold }))
    .sort((a, b) => b.projects.length - a.projects.length || b.count - a.count || `${a.kind}${a.stack}`.localeCompare(`${b.kind}${b.stack}`));
}

/** Pure: a stable per-project sample, taken in turn from each relation so a rare one is still audited. */
export function sampleByRelation(parts, n, salt = '') {
  const h = (s) => crypto.createHash('sha1').update(salt + s).digest('hex');
  const piles = {};
  for (const p of [...parts].sort((a, b) => h(a.id).localeCompare(h(b.id)))) ((piles[`${p.project}|${p.relation}`] ??= [])).push(p);
  return Object.keys(piles).sort().flatMap((k) => piles[k].slice(0, n));
}

export function sample(parts, perProject, salt = '') {
  const h = (s) => crypto.createHash('sha1').update(salt + s).digest('hex');
  const by = {};
  for (const p of [...parts].sort((a, b) => h(a.id).localeCompare(h(b.id)))) ((by[p.project] ??= {})[p.relation] ??= []).push(p);
  return Object.values(by).flatMap((relations) => {
    const piles = Object.keys(relations).sort().map((r) => relations[r]);
    const out = [];
    for (let i = 0; out.length < perProject && piles.some((p) => i < p.length); i++) {
      for (const pile of piles) if (i < pile.length && out.length < perProject) out.push(pile[i]);
    }
    return out;
  });
}

/** Pure: {audited, disagree, rate}; rate is omitted when nothing was audited. */
export function auditRate(audit) {
  const values = Object.values(audit ?? {}).filter((v) => v === 'agree' || v === 'disagree');
  const disagree = values.filter((v) => v === 'disagree').length;
  return values.length ? { audited: values.length, disagree, rate: disagree / values.length } : { audited: 0, disagree: 0 };
}

/** Pure: the vault note. */
export function renderReport(census, audit) {
  const a = auditRate(audit);
  const g = gaps(census.parts);
  const accuracy = a.audited
    ? `Audited sample: ${a.audited} parts, ${a.disagree} wrong (${(a.rate * 100).toFixed(1)}%).`
    : '**Not audited: every count below is an unverified Codex judgment.**';
  const projects = Object.entries(g).sort(([x], [y]) => x.localeCompare(y))
    .map(([slug, r]) => `| ${slug} | ${r.parts} | ${r.consumes} | ${r.inbound} | ${r.outbound} | ${r.local} | ${r.unverified} |`).join('\n');
  const coverageLines = Object.entries(census.coverage ?? {}).sort(([x], [y]) => x.localeCompare(y))
    .map(([slug, c]) => `| ${slug} | ${c.tracked} | ${c.scoped} | ${c.read} | ${c.missed} | ${c.scoped ? ((c.read + c.trivial) / c.scoped * 100).toFixed(1) : '0.0'}% |`).join('\n');
  const built = builtOnSummary(census.parts)
    .map((r) => `| ${r.kind} | ${r.parts} | ${r.scratch} | ${Object.entries(r.on).sort((x, y) => y[1] - x[1]).slice(0, 4).map(([k, n]) => `${k} (${n})`).join(', ')} |`).join('\n');
  const adj = census.adjudication
    ? `No-standard claims checked against the whole registry: ${census.adjudication.checked}. Moved to reinvents: ${census.adjudication.reinvents}. Moved to consumes: ${census.adjudication.consumes}. Kept: ${census.adjudication.kept}. Not checked: ${census.adjudication.unchecked}.`
    : '**No-standard claims were not checked against the whole registry.**';
  const rej = census.rejudge
    ? `${census.deduped ? `Rows merged as duplicates: ${census.deduped.merged}, of which read differently by two surveys: ${census.deduped.disputed}. ` : ''}Reinvents accusations rejudged for applicability: ${census.rejudge.checked}. Upheld with a quoted rule: ${census.rejudge.upheld}. Actually follow the standard: ${census.rejudge.follows}. Standard does not govern: ${census.rejudge.notGoverned}. Upheld without a verifiable rule, so not believed: ${census.rejudge.unbacked}. Upheld without a checkable trigger for the harm: ${census.rejudge.noHarm ?? 0}. Not checked: ${census.rejudge.unchecked}.`
    : '**Reinvents accusations were not rejudged for applicability.**';
  const conf = census.confirm
    ? `Consumes claims naming a standard, checked: ${census.confirm.checked}. Shown to follow it: ${census.confirm.confirmed}. Actually break it: ${census.confirm.reinvents}. Standard does not apply, but built on a shared part: ${census.confirm.builtOn}. Not governed: ${census.confirm.notGoverned}. Could not be backed: ${census.confirm.unbacked}. Accused without a checkable trigger: ${census.confirm.noHarm ?? 0}. Not checked: ${census.confirm.unchecked}.`
    : '**Consumes claims were not confirmed against their standard.**';
  const rep = census.repeat
    ? `Upheld accusations judged a second time: ${census.repeat.checked}. Agreed: ${census.repeat.agreed}. Contested, moved to unverified: ${census.repeat.contested}. Not checked: ${census.repeat.unchecked}.`
    : '**Upheld accusations were not judged a second time.**';
  const list = clusters(census.parts);
  const repeat = list.filter((c) => c.sharedCandidate)
    .map((c) => `| ${c.kind} | ${c.stack} | ${c.projects.length} | ${c.count} | ${Object.entries(c.capabilities).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([k, n]) => `${k} (${n})`).join(', ')} |`)
    .join('\n');
  return [
    accuracy,
    '',
    `Parts kept: ${census.parts.length}. Dropped, quote not found in the cited file: ${census.dropped}. Invalid rows: ${census.invalid}. Contexts with no usable result: ${census.unusable.length}.`,
    '',
    adj,
    '',
    rej,
    '',
    conf,
    '',
    rep,
    '',
    'Counts are what the census saw, not the size of the true gap.',
    '',
    '## Coverage: files whose content was returned to Codex',
    '',
    '| project | tracked | in scope | read | not read | coverage |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    coverageLines,
    '',
    '## How each kind of part is built',
    '',
    '| kind | parts | from scratch | built on |',
    '| --- | ---: | ---: | --- |',
    built,
    '',
    '## Two-way gap per project',
    '',
    'Inbound: rebuilt although the registry has a standard. Outbound: the registry has no standard, or this part is better than it. Local: a standard was alleged and does not apply. Unverified: the judges could not back the claim or disagreed; the Director reads these.',
    '',
    '| project | parts | consumes | inbound | outbound | local | unverified |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    projects,
    '',
    `## Shared-part candidates (${REPEAT_THRESHOLD}+ projects, same kind and stack)`,
    '',
    '| kind | stack | projects | parts | most common capabilities |',
    '| --- | --- | ---: | ---: | --- |',
    repeat,
    '',
    '## Contexts with no usable result',
    '',
    census.unusable.map((u) => `- ${u}`).join('\n') || 'None.',
    '',
  ].join('\n');
}

function main() {
  installCrashDoor();
  const [cmd, ...rest] = process.argv.slice(2);
  const arg = (n) => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : null; };
  const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
  const fail = (m) => { console.error(m); process.exit(EXIT.FATAL); };
  if (cmd === 'collect') {
    if (!arg('--runs') || !arg('--roots') || !arg('--out')) fail('usage: collect --runs <dir> --roots <json> --out <file>');
    const census = collect(arg('--runs'), readJson(arg('--roots')));
    fs.writeFileSync(arg('--out'), JSON.stringify(census, null, 1) + '\n');
    console.log(JSON.stringify({ parts: census.parts.length, dropped: census.dropped, invalid: census.invalid, unusable: census.unusable.length }));
  } else if (cmd === 'apply-adjudication') {
    if (!arg('--census') || !arg('--runs') || !arg('--out')) fail('usage: apply-adjudication --census <file> --runs <adjudicate-dir> --out <file>');
    const verdicts = [];
    for (const slug of fs.readdirSync(arg('--runs'))) {
      for (const batch of fs.readdirSync(path.join(arg('--runs'), slug))) {
        try { verdicts.push(...(lastJsonBlock(fs.readFileSync(path.join(arg('--runs'), slug, batch, 'last.md'), 'utf8'))?.verdicts ?? [])); } catch { /* a batch with no result */ }
      }
    }
    const applied = applyAdjudication(readJson(arg('--census')), verdicts);
    fs.writeFileSync(arg('--out'), JSON.stringify(applied, null, 1) + '\n');
    console.log(JSON.stringify(applied.adjudication));
  } else if (cmd === 'apply-rejudge') {
    if (!arg('--census') || !arg('--runs') || !arg('--roots') || !arg('--out')) fail('usage: apply-rejudge --census <file> --runs <rejudge-dir> --roots <json> --out <file>');
    const { verdicts, targets } = loadVerdicts(arg('--runs'));
    const roots = readJson(arg('--roots'));
    const applied = applyRejudge(readJson(arg('--census')), verdicts, makeRuleFound(targets), (p, q, file = p.file) => quotedInFile(roots[p.project], file, q));
    fs.writeFileSync(arg('--out'), JSON.stringify(applied, null, 1) + '\n');
    console.log(JSON.stringify(applied.rejudge));
  } else if (cmd === 'sample') {
    if (!arg('--census') || !arg('--out')) fail('usage: sample --census <file> --per-project <n> --out <file>');
    const known = new Set(arg('--exclude') ? arg('--exclude').split(',').flatMap((g) => readJson(g).map((r) => r.id)) : []);
    const parts = readJson(arg('--census')).parts.filter((p) => !known.has(p.id) && !(p.alsoIds ?? []).some((id) => known.has(id)));
    const picked = arg('--per-relation') ? sampleByRelation(parts, Number(arg('--per-relation')), arg('--salt') ?? '') : sample(parts, Number(arg('--per-project') ?? 5), arg('--salt') ?? '');
    fs.writeFileSync(arg('--out'), JSON.stringify(picked, null, 1) + '\n');
    console.log(`${picked.length} parts to audit`);
  } else if (cmd === 'report') {
    if (!arg('--census')) fail('usage: report --census <file> [--audit <file>] [--no-vault]');
    const body = renderReport(readJson(arg('--census')), arg('--audit') ? readJson(arg('--audit')) : null);
    if (rest.includes('--no-vault')) { console.log(body); process.exit(EXIT.OK); }
    const vault = vaultRoot();
    if (!vault) fail('FATAL: no vault (set DAYBREAK_VAULT)');
    console.log(writeNewNote({ vault, dir: 'census', title: 'Daybreak census', body }));
  } else if (cmd === 'gate') {
    if (!arg('--census') || !arg('--audit') || !arg('--golden')) fail('usage: gate --census <file> --audit <file> --golden <score.json>');
    const verdict = evaluateGate(readJson(arg('--census')), readJson(arg('--audit')), readJson(arg('--golden')));
    console.log(JSON.stringify(verdict, null, 1));
    process.exit(verdict.pass ? EXIT.OK : EXIT.FATAL);
  } else if (cmd === 'golden-add') {
    if (!arg('--golden') || !arg('--sample') || !arg('--audit')) fail('usage: golden-add --golden <file> --sample <sample.json> --audit <audit.json> [--truth <json>]');
    const prior = fs.existsSync(arg('--golden')) ? readJson(arg('--golden')) : [];
    const audit = readJson(arg('--audit')), truth = arg('--truth') ? readJson(arg('--truth')) : {};
    const byId = new Map(prior.map((r) => [r.id, r]));
    for (const p of readJson(arg('--sample'))) if (audit[p.id] === 'agree' || audit[p.id] === 'disagree') byId.set(p.id, goldenRow(p, audit[p.id], truth[p.id]));
    fs.writeFileSync(arg('--golden'), JSON.stringify([...byId.values()], null, 1) + '\n');
    console.log(`${byId.size} golden rows`);
  } else if (cmd === 'golden-census') {
    if (!arg('--golden') || !arg('--out')) fail('usage: golden-census --golden <file[,file]> --out <file>');
    fs.writeFileSync(arg('--out'), JSON.stringify(goldenCensus(arg('--golden').split(',').flatMap(readJson)), null, 1) + '\n');
  } else if (cmd === 'golden-score') {
    if (!arg('--golden') || !arg('--census') || !arg('--out')) fail('usage: golden-score --golden <file[,file]> --census <file> --out <file>');
    const score = goldenScore(readJson(arg('--census')), arg('--golden').split(',').flatMap(readJson));
    fs.writeFileSync(arg('--out'), JSON.stringify(score, null, 1) + '\n');
    console.log(JSON.stringify(score, null, 1));
  } else fail('usage: census.mjs collect|apply-adjudication|apply-rejudge|sample|report|gate|golden-add|golden-census|golden-score');
  process.exit(EXIT.OK);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
