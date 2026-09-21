#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderRecipe } from './lib/recipe-render.mjs';
import { sameIgnoringNewlines } from './lib/bundle-hash.mjs';
import { EXIT } from './lib/exit-codes.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const check = process.argv.includes('--check');
const dirs = (dir) => fs.readdirSync(dir, {withFileTypes:true}).filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name).sort();
try {
  const pending = [];
  let count = 0;
  for (const domain of dirs(path.join(root, 'recipes'))) {
    for (const topic of dirs(path.join(root, 'recipes', domain))) {
      for (const slug of dirs(path.join(root, 'recipes', domain, topic))) {
        const dir = path.join(root, 'recipes', domain, topic, slug);
        const obj = JSON.parse(fs.readFileSync(path.join(dir, 'recipe.json'), 'utf8'));
        if (obj.slug !== slug || obj.domain !== domain || obj.path !== `${domain}/${topic}`) throw new Error(`identity mismatch: ${domain}/${topic}/${slug}`);
        const next = renderRecipe(obj);
        const file = path.join(dir, 'RECIPE.md');
        const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
        count++;
        if (!sameIgnoringNewlines(prev, next)) pending.push({file, next});
      }
    }
  }
  if (!count) throw new Error('empty recipe lane');
  // Parse every input before writing anything: malformed input cannot leave a partial render.
  if (check) {
    for (const {file} of pending) console.error(`stale recipe view: ${path.relative(root, file)}`);
  } else for (const {file, next} of pending) fs.writeFileSync(file, next);
  console.log(`recipe views: ${count} checked; ${pending.length} ${check ? 'stale' : 'written'}`);
  process.exitCode = check && pending.length ? EXIT.VIOLATIONS : EXIT.OK;
} catch (error) {
  console.error(`render-recipes FATAL: ${error.message}`);
  process.exitCode = EXIT.FATAL;
}
