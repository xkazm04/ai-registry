// Deterministic tests for reachability.mjs: `node --test skills/kit/tests`.
// A temp tree with an alias import, a relative import, an index-file import, a lazy
// dynamic import, a TS-ESM ".js" specifier and one module no file imports. Builtins only.
//
// What is worth pinning: the resolver follows every import form the app can use, a module
// nobody imports is reported dead, and the grouping is the shared one.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  extractSpecifiers, parseAliasArg, parseTsconfigPaths, entriesFromHtml, createResolver, walkGraph,
  groupReachability, analyzeReachability, findEntries,
} from '../scripts/reachability.mjs';

test('specifiers: from, export-from, dynamic, side-effect, require', () => {
  const src = [
    "import A, { b } from './a';",
    "import type { T } from '@/types';",
    "export * from \"./re\";",
    "const L = lazy(() => import('./lazy/Page'));",
    "import './side.css';",
    "const r = require('../req');",
    "import React from 'react';",
  ].join('\n');
  assert.deepEqual(extractSpecifiers(src), ['./a', '@/types', './re', './lazy/Page', './side.css', '../req', 'react']);
});

test('alias parsing: CLI pairs and tsconfig paths (JSONC, baseUrl, exact keys)', () => {
  assert.deepEqual(parseAliasArg('@=src'), ['@', 'src']);
  assert.deepEqual(parseAliasArg('~lib=packages/lib/src'), ['~lib', 'packages/lib/src']);
  assert.throws(() => parseAliasArg('@src'), /KEY=DIR/);
  const ts = '{ "compilerOptions": { // comment\n "baseUrl": ".", "paths": { "@/*": ["./src/*"], "#ui/*": ["src/ui/*"], "cfg": ["./config/index.ts"], } } }';
  assert.deepEqual(parseTsconfigPaths(ts), { '@': 'src', '#ui': 'src/ui', cfg$: 'config/index.ts' });
  assert.deepEqual(parseTsconfigPaths('{ "compilerOptions": { "baseUrl": "src", "paths": { "@/*": ["*"] } } }'), { '@': 'src' });
  assert.deepEqual(parseTsconfigPaths('not json'), {});
});

test('html entry: module scripts, root-absolute and relative, remote skipped', () => {
  const html = '<script type="module" src="/src/main.tsx"></script><script src="https://cdn.x/y.js"></script><script src="./boot.ts"></script>';
  assert.deepEqual(entriesFromHtml(html, 'index.html'), ['src/main.tsx', 'boot.ts']);
  assert.deepEqual(entriesFromHtml('<script src="app.ts"></script>', 'web/index.html'), ['web/app.ts']);
});

test('resolver with an in-memory file set: alias, relative, index, extension order, .js -> .ts', () => {
  const repo = path.resolve('/r');
  const files = new Set(['src/a.tsx', 'src/dir/index.ts', 'src/lib/util.ts', 'src/x.ts', 'src/x.tsx', 'config/index.ts'].map((f) => path.join(repo, f)));
  const resolve = createResolver({ repo, aliases: { '@': 'src', cfg$: 'config/index.ts' }, isFile: (p) => files.has(p) });
  const from = path.join(repo, 'src/a.tsx');
  assert.equal(resolve(from, '@/lib/util'), path.join(repo, 'src/lib/util.ts'));
  assert.equal(resolve(from, './dir'), path.join(repo, 'src/dir/index.ts'));
  assert.equal(resolve(from, './x'), path.join(repo, 'src/x.ts'), '.ts wins over .tsx');
  assert.equal(resolve(from, './lib/util.js'), path.join(repo, 'src/lib/util.ts'));
  assert.equal(resolve(from, 'cfg'), path.join(repo, 'config/index.ts'));
  assert.equal(resolve(from, 'cfg/other'), null, 'exact alias does not match a subpath');
  assert.equal(resolve(from, 'react'), null);
  assert.equal(resolve(from, './missing'), null);
});

