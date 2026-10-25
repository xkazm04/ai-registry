// A tool run through a linked skill directory must still run: a consumer reaches the kit via
// .claude/skills/demo-film, and a URL-equality entry guard made those runs exit 0 having done nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as imports from '../tools/lib/imports.mjs';

const { localImports } = imports;
const localEntry = (dir) => {
  assert.equal(typeof imports.localEntry, 'function', 'lib/imports.mjs exports localEntry(localDir)');
  return imports.localEntry(dir);
};

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// check.mjs imports the zod contract, which only an `npm ci` in the kit installs. Without it the
// child dies on ERR_MODULE_NOT_FOUND - also a non-zero exit, so "not 0" passed for the wrong reason
// in every checkout that lacks the dependency (the registry gate's, for one). The test now asserts
// the USAGE refusal itself, and says plainly when it cannot run.
const zodPresent = (() => {
  try {
    createRequire(path.join(KIT, 'package.json')).resolve('zod');
    return true;
  } catch {
    return false;
  }
})();

test('check.mjs run through a linked directory still runs (usage error, not a silent exit 0)', { skip: zodPresent ? false : 'zod absent (npm ci in skills/demo-film): check.mjs cannot load, so its usage path cannot be reached' }, () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'demo-film-link-'));
  const link = path.join(tmp, 'demo-film');
  try {
    symlinkSync(KIT, link, 'junction');
    const r = spawnSync(process.execPath, [path.join(link, 'tools', 'check.mjs')], { encoding: 'utf8' });
    assert.equal(r.status, 2, `expected the usage refusal (exit 2), got exit ${r.status}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /usage: node tools\/check\.mjs/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('check and render find the SAME local entry: .jsx/.js heroes are linted, not only bundled', () => {
  // render.mjs bundled local/index.{tsx,ts,jsx,js}; check.mjs followed imports only from
  // index.{tsx,ts}. A .jsx entry's shared code outside local/ rendered without the seek lint.
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'demo-film-entry-'));
  try {
    const local = path.join(tmp, 'local');
    mkdirSync(local);
    assert.equal(localEntry(local), undefined, 'no entry -> undefined');
    for (const name of ['index.js', 'index.jsx', 'index.ts', 'index.tsx']) {
      writeFileSync(path.join(local, name), 'export const components = {};\n');
      assert.equal(path.basename(localEntry(local)), name, `${name} wins over the ones written before it`);
    }
    const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'`\\])\/\/.*$/gm, '$1');
    for (const tool of ['check.mjs', 'render.mjs']) {
      const src = strip(readFileSync(path.join(KIT, 'tools', tool), 'utf8'));
      assert.match(src, /localEntry\(/, `${tool} resolves the entry through localEntry()`);
      assert.doesNotMatch(src, /\['index\.tsx', 'index\.ts'/, `${tool} keeps no list of its own`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('localImports follows relative imports out of local/ transitively', () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'demo-film-imports-'));
  try {
    mkdirSync(path.join(tmp, 'film', 'local'), { recursive: true });
    mkdirSync(path.join(tmp, 'shared'));
    writeFileSync(path.join(tmp, 'film', 'local', 'index.tsx'), "import { A } from '../../shared/A';\nexport const components = { A };\n");
    writeFileSync(path.join(tmp, 'shared', 'A.tsx'), "import './font.ts';\nexport const A = () => null;\n");
    writeFileSync(path.join(tmp, 'shared', 'font.ts'), 'export {};\n');
    const got = localImports(path.join(tmp, 'film', 'local', 'index.tsx')).map((f) => path.basename(f)).sort();
    assert.deepEqual(got, ['A.tsx', 'font.ts', 'index.tsx']);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
