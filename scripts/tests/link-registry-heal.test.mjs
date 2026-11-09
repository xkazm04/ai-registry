// link-registry --heal runs unattended at every session start (a SessionStart hook the
// default run writes), so what it may touch is the whole question. These cases pin the
// SAFE/UNSAFE split from the script header on a fixture fleet: a COPY of the script in a
// temp registry root, one git-initialised project, so a regression writes into the temp
// tree and never into a real checkout. Heal must repair the safe classes, leave the unsafe
// ones byte-identical, stay silent when there is nothing to do, and exit 0 even when the
// instrument is broken - a hook that fails a session start gets removed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from '../lib/exit-codes.mjs';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GIT_ID = ['-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false'];

/** Unlink every link under a skills dir first: never recurse through a link on Windows. */
function unlinkLinks(dir) {
  let entries = [];
  try { entries = fs.readdirSync(dir); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e);
    try {
      if (fs.lstatSync(p).isSymbolicLink()) { try { fs.unlinkSync(p); } catch { fs.rmdirSync(p); } }
    } catch { /* gone */ }
  }
}

function fixture(fn, { gitInit = true } = {}) {
  const temp = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(temp, 'link-registry-heal-'));
  const app = path.join(root, 'work', 'app');
  try {
    fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
    for (const f of ['link-registry.mjs', 'lib/projects.mjs']) fs.copyFileSync(path.join(SCRIPTS, f), path.join(root, 'scripts', f));
    for (const s of ['alpha', 'beta']) {
      fs.mkdirSync(path.join(root, 'skills', s), { recursive: true });
      fs.writeFileSync(path.join(root, 'skills', s, 'SKILL.md'), `---\nname: ${s}\nversion: 1.0.0\n---\nFixture.\n`);
    }
    fs.mkdirSync(path.join(root, 'rules'));
    fs.writeFileSync(path.join(root, 'rules', 'ai-registry-access.md'), 'access rule\n');
    fs.writeFileSync(path.join(root, 'rules', 'ai-registry-dom.md'), 'dom rule\n');
    fs.writeFileSync(path.join(root, 'projects.json'), JSON.stringify({ schema: 2, machines: { T: {} }, projects: { app: { checkouts: { T: 'work/app' } } } }));
    fs.writeFileSync(path.join(root, '.machine.local.json'), JSON.stringify({ machine: 'T', root }));
    fs.mkdirSync(path.join(app, '.ai'), { recursive: true });
    fs.writeFileSync(path.join(app, '.ai', 'manifest.yaml'), 'skills:\n  - alpha\n  - beta\nknowledge:\n  domains: [dom]\n');
    if (gitInit) execFileSync('git', ['init', '-q', app], { stdio: 'ignore' });
    const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'link-registry.mjs'), ...args], { encoding: 'utf8' });
    const git = (...args) => execFileSync('git', [...GIT_ID, '-C', app, ...args], { stdio: 'ignore' });
    const at = (...rel) => path.join(app, ...rel);
    fn({ root, app, run, git, at });
  } finally {
    unlinkLinks(path.join(app, '.claude', 'skills'));
    unlinkLinks(path.join(root, '.claude', 'skills'));
    const rel = path.relative(temp, fs.realpathSync(root));
    if (!rel.startsWith('link-registry-heal-') || rel.includes(path.sep)) throw new Error('unsafe cleanup');
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const settingsOf = (app) => JSON.parse(fs.readFileSync(path.join(app, '.claude', 'settings.local.json'), 'utf8'));
const isLaneLink = (entry, root, name) => fs.lstatSync(entry).isSymbolicLink()
  && path.resolve(fs.realpathSync(entry)) === path.resolve(fs.realpathSync(path.join(root, 'skills', name)));

test('heal repairs a drifted rule, an absent rule, an absent link and a mis-pointed link; a second run is silent', () => {
  fixture(({ root, run, at }) => {
    const setup = run('--project', 'app');
    assert.equal(setup.status, EXIT.OK, setup.stderr);
    fs.writeFileSync(at('.claude', 'rules', 'ai-registry-access.md'), 'an old copy of the access rule\n');
    fs.rmSync(at('.claude', 'rules', 'ai-registry-dom.md'));
    fs.unlinkSync(at('.claude', 'skills', 'beta'));
    // alpha's link now points INTO the lane, at the wrong skill.
    fs.unlinkSync(at('.claude', 'skills', 'alpha'));
    fs.symlinkSync(path.join(root, 'skills', 'beta'), at('.claude', 'skills', 'alpha'), 'junction');

    const first = run('--heal', '--project', 'app');
    assert.equal(first.status, EXIT.OK, first.stderr);
    assert.equal(first.stdout, '', 'a SessionStart hook\'s stdout becomes session context - heal prints nothing there');
    const lines = first.stderr.trim().split('\n');
    assert.equal(lines.length, 1, first.stderr);
    for (const want of ['rule ai-registry-access.md (drifted)', 'rule ai-registry-dom.md (absent)', 'link beta (absent)', 'link alpha (pointing at another lane skill)', 'takes effect from the next session at the latest']) {
      assert.ok(lines[0].includes(want), `missing "${want}" in: ${lines[0]}`);
    }
    assert.equal(fs.readFileSync(at('.claude', 'rules', 'ai-registry-access.md'), 'utf8'), 'access rule\n');
    assert.equal(fs.readFileSync(at('.claude', 'rules', 'ai-registry-dom.md'), 'utf8'), 'dom rule\n');
    assert.ok(isLaneLink(at('.claude', 'skills', 'beta'), root, 'beta'));
    assert.ok(isLaneLink(at('.claude', 'skills', 'alpha'), root, 'alpha'));

    const second = run('--heal', '--project', 'app');
    assert.equal(second.status, EXIT.OK);
    assert.equal(second.stdout, '');
    assert.equal(second.stderr, '', 'nothing to do must be silent');
    const check = run('--check', '--project', 'app');
    assert.equal(check.status, EXIT.OK, check.stderr);
  });
});

test('heal leaves a tracked rule copy, a .gitignore block mismatch and a shadowing real directory byte-identical; --check still reports them', () => {
  fixture(({ run, git, at }) => {
    assert.equal(run('--project', 'app').status, EXIT.OK);
    // 1. a TRACKED rule copy that drifted: someone's working tree.
    git('add', '-f', '.claude/rules/ai-registry-access.md');
    git('commit', '-q', '-m', 'track a rule copy');
    fs.writeFileSync(at('.claude', 'rules', 'ai-registry-access.md'), 'a project edit to a tracked copy\n');
    // 2. the managed .gitignore block no longer matches the declaration.
    const gi = at('.gitignore');
    fs.writeFileSync(gi, fs.readFileSync(gi, 'utf8').replace('/.claude/skills/alpha\n', '/.claude/skills/alpha\n/.claude/skills/hand-added\n'));
    // 3. a real directory where the lane link for beta belongs.
    fs.unlinkSync(at('.claude', 'skills', 'beta'));
    fs.mkdirSync(at('.claude', 'skills', 'beta'));
    fs.writeFileSync(at('.claude', 'skills', 'beta', 'SKILL.md'), '---\nname: beta\n---\nA project fork.\n');

    const watched = [at('.claude', 'rules', 'ai-registry-access.md'), gi, at('.claude', 'skills', 'beta', 'SKILL.md'), at('.claude', 'settings.local.json')];
    const before = watched.map((f) => fs.readFileSync(f));
    const healed = run('--heal', '--project', 'app');
    assert.equal(healed.status, EXIT.OK, healed.stderr);
    assert.equal(healed.stdout, '');
    assert.equal(healed.stderr, '', 'UNSAFE findings are not repaired and not printed by --heal');
    watched.forEach((f, i) => assert.ok(fs.readFileSync(f).equals(before[i]), `${f} changed under --heal`));
    assert.equal(fs.lstatSync(at('.claude', 'skills', 'beta')).isSymbolicLink(), false);

    const check = run('--check', '--project', 'app');
    assert.equal(check.status, EXIT.VIOLATIONS, check.stdout);
    assert.match(check.stderr, /rule ai-registry-access\.md is a copy that drifted/);
    assert.match(check.stderr, /\.gitignore's managed block does not match/);
    assert.match(check.stderr, /\.claude\/skills\/beta is a REAL directory/);
  });
});

test('heal writes nothing into a path git does not ignore (no managed block yet)', () => {
  fixture(({ run, at }) => {
    const r = run('--heal', '--project', 'app');
    assert.equal(r.status, EXIT.OK, r.stderr);
    assert.equal(r.stderr, '');
    assert.equal(fs.existsSync(at('.claude')), false, 'without the ignore rules nothing is SAFE to write');
  });
});

test('--heal without --project, --heal with an unknown flag, and --heal --check are refused with exit 2 and write nothing', () => {
  fixture(({ run, at }) => {
    for (const args of [['--heal'], ['--heal', '--bogus', '--project', 'app'], ['--heal', '--check', '--project', 'app'], ['--heal', '--listing-only', '--project', 'app']]) {
      const r = run(...args);
      assert.equal(r.status, EXIT.FATAL, `${args.join(' ')}: ${r.stdout}`);
      assert.equal(fs.existsSync(at('.claude')), false, `${args.join(' ')} wrote into the project`);
    }
    assert.match(run('--heal').stderr, /--heal needs --project/);
  });
});

test('a broken instrument under --heal prints one line and exits 0', () => {
  const cases = {
    'unreadable manifest': ({ at }) => { fs.rmSync(at('.ai', 'manifest.yaml')); fs.mkdirSync(at('.ai', 'manifest.yaml')); },
    'missing rules directory': ({ root }) => fs.rmSync(path.join(root, 'rules'), { recursive: true }),
    'no machine file': ({ root }) => fs.rmSync(path.join(root, '.machine.local.json')),
    'missing skills lane': ({ root }) => fs.rmSync(path.join(root, 'skills'), { recursive: true }),
  };
  for (const [name, breakIt] of Object.entries(cases)) {
    fixture((fx) => {
      breakIt(fx);
      const r = fx.run('--heal', '--project', 'app');
      assert.equal(r.status, EXIT.OK, `${name}: ${r.stderr}`);
      assert.equal(r.stdout, '', name);
      const lines = r.stderr.trim().split('\n');
      assert.equal(lines.length, 1, `${name}: ${r.stderr}`);
      assert.match(lines[0], /^link-registry --heal app: could not run - /, name);
    });
  }
  fixture(({ run }) => {
    const r = run('--heal', '--project', 'nosuch');
    assert.equal(r.status, EXIT.OK);
    assert.equal(r.stderr.trim().split('\n').length, 1);
  });
});

test('the default run writes the SessionStart heal hook once, idempotently', () => {
  fixture(({ root, run, app }) => {
    assert.equal(run('--project', 'app').status, EXIT.OK);
    const s = settingsOf(app);
    assert.equal(s.hooks.SessionStart.length, 1);
    const [group] = s.hooks.SessionStart;
    assert.equal(group.matcher, 'startup|resume');
    assert.equal(group.hooks.length, 1);
    assert.equal(group.hooks[0].type, 'command');
    assert.equal(group.hooks[0].timeout, 30);
    assert.equal(group.hooks[0].command, `node "${root.split(path.sep).join('/')}/scripts/link-registry.mjs" --heal --project app`);
    const bytes = fs.readFileSync(path.join(app, '.claude', 'settings.local.json'));
    assert.equal(run('--project', 'app').status, EXIT.OK);
    assert.ok(fs.readFileSync(path.join(app, '.claude', 'settings.local.json')).equals(bytes), 'a re-run changed the settings file');
  });
});

test('--listing-only writes the heal hook too, and nothing outside settings.local.json', () => {
  fixture(({ run, app, at }) => {
    assert.equal(run('--listing-only', '--project', 'app').status, EXIT.OK);
    const s = settingsOf(app);
    assert.equal(s.hooks.SessionStart.length, 1);
    assert.match(s.hooks.SessionStart[0].hooks[0].command, /link-registry\.mjs" --heal --project app$/);
    assert.deepEqual(fs.readdirSync(at('.claude')), ['settings.local.json'], 'the listing pass made a link, a rule copy or another file');
    assert.ok(!fs.existsSync(at('.gitignore')), 'the listing pass wrote .gitignore');
  });
});

test('hook maintenance preserves foreign hooks and unrelated keys, and replaces an outdated entry', () => {
  fixture(({ run, app }) => {
    const file = path.join(app, '.claude', 'settings.local.json');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const foreign = {
      permissions: { allow: ['Bash(ls)'] },
      env: { X: '1' },
      hooks: {
        SessionStart: [
          { matcher: 'startup', hooks: [{ type: 'command', command: 'echo hi' }] },
          { matcher: 'startup', hooks: [{ type: 'command', command: 'node "/old/place/scripts/link-registry.mjs" --heal --project old' }, { type: 'command', command: 'echo sibling' }] },
        ],
        Stop: [{ hooks: [{ type: 'command', command: 'echo bye' }] }],
      },
    };
    fs.writeFileSync(file, JSON.stringify(foreign, null, 2));
    const check = run('--check', '--project', 'app');
    assert.equal(check.status, EXIT.VIOLATIONS);
    assert.match(check.stderr, /SessionStart heal hook .* is outdated/);

    assert.equal(run('--project', 'app').status, EXIT.OK);
    const s = settingsOf(app);
    assert.deepEqual(s.permissions, foreign.permissions);
    assert.deepEqual(s.env, foreign.env);
    assert.deepEqual(s.hooks.Stop, foreign.hooks.Stop);
    assert.deepEqual(s.hooks.SessionStart[0], foreign.hooks.SessionStart[0], 'a foreign group moved or changed');
    assert.deepEqual(s.hooks.SessionStart[1], { matcher: 'startup', hooks: [{ type: 'command', command: 'echo sibling' }] }, 'a foreign handler sharing a group with ours was lost');
    const ours = s.hooks.SessionStart.flatMap((g) => g.hooks).filter((h) => /--heal/.test(h.command));
    assert.equal(ours.length, 1);
    assert.match(ours[0].command, /--heal --project app$/);
    assert.equal(run('--check', '--project', 'app').status, EXIT.OK);
  });
});

test('hook: skipped with a message when the settings file is tracked; reported by --check when missing', () => {
  fixture(({ run, git, app }) => {
    const file = path.join(app, '.claude', 'settings.local.json');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '{\n  "env": {}\n}\n');
    const missing = run('--check', '--project', 'app');
    assert.equal(missing.status, EXIT.VIOLATIONS);
    assert.match(missing.stderr, /no SessionStart heal hook/);
    git('add', '-f', '.claude/settings.local.json');
    git('commit', '-q', '-m', 'track settings');
    const before = fs.readFileSync(file);
    const r = run('--project', 'app');
    assert.equal(r.status, EXIT.OK, r.stderr);
    assert.match(r.stderr, /SessionStart heal hook not written - \.claude\/settings\.local\.json is tracked/);
    assert.ok(fs.readFileSync(file).equals(before), 'a tracked settings file was written');
  });
});

test('hook: an unparseable settings file is left alone and named', () => {
  fixture(({ run, app }) => {
    const file = path.join(app, '.claude', 'settings.local.json');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '{ not json');
    const r = run('--project', 'app');
    assert.match(r.stderr, /SessionStart heal hook not written - .* is unparseable/);
    assert.equal(fs.readFileSync(file, 'utf8'), '{ not json');
  });
});

test('the registry links the lane skills its own .gitignore declares, and --check reports them missing', () => {
  fixture(({ root, run }) => {
    fs.writeFileSync(path.join(root, '.gitignore'), '# own lane links\n/.claude/skills/alpha\n.claude/skills/not-in-lane\n');
    const before = run('--check');
    assert.match(before.stderr, /ai-registry: lane skill alpha is absent in \.claude\/skills/);
    assert.doesNotMatch(before.stderr, /not-in-lane/);
    assert.equal(run().status, EXIT.OK);
    assert.ok(isLaneLink(path.join(root, '.claude', 'skills', 'alpha'), root, 'alpha'));
    assert.equal(fs.existsSync(path.join(root, '.claude', 'skills', 'beta')), false, 'an undeclared lane skill was linked');
    assert.doesNotMatch(run('--check').stderr, /lane skill alpha/);
  });
});

test('timing: --heal with nothing to do, five runs', (t) => {
  fixture(({ run }) => {
    assert.equal(run('--project', 'app').status, EXIT.OK);
    const ms = [];
    for (let i = 0; i < 5; i += 1) {
      const t0 = process.hrtime.bigint();
      const r = run('--heal', '--project', 'app');
      ms.push(Number(process.hrtime.bigint() - t0) / 1e6);
      assert.equal(r.status, EXIT.OK);
      assert.equal(r.stderr, '');
    }
    t.diagnostic(`--heal nothing-to-do wall ms: ${ms.map((v) => v.toFixed(0)).join(', ')}`);
    // A loose ceiling: this is a regression tripwire (a git spawn on the hot path, a
    // fleet walk), not a benchmark.
    assert.ok(Math.max(...ms) < 5000, ms.join(', '));
  });
});
