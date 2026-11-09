// registry-yaml: the one reader of registry.yaml reads today's file, and refuses every
// construct outside its subset with a message that names the line - never a guessed value.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { parseRegistryYaml, readRegistryYaml, lanesOf, RegistryYamlError } from '../lib/registry-yaml.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));

test("today's registry.yaml: every lane with path, holds, spec, gate, depth", () => {
  const doc = readRegistryYaml(root);
  assert.equal(doc.registry, 1);
  assert.equal(doc.name, 'ai-registry');
  const lanes = lanesOf(doc);
  assert.deepEqual(lanes.map((l) => l.name),
    ['knowledge', 'skills', 'recipes', 'publications', 'practices', 'memory', 'usage', 'signals', 'librarian']);
  for (const l of lanes) {
    assert.match(l.path, /^[a-z]+\/$/, `${l.name}.path`);
    assert.equal(typeof l.holds, 'string', `${l.name}.holds`);
    assert.ok(l.holds.length > 20, `${l.name}.holds folded in full`);
    assert.equal(typeof l.spec, 'string', `${l.name}.spec`);
    assert.ok(['nested', 'fixed'].includes(l.depth), `${l.name}.depth (trailing comment stripped)`);
    assert.ok(l.gate === null || /^scripts\/check-[a-z-]+\.mjs$/.test(l.gate), `${l.name}.gate`);
    assert.equal(typeof l.status, 'string', `${l.name}.status`);
  }
  assert.equal(lanes.find((l) => l.name === 'librarian').gate, null, 'librarian declares no gate');
  const k = doc.lanes.knowledge;
  assert.equal(k.max_child_dirs, 10);
  assert.equal(k.rules.installed_into, k.rules.linked_into, 'the new key carries the kept key\'s value');
  assert.deepEqual(doc.lanes.skills.resolution.harness_order, ['enterprise', 'personal', 'project', 'plugin']);
  assert.equal(doc.lanes.skills.resolution.version_breaks_ties_across_tiers, false);
  assert.match(doc.lanes.skills.marketplace.install, /&& claude plugin install <skill>@ai-registry/);
  assert.deepEqual(doc.owners, ['xkazm04']);
  assert.match(doc.lanes.publications.format, /Text-only: the SVGs are canonical/, 'a continuation line with ": " folds as text');
});

test('folding, quoting, inline lists and comments', () => {
  const doc = parseRegistryYaml([
    '# head',
    'a:',
    '  b: one two',
    '    three  # trailing',
    '  c: "x # not a comment"  # but this is',
    "  d: 'it''s'",
    '  e: [p, "q r", 3]',
    '  f:',
    '    - x',
    '    - y',
    '  g:',
    'h: ~',
  ].join('\n'));
  assert.deepEqual(doc, { a: { b: 'one two three', c: 'x # not a comment', d: "it's", e: ['p', 'q r', 3], f: ['x', 'y'], g: null }, h: null });
});

const refuses = (text, re, line) => {
  assert.throws(() => parseRegistryYaml(text), (e) => {
    assert.ok(e instanceof RegistryYamlError, e.message);
    assert.match(e.message, re);
    assert.equal(e.line, line, e.message);
    assert.match(e.message, new RegExp(`^registry\\.yaml:${line}: `));
    return true;
  });
};

test('refuses an anchor, naming the line', () => refuses('lanes:\n  a: &x 1\n', /anchors/, 2));
test('refuses an alias, naming the line', () => refuses('lanes:\n  a: 1\n  b: *x\n', /aliases/, 3));
test('refuses a block scalar |, naming the line', () => refuses('lanes:\n  a: |\n    text\n', /block scalars \(\|\)/, 2));
test('refuses a folded block scalar >, naming the line', () => refuses('a: >\n  text\n', /block scalars \(>\)/, 1));
test('refuses a flow map, naming the line', () => refuses('x: 1\nlanes: {a: 1}\n', /flow maps/, 2));
test('refuses a tag', () => refuses('a: !!str 1\n', /tags/, 1));
test('refuses a document marker', () => refuses('a: 1\n---\nb: 2\n', /document markers/, 2));
test('refuses a duplicate key', () => refuses('a: 1\na: 2\n', /duplicate key "a"/, 2));
test('refuses a tab in indentation', () => refuses('a:\n\tb: 1\n', /tab/, 2));
test('refuses a list item that is a map', () => refuses('a:\n  - k: v\n', /list item that is a map/, 2));
test('refuses indentation that returns to no open level', () => refuses('a:\n    b: 1\n  c: 2\n', /indentation 2/, 3));
test('refuses an unterminated quoted scalar', () => refuses('a: "open\n', /unterminated double-quoted/, 1));
test('refuses a line that is not key: value', () => refuses('a: 1\njust words\n', /not a "key: value" line/, 2));
