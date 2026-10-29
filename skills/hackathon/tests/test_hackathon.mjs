// Deterministic tests for the pure half of scripts/hackathon.mjs:
//   node --test skills/hackathon/tests/test_hackathon.mjs
// Builtins only; nothing here spawns a CLI or touches git. The state-lock test writes in a temp dir.
//
// What is pinned is what goes wrong silently and late in a hackathon: a builder restarted after
// the deadline or forever after a seat limit (planSession), a board that names the seat behind an
// idea (buildBoard + leaks), a brief that reaches a seat with a literal {{placeholder}}
// (renderTemplate), a ledger that double-counts on a rerun (seats.json), and an exclude file that
// grows a line per prepare (addExcludeLine).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter, parseOverlay, resolveConfig, resolveVault, resolveWorktreesRoot, DEFAULT_IDEATORS } from '../scripts/lib/config.mjs';
import { validateIdea, validateIdeasDoc, recoverFromFinal, buildBoard, leaks, groupIdeas, seatStrings } from '../scripts/lib/ideas.mjs';
import { planSession, planSessionWhy, countedSessions, isoLocal, hhmm, humanDuration, sessionLine } from '../scripts/lib/clock.mjs';
import { renderTemplate, demoteHeadings, markdownToHtml,boardHtml, boardMarkdown, ideaMarkdown, escapeHtml } from '../scripts/lib/render.mjs';
import { seatKey, seatContributions, upsertSeatLedger, seatTotals, renderSeatsMd, upsertIndexRow, renderHackathonNote } from '../scripts/lib/ledger.mjs';
import { addExcludeLine } from '../scripts/lib/git.mjs';
import { validatePacks, packMarkdown, shortlistLabels, entryIdeaLabel, PACK_LICENSE, pickAdvice } from '../scripts/lib/packs.mjs';
import { ramCheck, reaperNote, effectiveSpec } from '../scripts/lib/preflight.mjs';
import { acquireLock, withFileLock } from '../scripts/lib/lock.mjs';
import { parseFusion, fusionBase, verdictLabel, wrapPlan } from '../scripts/lib/verdict.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REFS = path.join(HERE, '..', 'references');
const MIN = 60000;
const HOUR = 60 * MIN;

const idea = (over = {}) => ({
  title: 'Live diff lens', pitch: 'Shows what changed. For reviewers.', user_moment: 'A reviewer opens a PR and sees the risk map.',
  insight: 'Risk follows churn, not size.', surface: 'frontend', baseline: 'One page renders the map.', mastery: 'Motion and density.',
  stretch: ['export'], grounding: ['src/diff.ts - the parser'], risks: 'Parser speed.', ...over,
});

// ---------------------------------------------------------------- overlay

const OVERLAY = `---
vault: ["~/Missing Vault", C:/also/missing]
vault_subdir: Hacks
ideators: [claude:claude-opus-5-5@high, "codex:gpt-6.1-sol@high"]
ideas: 6   # fewer
hours: 3
build_effort: max
base_port: 4100
# a comment line
baseline_frac: 0.4
---
Intro prose.

## Setup
- \`npm ci\`
- install the browsers first

## Gates
- \`npm test\` - unit
* \`npm run lint\`

## Taste
Quiet interfaces. No modals.

## Repo law
Never touch migrations/.
`;

test('overlay: frontmatter scalars, quoted strings, lists and trailing comments', () => {
  const { data, body } = parseFrontmatter(OVERLAY);
  assert.deepEqual(data.vault, ['~/Missing Vault', 'C:/also/missing']);
  assert.deepEqual(data.ideators, ['claude:claude-opus-5-5@high', 'codex:gpt-6.1-sol@high']);
  assert.equal(data.ideas, '6');
  assert.equal(data.baseline_frac, '0.4');
  assert.ok(body.startsWith('Intro prose.'));
  assert.deepEqual(parseFrontmatter('no frontmatter here').data, {});
});

test('overlay: Setup/Gates bullets carry one backticked command; Taste and Repo law are prose', () => {
  const o = parseOverlay(OVERLAY);
  assert.deepEqual(o.setup, ['npm ci']);
  assert.deepEqual(o.gates, ['npm test', 'npm run lint']);
  assert.equal(o.taste, 'Quiet interfaces. No modals.');
  assert.equal(o.repo_law, 'Never touch migrations/.');
  assert.equal(o.warnings.length, 1);
  assert.match(o.warnings[0], /install the browsers first/);
});

test('config: CLI beats overlay beats default, and every value names its source', () => {
  const base = { id: 'h1', cwd: '/r', home: '/home/u', platform: 'linux', tmpdir: '/tmp', exists: () => false };
  const { config, sources } = resolveConfig({ ...base, overlay: parseOverlay(OVERLAY), cli: { hours: '2', gate: ['make check'] } });
  assert.equal(config.hours, 2); assert.equal(sources.hours, 'cli');
  assert.equal(config.ideas_per_seat, 6); assert.equal(sources.ideas, 'overlay');
  assert.equal(config.sprint_min, 60); assert.equal(sources.sprint_min, 'default');
  assert.deepEqual(config.ideators, ['claude:claude-opus-5-5@high', 'codex:gpt-6.1-sol@high']);
  assert.deepEqual(config.gates, ['make check']); assert.equal(sources.gates, 'cli');
  assert.deepEqual(config.setup, ['npm ci']); assert.equal(sources.setup, 'overlay');
  assert.equal(config.build_effort, 'max');
  assert.equal(config.vault, path.join('/r', '.hackathon'));
  assert.match(sources.vault, /no listed vault exists/);
  assert.equal(config.worktrees_root, '/tmp/hk-h1');
  const d = resolveConfig({ ...base, cli: {} });
  assert.deepEqual(d.config.ideators, DEFAULT_IDEATORS.split(','));
  assert.equal(d.config.mode, 'long');
  assert.throws(() => resolveConfig({ ...base, cli: { ideators: 'claude:opus@ultra' } }), /unknown effort/);
  assert.throws(() => resolveConfig({ ...base, cli: { 'baseline-frac': '1.2' } }), /baseline_frac/);
  assert.throws(() => resolveConfig({ ...base, cli: { hours: true } }), /needs a value/);
});

