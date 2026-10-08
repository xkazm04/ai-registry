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
import { parseParticipant, parseParticipants, engineCommand, parseClaude, parseGrok, parseCodex, parseAgy, classifyOutcome } from '../scripts/lib/participants.mjs';
import { blindMap, scrubIdentity, materialPhrases, validateVerdict, aggregate, tallyPatterns, scoreboardMarkdown } from '../scripts/lib/judging.mjs';
import { upsertPatterns, readPatterns, upsertIndex, renderContestNote } from '../scripts/lib/vault.mjs';

test('participant spec parses to a stable filesystem-safe id', () => {
  const p = parseParticipant('claude:opus@xhigh');
  assert.equal(p.id, 'claude-opus_xhigh');
  assert.deepEqual([p.engine, p.model, p.effort, p.label], ['claude', 'opus', 'xhigh', null]);
  assert.equal(parseParticipant('codex:gpt-5.6-sol@high#b').id, 'codex-gpt-5.6-sol_high-b');
  assert.throws(() => parseParticipant('gemma:pro@high'), /unknown engine/);
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

test('agy: prompt as argument, stdin closed, effort clamped, status is the verdict', () => {
  const a = engineCommand(parseParticipant('agy:gemini-3.8-flash@xhigh'), 'agy.exe', 'READ ME');
  assert.ok(a.argv.includes('READ ME') && a.stdin === '');
  assert.equal(a.argv[a.argv.indexOf('--model') + 1], 'gemini-3.8-flash-high');
  assert.ok(!a.argv.includes('--effort'));
  assert.equal(engineCommand(parseParticipant('agy:gemini-3.8-flash-medium@medium'), 'agy', 'x').argv[4], 'gemini-3.8-flash-medium');
  assert.ok(a.argv.includes('--dangerously-skip-permissions'));
  const ok = parseAgy('{"status":"SUCCESS","response":"done","num_turns":4,"usage":{"total_tokens":9}}');
  assert.deepEqual([ok.final, ok.errors, ok.turns], ['done', [], 4]);
  const bad = parseAgy('{"status":"ERROR","error":"RESOURCE_EXHAUSTED 429 quota"}');
  assert.equal(classifyOutcome(bad, { exit: 0, timedOut: false }), 'seat-limit');
  assert.match(parseAgy('').errors[0], /no JSON envelope/);
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

test('identifiers the staged material uses survive blinding; a signature does not', () => {
  const data = ['| anthropic/opus@xhigh | 660 |', 'google/gemini-2.5-flash vs openrouter/google/gemini-2.5-flash; the claude engine'];
  const extra = ['claude-opus_xhigh', 'opus'];
  const protect = materialPhrases(data, extra);
  assert.ok(protect.includes('anthropic/opus@xhigh'));
  assert.ok(protect.includes('gemini-2.5-flash'), 'a path tail is protected too');
  assert.ok(!protect.includes('claude'), 'a bare vendor word is never protected');
  const r = scrubIdentity('660 verdicts carry anthropic/opus@xhigh and gemini-2.5-flash. Built by Claude Opus.', extra, protect);
  assert.equal(r.text, '660 verdicts carry anthropic/opus@xhigh and gemini-2.5-flash. Built by [redacted] [redacted].');
  assert.equal(r.count, 2);
  assert.equal(r.kept, 2);
  assert.deepEqual(scrubIdentity('Built by Claude.', extra), { text: 'Built by [redacted].', count: 1, kept: 0 }, 'no material means the old behaviour');
});

test('the router links blinded copies, marks eliminated variants and keeps them clickable', async () => {
  const { renderRouter, fileHref } = await import('../scripts/lib/router.mjs');
  assert.equal(fileHref(['C:', 'a b', 'x.html'].join(String.fromCharCode(92))), 'file:///C:/a%20b/x.html');
  const html = renderRouter({ title: 'T', contests: [{ id: 'c1', title: 'One', project: 'p', collected: true, reveal: 'collected', entries: [
    { letter: 'B', variants: [
      { n: 1, present: true, concept: 'Kept one', bytes: 2048, state: 'kept', href: 'file:///k.html', notesHref: 'file:///k.md', mastered: { concept: 'Kept one, mastered', href: 'file:///m.html', notesHref: 'file:///m.md' } },
      { n: 2, present: true, concept: 'Cut one', bytes: 1024, state: 'eliminated', href: 'file:///c.html', notesHref: 'file:///c.md' },
      { n: 3, present: false },
    ] },
  ] }, { id: 'c2', title: 'Two', collected: false }] });
  assert.match(html, /href="file:\/\/\/c\.html"/, 'an eliminated variant stays linked');
  assert.match(html, /class="card cut"/);
  assert.match(html, /mastered in reveal/);
  assert.match(html, /not delivered/);
  assert.match(html, /Not collected yet/);
  assert.match(html, /2 variant\(s\) across 2 contest\(s\), 1 eliminated in reveal/);
});

test('once the contest is decided, an eliminated variant keeps its name and loses its link', async () => {
  const { renderRouter } = await import('../scripts/lib/router.mjs');
  const html = renderRouter({ title: 'T', contests: [{ id: 'c', title: 'C', collected: true, closed: true, designHref: 'file:///d.md', reveal: 'collected', entries: [
    { letter: 'B', variants: [
      { n: 1, present: true, concept: 'Won', state: 'winner', href: 'file:///w.html', notesHref: 'file:///w.md', score: { mean: 7.5, spread: 1.2, rank: 1, of: 3 } },
      { n: 2, present: true, concept: 'Cut', state: 'eliminated', href: 'file:///c.html', notesHref: 'file:///c.md' },
    ] },
  ] }] });
  assert.doesNotMatch(html, /file:\/\/\/c\.html/, 'a decided contest no longer links its eliminated variants');
  assert.match(html, /contest decided/);
  assert.match(html, /final design/);
  assert.match(html, /panel 7\.50 &middot; #1 of 3/);
});


test('a combined decision closes the contest and marks every fused variant; a shortlist keeps it open', async () => {
  const { renderRouter } = await import('../scripts/lib/router.mjs');
  const v = (n, state) => ({ n, present: true, concept: `V${n}`, state, href: `file:///v${n}.html`, notesHref: `file:///v${n}.md` });
  const html = renderRouter({ title: 'T', contests: [
    { id: 'fused', title: 'F', collected: true, closed: true, reveal: 'collected', entries: [{ letter: 'A', variants: [v(1, 'combined'), v(2, 'eliminated')] }] },
    { id: 'open', title: 'O', collected: true, closed: false, reveal: 'collected', entries: [{ letter: 'B', variants: [v(1, 'shortlisted'), v(2, 'eliminated')] }] },
  ] });
  assert.match(html, /in the combined design/);
  assert.match(html, /shortlisted/);
  assert.match(html, /href="file:\/\/\/v2\.html"/, 'the open contest still links its eliminated variant');
});

test('plan hands seats to an outside dispatcher, and the other steps accept what it leaves behind', async () => {
  const { spawnSync } = await import('node:child_process');
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const script = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'contest.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'contest-plan-'));
  const cli = (...a) => {
    const r = spawnSync(process.execPath, [script, ...a, '--vault', path.join(root, 'vault')], { cwd: root, encoding: 'utf8' });
    assert.equal(r.status, 0, `${a[0]} failed: ${r.stderr}`);
    return r.stdout;
  };
  fs.writeFileSync(path.join(root, 'BRIEF.md'), 'A small idea.\n');
  cli('init', '--id', 'p1', '--title', 'Plan test', '--brief', 'BRIEF.md', '--participants', 'claude:opus@high,codex:gpt-x@high', '--variants', '1');
  const planned = JSON.parse(cli('plan', '--id', 'p1'));
  assert.equal(planned.kind, 'participants');
  assert.equal(planned.seats.length, 2);
  for (const s of planned.seats) {
    assert.ok(fs.existsSync(path.join(s.cwd, 'PARTICIPANT.md')), 'the seat cwd is the prepared workspace');
    assert.match(s.prompt, /PARTICIPANT\.md/);
    // The dispatcher's side of the contract: a variant, a record and a final message.
    fs.mkdirSync(path.join(s.cwd, 'variant-1'), { recursive: true });
    fs.writeFileSync(path.join(s.cwd, 'variant-1', 'index.html'), '<title>V</title>');
    fs.mkdirSync(s.log_dir, { recursive: true });
    fs.writeFileSync(path.join(s.log_dir, 'record.json'), JSON.stringify({ id: s.id, spec: s.spec, outcome: 'completed', wall_s: 60 }));
    fs.writeFileSync(path.join(s.log_dir, 'final.md'), 'done');
  }
  cli('collect', '--id', 'p1');
  const judges = JSON.parse(cli('plan', '--id', 'p1', '--kind', 'judges', '--judges', 'grok:grok-9@high,claude:fable@high'));
  assert.equal(judges.seats.length, 2);
  const [j, j2] = judges.seats;
  const arena = path.join(root, '.contest', 'arena', 'p1');
  const judging = path.join(arena, 'judging');
  const inside = (p, dir) => { const rel = path.relative(dir, p); return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel)); };
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true, recursive: true }).filter((f) => f.isFile()).map((f) => f.name);
  try {
    for (const s of judges.seats) {
      // Blind judging is structural, not a request: the judge's cwd is a staged copy outside the arena.
      assert.ok(!inside(s.cwd, arena), `the judge cwd ${s.cwd} must be outside the arena ${arena}`);
      assert.ok(inside(s.log_dir, arena), 'the host contract: log_dir stays inside the arena');
      assert.ok(fs.existsSync(path.join(s.cwd, `JUDGE-${s.id}.md`)), 'plan prepares the judge brief without spawning');
      assert.ok(fs.existsSync(path.join(s.cwd, 'entries', 'A', 'variant-1', 'index.html')), 'the staged copy holds the blinded entries');
      // Nothing that unblinds is reachable from the cwd or one level up.
      for (const d of [s.cwd, path.dirname(s.cwd)]) {
        const names = walk(d);
        for (const bad of ['blind-map.json', 'manifest.json', 'contest.json']) assert.ok(!names.includes(bad), `${bad} is reachable under ${d}`);
      }
    }
    assert.notEqual(j.cwd, j2.cwd, 'each judge gets its own workspace');
    const c = JSON.parse(fs.readFileSync(path.join(arena, 'contest.json'), 'utf8'));
    assert.deepEqual(c.judges, ['grok:grok-9@high', 'claude:fable@high']);
    assert.deepEqual(c.judge_workspaces, { [j.id]: j.cwd, [j2.id]: j2.cwd });
    const dims = { wow: 7, clarity: 7, wayfinding: 7, interaction: 7, craft: 7, concept: 7, utility: 7 };
    const verdictOf = (id) => ({ judge: id, entries: { A: { variants: [{ n: 1, scores: dims }] }, B: { variants: [{ n: 1, scores: dims }] } }, ranking: ['A/1', 'B/1'] });
    // One judge writes its verdict file where the brief says, in the staged cwd ...
    fs.writeFileSync(path.join(j.cwd, `verdict-${j.id}.json`), JSON.stringify(verdictOf(j.id)));
    // ... the other leaves it only in its final message, which aggregate still recovers.
    fs.mkdirSync(j2.log_dir, { recursive: true });
    fs.writeFileSync(path.join(j2.log_dir, 'final.md'), `Here it is:\n${JSON.stringify(verdictOf(j2.id))}`);
    cli('aggregate', '--id', 'p1', '--keep-workspaces');
    assert.ok(fs.existsSync(j.cwd) && fs.existsSync(j2.cwd), '--keep-workspaces leaves the staged copies');
    cli('aggregate', '--id', 'p1');
    for (const s of judges.seats) {
      assert.ok(fs.existsSync(path.join(judging, `verdict-${s.id}.json`)), `verdict-${s.id} lands in judging/`);
      assert.ok(!fs.existsSync(s.cwd), 'a harvested workspace is deleted');
    }
    const board = JSON.parse(fs.readFileSync(path.join(judging, 'scoreboard.json'), 'utf8'));
    assert.deepEqual(new Set(board.judges), new Set([j.id, j2.id]));
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(arena, 'contest.json'), 'utf8')).judge_workspaces, {});
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    for (const s of judges.seats) fs.rmSync(s.cwd, { recursive: true, force: true });
  }
});