function tree() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-reach-'));
  const w = (rel, text) => { const p = path.join(dir, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); };
  w('tsconfig.json', '{ "compilerOptions": { "paths": { "~/*": ["./src/*"] } } }');
  w('src/main.tsx', "import { App } from './App';\nimport './index.css';");
  w('src/index.css', 'body{}');
  w('src/App.tsx', "import { Home } from '~/features/home/sub_start';\nconst S = lazy(() => import('~/features/settings/sub_admin/Admin'));\nexport * from './features/shared/components/kit';");
  w('src/features/home/sub_start/index.tsx', "export { Home } from './Home.js';");
  w('src/features/home/sub_start/Home.tsx', "import { util } from '../../../lib/util';");
  w('src/lib/util.ts', 'export const util = 1;');
  w('src/features/settings/sub_admin/Admin.tsx', 'export default 1;');
  w('src/features/settings/sub_admin/Orphan.tsx', 'export default 2;');
  w('src/features/settings/sub_admin/Admin.test.tsx', "import A from './Orphan';");
  w('src/features/shared/components/kit/index.tsx', 'export const K = 1;');
  w('src/features/recipes/sub_old/Old.tsx', "import { util } from '~/lib/util';");
  w('src/features/recipes/sub_old/OldToo.tsx', "import Old from './Old';");
  return dir;
}

test('walk a temp tree: tsconfig alias, index, lazy import, dead module, partial module', () => {
  const dir = tree();
  try {
    assert.deepEqual(findEntries(dir).files, ['src/main.tsx']);
    const res = analyzeReachability(dir, {});
    assert.deepEqual(res.aliases, { '~': 'src' });
    const by = Object.fromEntries(res.modules.map((m) => [m.module, m]));
    assert.deepEqual(Object.keys(by).sort(), ['home/sub_start', 'recipes/sub_old', 'settings/sub_admin', 'shared/components/kit']);
    assert.equal(by['home/sub_start'].reachable, 2);
    assert.equal(by['shared/components/kit'].reachable, 1);
    assert.deepEqual([by['settings/sub_admin'].reachable, by['settings/sub_admin'].files], [1, 2], 'test file is not an entry and not counted');
    assert.deepEqual(by['settings/sub_admin'].unreachable, ['src/features/settings/sub_admin/Orphan.tsx']);
    assert.equal(by['recipes/sub_old'].reachable, 0, 'imports inside a dead module do not revive it');
    assert.equal(res.modules[0].module, 'recipes/sub_old', 'least reachable first');
    // An explicit --alias wins over tsconfig; a wrong one breaks resolution loudly (fewer files walked).
    const broken = analyzeReachability(dir, {}, { aliasPairs: ['~=nowhere'] });
    assert.ok(broken.walked < res.walked);
    // An html entry expands to its module scripts.
    fs.writeFileSync(path.join(dir, 'index.html'), '<script type="module" src="/src/main.tsx"></script>');
    assert.equal(analyzeReachability(dir, {}, { entries: ['index.html'] }).walked, res.walked);
    assert.throws(() => analyzeReachability(dir, {}, { entries: ['src/nope.tsx'] }), /does not exist/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('walkGraph and groupReachability are pure over injected io', () => {
  const graph = { '/e.ts': "import './a'", '/a.ts': "import('./b')", '/b.ts': '', '/c.ts': "import './a'" };
  const resolve = (from, spec) => { const p = path.posix.join(path.posix.dirname(from), spec) + '.ts'; return graph[p] != null ? p : null; };
  const seen = walkGraph(['/e.ts'], resolve, (f) => graph[f]);
  assert.deepEqual([...seen].sort(), ['/a.ts', '/b.ts', '/e.ts']);
  const rows = groupReachability(['src/features/x/sub_a/A.tsx', 'src/features/x/sub_a/B.tsx', 'src/other/Z.tsx'], new Set(['src/features/x/sub_a/A.tsx']));
  assert.deepEqual(rows, [{ module: 'x/sub_a', files: 2, reachable: 1, unreachable: ['src/features/x/sub_a/B.tsx'] }]);
});
