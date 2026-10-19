// The DDL of an older store version, derived from the current references/store.sql by undoing each later
// version's additions - so a migration test runs against the shape that version shipped, and a new version only
// adds one step here. v1 is not derivable (v2 rebuilt proposals); store-v2.test.mjs keeps it verbatim.
import { readFileSync } from 'node:fs';
import { DDL_PATH } from '../scripts/store.mjs';

const swap = (s, a, b) => {
  if (!s.includes(a)) throw new Error(`legacy-ddl: ${JSON.stringify(a)} is not in store.sql any more; update this helper`);
  return s.replace(a, b);
};
const dropLines = (s, re) => s.split('\n').filter((l) => !re.test(l)).join('\n');

/** The store DDL as it was at `version` (2 or 3). */
export function legacyDdl(version) {
  let s = readFileSync(DDL_PATH, 'utf8').replace(/\r\n/g, '\n');
  if (version >= 4) return s;
  // v3: no v4 block (the last seven proposals columns and their two indexes), kind without 'work-item'
  const start = s.indexOf('\n  -- v4');
  const end = s.indexOf('\n', s.indexOf('  ranked_at', start) + 1);
  if (start < 0 || end < 0) throw new Error('legacy-ddl: the v4 block is not in store.sql any more');
  s = s.slice(0, start) + s.slice(end);
  s = swap(s, 'triaged_from   TEXT,', 'triaged_from   TEXT ');
  s = swap(s, ", 'work-item')", ')');
  s = dropLines(s, /proposals_external_ref|proposals_tier/);
  s = swap(s, 'PRAGMA user_version = 4;', 'PRAGMA user_version = 3;');
  if (version === 3) return s;
  // v2: no triaged_from
  s = dropLines(s, /^\s*-- v3\s*$|^\s*triaged_from\s/);
  s = swap(s, 'triaged_at     TEXT,', 'triaged_at     TEXT');
  s = swap(s, 'PRAGMA user_version = 3;', 'PRAGMA user_version = 2;');
  if (version === 2) return s;
  throw new Error(`legacy-ddl: no v${version} (v1 is kept verbatim in store-v2.test.mjs)`);
}