test('config: the default session cap never cuts a sprint plan short; an explicit one is kept and warned', () => {
  const base = { id: 'h1', cwd: '/r', platform: 'linux', tmpdir: '/tmp' };
  const r = resolveConfig({ ...base, cli: { sprints: true, 'sprint-min': '30' } });
  assert.equal(r.config.mode, 'sprints');
  assert.ok(r.config.max_sessions >= 1 + Math.ceil((300 * 0.65) / 30));
  assert.match(r.warnings.join('\n'), /raised/);
  const k = resolveConfig({ ...base, cli: { sprints: true, 'sprint-min': '30', 'max-sessions': '4' } });
  assert.equal(k.config.max_sessions, 4);
  assert.match(k.warnings.join('\n'), /stops early/);
});

test('config: first existing vault wins; worktrees root is per hackathon', () => {
  const exists = (p) => p === path.resolve('/r', 'b');
  assert.equal(resolveVault(['a', 'b'], { cwd: '/r', exists }).root, path.resolve('/r', 'b'));
  assert.equal(resolveVault('~/v', { cwd: '/r', home: '/h', exists: (p) => p === path.resolve('/h', 'v') }).root, path.resolve('/h', 'v'));
  assert.equal(resolveWorktreesRoot(null, { id: 'x', platform: 'win32' }), 'C:/t/hk-x');
  assert.equal(resolveWorktreesRoot('D:/wt/<id>', { id: 'x', platform: 'win32' }), 'D:/wt/x');
  assert.equal(resolveWorktreesRoot('/wt', { id: 'x', platform: 'linux' }), path.join('/wt', 'hk-x'));
});

// ---------------------------------------------------------------- ideas

test('idea validation: required strings, surface, string arrays; empty grounding warns', () => {
  assert.deepEqual(validateIdea(idea()).problems, []);
  const bad = validateIdea(idea({ pitch: '  ', surface: 'mobile', stretch: 'x' }));
  assert.equal(bad.problems.length, 3);
  assert.match(bad.problems.join(' '), /pitch/); assert.match(bad.problems.join(' '), /surface/); assert.match(bad.problems.join(' '), /stretch/);
  const w = validateIdea(idea({ grounding: [] }));
  assert.deepEqual(w.problems, []); assert.match(w.warnings[0], /grounding is empty/);
  assert.deepEqual(validateIdea(idea({ surface: ' Both ' })).problems, []);
  const doc = validateIdeasDoc({ seat_notes: 'n', ideas: [idea(), idea({ risks: '' }), idea({ grounding: [] })] }, 10);
  assert.equal(doc.valid.length, 2);
  assert.equal(doc.invalid.length, 1); assert.equal(doc.invalid[0].index, 2);
  assert.ok(doc.warnings.some((x) => /3 idea\(s\) proposed, 10 asked for/.test(x)));
  assert.ok(doc.warnings.some((x) => /idea 3: grounding/.test(x)));
  assert.match(validateIdeasDoc({ nope: 1 }).fatal, /no "ideas" array/);
});

test('recovery: the last json fence wins; else the last top-level object with an ideas array', () => {
  const a = { ideas: [idea({ title: 'first' })] };
  const b = { ideas: [idea({ title: 'second {not a brace}' })] };
  const fenced = `Here.\n\`\`\`json\n${JSON.stringify(a)}\n\`\`\`\nRevised:\n\`\`\`json\n${JSON.stringify(b, null, 2)}\n\`\`\`\nDone.`;
  assert.equal(recoverFromFinal(fenced).ideas[0].title, 'second {not a brace}');
  const bare = `I wrote this: ${JSON.stringify({ seat_notes: 'x', ideas: [idea({ title: 'bare' })] })} - bye {oops`;
  assert.equal(recoverFromFinal(bare).ideas[0].title, 'bare');
  const brokenFence = `\`\`\`json\n{ "ideas": [ \n\`\`\`\nbut ${JSON.stringify(a)}`;
  assert.equal(recoverFromFinal(brokenFence).ideas[0].title, 'first');
  assert.equal(recoverFromFinal('no json here {"a": 1}'), null);
  assert.equal(recoverFromFinal(''), null);
});

// ---------------------------------------------------------------- board

const SPECS = ['claude:claude-opus-5-5@high', 'claude:claude-sonnet-5-5@high', 'codex:gpt-6.1-sol@high', 'muse:muse-wonder-1.0@high'];
const seatId = (spec) => spec.replace(':', '-').replace('@', '_');
const leakyIdeas = (spec) => [
  idea({ title: `Built by ${spec.split(':')[1].split('@')[0]}`, pitch: 'As Claude Opus I propose this. Sonnet agrees.', insight: `Seat ${seatId(spec)} via codex and grok and agy and muse.` }),
  idea({ surface: 'backend', grounding: [`src/x.ts - ${spec}`, 'lib/y - plain'], risks: 'OpenAI gpt-6 may differ; Anthropic too.' }),
];

