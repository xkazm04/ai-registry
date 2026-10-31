---
layer: application
type: application
subject: audit-logging
technique: write-chokepoint
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.80
---

# The credential audit ledger's one door

The canonical ledger is `src-tauri/db/src/repos/resources/audit_log.rs`,
and its module layout *is* the technique: a section header at `:29-31`
reads "Insert (append-only -- no update or delete functions)" and the
file delivers exactly that — `insert` plus read queries, no mutation
surface to call. The doc comment on `insert` (`:33-41`) states the whole
contract in one paragraph: "the single chokepoint for ALL credential
audit writes (decrypt at injection, healthcheck, CRUD ops)" — the writer
list, enumerated in the door's own documentation.

## Every invariant lives inside the door

- **Sanitization at insert**: `insert_inner` runs the free-text `detail`
  through `sanitize_secrets` (`audit_log.rs:89`) before the `INSERT` —
  the scrubber (`src-tauri/core/src/utils/sanitization.rs:22`) masks
  bearer/basic authorization values, key:value secret pairs, known key
  prefixes, and emails, with its regexes compiled once because, per its
  own comment, it "runs on every audit-log write."
- **Timestamp and identity minted at the door**: `insert_inner` assigns
  the UUID and the UTC timestamp (`audit_log.rs:85-86`); callers cannot
  supply either.
- **Failure accounting wrapped around the write**: `insert` delegates to
  `insert_inner` and, on error, increments the process-wide counter via
  `record_credential_audit_write_failure()` and logs a warning that
  names the consequence — "operation proceeded without an audit trail
  (counted on vault_status)" (`audit_log.rs:60-69`). The counter is
  defined in `src-tauri/core/src/crypto.rs:183-202` and surfaced as
  `credential_audit_write_failures` in the `vault_status` command
  (`src-tauri/src/commands/credentials/crud.rs:483-497`). A regression
  test pins the increment
  (`src-tauri/src/engine/runner/credentials.rs:1291-1341`).
- **Origin tagging**: the `log_decrypt` wrapper (`audit_log.rs:211-228`)
  takes a `caller` argument — `"api_proxy"`, `"healthcheck"`,
  `"db_query"` — so the decrypt records carry which subsystem opened the
  value.

## Placement above the door

Callers choose their error posture without touching the guarantees:
`insert_warn` (`audit_log.rs:185-204`) is the fire-and-forget wrapper
that logs and swallows — availability over auditability, with the gap
still counted, because the counter lives *inside* `insert`, below every
wrapper. The incidents promoter is layered the same way:
`promote_credential_audit` is called from inside `insert_inner`
(`audit_log.rs:110`) and is itself best-effort by contract — its module
doc (`src-tauri/db/src/audit_incidents_promoter.rs:6-9`) states
"Promotion failure must NEVER fail the parent audit insert."

## Where the technique's warning is visible

The frontend module named for this concern —
`src/lib/execution/middleware/auditMiddleware.ts` — demonstrates the
*placement* half (middleware registered on pipeline stages
`create_record` and `finalize_status`, so every execution passes it) but
its output is `logger.info` diagnostics, not ledger rows: an "audit"
name on what is structurally telemetry. The distinction the golden path
draws — business record vs. diagnostic output — is exactly the line this
file sits on the wrong side of, and it is the counter-example cited in
the golden path's frontmatter.
