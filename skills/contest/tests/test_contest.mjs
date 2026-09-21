// Deterministic tests for the pure half of scripts/contest.mjs: `node --test skills/contest/tests`.
// Builtins only; nothing here spawns a CLI or touches the arena.
//
// What is worth pinning is the three promises the method makes and a reader could not
// re-derive from the code without running a contest: (1) a spec parses to a stable id so a
// rerun lands in the same workspace, (2) blinding is deterministic per contest and scrubs
// every family name, (3) a broken variant never outranks an intact one and a missing score
// is a validation problem, not a zero.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseParticipant, parseParticipants, engineCommand, parseClaude, parseGrok, parseCodex, classifyOutcome } from '../scripts/lib/participants.mjs';
import { blindMap, scrubIdentity, validateVerdict, aggregate, tallyPatterns, scoreboardMarkdown } from '../scripts/lib/judging.mjs';
import { upsertPatterns, readPatterns, upsertIndex, renderContestNote } from '../scripts/lib/vault.mjs';

test('participant spec parses to a stable filesystem-safe id', () => {
  const p = parseParticipant('claude:opus@xhigh');
  assert.equal(p.id, 'claude-opus_xhigh');
  assert.deepEqual([p.engine, p.model, p.effort, p.label], ['claude', 'opus', 'xhigh', null]);
  assert.equal(parseParticipant('codex:gpt-5.6-sol@high#b').id, 'codex-gpt-5.6-sol_high-b');
  assert.throws(() => parseParticipant('gemini:pro@high'), /unknown engine/);
  assert.throws(() => parseParticipant('claude:opus@ultra'), /unknown effort/);
  assert.throws(() => parseParticipants('claude:opus@high,claude:opus@high'), /#label/);
});

test('engine commands: grok takes the prompt as an argument, the others on stdin', () => {
  const grok = engineCommand(parseParticipant('grok:grok-4.6@high'), 'grok.exe', 'READ ME', { workspace: '.' });
  assert.ok(grok.argv.includes('READ ME') && grok.stdin === '');
  assert.equal(grok.env.GROK_MEMORY, '0');
  const claude = engineCommand(parseParticipant('claude:fable@high'), 'claude.exe', 'READ ME');
  assert.ok(!claude.argv.includes('READ ME') && claude.stdin === 'READ ME');
  assert.ok(claude.argv.includes('--no-session-persistence'));
  const codex = engineCommand(parseParticipant('codex:gpt-5.6-sol@high'), ['node', 'codex.js'], 'READ ME');
  assert.deepEqual(codex.argv.slice(0, 3), ['node', 'codex.js', 'exec']);
  assert.ok(codex.argv.includes('model_reasoning_effort="high"'));
});

test('envelopes: a refusal or a bad stop reason is an error, not a result', () => {
  const ok = parseClaude('{"result":"done","subtype":"success","is_error":false,"total_cost_usd":1.5,"num_turns":3,"usage":{}}');
  assert.deepEqual([ok.final, ok.errors, ok.cost_usd, ok.turns], ['done', [], 1.5, 3]);
  const refused = parseClaude('{"result":"I cannot help with that","subtype":"success","is_error":true}');
  assert.match(refused.errors[0], /cannot help/);
  const grok = parseGrok('banner line\n{"text":"hi","stopReason":"max_tokens","usage":{}}');
  assert.match(grok.errors[0], /^max_tokens/);
  const codex = parseCodex(['{"type":"item.completed","item":{"type":"agent_message","text":"first"}}',
    '{"type":"turn.completed","usage":{"input_tokens":5}}', 'not json',
    '{"type":"item.completed","item":{"type":"agent_message","text":"last"}}'].join('\n'));
  assert.deepEqual([codex.final, codex.turns, codex.usage.input_tokens], ['last', 1, 5]);
  assert.equal(classifyOutcome({ errors: ['usage limit reached'] }, { exit: 0, timedOut: false }), 'seat-limit');
  assert.equal(classifyOutcome({ errors: [] }, { exit: 0, timedOut: true }), 'timed-out');
  assert.equal(classifyOutcome({ errors: [] }, { exit: 0, timedOut: false }), 'completed');
});

test('blinding is deterministic per contest and depends on the seed', () => {
  const ids = ['claude-opus_xhigh', 'grok-grok-4.6_high', 'claude-fable_high'];
  const a = blindMap(ids, 'skill-tree');
  assert.deepEqual(a, blindMap([...ids].reverse(), 'skill-tree'));
  assert.deepEqual(Object.keys(a), ['A', 'B', 'C']);
  assert.deepEqual(new Set(Object.values(a)), new Set(ids));
  const seeds = ['s1', 's2', 's3', 's4', 's5', 's6'].map((s) => JSON.stringify(blindMap(ids, s)));
  assert.ok(new Set(seeds).size > 1, 'the seed must matter');
});

test('identity scrub redacts vendors, models and the contest-specific words', () => {
  const { text, count } = scrubIdentity('Built by Claude Opus with GPT-5 ideas; grok-4.6 helped. Nothing about geckos.', ['grok-4.6']);
  assert.equal(count, 4);
  assert.ok(!/claude|opus|gpt|grok|4\.6/i.test(text));
  assert.match(text, /geckos/);
});

test('verdict validation reports a missing variant and an out-of-range score', () => {
  const v = { entries: { A: { variants: [{ n: 1, scores: { wow: 11, clarity: 5, wayfinding: 5, interaction: 5, craft: 5, concept: 5 } }] } }, ranking: ['A/1'] };
  const problems = validateVerdict(v, { A: 2, B: 1 });
  assert.ok(problems.some((p) => /A\/1: wow/.test(p)));
  assert.ok(problems.some((p) => /A\/2: not scored/.test(p)));
  assert.ok(problems.some((p) => /entry B: missing/.test(p)));
});

test('aggregation: means across judges, spread, and broken sinks below intact', () => {
  const s = (x) => ({ wow: x, clarity: x, wayfinding: x, interaction: x, craft: x, concept: x });
  const j1 = { judge: 'j1', entries: { A: { variants: [{ n: 1, scores: s(8) }, { n: 2, scores: s(9), broken: false }] }, B: { variants: [{ n: 1, scores: s(10) }] } }, patterns: [{ statement: 'Progressive disclosure by zoom level', variants: ['A/2'] }] };
  const j2 = { judge: 'j2', entries: { A: { variants: [{ n: 1, scores: s(6) }, { n: 2, scores: s(7) }] }, B: { variants: [{ n: 1, broken: true }] } }, patterns: ['progressive disclosure by zoom level.'] };
  const rows = aggregate([j1, j2]);
  assert.deepEqual(rows.map((r) => r.key), ['A/2', 'A/1', 'B/1']);
  assert.equal(rows[0].mean, 8);
  assert.equal(rows[0].spread, 2);
  assert.deepEqual(rows[2].broken_by, ['j2']);
  const tally = tallyPatterns([j1, j2]);
  assert.equal(tally.length, 1, 'near-duplicate statements merge by their first words');
  assert.deepEqual(tally[0].judges, ['j1', 'j2']);
  const md = scoreboardMarkdown(rows, { A: 'p1', B: 'p2' }, { p1: { spec: 'claude:opus@xhigh' } });
  assert.match(md, /\| 1 \| A\/2 \| claude:opus@xhigh \| 8 \| 2 \|/);
});

test('the pattern ledger counts wins and sightings and never duplicates a slug', () => {
  let text = upsertPatterns(null, 'c1', [{ slug: 'zoom-as-disclosure', statement: 'Zoom level decides what is drawn.', evidence: 'A/2 drew subjects only past 40%', winner: true }]);
  text = upsertPatterns(text, 'c2', [{ slug: 'zoom-as-disclosure', statement: 'ignored on update', evidence: 'seen again', winner: false }]);
  text = upsertPatterns(text, 'c2', [{ slug: 'zoom-as-disclosure', statement: 'ignored twice', evidence: 'seen again', winner: false }]);
  const rows = readPatterns(text);
  assert.equal(rows.length, 1);
  assert.deepEqual([rows[0].wins, rows[0].seen, rows[0].statement], [1, 2, 'Zoom level decides what is drawn.']);
  assert.equal((text.match(/- c2:/g) ?? []).length, 1);
});

test('the contest index upserts its row and the note renders its frontmatter', () => {
  const row = { id: 'skill-tree', title: 'Skill tree', date: '2026-09-17', project: 'x', winner: 'B/2 Constellation', winnerSeat: 'grok:grok-4.6@high', participants: 3 };
  const once = upsertIndex(null, row);
  const twice = upsertIndex(once, { ...row, winner: 'A/1 Atlas' });
  assert.equal((twice.match(/skill-tree/g) ?? []).length, 1);
  assert.match(twice, /Atlas/);
  const note = renderContestNote({ id: 'skill-tree', title: 'Skill tree', date: '2026-09-17', project: 'x', brief: 'idea', participants: [{ spec: 'a:b@high' }], scoreboard: '| t |', winner: { label: 'B/2', spec: 'a:b@high', concept: 'Constellation' }, runnerUp: null, judges: ['j'], patterns: [{ slug: 'p', statement: 's' }], antiPatterns: [], decision: 'because', costs: '' });
  assert.match(note, /^---\ncontest: "skill-tree"/);
  assert.match(note, /winner_seat: "a:b@high"/);
  assert.match(note, /\[\[Patterns#p\|p\]\]/);
});