test('board letters are deterministic per hackathon id and every seat string is scrubbed', () => {
  const seats = SPECS.map((spec) => ({ id: seatId(spec), spec, ideas: leakyIdeas(spec) }));
  const material = ['Track: make the claude-opus-5-5 runner observable. We use Claude Code daily.'];
  const one = buildBoard({ hackathonId: 'hk-a', seats, material });
  const two = buildBoard({ hackathonId: 'hk-a', seats: [...seats].reverse(), material });
  assert.deepEqual(one.letters, two.letters);
  assert.deepEqual(Object.keys(one.letters).sort(), ['A', 'B', 'C', 'D']);
  assert.equal(one.ideas.length, 8);
  assert.deepEqual(one.ideas.map((i) => i.id).slice(0, 2), ['A1', 'A2']);
  assert.ok(one.redactions > 0);
  // A material phrase that names one of this hackathon's seats is not protected.
  assert.ok(!one.protect.some((p) => /claude-opus-5-5/i.test(p)));
  const { groups } = groupIdeas(one.ideas);
  const html = boardHtml({ title: 'Observability hackathon', generated: '2026-10-28', groups, ideas: one.ideas, seatCount: 4 });
  const md = boardMarkdown({ title: 'Observability hackathon', generated: '2026-10-28', groups, ideas: one.ideas });
  for (const text of [html, md, JSON.stringify(one.ideas)]) {
    assert.deepEqual(leaks(text, SPECS, { engines: true }), []);
    const lower = text.toLowerCase();
    for (const w of ['claude', 'opus', 'sonnet', 'codex', 'grok', 'agy', 'muse', 'gpt-6', 'openai', 'anthropic', 'wonder']) {
      assert.ok(!lower.includes(w), `board contains "${w}"`);
    }
  }
  const other = buildBoard({ hackathonId: 'hk-b', seats, material });
  assert.equal(Object.keys(other.letters).length, 4);
});

test('leaks names a surviving seat string; seatStrings covers ids, specs and model slugs', () => {
  assert.deepEqual(leaks('built on gpt-6.1-sol', ['codex:gpt-6.1-sol@high']), ['gpt-6.1-sol']);
  assert.deepEqual(leaks('a quiet board', ['codex:gpt-6.1-sol@high']), []);
  const ss = seatStrings(['codex:gpt-6.1-sol@high#b']);
  for (const s of ['codex:gpt-6.1-sol@high#b', 'codex:gpt-6.1-sol', 'gpt-6.1-sol', 'codex', 'codex-gpt-6.1-sol_high-b']) assert.ok(ss.includes(s), s);
  assert.ok(!ss.includes('b'));
});

