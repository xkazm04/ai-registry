---
subject: sql-console
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# sql-console

First touch: [[2026-09-01-1]], the librarian sweep that drained the consumer-lead inbox. Never swept before; it sat on the worklist on demand alone with 6-12 deviations.

## 2026-09-01 - inbox leads landed

Two leads (ascent), both single-repo sightings, landed narrowly. `safe-mode-guarding`: a
pending consent's target includes where the result lands, captured when the gate opens, not
when it resolves; a connection-keyed identity cannot see a same-connection destination swap.
`result-fidelity`: stale-success-plus-error is a fourth shape the truth table never declared,
produced by a transition - entering a run clears the outcome slot and only the terminal
state refills it. Applications `next--safe-mode-guarding` (the positive form is NOT present
in ascent; the negative case and the available mechanism are recorded) and
`next--result-fidelity` (house idiom clear-on-entry, one counter-example that clears error
but never result), both at ascent `a57f272c`, citing state not diffs.
First touch: [[2026-09-02-1]]. Class: MATURE (6 techniques, 3 applications
react + rust ×2; never swept before; 6 consumer deviations on the floor).

## State

6 techniques, 3 applications (react, rust, rust). No version witness. No new
application this run — no tree was read.

## What run 2026-09-02-1 changed

- `safe-mode-guarding`: **a read-only transaction envelope is session state,
  not a credential** — a stacked `COMMIT;` ends it and the tail runs with the
  connection's full rights (a published 2025 post-mortem of a protocol-facing
  database server). Layering order stated: least-privilege role → single
  statement at the driver call → classifier → envelope as the cheapest extra.
  Rule 4 (vocabulary) seeded from the SQL standard's `READ ONLY` mode as engines
  implement it: read-shaped writes belong in the mutation class.
- `result-fidelity`: the **stale-success/error pair** — on re-run in place the
  outcome slot is replaced whole; number transport anchored to RFC 8259 §6.
- `nl-assist-gating`: an author with no human behind it has no consent gate;
  agent write mode is default-off safe mode with a faster author.
- Six `use_when` rows across the three techniques.

## Inbox rulings

- "Bind the pending statement to its execution target" — already in the forge
  text on two techniques; landed as `use_when` rows so a consult routes to it.
- "Clear the previous result when a re-run fails" — landed in `result-fidelity`;
  corroborated by two unrelated public trackers (2018, 2023).

## Open leads / proposals (placed)

- "Envelope is session state, not a credential" is a general shape (a
  per-request wrapper a payload can close from inside). Recorded on
  [[credential-vault]] as a candidate clause for brokered-egress.
- The stale-success/error pair belongs equally to the table's body state model
  on re-fetch failure. Recorded on [[table]].

## Declines

- A seventh technique "engine-level read-only enforcement" — converged, but one
  clause of the guard story.
- Softening "refuse batches in safe mode" — the post-mortem shows it is exactly
  the load-bearing rule.

### Impact (2026-09-02)

Stale verdicts after this landing: personas (4). Apply row: see `librarian/applied.md`.

### 2026-09-23 - `/conform --stale` on personas (4 pairs re-judged)

3 deviation, 1 not-applicable. Batch refusal fixed; still open: a mutation acknowledgement
rendered as an empty success, NULL copied as text and pinned that way by a test, a
client-built command beside the parameterized door, NL output marked ready with no SQL.
Two claims in the 2026-08-29 detail were never true (the truncation message always named
its bound; engine errors are scrubbed backend-side). No proposals.

## 2026-10-31 - architecture review

