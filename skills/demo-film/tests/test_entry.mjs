// A tool run through a linked skill directory must still run: a consumer reaches the kit via
// .claude/skills/demo-film, and a URL-equality entry guard made those runs exit 0 having done nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localImports } from '../tools/lib/imports.mjs';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('check.mjs run through a linked directory still runs (usage error, not a silent exit 0)', () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'demo-film-link-'));
  const link = path.join(tmp, 'demo-film');
  try {
    symlinkSync(KIT, link, 'junction');
    const r = spawnSync(process.execPath, [path.join(link, 'tools', 'check.mjs')], { encoding: 'utf8' });
    assert.notEqual(r.status, 0, `expected a usage failure, got exit ${r.status}: ${r.stdout}${r.stderr}`);
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
