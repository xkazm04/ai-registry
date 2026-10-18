// True when this module is the process entry point. Compares real paths, so a tool run through a
// linked skill directory (.claude/skills/demo-film -> the registry) is still recognised as main;
// a plain URL comparison made such runs exit 0 having done nothing.
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function isMain(importMetaUrl) {
  const arg = process.argv[1];
  if (!arg) return false;
  try {
    return realpathSync(path.resolve(arg)) === realpathSync(fileURLToPath(importMetaUrl));
  } catch {
    return false;
  }
}