First architecture-review record for this subject. All 12 documents read. The golden path
and five of six techniques hold. One technique carries an inaccurate gloss of the
PostgreSQL read-only list ('cursor' executions are not on it; `EXPLAIN ANALYZE` is). The
four applications citing the personas tree were checked against it at `a7b34f56`: the
engine module moved into an extracted crate (every `src-tauri/src/engine/db_query.rs`
citation is stale), the react application's banner deviation has since been fixed, and
the second mutation door now adds a single-statement check. The two ascent applications
could not be re-read from this checkout. Those are reverify items, not refreshed dates.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/sql-console",
  "date": "2026-10-31",
  "baseline": "a2473a65c",
  "digest": "sha256-b2:60a26f15745fd8c1",
  "disposition": "reverify",
  "coverage": "All 12 documents decided (golden path, 6 techniques, 5 applications). Trigger: never architecture-reviewed (state pending). Intended benefit: a console that keeps the credential in the vault and every SQL author behind one classified-statement executor. Failure if ignored: a second executor or a read-only envelope as the only guard lets a stacked COMMIT through. Boundary: foreign-schema user SQL only; the application's own persistence is data-access, grid mechanics are table, extraction is structured-output. Primary sources re-opened: RFC 8259 section 6, the PostgreSQL SET TRANSACTION page, PostgreSQL sequence.c, the Datadog Security Labs post-mortem. Consumer trees: personas read at a7b34f56; ascent not reachable from this checkout.",
  "counterexamples": [
    "A console whose only guard is a BEGIN READ ONLY envelope is escaped by a payload-internal COMMIT when the driver accepts stacked statements (the 2025 reference Postgres MCP server).",
    "A SELECT-led statement can still write: nextval() and setval() on a non-temporary sequence are refused in a PostgreSQL read-only transaction, so a first-keyword read list admits a write.",
    "An integer id above 2^53 - 1 crosses a JSON boundary without any interoperability guarantee; a console that parses it as a binary64 number shows and copies a neighbouring id.",
    "A modal overlay can keep a consent's destination frozen without capturing it, until a non-modal path (a refresh, a keyboard route) re-points it."
  ],
  "sources": [
    {
      "url": "https://www.rfc-editor.org/rfc/rfc8259#section-6",
      "result": "Read 2026-10-31. 'numbers that are integers and are in the range [-(2**53)+1, (2**53)-1] are interoperable in the sense that implementations will agree exactly on their numeric values'; 'A JSON number such as 1E400 or 3.141592653589793238462643383279 may indicate potential interoperability problems'. Supports result-fidelity's number-transport rule as written."
    },
    {
      "url": "https://www.postgresql.org/docs/current/sql-set-transaction.html",
      "result": "Read 2026-10-31. Read-only disallows 'INSERT, UPDATE, DELETE, MERGE, and COPY FROM if the table they would write to is not a temporary table; all CREATE, ALTER, and DROP commands; COMMENT, GRANT, REVOKE, TRUNCATE; and EXPLAIN ANALYZE and EXECUTE if the command they would execute is among those listed. This is a high-level notion of read-only that does not prevent all writes to disk.' Supports the envelope quote; refutes safe-mode-guarding's 'cursor' gloss (the list names EXPLAIN ANALYZE and EXECUTE, not cursors)."
    },
    {
      "url": "https://raw.githubusercontent.com/postgres/postgres/master/src/backend/commands/sequence.c",
      "result": "Read 2026-10-31. '/* read-only transactions may only modify temp sequences */ if (!seqrel->rd_islocaltemp) PreventCommandIfReadOnly(\"nextval()\");' and the same for setval(). Supports 'sequence advancement' in rule 4."
    },
    {
      "url": "https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/",
      "result": "Read 2026-10-31, dated August 21, 2025. 'Every SQL query submitted by the user is wrapped in a read-only transaction'; the input can 'terminate the transaction with a COMMIT; statement'; demo payload 'COMMIT; DROP SCHEMA public CASCADE;'; mitigations a least-privilege role and 'prepared statements, which do not allow multiple statements'. Supports the 2025 post-mortem and the layering order in safe-mode-guarding and nl-assist-gating."
    },
    {
      "source": "personas tree at a7b34f56 (read, not executed)",
      "result": "db_query.rs now lives in the extracted engine crate; is_mutation at :561, has_multiple_statements at :496, READ_SHAPED_WRITES at :307 with a parity test against the client regex; introspect_columns at :1015 still binds the sanitized name. MutationConfirmBanner renders the whole statement in a scrolling pre with a comment naming the 200-character cut it replaced. classifyDbQuery still has no caller beyond its wrapper. connector_use.rs execute_mutation still gates on starts_with over seven verbs and now also requires is_single_statement. introspectionQueries.ts getSelectAllQuery emits a Redis SCAN command at :168."
    }
  ],
  "documents": {
    "sql-console.md": {
      "disposition": "keep",
      "reason": "The containment framing, the boundaries against data-access, credential-vault, table and structured-output, the two-sided guard, one classified-statement executor and the NL lane as second author are coherent and consistent with every technique."
    },
    "techniques/safe-mode-guarding.md": {
      "disposition": "clarify",
      "reason": "Rule 4 says the read-only access mode refuses 'cursor and prepared-statement executions of a refused command'. The PostgreSQL page lists 'EXPLAIN ANALYZE and EXECUTE if the command they would execute is among those listed'; cursors are not named. Replace with EXPLAIN ANALYZE and prepared-statement EXECUTE. Sequence advancement (sequence.c) and the envelope quote and post-mortem (Datadog) are verified and stay."
    },
    "techniques/result-fidelity.md": {
      "disposition": "keep",
      "reason": "The RFC 8259 section 6 range and quote match the source. The stale-success/error pair, n+1 truncation detection and secret scrubbing are internally consistent with the golden path."
    },
    "techniques/introspection-architecture.md": {
      "disposition": "keep",
      "reason": "Names as bound values in catalog lookups, the executed-versus-emitted line, progressive disclosure and labelled row counts are sound; no unstable external claim."
    },
    "techniques/dialect-capability-declaration.md": {
      "disposition": "keep",
      "reason": "One declaration per family next to the execute dispatch, declare over probe, and minimal profile for unknown engines are coherent; no unstable external claim."
    },
    "techniques/editor-ergonomics.md": {
      "disposition": "keep",
      "reason": "The editor floor, identity-keyed bounded history, promotion to saved queries and every convenience terminating at the guard are sound and match the golden path."
    },
    "techniques/nl-assist-gating.md": {
      "disposition": "keep",
      "reason": "Second author not second path; the no-human-behind-it rule matches the Datadog mitigations (least-privilege role, statements that cannot stack) re-read this run."
    },
    "applications/next--result-fidelity.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent tree at a57f272c, which is not reachable from this checkout; no evidence of drift and none of currency. Needs a re-read of the cited hooks and MemoryRecallPanel at a current HEAD before verified_on moves."
    },
    "applications/next--safe-mode-guarding.md": {
      "disposition": "reverify",
      "reason": "Same ascent tree at a57f272c, not reachable here. Needs a re-read of ConfirmAction, usePlaybookCard and DataErasurePreview at a current HEAD, in particular whether the destination is now captured."
    },
    "applications/react--safe-mode-guarding.md": {
      "disposition": "reverify",
      "reason": "Drifted in the personas tree at a7b34f56: the banner deviation (slice at 200 characters) is fixed, the client regex for read-shaped writes moved to :54, and the Rust citation src-tauri/src/engine/db_query.rs no longer exists (now the engine crate). The classifyDbQuery zero-caller finding still holds. Needs a full line re-check and a rewrite of the deviation paragraph."
    },
    "applications/rust--introspection-architecture.md": {
      "disposition": "reverify",
      "reason": "The mechanism still holds (sanitized name bound into information_schema.columns at :1015-1060 of the moved file), but every db_query.rs path and line is stale, and the 2026-09-23 conform reported a client-built command beside the parameterized door (getSelectAllQuery now emits a Redis SCAN at :168); whether it is executed or only copied decides the 'second door deleted' claim."
    },
    "applications/rust--safe-mode-guarding.md": {
      "disposition": "reverify",
      "reason": "Paths and lines stale after the move to the engine crate, and the second-door gap changed: execute_mutation now also requires is_single_statement before reaching the pool. Needs re-citation and a re-statement of what the gap still is."
    }
  }
}
```


Phase B applied the one clarify; the record below supersedes the first 2026-10-31 record against the new bytes.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/sql-console",
  "date": "2026-10-31",
  "baseline": "a2473a65c",
  "digest": "sha256-b2:fd16b5b668df1a8e",
  "disposition": "reverify",
  "coverage": "Second record of 2026-10-31, after Phase B. The one clarify (safe-mode-guarding rule 4) was applied against the PostgreSQL SET TRANSACTION page opened this run and the edited sentence re-read. All other documents are byte-unchanged and keep the dispositions of the first 2026-10-31 record; the five applications stay reverify and no verified_on moved. Boundary, trigger and sources as in the first record.",
  "counterexamples": [
    "A console whose only guard is a BEGIN READ ONLY envelope is escaped by a payload-internal COMMIT when the driver accepts stacked statements (the 2025 reference Postgres MCP server).",
    "A SELECT-led statement can still write: nextval() and setval() on a non-temporary sequence are refused in a PostgreSQL read-only transaction, so a first-keyword read list admits a write.",
    "An integer id above 2^53 - 1 crosses a JSON boundary without any interoperability guarantee; a console that parses it as a binary64 number shows and copies a neighbouring id.",
    "A modal overlay can keep a consent's destination frozen without capturing it, until a non-modal path (a refresh, a keyboard route) re-points it."
  ],
  "sources": [
    {
      "url": "https://www.rfc-editor.org/rfc/rfc8259#section-6",
      "result": "Read 2026-10-31. 'numbers that are integers and are in the range [-(2**53)+1, (2**53)-1] are interoperable in the sense that implementations will agree exactly on their numeric values'; 'A JSON number such as 1E400 or 3.141592653589793238462643383279 may indicate potential interoperability problems'. Supports result-fidelity's number-transport rule as written."
    },
    {
      "url": "https://www.postgresql.org/docs/current/sql-set-transaction.html",
      "result": "Read 2026-10-31. Read-only disallows 'INSERT, UPDATE, DELETE, MERGE, and COPY FROM if the table they would write to is not a temporary table; all CREATE, ALTER, and DROP commands; COMMENT, GRANT, REVOKE, TRUNCATE; and EXPLAIN ANALYZE and EXECUTE if the command they would execute is among those listed. This is a high-level notion of read-only that does not prevent all writes to disk.' Supports the envelope quote; refutes safe-mode-guarding's 'cursor' gloss (the list names EXPLAIN ANALYZE and EXECUTE, not cursors)."
    },
    {
      "url": "https://raw.githubusercontent.com/postgres/postgres/master/src/backend/commands/sequence.c",
      "result": "Read 2026-10-31. '/* read-only transactions may only modify temp sequences */ if (!seqrel->rd_islocaltemp) PreventCommandIfReadOnly(\"nextval()\");' and the same for setval(). Supports 'sequence advancement' in rule 4."
    },
    {
      "url": "https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/",
      "result": "Read 2026-10-31, dated August 21, 2025. 'Every SQL query submitted by the user is wrapped in a read-only transaction'; the input can 'terminate the transaction with a COMMIT; statement'; demo payload 'COMMIT; DROP SCHEMA public CASCADE;'; mitigations a least-privilege role and 'prepared statements, which do not allow multiple statements'. Supports the 2025 post-mortem and the layering order in safe-mode-guarding and nl-assist-gating."
    },
    {
      "source": "personas tree at a7b34f56 (read, not executed)",
      "result": "db_query.rs now lives in the extracted engine crate; is_mutation at :561, has_multiple_statements at :496, READ_SHAPED_WRITES at :307 with a parity test against the client regex; introspect_columns at :1015 still binds the sanitized name. MutationConfirmBanner renders the whole statement in a scrolling pre with a comment naming the 200-character cut it replaced. classifyDbQuery still has no caller beyond its wrapper. connector_use.rs execute_mutation still gates on starts_with over seven verbs and now also requires is_single_statement. introspectionQueries.ts getSelectAllQuery emits a Redis SCAN command at :168."
    }
  ],
  "documents": {
    "sql-console.md": {
      "disposition": "keep",
      "reason": "The containment framing, the boundaries against data-access, credential-vault, table and structured-output, the two-sided guard, one classified-statement executor and the NL lane as second author are coherent and consistent with every technique."
    },
    "techniques/safe-mode-guarding.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: rule 4's 'cursor and prepared-statement executions of a refused command' now reads '`EXPLAIN ANALYZE` and prepared-statement `EXECUTE` of a refused command', matching the PostgreSQL read-only list; sequence advancement and the envelope paragraph unchanged."
    },
    "techniques/result-fidelity.md": {
      "disposition": "keep",
      "reason": "The RFC 8259 section 6 range and quote match the source. The stale-success/error pair, n+1 truncation detection and secret scrubbing are internally consistent with the golden path."
    },
    "techniques/introspection-architecture.md": {
      "disposition": "keep",
      "reason": "Names as bound values in catalog lookups, the executed-versus-emitted line, progressive disclosure and labelled row counts are sound; no unstable external claim."
    },
    "techniques/dialect-capability-declaration.md": {
      "disposition": "keep",
      "reason": "One declaration per family next to the execute dispatch, declare over probe, and minimal profile for unknown engines are coherent; no unstable external claim."
    },
    "techniques/editor-ergonomics.md": {
      "disposition": "keep",
      "reason": "The editor floor, identity-keyed bounded history, promotion to saved queries and every convenience terminating at the guard are sound and match the golden path."
    },
    "techniques/nl-assist-gating.md": {
      "disposition": "keep",
      "reason": "Second author not second path; the no-human-behind-it rule matches the Datadog mitigations (least-privilege role, statements that cannot stack) re-read this run."
    },
    "applications/next--result-fidelity.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent tree at a57f272c, which is not reachable from this checkout; no evidence of drift and none of currency. Needs a re-read of the cited hooks and MemoryRecallPanel at a current HEAD before verified_on moves."
    },
    "applications/next--safe-mode-guarding.md": {
      "disposition": "reverify",
      "reason": "Same ascent tree at a57f272c, not reachable here. Needs a re-read of ConfirmAction, usePlaybookCard and DataErasurePreview at a current HEAD, in particular whether the destination is now captured."
    },
    "applications/react--safe-mode-guarding.md": {
      "disposition": "reverify",
      "reason": "Drifted in the personas tree at a7b34f56: the banner deviation (slice at 200 characters) is fixed, the client regex for read-shaped writes moved to :54, and the Rust citation src-tauri/src/engine/db_query.rs no longer exists (now the engine crate). The classifyDbQuery zero-caller finding still holds. Needs a full line re-check and a rewrite of the deviation paragraph."
    },
    "applications/rust--introspection-architecture.md": {
      "disposition": "reverify",
      "reason": "The mechanism still holds (sanitized name bound into information_schema.columns at :1015-1060 of the moved file), but every db_query.rs path and line is stale, and the 2026-09-23 conform reported a client-built command beside the parameterized door (getSelectAllQuery now emits a Redis SCAN at :168); whether it is executed or only copied decides the 'second door deleted' claim."
    },
    "applications/rust--safe-mode-guarding.md": {
      "disposition": "reverify",
      "reason": "Paths and lines stale after the move to the engine crate, and the second-door gap changed: execute_mutation now also requires is_single_statement before reaching the pool. Needs re-citation and a re-statement of what the gap still is."
    }
  }
}
```

