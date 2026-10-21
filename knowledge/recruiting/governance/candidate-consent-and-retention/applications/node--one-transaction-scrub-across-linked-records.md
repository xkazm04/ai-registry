---
layer: application
type: application
subject: candidate-consent-and-retention
technique: one-transaction-scrub-across-linked-records
stack: node
status: forged
verified_on: 2026-10-21
verified_against: node@24
---

# One-transaction erasure across the candidate graph (Node/SQLite)

Re-read at kp `efa2089f1` on 2026-10-21. The first reading, on 2026-08-20, cited
`anonymizeEntry` at lines 1667-1739. The function now starts at line 2783 and has
gained a race guard, a pseudonymous-hash scrub, an address-keyed outbox scrub,
post-commit file deletion, and a test-pinned exemption inventory. Every anchor below
is from the re-read.

## The entry point

`anonymizeEntry(entryId, reason, workspaceId)` —
`app/_lib/db/pipeline.ts:2783` — is the whole erasure, wrapped in a single
`db.transaction(...)` run as `tx.immediate()` (`:2900`). It serves both callers: the
retention sweep (`reason: "expiry"`) and the candidate's self-service request
(`reason: "erasure"`, from `app/api/data/[token]/route.ts:86`). One code path,
two reasons, one audit distinction.

## Idempotence, now under two writers

The read-side guard is still there:
`app/_lib/db/pipeline.ts:2788 "already scrubbed — no-op"`. By itself it was not
idempotence. The two doors could both pass it before either wrote, because the
transaction was deferred. The second pass then masked an already-masked label,
re-ran the linked scrub, and logged a second consent event. The audit trail showed
one candidate erased twice.

Two fixes, deliberately both. `.immediate()` takes the write lock at BEGIN, which
covers writers on this connection. The claim update re-asserts the guard in SQL,
`AND anonymized_at IS NULL` (`:2808`), and a zero row count returns the row as it
stands, which covers a second connection on the same file. The technique asks that a
second request produce the same end state and no error. This adds the concurrent case:
two requests at once must also produce one consent event, not two.

## The tenancy incident this function is shaped by

`app/api/data/[token]/route.ts:79` carries the incident comment, still the clearest
statement of the failure the technique exists to prevent. The scrub is scoped
`WHERE id = ? AND workspace_id = ?`, so a bare call matched no row for any candidate
outside the default workspace. The endpoint still answered `{ erased: true }`, and
the candidate's name, contact, CV profile, saved analyses and interview transcript
stayed readable on the recruiter's board. The workspace comes off the row the token
resolved to, never a session, because this is a public capability-link route.

The same bug recurred one level down, and its comment is at the call
(`app/_lib/db/pipeline.ts:2838`). `anonymizeProfile` was called bare while every
other statement was scoped, so "the candidate's CV payload — the largest PII blob in
the system — survived intact and the caller was told the erasure succeeded".

## The graph, in transaction order

1. **The person row** (`:2808`). The label is masked, and `contact`, `github_handle`,
   `github_json`, `notes`, `erasure_token`, `optout_token` and `applicant_key` are
   nulled in the claiming update.
2. **Denormalised label copies** (`:2827`). `pipeline_events` snapshots the label on
   every audit row, so those are masked in the same transaction.
3. **The linked CV profile** (`:2838`), scoped.
4. **Saved analyses** (`:2852-2878`). This is the table with no foreign key, covered below.
5. **Every other entry-linked table** (`:2880`). `scrubEntryLinkedPii` covers the note
   thread (deleted, since "a thread of notes has no retained half"), interview transcript
   and scorecard, comms outbox, offer, prep, schedule, onboarding and rediscovery records.
6. **Letters sent before the person was an entry** (`:2888`). Knockout-decline mail
   to an address that later applied has no `ref`, so the entry-keyed scrub cannot reach
   it. It is matched on the trimmed, case-folded address within the workspace. This is
   the technique's human-readable-key shape, found a second time.
7. **The consent event** (`:2891`), inside the transaction.

