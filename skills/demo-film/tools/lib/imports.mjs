import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

// Every file the consumer's heroes reach by relative import, transitively (shared code and fonts
// outside local/ included): an edit to any of them must change the bundle key, or a stale cached
// bundle renders the old code.
const IMPORT_RE = /(?:from\s+|import\s*\(?\s*)['"](\.{1,2}\/[^'"]+)['"]/g;
const RESOLVE_EXT = ['', '.tsx', '.ts', '.jsx', '.js', '.mjs', '/index.tsx', '/index.ts', '/index.js'];
export function localImports(entry) {
  const seen = new Set();
  const queue = [path.resolve(entry)];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!/\.(tsx?|jsx?|mjs)$/.test(file)) continue;
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(IMPORT_RE)) {
      const base = path.resolve(path.dirname(file), m[1].split('?')[0]);
      const hit = RESOLVE_EXT.map((e) => base + e).find((p) => existsSync(p) && !statSync(p).isDirectory());
      if (hit) queue.push(hit);
    }
  }
  return [...seen];
}