test('board page: self-contained, filter row, search, light and dark, revealed copy shows seats', () => {
  const ideas = [{ id: 'A1', letter: 'A', n: 1, ...idea() }, { id: 'B1', letter: 'B', n: 1, ...idea({ surface: 'backend', title: '<script>x</script>' }) }];
  const { groups, warnings } = groupIdeas(ideas, { clusters: [{ name: 'Review', note: 'two takes', ideas: ['A1', 'Z9'] }] });
  assert.deepEqual(groups.map((g) => g.name), ['Review', 'Unclustered']);
  assert.match(warnings[0], /Z9/);
  const html = boardHtml({ title: 'T', generated: 'now', groups, ideas, seatCount: 2 });
  assert.ok(!/(?:src|href)=["']https?:/i.test(html) && !/@import|url\(/i.test(html));
  assert.match(html, /prefers-color-scheme: dark/);
  assert.match(html, /position:sticky/);
  assert.match(html, /type="search"/);
  assert.match(html, /data-surface="backend"/);
  assert.ok(html.includes('&lt;script&gt;x&lt;/script&gt;'));
  assert.ok(!html.includes('<script>x</script>'));
  const rev = boardHtml({ title: 'T', generated: 'now', groups, ideas, seatCount: 2, reveal: { seatOf: { A1: 'claude:x@high', B1: 'codex:y@high' }, pickOf: { B1: 'e1' } } });
  assert.match(rev, /claude:x@high/);
  assert.match(rev, /Shortlisted - e1/);
  assert.match(rev, /class="card picked"/);
});

// ---------------------------------------------------------------- clock

test('planSession long: full, continuation, resume, stop near deadline, seat limit, max sessions', () => {
  const started = Date.UTC(2026, 9, 28, 9);
  const deadline = started + 5 * HOUR;
  const base = { mode: 'long', started, deadline, maxSessions: 6, baselineFrac: 0.35, sprintMin: 60 };
  assert.deepEqual(planSession({ ...base, now: started, sessions: 0 }), { end: deadline, kind: 'full' });
  assert.deepEqual(planSession({ ...base, now: started + 2 * HOUR, sessions: 1, lastOutcome: 'completed' }), { end: deadline, kind: 'continuation' });
  assert.deepEqual(planSession({ ...base, now: started + HOUR, sessions: 1, lastOutcome: 'errored' }), { end: deadline, kind: 'resume' });
  assert.deepEqual(planSession({ ...base, now: started + HOUR, sessions: 2, lastOutcome: 'timed-out' }), { end: deadline, kind: 'resume' });
  assert.deepEqual(planSession({ ...base, now: started + HOUR, sessions: 1, lastOutcome: 'interrupted' }), { end: deadline, kind: 'resume' });
  assert.equal(planSession({ ...base, now: deadline - 9 * MIN, sessions: 1, lastOutcome: 'completed' }), null);
  assert.equal(planSession({ ...base, now: deadline + MIN, sessions: 1, lastOutcome: 'timed-out' }), null);
  assert.ok(planSession({ ...base, now: deadline - 11 * MIN, sessions: 1, lastOutcome: 'completed' }));
  assert.equal(planSession({ ...base, now: started + HOUR, sessions: 1, lastOutcome: 'seat-limit' }), null);
  assert.match(planSessionWhy({ ...base, now: started + HOUR, sessions: 1, lastOutcome: 'seat-limit' }).reason, /usage limit/);
  // The host's explicit --resume-limited after the reset: one resume to the same deadline, never past it.
  assert.deepEqual(planSession({ ...base, now: deadline - 30 * MIN, sessions: 2, lastOutcome: 'seat-limit', resumeLimit: true }), { end: deadline, kind: 'resume' });
  assert.equal(planSession({ ...base, now: deadline - 5 * MIN, sessions: 2, lastOutcome: 'seat-limit', resumeLimit: true }), null);
  assert.equal(planSession({ ...base, now: started + HOUR, sessions: 6, lastOutcome: 'completed' }), null);
  assert.equal(planSession({ ...base, now: started + HOUR, sessions: new Array(6).fill({}), lastOutcome: 'completed' }), null);
  assert.match(planSessionWhy({ ...base, now: deadline - MIN, sessions: 1, lastOutcome: 'completed' }).reason, /10 min/);
});

test('planSession sprints: baseline end, sprint chunks clamped to the deadline, resume', () => {
  const started = Date.UTC(2026, 9, 28, 9);
  const deadline = started + 5 * HOUR;
  const base = { mode: 'sprints', started, deadline, maxSessions: 9, baselineFrac: 0.35, sprintMin: 60 };
  const baselineEnd = started + 0.35 * 5 * HOUR; // 105 min
  assert.deepEqual(planSession({ ...base, now: started, sessions: 0 }), { end: baselineEnd, kind: 'baseline' });
  const now = baselineEnd + 2 * MIN;
  assert.deepEqual(planSession({ ...base, now, sessions: 1, lastOutcome: 'timed-out' }), { end: now + 60 * MIN, kind: 'sprint' });
  assert.deepEqual(planSession({ ...base, now, sessions: 1, lastOutcome: 'completed' }), { end: now + 60 * MIN, kind: 'sprint' });
  const late = deadline - 40 * MIN;
  assert.deepEqual(planSession({ ...base, now: late, sessions: 4, lastOutcome: 'timed-out' }), { end: deadline, kind: 'sprint' });
  assert.deepEqual(planSession({ ...base, now: started + 30 * MIN, sessions: 1, lastOutcome: 'errored' }), { end: baselineEnd, kind: 'resume' });
  assert.deepEqual(planSession({ ...base, now: started + 3 * HOUR, sessions: 3, lastOutcome: 'errored' }), { end: started + 4 * HOUR, kind: 'resume' });
  assert.equal(planSession({ ...base, now: deadline - 5 * MIN, sessions: 4, lastOutcome: 'timed-out' }), null);
  // A whole sprint run never plans a session past the deadline.
  let t = started;
  let n = 0;
  let plan;
  while ((plan = planSession({ ...base, now: t, sessions: n, lastOutcome: n ? 'timed-out' : null }))) {
    assert.ok(plan.end <= deadline && plan.end > t);
    t = plan.end; n += 1;
  }
  assert.equal(n, 1 + Math.ceil((5 * HOUR - 105 * MIN) / (60 * MIN)));
});

test('clock formatting: ISO local with offset round-trips; human durations; session lines', () => {
  const ms = Date.UTC(2026, 9, 28, 12, 45, 0);
  const iso = isoLocal(ms);
  assert.match(iso, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  assert.equal(Date.parse(iso), ms);
  assert.match(hhmm(ms), /^\d{2}:\d{2}$/);
  assert.equal(humanDuration(130 * MIN), '2 h 10 min');
  assert.equal(humanDuration(5 * MIN), '5 min');
  assert.equal(humanDuration(2 * HOUR), '2 h');
  assert.equal(sessionLine({ kind: 'full', n: 1 }), 'Session 1 of a long run: you have the whole clock.');
  assert.equal(sessionLine({ kind: 'continuation', n: 3, now: 0, deadline: 130 * MIN }),
    'Session 3 (continuation): you stopped with 2 h 10 min left. Read .hackathon/HACKLOG.md, then keep mastering - the clock is the point.');
  assert.match(sessionLine({ kind: 'baseline', n: 1, now: 0, end: ms, deadline: ms + HOUR }), /^Sprint 1 - baseline: this session ends at \d{2}:\d{2}; reach the baseline before then\.$/);
  assert.match(sessionLine({ kind: 'resume', n: 2, now: 0, end: HOUR, deadline: 2 * HOUR, lastOutcome: 'errored' }), /resume.*errored.*2 h left/);
});

// ---------------------------------------------------------------- templates

test('renderTemplate throws on an unknown placeholder and on an empty required value', () => {
  assert.equal(renderTemplate('a {{x}} b', { x: 1, unused: 2 }), 'a 1 b');
  assert.throws(() => renderTemplate('a {{x}} {{y}}', { x: 1 }), /no value: y/);
  assert.throws(() => renderTemplate('a {{x}}', { x: '' }), /not optional: x/);
  assert.equal(renderTemplate('a{{taste}}b', { taste: '' }), 'ab');
  // One pass: a value that itself contains a placeholder is not re-expanded.
  assert.equal(renderTemplate('{{x}}', { x: '{{y}}' }), '{{y}}');
});

test('both real templates fill completely', () => {
  const ideator = renderTemplate(fs.readFileSync(path.join(REFS, 'ideator-brief.md'), 'utf8'), {
    ideas: '10', hours: '5', track: 'Make it observable.', dossier: '', baseline_frac_pct: '35', taste: '', out: '.hackathon/IDEAS.json',
  });
  assert.ok(!ideator.includes('{{'), 'ideator brief has a placeholder left');
  assert.match(ideator, /propose 10 projects/);
  const builder = renderTemplate(fs.readFileSync(path.join(REFS, 'builder-brief.md'), 'utf8'), {
    title: 'Live diff lens', track: 'Make it observable.', idea: ideaMarkdown({ id: 'A1', ...idea() }), owner_note: '', hours: '5',
    started: '2026-10-28T09:00:00+01:00 (09:00)', deadline: '2026-10-28T14:00:00+01:00 (14:00)', baseline_by: '2026-10-28T10:45:00+01:00 (10:45)',
    session_line: 'Session 1 of a long run: you have the whole clock.', port: '3301', branch: 'hackathon/h/e1',
    gates: '- `npm test`', taste: '', repo_law: '', dossier_path: '.hackathon/DOSSIER.md',
  });
  assert.ok(!builder.includes('{{'), 'builder brief has a placeholder left');
  assert.match(builder, /port \*\*3301\*\*/);
});

test('markdownToHtml escapes everything and renders headings, lists, code', () => {
  const h = markdownToHtml('# Run it\n\n1. `npm start`\n2. open <b>\n\n```\n<img onerror=x>\n```\n\nPlain **bold** text.');
  assert.match(h, /<h3>Run it<\/h3>/);
  assert.match(h, /<ol>\n<li><code>npm start<\/code><\/li>/);
  assert.ok(h.includes('open &lt;b&gt;'));
  assert.ok(h.includes('<pre><code>&lt;img onerror=x&gt;</code></pre>'));
  assert.match(h, /<strong>bold<\/strong>/);
  assert.equal(escapeHtml(`"'&`), '&quot;&#39;&amp;');
});

test('demoteHeadings pushes a quoted track under the brief heading, never inside a fence', () => {
  assert.equal(demoteHeadings('# Track\ntext\n```sh\n# a comment\n```\n###### deep'), '### Track\ntext\n```sh\n# a comment\n```\n###### deep');
});

// ---------------------------------------------------------------- ledger and exclude

const STATE = {
  id: 'h1', title: 'Hack', created: '2026-10-28T09:00:00+01:00', mode: 'long', hours: 5,
  ideators: ['claude:claude-opus-5-5@high', 'codex:gpt-6.1-sol@high'],
  ideation: {
    a: { spec: 'claude:claude-opus-5-5@high', letter: 'A', count: 10 },
    b: { spec: 'codex:gpt-6.1-sol@high', letter: 'B', count: 8 },
  },
  shortlist: [{ idea: 'A3', entry: 'e1' }, { idea: 'B2', entry: 'e2' }],
  entries: {
    e1: { idea: 'A3', title: 'One', spec: 'claude:claude-opus-5-5@xhigh', sessions: [{ outcome: 'completed' }] },
    e2: { idea: 'B2', title: 'Two', spec: 'claude:claude-opus-5-5@xhigh', sessions: [{ outcome: 'timed-out' }] },
  },
  winner: 'e2', runner_up: 'e1', verdict_note: 'Two felt finished.', owner_note: 'Go small.',
};

test('seat ledger: effort stripped, idempotent per hackathon id', () => {
  assert.equal(seatKey('claude:claude-opus-5-5@xhigh#b'), 'claude:claude-opus-5-5');
  const c = seatContributions(STATE);
  assert.deepEqual(c['claude:claude-opus-5-5'], { proposed: 10, shortlisted: 1, built: 2, won: 1, winning_idea: 0 });
  assert.deepEqual(c['codex:gpt-6.1-sol'], { proposed: 8, shortlisted: 1, built: 0, won: 0, winning_idea: 1 });
  let ledger = upsertSeatLedger(null, 'h1', c);
  const once = renderSeatsMd(ledger);
  ledger = upsertSeatLedger(ledger, 'h1', seatContributions(STATE));
  ledger = upsertSeatLedger(JSON.parse(JSON.stringify(ledger)), 'h1', seatContributions(STATE));
  assert.equal(renderSeatsMd(ledger), once);
  assert.equal(seatTotals(ledger)['claude:claude-opus-5-5'].hackathons, 1);
  ledger = upsertSeatLedger(ledger, 'h2', { 'claude:claude-opus-5-5': { proposed: 5, shortlisted: 0, built: 0, won: 0, winning_idea: 0 } });
  const t = seatTotals(ledger)['claude:claude-opus-5-5'];
  assert.equal(t.hackathons, 2); assert.equal(t.proposed, 15); assert.equal(t.won, 1);
  assert.match(renderSeatsMd(ledger), /\| claude:claude-opus-5-5 \| 2 \| 15 \| 1 \| 2 \| 1 \| 0 \|/);
});

test('index row upserts by id; the note carries both owner notes', () => {
  const row = { date: '2026-10-28', id: 'h1', title: 'Hack', mode: 'long', hours: 5, entries: 2, winner: 'pending', note: 'a | b' };
  const one = upsertIndexRow(null, row);
  assert.equal(upsertIndexRow(one, row), one);
  const two = upsertIndexRow(one, { ...row, winner: 'Two (claude:x@high)' });
  assert.equal(two.split('\n').filter((l) => l.includes('[[hackathons/h1')).length, 1);
  assert.match(two, /Two \(claude:x@high\)/);
  assert.match(two, /a \\\| b/);
  const three = upsertIndexRow(two, { ...row, id: 'h2' });
  assert.equal(three.split('\n').filter((l) => l.includes('[[hackathons/')).length, 2);
  const note = renderHackathonNote({ state: STATE, track: 'T', board: [{ id: 'A3', title: 'One', seat: 'claude:claude-opus-5-5@high', shortlisted: 'e1' }], entries: [] });
  assert.match(note, /\*\*Winner:\*\* e2 - Two/);
  assert.match(note, /Two felt finished\./);
  assert.match(note, /Go small\./);
});

// ---------------------------------------------------------------- packs

const BOARD_IDS = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];
const pack = (over = {}) => ({ title: 'Broad sweep', focus: 'broad', ideas: ['A1', 'B2'], builder: 'claude:claude-opus-5-5@xhigh', brief: 'Fuse them.\n\nSecond paragraph.', ...over });

test('packs: parse, validate, overlap allowed', () => {
  const ok = validatePacks({ packs: [pack(), pack({ title: 'Deep one', focus: 'deep', ideas: ['a1', 'B3'], note: 'Go deep.' })] }, BOARD_IDS);
  assert.deepEqual(ok.problems, []);
  assert.equal(ok.packs.length, 2);
  assert.deepEqual(ok.packs[1].ideas, ['A1', 'B3']); // ids normalized; A1 sits in both packs on purpose
  assert.equal(ok.packs[1].note, 'Go deep.');
  const bad = validatePacks({ packs: [pack({ ideas: ['A1', 'Z9'] }), pack({ builder: '' }), pack({ title: 'broad SWEEP' }), pack({ title: 'X', focus: 'wide', brief: ' ' }), pack({ title: 'Y', builder: 'claude:opus@ultra' })] }, BOARD_IDS);
  const text = bad.problems.join('\n');
  assert.match(text, /idea Z9 is not on the board/);
  assert.match(text, /builder is required/);
  assert.match(text, /title repeats pack 1/);
  assert.match(text, /focus "wide"/);
  assert.match(text, /brief is missing/);
  assert.match(text, /unknown effort/);
  assert.deepEqual(bad.packs, []);
  assert.match(validatePacks({ packs: [] }, BOARD_IDS).problems[0], /non-empty "packs"/);
  assert.match(validatePacks({ packs: [pack({ ideas: ['A1', 'a1'] })] }, BOARD_IDS).problems[0], /repeat an id/);
});

test('pack IDEA.md carries the fusion brief, the license and every fused card in full', () => {
  const cards = [{ id: 'A1', ...idea({ title: 'Card one' }) }, { id: 'B2', ...idea({ title: 'Card two', insight: 'Second insight.' }) }];
  const md = packMarkdown({ title: 'Broad sweep', focus: 'broad', brief: 'Fuse them.\n\nSecond paragraph.', note: 'Keep it calm.', cards });
  assert.ok(md.startsWith('# Pack: Broad sweep\n'));
  assert.match(md, /\*\*Focus:\*\* broad/);
  assert.match(md, /Fuse them\.\n\nSecond paragraph\./);
  assert.match(md, /Keep it calm\./);
  assert.ok(md.includes(PACK_LICENSE));
  assert.match(md, /## Ideas fused into this pack/);
  for (const c of cards) {
    assert.ok(md.includes(`### ${c.id} - ${c.title}`));
    for (const f of ['pitch', 'user_moment', 'insight', 'baseline', 'mastery', 'risks']) assert.ok(md.includes(c[f]), `${c.id} ${f}`);
    for (const g of c.grounding) assert.ok(md.includes(g));
  }
});

test('packs ledger: an idea in two packs is shortlisted once; built and won go to the pack builder', () => {
  const state = {
    ...STATE,
    shortlist: [{ entry: 'e1', title: 'Broad', ideas: ['A3', 'B2'] }, { entry: 'e2', title: 'Deep', ideas: ['A3'] }, { entry: 'e3', title: 'Deep B', ideas: ['B2', 'B5'] }],
    entries: {
      e1: { idea: 'A3', ideas: ['A3', 'B2'], pack: { focus: 'broad' }, title: 'Broad', spec: 'grok:grok-4.7@high', sessions: [{ outcome: 'completed' }] },
      e2: { idea: 'A3', ideas: ['A3'], pack: { focus: 'deep' }, title: 'Deep', spec: 'claude:claude-opus-5-5@xhigh', sessions: [] },
      e3: { idea: 'B2', ideas: ['B2', 'B5'], pack: { focus: 'deep' }, title: 'Deep B', spec: 'claude:claude-opus-5-5@xhigh', sessions: [{ outcome: 'timed-out' }] },
    },
    winner: 'e1',
  };
  const c = seatContributions(state);
  assert.equal(c['claude:claude-opus-5-5'].shortlisted, 1); // A3 in two packs counts once
  assert.equal(c['codex:gpt-6.1-sol'].shortlisted, 2); // B2 (two packs) and B5
  assert.deepEqual(c['grok:grok-4.7'], { proposed: 0, shortlisted: 0, built: 1, won: 1, winning_idea: 0 });
  assert.equal(c['claude:claude-opus-5-5'].built, 1);
  assert.equal(c['claude:claude-opus-5-5'].winning_idea, 1);
  assert.equal(c['codex:gpt-6.1-sol'].winning_idea, 1);
  const labels = shortlistLabels(state);
  assert.equal(labels.A3, 'e1 "Broad", e2 "Deep"');
  assert.equal(labels.B5, 'e3 "Deep B"');
  assert.equal(shortlistLabels(STATE).A3, 'e1');
  assert.equal(entryIdeaLabel(state.entries.e3), 'pack [deep]: B2, B5');
  assert.equal(entryIdeaLabel(STATE.entries.e1), 'A3');
});

test('exclude line is appended once', () => {
  const a = addExcludeLine('# git ls-files --others --exclude-from=.git/info/exclude\n*.log');
  assert.ok(a.changed);
  assert.equal(a.text, '# git ls-files --others --exclude-from=.git/info/exclude\n*.log\n.hackathon/\n');
  const b = addExcludeLine(a.text);
  assert.equal(b.changed, false);
  assert.equal(b.text, a.text);
  assert.equal(addExcludeLine('').text, '.hackathon/\n');
  assert.equal(addExcludeLine('x\r\n.hackathon/\r\n').changed, false);
});

// ---------------------------------------------------------------- 1.1.0: lessons of the first run

test('planSession: host-ended sessions do not spend max_sessions; a declared-done builder stops', () => {
  const started = Date.UTC(2026, 9, 28, 9);
  const deadline = started + 5 * HOUR;
  const base = { mode: 'long', started, deadline, maxSessions: 6, baselineFrac: 0.35, sprintMin: 60 };
  const seat = (outcome) => ({ outcome });
  // Five seat sessions and one host death: the sixth slot is still the seat's.
  const six = [seat('completed'), seat('completed'), seat('interrupted'), seat('completed'), seat('completed'), seat('completed')];
  assert.equal(countedSessions(six), 5);
  assert.deepEqual(planSession({ ...base, now: started + 3 * HOUR, sessions: six, lastOutcome: 'completed' }), { end: deadline, kind: 'continuation' });
  assert.equal(planSession({ ...base, now: started + 3 * HOUR, sessions: [...six, seat('completed')], lastOutcome: 'completed' }), null);
  assert.equal(countedSessions([seat('seat-limit'), seat('timed-out')]), 1);
  assert.equal(countedSessions(4), 4);
  // A history of one host death is still a resume, not a fresh full session.
  assert.deepEqual(planSession({ ...base, now: started + HOUR, sessions: [seat('interrupted')], lastOutcome: 'interrupted' }), { end: deadline, kind: 'resume' });
  const done = planSessionWhy({ ...base, now: started + 2 * HOUR, sessions: [seat('completed')], lastOutcome: 'completed', declaredDone: 'the atlas is complete' });
  assert.equal(done.plan, null);
  assert.match(done.reason, /declared the entry done: the atlas is complete/);
  assert.match(planSessionWhy({ ...base, now: started + 2 * HOUR, sessions: 1, lastOutcome: 'completed', declaredDone: true }).reason, /declared the entry done$/);
  // Unsaid done: e3's sessions 5-8 of the first run each ended in 1-4 min.
  const quick = [{ outcome: 'completed', wall_s: 13260 }, { outcome: 'completed', wall_s: 60 }, { outcome: 'completed', wall_s: 240 }];
  assert.match(planSessionWhy({ ...base, now: started + 4 * HOUR, sessions: quick, lastOutcome: 'completed' }).reason, /two sessions in a row within 5 min/);
  assert.ok(planSession({ ...base, now: started + 4 * HOUR, sessions: [quick[0], quick[1]], lastOutcome: 'completed' }), 'one quick session is not a pattern');
  assert.ok(planSession({ ...base, now: started + 4 * HOUR, sessions: [quick[1], { outcome: 'errored', wall_s: 30 }], lastOutcome: 'errored' }), 'an errored quick session is a resume');
});

test('preflight: memory sized to the field, the reaper note, agy effort as it runs', () => {
  const GB = 1024 ** 3;
  const short = ramCheck({ freeBytes: 5.7 * GB, totalBytes: 63 * GB, entries: 3 });
  assert.equal(short.ok, false);
  assert.equal(short.needGb, 13);
  assert.match(short.line, /free RAM 5\.7 of 63 GB; 3 entries x 3 GB \+ 4 GB reserve = 13 GB/);
  assert.equal(ramCheck({ freeBytes: 30 * GB, totalBytes: 63 * GB, entries: 4 }).ok, true);
  assert.match(ramCheck({ freeBytes: GB, totalBytes: 8 * GB, entries: 1, perEntryGb: 2, reserveGb: 1 }).line, /1 entry x 2 GB/);
  assert.equal(reaperNote({}), null);
  assert.equal(reaperNote({ CLAUDECODE: '1', CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP: '1' }), null);
  assert.match(reaperNote({ CLAUDECODE: '1' }), /CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP=1/);
  assert.equal(effectiveSpec('agy:gemini-4-argon@xhigh'), 'agy:gemini-4-argon@high');
  assert.equal(effectiveSpec('agy:gemini-4-argon@max#b'), 'agy:gemini-4-argon@high#b');
  assert.equal(effectiveSpec('agy:gemini-3.8-flash-medium@xhigh'), 'agy:gemini-3.8-flash-medium@medium');
  assert.equal(effectiveSpec('agy:gemini-4-argon@low'), 'agy:gemini-4-argon@low');
  assert.equal(effectiveSpec('claude:claude-opus-5-5@xhigh'), 'claude:claude-opus-5-5@xhigh');
});

test('state lock: one writer, a held lock waits then throws, a stale lock is broken', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hk-lock-'));
  try {
    const file = path.join(dir, 'hackathon.json');
    assert.equal(withFileLock(file, () => fs.existsSync(`${file}.lock`)), true);
    assert.equal(fs.existsSync(`${file}.lock`), false);
    assert.throws(() => withFileLock(file, () => { throw new Error('inner'); }), /inner/);
    assert.equal(fs.existsSync(`${file}.lock`), false, 'released after a throw');
    fs.writeFileSync(`${file}.lock`, '1 held');
    assert.throws(() => acquireLock(`${file}.lock`, { waitMs: 0, sleep: () => {} }), /held for/);
    const old = new Date(Date.now() - 60000);
    fs.utimesSync(`${file}.lock`, old, old);
    assert.equal(withFileLock(file, () => 'ran', { staleMs: 30000, waitMs: 0 }), 'ran');
    assert.equal(fs.existsSync(`${file}.lock`), false);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('verdict fusion: every entry gets a disposition; wrap keeps what the follow-up builds from', () => {
  const ids = ['e1', 'e2', 'e3', 'e4'];
  const ok = parseFusion('e1=base, e2=absorb,e3=defer,E4=Drop', ids);
  assert.deepEqual(ok.problems, []);
  assert.deepEqual(ok.dispositions, { e1: 'base', e2: 'absorb', e3: 'defer', e4: 'drop' });
  assert.equal(fusionBase(ok.dispositions), 'e1');
  const text = (t) => parseFusion(t, ids).problems.join('\n');
  assert.match(text('e1=base,e2=absorb,e3=defer'), /e4 has no disposition/);
  assert.match(text('e1=base,e2=base,e3=drop,e4=drop'), /more than one base/);
  assert.match(text('e1=keep,e2=absorb,e3=drop,e4=drop'), /disposition is one of/);
  assert.match(text('e1=defer,e2=drop,e3=drop,e4=drop'), /needs a base or an absorbed entry/);
  assert.match(text('e9=base'), /e9 is not an entry/);
  assert.match(text(''), /names no entry/);
  assert.deepEqual(parseFusion('e1=base,e1=drop,e2=drop,e3=drop,e4=drop', ids).dispositions, {});
  const state = { entries: { e1: { title: 'A' }, e2: { title: 'B' }, e3: { title: 'C' }, e4: { title: 'D' } }, winner: 'e1', dispositions: ok.dispositions };
  assert.deepEqual(wrapPlan(state), { remove: ['e3', 'e4'], keep: [{ eid: 'e1', why: 'base' }, { eid: 'e2', why: 'absorb' }] });
  assert.deepEqual(wrapPlan(state, { release: true }).remove, ids);
  assert.deepEqual(wrapPlan({ entries: state.entries, winner: 'e2' }), { remove: ['e1', 'e3', 'e4'], keep: [{ eid: 'e2', why: 'winner' }] });
  assert.deepEqual(wrapPlan({ entries: state.entries, closed: 'none' }).keep, []);
  assert.equal(verdictLabel(state), 'fusion: e1 base, e2 absorb, e3 defer, e4 drop');
  assert.equal(verdictLabel({ entries: state.entries, winner: 'e2', runner_up: 'e1' }), 'winner e2 B, runner-up e1');
  assert.equal(verdictLabel({ closed: 'nothing ran' }), 'closed: nothing ran');
  assert.equal(verdictLabel({}), 'undecided');
  const note = renderHackathonNote({ state: { ...STATE, winner: 'e1', runner_up: null, dispositions: { e1: 'base', e2: 'absorb' }, followup: '/spark audio-agent-studio' }, track: 'T', board: [], entries: [] });
  assert.match(note, /dispositions: \{e1: base, e2: absorb\}/);
  assert.match(note, /\*\*Fusion:\*\*.*next: \/spark audio-agent-studio/);
  assert.match(note, /- \*\*absorb\*\* e2 - Two - built by/);
});

test('pick advice: more picks than seats are steered to packs', () => {
  assert.equal(pickAdvice(3, 2), null);
  assert.equal(pickAdvice(12, 4).refuse, true);
  assert.match(pickAdvice(12, 4).message, /shortlist --packs/);
  assert.equal(pickAdvice(5, 6).refuse, false);
  assert.match(pickAdvice(5, 6).message, /consider packs/);
  assert.equal(pickAdvice(1, 2).refuse, false);
});