Then, after commit: interview audio files are deleted (`:2915`). An unlink cannot be
rolled back, so deleting inside the transaction would destroy audio for an erasure that
then failed. The calendar event naming the candidate is removed by the route after
`anonymizeEntry` returns.

## The table with no foreign key

`analyses` holds the full CV payload and has no FK back to the entry. The scrub matches
on the normalised label, `LOWER(TRIM(...))` on both sides (`:2855`), mirroring
`findActiveEntriesByCandidateLabel`. The comment keeps the residual honest: an
exact-label namesake in the same workspace still collides, over-scrubbing it is "the
documented safe direction", and a real per-candidate FK is named as the durable fix.

New since the first reading: `cv_hash` is nulled with the payload (`:2859`). A SHA-256
of the CV bytes is a pseudonymous identifier. A scrubbed row that kept it joined
straight back to the same file uploaded again after the erasure.

## Deep redaction, and the corrupt-payload rule

Each matched payload goes through `scrubPiiFromPayload` (`app/_lib/consent.ts:237`)
with three key classes: `PII_KEYS` (`:173`), which now includes `explanation` because
the keyless builder writes the candidate's name into the verdict prose (`:181`);
`PII_ARRAY_KEYS` (`:201`), which now includes the extractor's `parsingNotes`; and
`PII_CONTAINER_KEYS` (`:215`), which now covers `extractionComparison` (two more full
copies of the CV text) and `interviewKit` besides `evidenceTrace`. `deepRedact`
(`:220`) recurses: strings become `""`, arrays `[]`, other scalars are kept. A payload
that will not parse is replaced with `"{}"` (`app/_lib/db/pipeline.ts:2872`), rather
than leaving PII or aborting the erasure.

## The inventory is a test, not a document

`ERASURE_EXEMPT` (`app/_lib/db/pipeline.ts:2380`) is the declared list, and each entry
carries either a legal basis or a factual "holds no personal data". `erasure-full-scrub.test.ts:257`
enumerates every workspace-scoped table and fails on any that is neither scrubbed in
the erasure region, delegated to a named function, nor exempted with a reason. A new
table cannot opt out by being forgotten. That is the technique's "inventory, or a written
reason why not" made executable.

Two exemptions show the newer rule about stores the scrub cannot key into.
`role_run_stages` holds no personal data "by construction, not by convention", enforced
at its one write door (`app/_lib/db/role-runs.ts:235`, `assertStagePayloadPiiFree`).
`llm_usage` is exempt because its free-text reason column is reduced to a closed
vocabulary on the Python side; see the python application. The test's reach ends at the
tenancy manifest. Files on disk are not tables, and the python application records the
one store that falls outside it.

## The carve-out

`decision_records`, the sealed, hash-chained decision log, is exempt on the
Art. 17(3)(b)/(e) basis (`app/_lib/db/pipeline.ts:2443`). The entry says the retention is
"DISCLOSED on /data instead of over-promised as deleted". The enumeration is narrow,
covering the sealed chain, the consent history and the observed-process chain of an
assessment. kp's own `docs/features/compliance/README.md` still points readers to
`pipeline.ts:1332-1335` for the ground, a line range the file has long since moved past.

## Deviations against the standard

- **The receipt does not enumerate.** `app/api/data/[token]/route.ts:96` returns
  `{ erased: true }`. The standard requires the receipt to name what was destroyed, what
  was reduced to a shell, and what was retained under the carve-out with its ground and
  end date. The standard stays.
- **The receipt does not wait for the external stores.** Audio files and the calendar
  event are deleted after commit, best-effort, with the sweep owning retries, and the
  answer is `{ erased: true }` either way. The technique's external-store clause is to
  record those deletions as pending and to let the receipt wait for reconciliation.
  Ordering them after commit is right. Confirming before they finish is not.
- **Replay 404s instead of re-confirming.** `erasure_token` is nulled in the scrub, so a
  second request finds no entry and returns `404` (`route.ts:77`; the comment at `:67`
  states it). `anonymizeEntry` is idempotent; the token is not.
- **No end date on the carve-out.** The retained decision chain has a stated ground but
  no expiry. The fleet map's 2026-10-18 conform verdict records this deviation too.
