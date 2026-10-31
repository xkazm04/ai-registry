// The DDL of an older store version, derived from the current references/store.sql by undoing each later
// version's additions - so a migration test runs against the shape that version shipped, and a new version only
// adds one step here. v1 is not derivable (v2 rebuilt proposals); V1_DDL keeps it verbatim (comments stripped).
import { readFileSync } from 'node:fs';
import { DDL_PATH } from '../scripts/store.mjs';

const swap = (s, a, b) => {
  if (!s.includes(a)) throw new Error(`legacy-ddl: ${JSON.stringify(a)} is not in store.sql any more; update this helper`);
  return s.replace(a, b);
};
const dropLines = (s, re) => s.split('\n').filter((l) => !re.test(l)).join('\n');
/** Cuts from the line holding `from` through the line holding `to` (both included). */
const cut = (s, from, to, what) => {
  const start = s.indexOf(from);
  const lineStart = s.lastIndexOf('\n', start);
  const end = s.indexOf('\n', s.indexOf(to, start) + 1);
  if (start < 0 || end < 0) throw new Error(`legacy-ddl: the ${what} is not in store.sql any more`);
  return s.slice(0, lineStart) + s.slice(end);
};

/** The current DDL (`version` 5) or the store DDL as it was at `version` (2, 3 or 4). */
export function legacyDdl(version) {
  let s = readFileSync(DDL_PATH, 'utf8').replace(/\r\n/g, '\n');
  if (version >= 5) return s;
  // v4: no v5 block (the seventeen scan-finding/1 proposals columns), no score index, no trust_events
  s = cut(s, '  -- v5: scan-finding/1', '  proof             TEXT', 'v5 column block');
  s = swap(s, 'ranked_at      TEXT,', 'ranked_at      TEXT');
  s = dropLines(s, /proposals_score/);
  s = cut(s, '-- v5. Append-only autonomy ledger', 'CREATE INDEX IF NOT EXISTS trust_events_slice', 'trust_events block');
  s = swap(s, 'PRAGMA user_version = 5;', 'PRAGMA user_version = 4;');
  if (version === 4) return s;
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
  throw new Error(`legacy-ddl: no v${version} (v1 is V1_DDL, kept verbatim)`);
}

// The v1 DDL as it shipped (comments stripped).
export const V1_DDL = `
PRAGMA journal_mode = WAL;
PRAGMA user_version = 1;

CREATE TABLE IF NOT EXISTS runs (
  id            TEXT PRIMARY KEY,
  started_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  ended_at      TEXT,
  phase         TEXT NOT NULL CHECK (phase IN ('measure', 'propose', 'execute', 'propagate')),
  status        TEXT NOT NULL CHECK (status IN ('running', 'done', 'failed', 'aborted')),
  lenses        TEXT NOT NULL,
  scope         TEXT,
  skill_version TEXT,
  model         TEXT,
  note          TEXT
);

CREATE TABLE IF NOT EXISTS measurements (
  id          INTEGER PRIMARY KEY,
  run_id      TEXT NOT NULL REFERENCES runs(id),
  feature     TEXT NOT NULL,
  lens        TEXT NOT NULL,
  metric      TEXT NOT NULL,
  value       REAL NOT NULL,
  unit        TEXT,
  method      TEXT CHECK (method IN ('static', 'probe', 'harness', 'judgement')),
  evidence    TEXT,
  measured_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS measurements_key ON measurements (feature, lens, metric, measured_at);

CREATE TABLE IF NOT EXISTS proposals (
  id             TEXT PRIMARY KEY,
  run_id         TEXT NOT NULL REFERENCES runs(id),
  feature        TEXT NOT NULL,
  lens           TEXT NOT NULL,
  metric         TEXT,
  title          TEXT NOT NULL,
  body           TEXT,
  standard       TEXT NOT NULL DEFAULT 'none',
  expected_delta REAL,
  size           TEXT CHECK (size IN ('XS', 'S', 'M', 'L', 'XL')),
  risk           INTEGER CHECK (risk BETWEEN 1 AND 10),
  kind           TEXT NOT NULL CHECK (kind IN ('fix', 'baseline-upgrade', 'propagation')),
  parent_id      TEXT REFERENCES proposals(id),
  status         TEXT NOT NULL CHECK (status IN ('proposed', 'approved', 'declined', 'executing', 'done', 'failed')),
  decided_by     TEXT,
  decided_at     TEXT,
  decision_note  TEXT,
  after_value    REAL,
  result_sha     TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS proposals_updated ON proposals (updated_at);

CREATE TABLE IF NOT EXISTS activity (
  id      INTEGER PRIMARY KEY,
  run_id  TEXT NOT NULL REFERENCES runs(id),
  at      TEXT NOT NULL,
  feature TEXT,
  lens    TEXT,
  kind    TEXT NOT NULL CHECK (kind IN ('reading', 'measured', 'proposed', 'executing', 'committed', 'note', 'error')),
  text    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shots (
  id             INTEGER PRIMARY KEY,
  run_id         TEXT NOT NULL REFERENCES runs(id),
  feature        TEXT NOT NULL,
  path           TEXT NOT NULL,
  size           TEXT,
  theme          TEXT,
  harness_module TEXT,
  captured_at    TEXT NOT NULL,
  report         TEXT
);

CREATE TABLE IF NOT EXISTS coverage (
  feature   TEXT NOT NULL,
  standard  TEXT NOT NULL,
  state     TEXT NOT NULL CHECK (state IN ('conformant', 'deviation', 'not-applicable', 'unknown')),
  evidence  TEXT,
  judged_at TEXT NOT NULL,
  run_id    TEXT REFERENCES runs(id),
  PRIMARY KEY (feature, standard)
);
`;
