import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

// The consumer's hero entry, in precedence order. render.mjs bundles it as @film/local and check.mjs
// lints what it imports, so both must resolve the SAME file: check once looked for .tsx/.ts only and
// a .jsx entry's shared code rendered without the seek lint.
export const LOCAL_ENTRY_NAMES = ['index.tsx', 'index.ts', 'index.jsx', 'index.js'];
export const localEntry = (localDir) => LOCAL_ENTRY_NAMES.map((f) => path.join(localDir, f)).find((f) => existsSync(f));

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