test('presets: --landing brings the UI seats, owner review and the landing bar; a named option still wins', async () => {
  const { resolveInit, reviewLines, UI_DEFAULT_PARTICIPANTS } = await import('../scripts/lib/presets.mjs');
  const landing = resolveInit({ landing: true });
  assert.deepEqual([landing.preset, landing.participants, landing.variants, landing.timeout_min, landing.review, landing.bar],
    ['landing', UI_DEFAULT_PARTICIPANTS, 3, 90, 'owner', 'landing-bar.md']);
  assert.equal(landing.participantsDefaulted, true);
  const named = resolveInit({ landing: true, participants: 'claude:opus@xhigh', 'timeout-min': '45', review: 'panel' });
  assert.deepEqual([named.participants, named.timeout_min, named.review, named.participantsDefaulted], ['claude:opus@xhigh', 45, 'panel', false]);
  // No preset: the UI seats are the default roster, a panel decides, and there is no extra bar.
  const plain = resolveInit({});
  assert.deepEqual([plain.preset, plain.participants, plain.timeout_min, plain.review, plain.bar], [null, UI_DEFAULT_PARTICIPANTS, 60, 'panel', null]);
  assert.throws(() => resolveInit({ preset: 'poster' }), /unknown preset/);
  assert.throws(() => resolveInit({ review: 'crowd' }), /panel or owner/);
  assert.match(reviewLines('owner').review_line, /owner/);
  assert.match(reviewLines('panel').rubric_intro, /1 to 10/);
});

