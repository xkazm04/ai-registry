// The publications lane gate: one positive (the fixture is clean) and at least one
// negative per mechanical rule, each built by mutating a copy of the known-good fixture
// so a failure names exactly one cause. The critique rules mutate a second fixture
// (fixture-critique) that carries the optional block and critique/ directory; both
// fixtures must stay clean. Plus the CLI contract: exit codes, the lane row in gate.mjs,
// and the index builder's freshness check and critique selector.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  validatePublication, selfTest, firstPersonHits, markdownProse, htmlProse,
} from '../check-publications.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const FIXTURE = path.join(root, 'scripts/fixtures/publications/fixture-post');
const CRITIQUE_FIXTURE = path.join(root, 'scripts/fixtures/publications/fixture-critique');
const temp = fs.realpathSync(os.tmpdir());

function scratch(t) {
  const dir = fs.mkdtempSync(path.join(temp, 'registry-publications-test-'));
  t.after(() => {
    const rel = path.relative(temp, fs.realpathSync(dir));
    if (!rel.startsWith('registry-publications-test-') || rel.includes(path.sep) || path.isAbsolute(rel)) throw new Error('unsafe fixture cleanup');
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return dir;
}

/** Copy the fixture as <lane>/fixture-post, apply `mutate(dir)`, return the findings. */
function run(t, mutate = () => {}, name = 'fixture-post') {
  const lane = scratch(t);
  const dir = path.join(lane, name);
  fs.cpSync(FIXTURE, dir, { recursive: true });
  mutate(dir);
  return validatePublication(dir, name);
}
const rulesOf = (r) => [...new Set(r.findings.map((f) => f.rule))].sort();
const edit = (dir, file, fn) => {
  const p = path.join(dir, file);
  fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8')));
};
const editJson = (dir, fn) => edit(dir, 'publication.json', (s) => {
  const o = JSON.parse(s);
  fn(o);
  return JSON.stringify(o, null, 2);
});
const failsOnly = (t, rule, mutate, name) => {
  const r = run(t, mutate, name);
  assert.deepEqual(rulesOf(r), [rule], JSON.stringify(r.findings, null, 1));
  return r;
};

test('the detectors pass their own planted cases', () => {
  assert.deepEqual(selfTest(), []);
});

test('the fixture is clean', (t) => {
  const r = run(t);
  assert.deepEqual(r.findings, []);
  assert.deepEqual(r.warnings, []);
});

// ---- shape
test('shape: a missing required file fails', (t) => {
  failsOnly(t, 'shape', (d) => fs.rmSync(path.join(d, 'medium/tags.txt')));
});
test('shape: a file outside the fixed shape fails', (t) => {
  failsOnly(t, 'shape', (d) => fs.writeFileSync(path.join(d, 'notes.txt'), 'stray\n'));
});
test('shape: more than five Medium tags fails', (t) => {
  failsOnly(t, 'shape', (d) => fs.writeFileSync(path.join(d, 'medium/tags.txt'), 'a\nb\nc\nd\ne\nf\n'));
});

// ---- the Medium figures: the lane is text-only. Figures are canonical as SVG; the PNG
// renders story.html names are derived and live outside the registry. The fixtures carry
// no PNG, so the clean-fixture tests above already prove a render is never required.
const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const putRender = (d, name) => {
  fs.mkdirSync(path.join(d, 'medium/figures'), { recursive: true });
  fs.writeFileSync(path.join(d, 'medium/figures', name), PNG_BYTES);
};
test('medium figures: a story PNG reference whose SVG is listed passes with no PNG present', (t) => {
  const r = run(t, (d) => {
    assert.match(fs.readFileSync(path.join(d, 'medium/story.html'), 'utf8'), /<img src="figures\/01-example-chart\.png"/);
    assert.equal(fs.existsSync(path.join(d, 'medium/figures/01-example-chart.png')), false);
  });
  assert.deepEqual(r.findings, []);
});
test('medium figures: a publication with no medium/figures/ directory at all passes', (t) => {
  for (const fixture of ['fixture-post', 'fixture-critique']) {
    const src = fixture === 'fixture-post' ? FIXTURE : CRITIQUE_FIXTURE;
    const dir = path.join(scratch(t), fixture);
    fs.cpSync(src, dir, { recursive: true });
    fs.rmSync(path.join(dir, 'medium/figures'), { recursive: true, force: true });
    assert.equal(fs.existsSync(path.join(dir, 'medium/figures')), false);
    assert.deepEqual(validatePublication(dir, fixture).findings, [], fixture);
  }
});
test('medium figures: a present render of a listed figure passes', (t) => {
  const r = run(t, (d) => putRender(d, '01-example-chart.png'));
  assert.deepEqual(r.findings, []);
});
test('medium figures: a story PNG reference whose SVG is not listed fails', (t) => {
  const r = failsOnly(t, 'shape', (d) => edit(d, 'medium/story.html', (s) => s.replace('src="figures/01-example-chart.png"', 'src="figures/02-unlisted-chart.png"')));
  assert.match(r.findings[0].message, /does not list/);
});
test('medium figures: a story PNG reference fails even when its unlisted render is present', (t) => {
  failsOnly(t, 'shape', (d) => {
    putRender(d, '01-example-chart.png');
    edit(d, 'medium/story.html', (s) => s.replace('src="figures/01-example-chart.png"', 'src="figures/02-unlisted-chart.png"'));
    putRender(d, '02-unlisted-chart.png');
  });
});
test('medium figures: any other relative or absolute img src fails', (t) => {
  for (const src of ['figures/01-example-chart.svg', '../figures/01-example-chart.svg', 'img/01-example-chart.png',
    '/figures/01-example-chart.png', 'data:image/png;base64,iVBORw0KGgo=']) {
    failsOnly(t, 'shape', (d) => edit(d, 'medium/story.html', (s) => s.replace('src="figures/01-example-chart.png"', `src="${src}"`)));
  }
});
test('medium figures: a network img src in the story still fails', (t) => {
  for (const src of ['https://cdn.example.org/01-example-chart.png', '//cdn.example.org/01-example-chart.png']) {
    failsOnly(t, 'self-contained', (d) => edit(d, 'medium/story.html', (s) => s.replace('src="figures/01-example-chart.png"', `src="${src}"`)));
  }
});
test('medium figures: a medium/figures/ PNG whose SVG is not listed fails', (t) => {
  const r = failsOnly(t, 'shape', (d) => putRender(d, '02-unlisted-chart.png'));
  assert.equal(r.findings[0].file, 'medium/figures/02-unlisted-chart.png');
});
test('medium figures: a misnamed file in medium/figures/ fails', (t) => {
  failsOnly(t, 'shape', (d) => putRender(d, 'Example Chart.png'));
});

// ---- schema
test('schema: a wrong schema id fails', (t) => {
  failsOnly(t, 'schema', (d) => editJson(d, (o) => { o.schema = 'publication/2'; }));
});
test('schema: null is never a value - absent keys are omitted', (t) => {
  failsOnly(t, 'schema', (d) => editJson(d, (o) => { o.run.costUsd = null; }));
});
test('schema: an unknown key fails', (t) => {
  failsOnly(t, 'schema', (d) => editJson(d, (o) => { o.author = 'someone'; }));
});
test('schema: a status other than approved fails', (t) => {
  failsOnly(t, 'schema', (d) => editJson(d, (o) => { o.status = 'draft'; }));
});
test('schema: a subject topic needs its bundle and subject', (t) => {
  failsOnly(t, 'schema', (d) => editJson(d, (o) => { o.topic.kind = 'subject'; }));
});
test('schema: a check value is pass or fail', (t) => {
  failsOnly(t, 'schema', (d) => editJson(d, (o) => { o.check.citations = 'ok'; }));
});
test('schema: costUsd, when present, is a non-negative number', (t) => {
  failsOnly(t, 'schema', (d) => editJson(d, (o) => { o.run.costUsd = -1; }));
  const r = run(t, (d) => editJson(d, (o) => { o.run.costUsd = 1.25; }));
  assert.deepEqual(r.findings, []);
});

// ---- slug
test('slug: the field must match the directory', (t) => {
  failsOnly(t, 'slug', (d) => editJson(d, (o) => { o.slug = 'another-post'; }));
});
test('slug: the directory must be kebab-case', (t) => {
  failsOnly(t, 'slug', (d) => editJson(d, (o) => { o.slug = 'Fixture_Post'; }), 'Fixture_Post');
});

// ---- citations
test('citations: an unresolved [n] in post.md fails', (t) => {
  failsOnly(t, 'citations', (d) => edit(d, 'post.md', (s) => s.replace('one fact [1]', 'one fact [9]')));
});
test('citations: an unresolved [n] in post.html fails', (t) => {
  failsOnly(t, 'citations', (d) => edit(d, 'post.html', (s) => s.replace('[8]</a>', '[42]</a>')));
});
test('citations: a grouped citation fails', (t) => {
  failsOnly(t, 'citations', (d) => edit(d, 'post.md', (s) => s.replace('[3] [4]', '[3, 4]')));
});
test('citations: a claim citing a missing source fails', (t) => {
  failsOnly(t, 'citations', (d) => editJson(d, (o) => { o.claims[0].source = 12; }));
});
test('citations: a [n] inside code is not a citation', (t) => {
  const r = run(t, (d) => edit(d, 'post.md', (s) => s.replace('items[0]', 'items[99]')));
  assert.deepEqual(r.findings, []);
});
test('citations: an uncited source is a warning, not a failure', (t) => {
  const r = run(t, (d) => edit(d, 'post.md', (s) => s.replace(' history [7]', ' history')));
  assert.deepEqual(r.findings, []);
  assert.equal(r.warnings.length, 1);
});

// ---- sources
test('sources: a source without a date fails', (t) => {
  failsOnly(t, 'sources', (d) => editJson(d, (o) => { delete o.sources[2].date; }));
});
test('sources: a malformed date fails', (t) => {
  failsOnly(t, 'sources', (d) => editJson(d, (o) => { o.sources[2].date = 'Oct 2025'; }));
});
test('sources: a malformed URL fails', (t) => {
  failsOnly(t, 'sources', (d) => editJson(d, (o) => { o.sources[0].url = 'SOURCES.md'; }));
});

// ---- source-mix
test('source-mix: fewer than eight sources fails', (t) => {
  failsOnly(t, 'source-mix', (d) => {
    editJson(d, (o) => { o.sources.splice(4, 1); o.sources.forEach((s, i) => { s.n = i + 1; }); o.claims[1].source = 7; });
    edit(d, 'post.md', (s) => s.replace(', and the eighth disagrees [8]', ''));
    edit(d, 'post.html', (s) => s.replace(/\[8\]/g, '[7]').replace('#r8', '#r7'));
    edit(d, 'medium/story.html', (s) => s.replace('[8]', '[7]'));
  });
});
test('source-mix: fewer than three primary sources fails', (t) => {
  failsOnly(t, 'source-mix', (d) => editJson(d, (o) => { o.sources.forEach((s, i) => { s.primary = i < 2; }); }));
});
test('source-mix: no counter source fails', (t) => {
  failsOnly(t, 'source-mix', (d) => editJson(d, (o) => { o.sources.forEach((s) => { s.counter = false; }); }));
});

// ---- figures
test('figures: a figure without a caption fails', (t) => {
  failsOnly(t, 'figures', (d) => editJson(d, (o) => { o.figures[0].caption = ' '; }));
});
test('figures: a figure without a source list fails', (t) => {
  failsOnly(t, 'figures', (d) => editJson(d, (o) => { o.figures[0].sources = []; }));
});
test('figures: an SVG nobody listed fails', (t) => {
  failsOnly(t, 'figures', (d) => fs.copyFileSync(path.join(d, 'figures/01-example-chart.svg'), path.join(d, 'figures/02-unlisted.svg')));
});

// ---- first-person
test('first-person: "we" in markdown prose fails', (t) => {
  failsOnly(t, 'first-person', (d) => edit(d, 'post.md', (s) => s.replace('The fixture states', 'Here we state')));
});
test('first-person: "I" and "our" in HTML prose fail', (t) => {
  const r = failsOnly(t, 'first-person', (d) => edit(d, 'post.html', (s) => s.replace('The fixture states', 'I think our fixture states')));
  assert.equal(r.findings.length, 2);
});
test('first-person: code, blockquotes and quotations are exempt', () => {
  assert.equal(firstPersonHits(markdownProse('> we said\n\nIt says “we use it”.\n\n```\nme = 1\n```\n')).length, 0);
  assert.equal(firstPersonHits(htmlProse('<p>It reads <q>we did</q> and <code>my_var</code>.</p><blockquote>our view</blockquote>')).length, 0);
  assert.equal(firstPersonHits(markdownProse('An I/O-bound loop and a Memo.')).length, 0);
  assert.equal(firstPersonHits(markdownProse('The tool, says me, works.')).length, 1);
});

// ---- self-contained
test('self-contained: an http(s) image src fails', (t) => {
  failsOnly(t, 'self-contained', (d) => edit(d, 'post.html', (s) => s.replace('src="figures/01-example-chart.svg"', 'src="https://cdn.example.org/a.svg"')));
});
test('self-contained: an external stylesheet fails', (t) => {
  failsOnly(t, 'self-contained', (d) => edit(d, 'post.html', (s) => s.replace('<title>', '<link rel="stylesheet" href="https://fonts.example.org/a.css"><title>')));
});
test('self-contained: an external script fails', (t) => {
  failsOnly(t, 'self-contained', (d) => edit(d, 'post.html', (s) => s.replace('<script>', '<script src="//cdn.example.org/x.js"></script><script>')));
});
test('self-contained: a CSS @import fails', (t) => {
  failsOnly(t, 'self-contained', (d) => edit(d, 'post.html', (s) => s.replace('<style>', '<style>@import url("https://fonts.example.org/b.css");')));
});
test('self-contained: a script in the Medium story fails', (t) => {
  failsOnly(t, 'self-contained', (d) => edit(d, 'medium/story.html', (s) => s.replace('</body>', '<script>1</script></body>')));
});
test('self-contained: navigation links are allowed', (t) => {
  const r = run(t, (d) => edit(d, 'post.html', (s) => s.replace('</article>', '<p>More at <a href="https://example.org/more">the site</a>.</p></article>')));
  assert.deepEqual(r.findings, []);
});

// ---- placeholders
test('placeholders: lorem ipsum fails', (t) => {
  failsOnly(t, 'placeholders', (d) => edit(d, 'post.md', (s) => s.replace('## Sources', 'Lorem ipsum dolor sit amet.\n\n## Sources')));
});
test('placeholders: a bracket placeholder fails', (t) => {
  failsOnly(t, 'placeholders', (d) => edit(d, 'post.html', (s) => s.replace('</article>', '<p>Results go here [TODO].</p></article>')));
});
test('placeholders: a placeholder in publication.json fails', (t) => {
  failsOnly(t, 'placeholders', (d) => editJson(d, (o) => { o.sources[3].took = '[insert the finding]'; }));
});

// ---- privacy
test('privacy: a machine home path fails', (t) => {
  failsOnly(t, 'privacy', (d) => edit(d, 'SOURCES.md', (s) => `${s}\nRun from C:\\Users\\somebodyreal\\scratch\\m1.py\n`));
});

// ---- critique: the optional block and its optional critique/ directory. Every case
// mutates a copy of the second fixture, which carries both.
const runCritique = (t, mutate = () => {}) => {
  const lane = scratch(t);
  const dir = path.join(lane, 'fixture-critique');
  fs.cpSync(CRITIQUE_FIXTURE, dir, { recursive: true });
  mutate(dir);
  return validatePublication(dir, 'fixture-critique');
};
const critiqueFailsOnly = (t, rule, mutate) => {
  const r = runCritique(t, mutate);
  assert.deepEqual(rulesOf(r), [rule], JSON.stringify(r.findings, null, 1));
  return r;
};
const editCritiqueFile = (dir, file, fn) => edit(dir, `critique/${file}`, (s) => {
  const o = JSON.parse(s);
  fn(o);
  return JSON.stringify(o, null, 2);
});

test('critique: the fixture with a critique block and directory is clean', (t) => {
  const r = runCritique(t);
  assert.deepEqual(r.findings, []);
  assert.deepEqual(r.warnings, []);
});
test('critique: the block may stand without the directory', (t) => {
  const r = runCritique(t, (d) => fs.rmSync(path.join(d, 'critique'), { recursive: true }));
  assert.deepEqual(r.findings, []);
});
test('critique: a publication with neither block nor directory is clean (the imported winner predates the step)', (t) => {
  const r = runCritique(t, (d) => {
    fs.rmSync(path.join(d, 'critique'), { recursive: true });
    editJson(d, (o) => { delete o.critique; });
  });
  assert.deepEqual(r.findings, []);
});
test('critique: counts that do not match the dispositions fail', (t) => {
  critiqueFailsOnly(t, 'critique', (d) => editJson(d, (o) => { o.critique.findings.accepted = 2; o.critique.findings.total = 4; }));
});
test('critique: a total that is not accepted + rejected + deferred fails', (t) => {
  critiqueFailsOnly(t, 'critique', (d) => {
    fs.rmSync(path.join(d, 'critique'), { recursive: true });
    editJson(d, (o) => { o.critique.findings.total = 5; });
  });
});
test('critique: a duplicate reviewer id fails', (t) => {
  critiqueFailsOnly(t, 'critique', (d) => editJson(d, (o) => { o.critique.reviewers[2].id = 'reviewer-claude'; }));
});
test('critique: an unknown reviewer outcome fails', (t) => {
  critiqueFailsOnly(t, 'critique', (d) => editJson(d, (o) => { o.critique.reviewers[2].outcome = 'out-of-balance'; }));
});
test('critique: more than two rounds fails', (t) => {
  critiqueFailsOnly(t, 'critique', (d) => editJson(d, (o) => { o.critique.rounds = 3; }));
});
test('critique: an unknown engine or decision fails', (t) => {
  const r = critiqueFailsOnly(t, 'critique', (d) => editJson(d, (o) => { o.critique.reviewers[0].engine = 'gemini'; o.critique.decision = 'ship'; }));
  assert.equal(r.findings.length, 2);
});
test('critique: a disposition for an unknown finding fails', (t) => {
  critiqueFailsOnly(t, 'critique', (d) => editCritiqueFile(d, 'dispositions.json', (o) => {
    o.push({ reviewer: 'reviewer-codex', round: 1, findingId: 'f7', disposition: 'rejected', reason: 'No such finding was made.' });
  }));
});
test('critique: a finding without a disposition fails', (t) => {
  const r = critiqueFailsOnly(t, 'critique', (d) => editCritiqueFile(d, 'dispositions.json', (o) => { o.pop(); }));
  assert.ok(r.findings.some((f) => /has no disposition/.test(f.message)), JSON.stringify(r.findings));
});
test('critique: a finding disposed of twice fails', (t) => {
  const r = critiqueFailsOnly(t, 'critique', (d) => editCritiqueFile(d, 'dispositions.json', (o) => { o.push({ ...o[0] }); }));
  assert.ok(r.findings.some((f) => /2 dispositions/.test(f.message)), JSON.stringify(r.findings));
});
test('critique: an empty reason fails', (t) => {
  critiqueFailsOnly(t, 'critique', (d) => editCritiqueFile(d, 'dispositions.json', (o) => { o[1].reason = '  '; }));
});
test('critique: a completed reviewer with no review fails', (t) => {
  critiqueFailsOnly(t, 'critique', (d) => editJson(d, (o) => { o.critique.reviewers[2].outcome = 'completed'; }));
});
test('critique: the directory without the block fails', (t) => {
  critiqueFailsOnly(t, 'critique', (d) => editJson(d, (o) => { delete o.critique; }));
});
test('critique: a machine home path inside reviews.json fails', (t) => {
  critiqueFailsOnly(t, 'privacy', (d) => editCritiqueFile(d, 'reviews.json', (o) => {
    o[0].findings[0].location = 'C:\\Users\\somebodyreal\\runs\\draft.md line 4';
  }));
});
test('critique: a malformed evidence URL fails', (t) => {
  critiqueFailsOnly(t, 'critique', (d) => editCritiqueFile(d, 'reviews.json', (o) => { o[0].findings[1].evidence = ['example.org/no-scheme']; }));
});
test('critique: an extra file inside critique/ fails', (t) => {
  critiqueFailsOnly(t, 'shape', (d) => fs.writeFileSync(path.join(d, 'critique', 'raw-transcript.txt'), 'stray\n'));
});
test('critique: a missing reviews.json inside critique/ fails', (t) => {
  critiqueFailsOnly(t, 'shape', (d) => fs.rmSync(path.join(d, 'critique', 'reviews.json')));
});
test('critique: null in a critique file fails', (t) => {
  critiqueFailsOnly(t, 'critique', (d) => editCritiqueFile(d, 'dispositions.json', (o) => { o[0].action = null; }));
});

// ---- CLI contract
const node = (args, cwd = root) => spawnSync(process.execPath, args, { cwd, encoding: 'utf8' });

test('CLI: green on the fixture lane, red on a broken copy, fatal on an empty lane', (t) => {
  assert.equal(node(['scripts/check-publications.mjs', '--root', 'scripts/fixtures/publications']).status, 0);
  const lane = scratch(t);
  fs.cpSync(FIXTURE, path.join(lane, 'fixture-post'), { recursive: true });
  edit(path.join(lane, 'fixture-post'), 'post.md', (s) => s.replace('one fact [1]', 'one fact [77]'));
  const bad = node(['scripts/check-publications.mjs', '--root', lane]);
  assert.equal(bad.status, 1, bad.stderr);
  assert.match(bad.stderr, /citations/);
  const empty = scratch(t);
  assert.equal(node(['scripts/check-publications.mjs', '--root', empty]).status, 2);
});

test('CLI: the index builder writes, then --check is fresh, then stale after an edit', (t) => {
  const lane = scratch(t);
  fs.cpSync(FIXTURE, path.join(lane, 'fixture-post'), { recursive: true });
  assert.equal(node(['scripts/build-publications-index.mjs', '--root', lane, '--check']).status, 1);
  assert.equal(node(['scripts/build-publications-index.mjs', '--root', lane]).status, 0);
  assert.equal(node(['scripts/build-publications-index.mjs', '--root', lane, '--check']).status, 0);
  const idx = JSON.parse(fs.readFileSync(path.join(lane, 'index.json'), 'utf8'));
  assert.equal(idx.publications['fixture-post'].sources, 8);
  assert.equal(idx.publications['fixture-post'].path, 'publications/fixture-post');
  assert.equal('critique' in idx.publications['fixture-post'], false, 'a post without a critique carries no critique key');
  // The index sits beside the publications; the gate must still accept the lane.
  assert.equal(node(['scripts/check-publications.mjs', '--root', lane]).status, 0);
  editJson(path.join(lane, 'fixture-post'), (o) => { o.title = 'A renamed fixture post'; });
  assert.equal(node(['scripts/build-publications-index.mjs', '--root', lane, '--check']).status, 1);
});

test('CLI: the index carries the critique selector - completed reviewers, rounds, decision', (t) => {
  const lane = scratch(t);
  fs.cpSync(CRITIQUE_FIXTURE, path.join(lane, 'fixture-critique'), { recursive: true });
  assert.equal(node(['scripts/build-publications-index.mjs', '--root', lane]).status, 0);
  const idx = JSON.parse(fs.readFileSync(path.join(lane, 'index.json'), 'utf8'));
  assert.deepEqual(idx.publications['fixture-critique'].critique, { reviewers: 2, rounds: 1, decision: 'keep' });
});

test('gate.mjs declares a publications lane, and --all runs both steps', () => {
  const src = fs.readFileSync(path.join(root, 'scripts/gate.mjs'), 'utf8');
  assert.match(src, /publications: \[CHECK_PUBLICATIONS, PUBLICATIONS_INDEX\]/);
  const all = /const ALL = \[([\s\S]*?)\];/.exec(src)[1];
  assert.match(all, /CHECK_PUBLICATIONS, PUBLICATIONS_INDEX/);
  const help = node(['scripts/gate.mjs', '--help']);
  assert.match(help.stderr, /publications/);
});
