#!/usr/bin/env node
// Read-only architectural inventory. Counts describe coverage, not content quality.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
try {
  const files = execFileSync('git', ['ls-files', '-z'], {
    cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  }).split('\0').filter(Boolean).sort();
  const groups = new Map();
  const skills = [];
  const rules = [];
  let bytes = 0;
  for (const file of files) {
    // Git symlinks are installation pointers, not content to follow outside the tree.
    const stat = fs.lstatSync(path.join(root, file));
    if (!stat.isFile()) continue;
    const body = fs.readFileSync(path.join(root, file));
    bytes += body.length;
    const parts = file.split('/');
    const key = parts.length === 1 ? '(root)' : parts.slice(0,
      ['knowledge', 'recipes'].includes(parts[0]) ? 3 : 1).join('/');
    const row = groups.get(key) ?? { path: key, files: 0, bytes: 0, markdown: 0,
      techniques: 0, applications: 0, recipes: 0 };
    row.files++;
    row.bytes += body.length;
    if (file.endsWith('.md')) row.markdown++;
    if (file.includes('/techniques/') && file.endsWith('.md')) row.techniques++;
    if (file.includes('/applications/') && file.endsWith('.md')) row.applications++;
    if (file.endsWith('/recipe.json')) row.recipes++;
    groups.set(key, row);
    if (/^skills\/[^/]+\/SKILL\.md$/.test(file)) {
      const text = body.toString('utf8');
      skills.push({ path: file, lines: text.split('\n').length,
        words: text.split(/\s+/).filter(Boolean).length,
        version: text.match(/^version:\s*(.+)$/m)?.[1] ?? null });
    }
    if (/^rules\/.*\.md$/.test(file)) rules.push({ path: file, bytes: body.length });
  }
  console.log(JSON.stringify({
    schema: 1,
    revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    scope: 'Tracked working-tree regular files; untracked files and symlinks excluded. Structural inventory only.',
    trackedEntries: files.length, bytes,
    groups: [...groups.values()].sort((a, b) => a.path.localeCompare(b.path, 'en')),
    skills, rules,
  }, null, 2));
} catch (error) {
  console.error(`review-inventory FATAL: ${error.message}`);
  process.exit(EXIT.FATAL);
}