test('wrap: a family is decided only when its last round is, and the winner keeps its source', async () => {
  const { familyState, shotsFor, isRebuildable, extractById, upsertSection } = await import('../scripts/lib/wrap.mjs');
  const root = { id: 'x', shortlist: [{ label: 'A/1' }] };
  const r2 = { id: 'x-r2', parent: 'x' };
  const reveal = { id: 'x-reveal', parent: 'x', kind: 'reveal' };
  assert.deepEqual(familyState([{ c: root }, { c: r2 }, { c: reveal }]).open, ['x-r2'], 'a refinement round waiting on the owner keeps the family open');
  const won = familyState([{ c: root }, { c: { ...r2, winner: { label: 'B/1' } } }, { c: reveal }]);
  assert.equal(won.decided, true, 'a reveal is covered by its parent; the last round decides');
  assert.deepEqual(won.keep, [{ id: 'x-r2', key: 'B/1', why: 'winner' }]);
  assert.deepEqual(familyState([{ c: { id: 'm', winner: { label: 'C/2' } } }, { c: { id: 'm-reveal', parent: 'm', kind: 'reveal' } }]).keep,
    [{ id: 'm', key: 'C/2', why: 'winner' }, { id: 'm-reveal', key: 'C/2', why: 'winner (mastered)' }], 'the winner\'s mastered version keeps its source too');
  assert.equal(familyState([{ c: { id: 'y', winner: 'A/2' } }, { c: { id: 'y-r2', parent: 'y' } }]).decided, false, 'a round opened after a winner is still pending');
  assert.equal(familyState([{ c: { id: 'z', closed: { reason: 'not grounded' } } }]).decided, true, 'closed with no winner is a decision');
  assert.deepEqual(familyState([{ c: { id: 'k', combined: ['A/2', { label: 'B/3' }] } }]).keep.map((k) => k.key), ['A/2', 'B/3']);

  assert.deepEqual(shotsFor(['visual/A-1-1280x800-load.png', 'visual/A-10-1280x800-load.png', 'keyboard/A-1-2-help.png', 'visual/A-1-notes.md', 'B-1-load.png'], 'A', 1),
    ['visual/A-1-1280x800-load.png', 'keyboard/A-1-2-help.png'], 'A/1 is not A/10, and only images count');
  assert.ok(isRebuildable('node_modules', []));
  assert.ok(!isRebuildable('build', ['index.html']), 'a variant\'s own build/ is content, not output');
  assert.ok(isRebuildable('dist', ['package.json', 'src']));
  assert.ok(isRebuildable('Library', ['Assets', 'ProjectSettings']) && !isRebuildable('Library', ['index.html']));

  const html = '<main><section id="reveal"><h2>Why this design</h2><table><tr><th>Axis</th><th>Mine</th></tr><tr><td>Wow</td><td>Depth &amp; motion</td></tr></table><section><p>Nested</p></section><p>Cut B/2: too dense.</p></section><footer>not this</footer></main>';
  const why = extractById(html, 'reveal');
  assert.match(why, /### Why this design/);
  assert.match(why, /\| Wow \| Depth & motion \|/);
  assert.match(why, /Cut B\/2: too dense\./, 'the matcher counts nested sections');
  assert.doesNotMatch(why, /not this/);
  assert.equal(extractById('<p>none</p>', 'reveal'), null);
  const { pageText } = await import('../scripts/lib/wrap.mjs');
  const report = pageText('<html><head><title>Faultline</title><style>p{}</style></head><body><h1>The bet</h1><p>Three callers in 35 days.</p><svg><text>axis</text></svg><script>x()</script></body></html>');
  assert.equal(report, '# Faultline\n\n## The bet\n\nThree callers in 35 days.', 'a report keeps its words and drops markup, script and drawing text');

  const note = '# C\n\n## Decision\n\nB won.\n\n## Wrapped\n\nold\n\n## Patterns\n\np\n';
  const once = upsertSection(note, 'Wrapped', 'new');
  assert.match(once, /## Wrapped\n\nnew\n\n## Patterns/);
  assert.doesNotMatch(once, /old/);
  assert.equal(upsertSection(once, 'Wrapped', 'new'), once, 'idempotent');
  assert.match(upsertSection('# C\n', 'Wrapped', 'x'), /# C\n\n## Wrapped\n\nx\n$/);
});

test('wrap archives notes and screenshots, keeps the winner, removes the rest, and never follows a junction', async () => {
  const { spawnSync } = await import('node:child_process');
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const script = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'contest.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'contest-wrap-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'contest-wrap-outside-'));
  const run = (...a) => spawnSync(process.execPath, [script, ...a, '--vault', path.join(root, 'vault')], { cwd: root, encoding: 'utf8' });
  const cli = (...a) => { const r = run(...a); assert.equal(r.status, 0, `${a[0]} failed: ${r.stderr}`); return r.stdout; };
  try {
    fs.writeFileSync(path.join(root, 'BRIEF.md'), 'A small idea.\n');
    fs.mkdirSync(path.join(root, 'stage'));
    fs.writeFileSync(path.join(root, 'stage', 'SCHEMA.md'), '# schema\n');
    fs.writeFileSync(path.join(root, 'stage', 'big.json'), '{}');
    cli('init', '--id', 'w1', '--title', 'Wrap test', '--brief', 'BRIEF.md', '--participants', 'claude:opus@high,codex:gpt-x@high', '--variants', '2', '--data', 'stage');
    const arena = path.join(root, '.contest', 'arena', 'w1');
    fs.writeFileSync(path.join(outside, 'sentinel.txt'), 'must survive');
    for (const s of JSON.parse(cli('plan', '--id', 'w1')).seats) {
      for (const n of [1, 2]) {
        const v = path.join(s.cwd, `variant-${n}`);
        fs.mkdirSync(v, { recursive: true });
        fs.writeFileSync(path.join(v, 'index.html'), `<title>V${n}</title><body><h2>Argument ${n}</h2><p>Why it holds.</p></body>`);
        fs.writeFileSync(path.join(v, 'NOTES.md'), `# Concept ${n}\n`);
        fs.symlinkSync(outside, path.join(v, 'node_modules'), 'junction');
      }
      fs.mkdirSync(path.join(s.cwd, 'spike', 'deep'), { recursive: true });
      fs.writeFileSync(path.join(s.cwd, 'spike', 'deep', 'blob.bin'), Buffer.alloc(4096));
      fs.mkdirSync(s.log_dir, { recursive: true });
      fs.writeFileSync(path.join(s.log_dir, 'record.json'), JSON.stringify({ id: s.id, spec: s.spec, outcome: 'completed', wall_s: 60 }));
      fs.writeFileSync(path.join(s.log_dir, 'final.md'), 'done');
    }
    cli('collect', '--id', 'w1');
    const blind = JSON.parse(fs.readFileSync(path.join(arena, 'runs', 'blind-map.json'), 'utf8'));
    const visual = path.join(arena, 'runs', 'visual');
    fs.mkdirSync(visual, { recursive: true });
    for (const l of Object.keys(blind)) for (const n of [1, 2]) if (!(l === 'B' && n === 2)) fs.writeFileSync(path.join(visual, `${l}-${n}-1280x800-load.png`), 'png');
    fs.writeFileSync(path.join(visual, 'A-2-1280x800-probe.png'), 'png');   // the probe frame often is the load frame again
    fs.writeFileSync(path.join(visual, 'A-2-1920x1080-load.png'), 'png-wide');
    fs.writeFileSync(path.join(visual, 'A-2-text.txt'), 'Words the script rendered.');

    const undecided = run('wrap', '--id', 'w1', '--apply');
    assert.equal(undecided.status, 3, 'an undecided contest is left alone');
    assert.match(undecided.stdout, /undecided/);

    cli('verdict', '--id', 'w1', '--winner', 'A/1', '--note', 'owner picked A/1');
    const dry = cli('wrap', '--id', 'w1');
    assert.match(dry, /\[dry run\]/);
    assert.ok(fs.existsSync(path.join(arena, 'entries', blind.A, 'variant-2', 'index.html')), 'a dry run changes nothing');

    const out = cli('wrap', '--id', 'w1', '--apply', '--lessons', 'Depth beat density.');
    assert.match(out, /NO SCREENSHOT, source kept: B\/2/);
    const ws = (l, ...p) => path.join(arena, 'entries', blind[l], ...p);
    assert.ok(fs.existsSync(ws('A', 'variant-1', 'index.html')), 'the winner keeps its source');
    assert.ok(fs.existsSync(ws('A', 'data', 'SCHEMA.md')), 'the winner\'s seat keeps the data it loads');
    assert.ok(!fs.existsSync(ws('A', 'variant-2')), 'a screenshotted loser goes');
    assert.ok(fs.existsSync(ws('B', 'variant-2', 'index.html')), 'a variant with no screenshot keeps its source');
    assert.ok(!fs.existsSync(ws('B', 'variant-1')) && !fs.existsSync(ws('B', 'spike')), 'a losing seat\'s variants and strays go');
    assert.ok(fs.existsSync(ws('B', 'PARTICIPANT.md')), 'the brief each seat read stays');
    assert.ok(fs.existsSync(path.join(outside, 'sentinel.txt')), 'a junction is unlinked, never entered');
    assert.ok(fs.existsSync(path.join(arena, 'archive', 'A-2', 'NOTES.md')) && fs.existsSync(path.join(arena, 'archive', 'A-2', 'shots', 'A-2-1280x800-load.png')));
    assert.ok(!fs.existsSync(path.join(visual, 'A-2-1280x800-load.png')), 'screenshots move into the archive');
    assert.deepEqual(fs.readdirSync(path.join(arena, 'archive', 'A-2', 'shots')).sort(), ['A-2-1280x800-load.png', 'A-2-1920x1080-load.png'], 'a byte-identical probe frame is dropped, the load frame kept');
    assert.match(fs.readFileSync(path.join(arena, 'archive', 'A-2', 'rendered-text.md'), 'utf8'), /Words the script rendered\./, 'the visual pass\'s live text is archived');
    assert.ok(!fs.existsSync(path.join(visual, 'A-2-text.txt')));
    assert.match(fs.readFileSync(path.join(arena, 'archive', 'A-2', 'page-text.md'), 'utf8'), /### Argument 2\n\nWhy it holds\./, 'the page\'s words outlive its source');
    assert.match(fs.readFileSync(path.join(arena, 'gallery.html'), 'utf8'), /archive\/A-2\/page-text\.md/);
    assert.ok(fs.existsSync(path.join(arena, 'data', 'SCHEMA.md')) && !fs.existsSync(path.join(arena, 'data', 'big.json')));
    assert.ok(fs.existsSync(path.join(arena, 'runs', blind.A, 'record.json')) && fs.existsSync(path.join(arena, 'runs', blind.A, 'final.md')));
    assert.ok(fs.existsSync(path.join(arena, 'judging', 'entries', 'B', 'variant-2')), 'the unscreenshotted blinded copy stays for the visual pass');
    const c = JSON.parse(fs.readFileSync(path.join(arena, 'contest.json'), 'utf8'));
    assert.deepEqual([c.wrapped.kept, c.wrapped.missing_shots, c.wrapped.archived], [['A/1'], ['B/2'], 4]);
    const wrapMd = fs.readFileSync(path.join(arena, 'WRAP.md'), 'utf8');
    assert.match(wrapMd, /## Lessons\n\nDepth beat density\./);
    assert.match(wrapMd, /\d\. winner A\/1\. /, 'the decision line reads once, with one full stop');
    assert.match(fs.readFileSync(path.join(arena, 'gallery.html'), 'utf8'), /archive\/A-2\/shots\/A-2-1280x800-load\.png/);
    assert.match(fs.readFileSync(path.join(root, 'vault', 'Contest', 'contests', 'w1.md'), 'utf8'), /## Wrapped\n\nWrapped \d{4}-\d\d-\d\d/);
    assert.match(fs.readFileSync(path.join(root, 'vault', 'Contest', 'router.html'), 'utf8'), /archive\/A-2\/shots/, 'the router links the screenshot once the source is gone');

    const blocked = run('collect', '--id', 'w1');
    assert.notEqual(blocked.status, 0, 'a wrapped contest refuses steps that need implementations');
    assert.match(blocked.stderr, /wrapped/);

    // The visual pass fills the gap; the second wrap finishes the job.
    fs.writeFileSync(path.join(visual, 'B-2-1280x800-load.png'), 'png');
    cli('wrap', '--id', 'w1', '--apply');
    assert.ok(!fs.existsSync(ws('B', 'variant-2')) && !fs.existsSync(path.join(arena, 'judging', 'entries')));
    assert.ok(fs.existsSync(path.join(arena, 'archive', 'A-2', 'NOTES.md')), 'a second wrap keeps what the first archived');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
});
