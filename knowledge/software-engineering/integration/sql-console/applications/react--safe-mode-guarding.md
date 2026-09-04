---
layer: application
type: application
subject: sql-console
technique: safe-mode-guarding
stack: react
verified_on: 2026-09-02
verified_against: react@19
applied: code
ab_verdict: better
proof: ab-paired
---

# The client mirror and the consent gate

The client side of the guard is two files under
`src/features/vault/sub_databases/`: `safeModeUtils.ts` (the mirror
classifier) and `hooks/useQuerySafeMode.ts` (the consent gate). Both editors
and the NL chat lane consume the hook, so there is one client-side gate for
three authors.

## The mirror

`safeModeUtils.ts:1-7` states its own status: *"Mirrors the Rust
`is_mutation()` logic so the UI can show instant feedback without an IPC
round-trip. The backend still enforces the guard — this is purely for the
confirmation dialog decision."* That is the advisory-mirror contract in the
code's own words.

`isMutationQuery` (`:37-68`) reproduces the authority's structure:

- leading `--` and `/* */` comments stripped first (`:41-53`), with an
  unclosed block comment returning `true` — fail-closed (`:48`);
- first keyword tested against `READ_ONLY_KEYWORDS` (`:9-18`);
- a `WITH`-led statement does not stop there: `stripSqlLiterals` (`:26-34`,
  dollar-quoted, single-quoted, double-quoted) runs before
  `MUTATION_VERBS_RE` scans the body (`:62-65`).

**Deviation, measured by the legacy corpus (closed since):** on 2026-08-18
the client's CTE verb regex omitted `DROP` and `ALTER`, which the Rust list
carried — the two mirrors disagreed on 2 of 47 fixture statements, failing
closed (the server refused what the client would have let through to a
confirm dialog). As of 2026-09-02 `MUTATION_VERBS_RE` (`:41`) carries both,
with a comment naming the backend constant it mirrors. The structural fix
the technique prescribes — one shared vocabulary — is still available and
unused: `classify_db_query` (`src-tauri/src/commands/credentials/db_schema.rs:165`)
exposes the authoritative classifier over IPC with a typed wrapper at
`src/api/vault/database/dbSchema.ts:64` and has zero callers. The two
sides are kept in step by paired comments and paired tests, not by one home.

## Read-shaped writes: an A/B on the vocabulary (2026-09-02)

The technique's rule 4 says to seed the mutation class from the engine's
definition of a read-only transaction, because a list of hand-typed verbs
misses the statements whose first token is `SELECT`. Measured here before
the change: **both** guards scanned a statement body only when it led with
`WITH` (the client also for `EXPLAIN`); anything `SELECT`- or `VALUES`-led
was granted read-only status on its first keyword alone
(`is_mutation`, `src-tauri/src/engine/db_query.rs:540`; `isMutationQuery`,
`safeModeUtils.ts:165`).

- **A** (tree as found), nine read-shaped writes through the client mirror
  via a scratch harness: `SELECT * INTO`, `INTO OUTFILE`, `FOR UPDATE`,
  `FOR SHARE`, `nextval`, `setval`, `VALUES (nextval(...))`,
  `pg_terminate_backend`, and `COMMIT; DROP` — **8 of 9 passed as
  read-only** with no confirm banner. The one refusal was the batch rule,
  not the vocabulary. Eight near-miss reads (`updated_at`, `deleted`,
  `shares`, verbs inside literals and comments): 0 of 8 over-blocked.
- **B**: a `READ_SHAPED_WRITES` vocabulary (`INTO`, `SHARE`, `NEXTVAL`,
  `SETVAL`, `LO_IMPORT`, `LO_EXPORT`, `PG_TERMINATE_BACKEND`,
  `PG_CANCEL_BACKEND`; `UPDATE` already in the verb list covers
  `FOR UPDATE`) held once per side and scanned, token-exact over stripped
  text, for `SELECT`/`VALUES`/`EXPLAIN`-led bodies as well as `WITH`. Same
  nine: **0 of 9 pass**; same eight near misses: 0 of 8 over-blocked. The
  project's own gates read the same verdict — vitest 27/27 on the classifier
  and consent-flow suites, `db_query::tests` 81/81 including two new cases.
  The Rust arm also closed `EXPLAIN ANALYZE <mutation>`, which the client
  had held alone since 2026-08 while the authority did not.

Two things the tree showed that the A/B did not need:

- **The envelope half of the finding has no seam here.** Nothing in the
  tree wraps a statement in `BEGIN ... READ ONLY`; the layering is
  credential (the user's own), then the batch rule, then the classifier.
  So the `COMMIT;` case was already refused, by a rule that never looked at
  the word `COMMIT` — the single-statement guard is doing the envelope's
  job before an envelope exists.
- **A read-shaped write now reaches the row-limit injector only in write
  mode**, and the injector (`db_query.rs`, `inject_row_limit`) appends
  `LIMIT n+1` to any `SELECT`-led single statement — after `FOR UPDATE`,
  which Postgres rejects. Pre-existing, and now the confirmed path's
  failure rather than safe mode's; left for the injector to learn lock
  clauses.

What this realization cannot do: it is still token scanning, so a column
literally named `share` or `into` (unquoted) raises one extra confirm. That
is the over-block direction the technique accepts for a guard.

## The consent gate

`useQuerySafeMode` (`hooks/useQuerySafeMode.ts:21-79`) turns the mirror's
verdict into the gate:

```ts
// useQuerySafeMode.ts:24, :40-49
const [safeMode, setSafeMode] = useState(true);            // default ON
const guardedExecute = useCallback(async (queryText) => {
  if (safeMode && isMutationQuery(text)) {
    setPendingMutation(text);                               // hold, don't run
    pendingRunQueryRef.current = runQuery;
    return;
  }
  await runQuery(text, !safeMode);                          // allow_mutation follows the mode
}, [safeMode, runQuery]);
```

Confirming (`confirmMutation`, `:51-64`) re-issues the held text with
`allowMutation = true`; the server then re-classifies and permits it. The
mirror decided whether to *ask*; the authority decides whether to *run*.

**Consent bound to its target:** the held statement is pinned to the
`runQuery` identity in effect when it was stashed (`:31`, `pendingRunQueryRef`);
an effect (`:33-38`) and a belt-and-braces check inside `confirmMutation`
(`:55-59`) void the pending mutation if the parent swaps `runQuery` —
which callers memoize on the `(credentialId, queryId)` tuple, per the
docstring at `:13-19`. The user cannot accept a destructive confirm whose
underlying connection changed underneath them.

## The banner, and its measured deviation

`tabs/MutationConfirmBanner.tsx` renders the held statement in a `<pre>`
with the run/cancel pair. **Deviation:** `:41` slices the statement at 200
characters (`pendingMutation.slice(0, 200) + '...'`) inside a `max-h-20`
container — consent to a prefix, in the one mode (write mode) where the
server's batch refusal is skipped and a pass-through connector forwards the
tail verbatim. The technique's rule is scroll, never slice.

## Three authors, one hook

`tabs/ConsoleTab.tsx:37`, `tabs/QueryEditorPane.tsx:73`, and the NL lane
`tabs/ChatTab.tsx:177` each call `useQuerySafeMode(runQuery)`; the chat
lane's comment at `:180-181` says why: *"AI-suggested mutations get the same
confirm dialog as the SQL editor, driven by the shared useQuerySafeMode
hook (safe mode on by default)."* The consent gate is one component, so a
hardening lands in all three lanes at once.