## Architecture review - 2026-10-31 (after re-verification)

This record follows the re-verification of applications at personas@22260d77; the two rust applications changed since the previous record.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/sql-console",
  "date": "2026-10-31",
  "baseline": "a1e825611",
  "digest": "sha256-b2:050838e3afdc6f34",
  "disposition": "clarify",
  "coverage": "All 12 documents decided. Since the previous record, the two rust applications changed (re-anchored to the extracted engine crate, verified_on 2026-10-31, verified_against rust@1, dated re-check paragraphs); both were read in full and spot-checked at personas@22260d77. Techniques, golden path and the next/react applications are byte-unchanged since the previous record and keep their dispositions.",
  "counterexamples": [
    "A console whose only guard is a BEGIN READ ONLY envelope is escaped by a payload-internal COMMIT when the driver accepts stacked statements (the 2025 reference Postgres MCP server).",
    "A SELECT-led statement can still write: nextval() and setval() on a non-temporary sequence are refused in a PostgreSQL read-only transaction, so a first-keyword read list admits a write.",
    "An integer id above 2^53 - 1 crosses a JSON boundary without any interoperability guarantee; a console that parses it as a binary64 number shows and copies a neighbouring id.",
    "A modal overlay can keep a consent's destination frozen without capturing it, until a non-modal path (a refresh, a keyboard route) re-points it.",
    "A model-authored mutation lane can gain a single-statement check and a SQLite authorizer and still never meet the executor's classifier, so the type-system gap survives a hardened door (connector_use.rs at personas@22260d77)."
  ],
  "sources": [
    {
      "source": "personas at 22260d77 (read, not executed)",
      "result": "src-tauri/engine/src/db_query.rs: READ_SHAPED_WRITES :307, strip_sql_literals :404, has_multiple_statements :496, body_has_mutation :510 (no cte_body_has_mutation remains), is_mutation :561, introspect_tables_paged :914, introspect_columns :1015. connector_use.rs:1525-1549 checks starts_with, then is_single_statement, then calls agent_sql_guard::run_agent_mutation (src-tauri/db/src/agent_sql_guard.rs:179). getSelectAllQuery's only non-test caller is TablesTab.tsx:104 via copyText."
    }
  ],
  "documents": {
    "sql-console.md": {
      "disposition": "keep",
      "reason": "The containment framing, the boundaries against data-access, credential-vault, table and structured-output, the two-sided guard, one classified-statement executor and the NL lane as second author are coherent and consistent with every technique."
    },
    "techniques/safe-mode-guarding.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: rule 4's 'cursor and prepared-statement executions of a refused command' now reads '`EXPLAIN ANALYZE` and prepared-statement `EXECUTE` of a refused command', matching the PostgreSQL read-only list; sequence advancement and the envelope paragraph unchanged."
    },
    "techniques/result-fidelity.md": {
      "disposition": "keep",
      "reason": "The RFC 8259 section 6 range and quote match the source. The stale-success/error pair, n+1 truncation detection and secret scrubbing are internally consistent with the golden path."
    },
    "techniques/introspection-architecture.md": {
      "disposition": "keep",
      "reason": "Names as bound values in catalog lookups, the executed-versus-emitted line, progressive disclosure and labelled row counts are sound; no unstable external claim."
    },
    "techniques/dialect-capability-declaration.md": {
      "disposition": "keep",
      "reason": "One declaration per family next to the execute dispatch, declare over probe, and minimal profile for unknown engines are coherent; no unstable external claim."
    },
    "techniques/editor-ergonomics.md": {
      "disposition": "keep",
      "reason": "The editor floor, identity-keyed bounded history, promotion to saved queries and every convenience terminating at the guard are sound and match the golden path."
    },
    "techniques/nl-assist-gating.md": {
      "disposition": "keep",
      "reason": "Second author not second path; the no-human-behind-it rule matches the Datadog mitigations (least-privilege role, statements that cannot stack) re-read this run."
    },
    "applications/next--result-fidelity.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent tree at a57f272c, which is not reachable from this checkout; no evidence of drift and none of currency. Needs a re-read of the cited hooks and MemoryRecallPanel at a current HEAD before verified_on moves."
    },
    "applications/next--safe-mode-guarding.md": {
      "disposition": "reverify",
      "reason": "Same ascent tree at a57f272c, not reachable here. Needs a re-read of ConfirmAction, usePlaybookCard and DataErasurePreview at a current HEAD, in particular whether the destination is now captured."
    },
    "applications/react--safe-mode-guarding.md": {
      "disposition": "reverify",
      "reason": "Drifted in the personas tree at a7b34f56: the banner deviation (slice at 200 characters) is fixed, the client regex for read-shaped writes moved to :54, and the Rust citation src-tauri/src/engine/db_query.rs no longer exists (now the engine crate). The classifyDbQuery zero-caller finding still holds. Needs a full line re-check and a rewrite of the deviation paragraph."
    },
    "applications/rust--introspection-architecture.md": {
      "disposition": "keep",
      "reason": "re-verified 2026-10-31 against personas@22260d77: anchors re-pointed to src-tauri/engine/src/db_query.rs and spot-checked; the dated paragraph adds paged table introspection and says the verdict and both deviations stand. The question the previous record left open is settled: getSelectAllQuery's only non-test caller copies it to the clipboard (TablesTab.tsx:104), so 'the second door was deleted' holds."
    },
    "applications/rust--safe-mode-guarding.md": {
      "disposition": "clarify",
      "reason": "re-verified 2026-10-31 against personas@22260d77; the dated paragraph's account holds on spot-check and keeps the verdict (the executor still takes a raw &str and the companion lane never meets is_mutation). Two body sentences now contradict it: the classifier bullet still cites 'cte_body_has_mutation (:340)', which no longer exists (body_has_mutation at :510), and the gap section still says the companion lane 'then calls the driver directly', where it now runs through agent_sql_guard::run_agent_mutation. Owed: re-anchor that bullet and restate the gap sentence."
    }
  }
}
```
