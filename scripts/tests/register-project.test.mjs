import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from '../lib/exit-codes.mjs';
import { addCheckout } from '../register-project.mjs';

const SCRIPT = fileURLToPath(new URL('../register-project.mjs', import.meta.url));
const REAL_FLEET = fileURLToPath(new URL('../../projects.json', import.meta.url));
const write = (file, body) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof body === 'string' ? body : JSON.stringify(body, null, 2));
};
const git = (cwd, ...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/**
 * A machine root holding a committed temp registry (a COPY of the real projects.json) and one
 * product with a context map, so the real map builder has something to join.
 */
function fixture(fn) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'register-project-'));
  try {
    const registry = path.join(base, 'registry');
    const root = path.join(base, 'work', 'shop');
    fs.mkdirSync(registry, { recursive: true });
    fs.copyFileSync(REAL_FLEET, path.join(registry, 'projects.json'));
    write(path.join(registry, '.gitignore'), '**/.*.local.json\n');
    write(path.join(registry, '.machine.local.json'), { machine: 'Wolf', root: base });
    write(path.join(registry, 'knowledge', 'software-engineering', 'index.json'), { subjects: {} });
    git(registry, 'init', '-q');
    git(registry, 'add', '-A');
    git(registry, 'commit', '-qm', 'fixture');
    write(path.join(root, 'src', 'retry.ts'), 'export function retryWithBackoff() {}\n');
    write(path.join(root, 'context-map.json'), { contexts: [
      { id: 'c1', name: 'retry-and-rate-limiting', description: 'retry with exponential backoff and rate limiting for outbound http calls', keywords: ['retry', 'backoff', 'rate-limit'], file_paths: ['src/retry.ts'] },
    ] });
    fn({ base, registry, root });
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
}
const run = (registry, root, ...extra) => spawnSync(process.execPath, [SCRIPT, '--slug', 'shop', '--path', root, '--registry', registry, ...extra], { encoding: 'utf8' });

test('addCheckout appends without disturbing the real file\'s formatting or key order', () => {
  const text = fs.readFileSync(REAL_FLEET, 'utf8');
  const { text: out, changed } = addCheckout(text, { slug: 'zz-new', machine: 'Wolf', rel: 'kiro/zz-new' });
  assert.equal(changed, true);
  // Everything before the new entry is byte-identical; the new project is the last one.
  const head = text.slice(0, text.lastIndexOf('    }\n  }\n}'));
  assert.ok(out.startsWith(head));
  assert.deepEqual(Object.keys(JSON.parse(out).projects).slice(0, -1), Object.keys(JSON.parse(text).projects));
  // A second machine on an existing project goes last among its checkouts.
  const added = JSON.parse(addCheckout(text, { slug: 'pof', machine: 'Fox', rel: 'dolla/pof' }).text).projects.pof.checkouts;
  assert.deepEqual(Object.keys(added), ['Wolf', 'Fox']);
});

test('addCheckout is idempotent and refuses a re-point or a second slug on one path', () => {
  const text = fs.readFileSync(REAL_FLEET, 'utf8');
  assert.deepEqual(addCheckout(text, { slug: 'pof', machine: 'Wolf', rel: 'kiro/pof' }), { text, changed: false });
  assert.throws(() => addCheckout(text, { slug: 'pof', machine: 'Wolf', rel: 'kiro/pof2' }), /re-pointing/);
  assert.throws(() => addCheckout(text, { slug: 'pof-two', machine: 'Wolf', rel: 'kiro/pof' }), /already registered/);
  assert.throws(() => addCheckout(text, { slug: 'x', machine: 'Nobody', rel: 'x' }), /not declared/);
});

test('a real registration writes the three things, and a second run writes nothing', () => {
  fixture(({ registry, root }) => {
    const first = run(registry, root);
    assert.equal(first.status, EXIT.OK, first.stderr + first.stdout);
    const fleet = JSON.parse(fs.readFileSync(path.join(registry, 'projects.json'), 'utf8'));
    assert.equal(fleet.projects.shop.checkouts.Wolf, 'work/shop');
    const manifest = fs.readFileSync(path.join(root, '.ai', 'manifest.yaml'), 'utf8');
    assert.match(manifest, /^schema: ai-manifest$/m);
    assert.match(manifest, /^ {2}domains: \[software-engineering\]$/m);
    assert.match(manifest, /^ {2}local: \.\.\/\.\.\/registry$/m);
    assert.ok(fs.existsSync(path.join(root, '.ai', 'registry-map.json')));

    git(registry, 'commit', '-qam', 'registered');
    const snapshot = ['projects.json'].map((f) => fs.readFileSync(path.join(registry, f), 'utf8'))
      .concat(['manifest.yaml', 'registry-map.json'].map((f) => fs.readFileSync(path.join(root, '.ai', f), 'utf8')));
    const second = run(registry, root);
    assert.equal(second.status, EXIT.OK, second.stderr);
    assert.match(second.stdout, /already registered/);
    const after = ['projects.json'].map((f) => fs.readFileSync(path.join(registry, f), 'utf8'))
      .concat(['manifest.yaml', 'registry-map.json'].map((f) => fs.readFileSync(path.join(root, '.ai', f), 'utf8')));
    assert.deepEqual(after, snapshot);
  });
});

test('a dirty registry checkout is refused before any write; --dry-run writes nothing', () => {
  fixture(({ registry, root }) => {
    write(path.join(registry, 'scratch.md'), 'another session\n');
    const before = fs.readFileSync(path.join(registry, 'projects.json'), 'utf8');
    const refused = run(registry, root);
    assert.equal(refused.status, EXIT.FATAL);
    assert.equal(refused.stderr.trim(), 'register-project refused: registry checkout has uncommitted changes');
    const dry = run(registry, root, '--dry-run');
    assert.equal(dry.status, EXIT.OK, dry.stderr);
    assert.match(dry.stdout, /\[dry-run\] projects\.json: add projects\.shop\.checkouts\.Wolf = "work\/shop"/);
    assert.match(dry.stdout, /\[dry-run\] .*manifest\.yaml: write \(product repo\)/);
    assert.equal(fs.readFileSync(path.join(registry, 'projects.json'), 'utf8'), before);
    assert.equal(fs.existsSync(path.join(root, '.ai')), false);
  });
});

test('a checkout outside the machine root is refused', () => {
  fixture(({ registry }) => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'register-project-outside-'));
    try {
      const r = run(registry, outside);
      assert.equal(r.status, EXIT.FATAL);
      assert.match(r.stderr, /outside this machine's root/);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});
