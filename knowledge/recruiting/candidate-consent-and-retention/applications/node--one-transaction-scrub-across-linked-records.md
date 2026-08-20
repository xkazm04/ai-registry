---
layer: application
type: application
subject: candidate-consent-and-retention
technique: one-transaction-scrub-across-linked-records
stack: node
status: forged
---

# One-transaction erasure across the candidate graph (Node/SQLite)

## The entry point

`anonymizeEntry(entryId, reason, workspaceId)` —
`app/_lib/db/pipeline.ts:1667-1739` — is the whole erasure, wrapped in a single
`db.transaction(...)`. It serves both callers: the retention sweep
(`reason: "expiry"`) and the candidate's self-service request
(`reason: "erasure"`, from `app/api/data/[token]/route.ts:56`). One code path,
two reasons, one audit distinction.

Idempotence is the second statement in the body: `if (row.anonymized_at) return
rowToEntry(row)` — already scrubbed is a no-op that still returns the record.

## The tenancy incident this function is shaped by

`app/api/data/[token]/route.ts:47-55` carries the incident comment verbatim,
and it is the clearest statement of the failure the technique exists to
prevent:

> `anonymizeEntry` scrubs under `WHERE id = ? AND workspace_id = ?`, so the
> bare call matched NO row for any candidate outside the default workspace —
> the scrub silently did nothing while this endpoint still answered
> `{ erased: true }`. A candidate exercised their Art. 17 right to erasure, was
> told it was done, and their name, contact, CV profile, saved analyses and
> interview transcript stayed fully readable on the recruiter's board.

The fix is also the right one: the workspace comes off the row **the token
resolved to** — never a session, because this is a public capability-link route
and has none. The scope is derived from the person, not from the requester.

The same bug recurred one level down. `anonymizeProfile` was called bare while
every other statement in the transaction was scoped
(`app/_lib/db/pipeline.ts:1687-1694`): the entry was masked and stamped
`anonymized_at` while "the candidate's CV payload — the largest PII blob in the
system — survived intact and the caller was told the erasure succeeded". Two
instances of the identical shape, in the same call chain, found separately.

## The graph, in transaction order

1. **The person row** (`:1675-1680`) — `candidate_label` replaced with
   `maskCandidateName(...)`, and `contact`, `github_handle`, `github_json`,
   `notes` nulled. `erasure_token` is nulled too, and `anonymized_at` stamped.
2. **Denormalised label copies** (`:1681-1683`) — `pipeline_events` snapshots
   the candidate label on every audit row, so they are masked in the same
   transaction. The comment is exact: otherwise "the activity feed can't
   reconstruct the name" would be false. This is the shape teams miss most.
3. **The linked CV profile** (`:1694`) — `anonymizeProfile(candidate_id,
   workspaceId)`, best-effort because a recruiter stub has no CV blob.
4. **Saved analyses** (`:1695-1729`) — the hard case, below.
5. **Every other entry-linked table** (`:1730-1733`) —
   `scrubEntryLinkedPii(db, entryId, candidate_id, masked)` covers interview
   transcript and scorecard, comms outbox, offer, prep, schedule, onboarding
   and rediscovery records. Same transaction handle, so it rolls back with
   everything else.
6. **The consent event** (`:1734`) — `logConsentEvent(db, entryId, reason ===
   "erasure" ? "erased" : "anonymized", ...)`, inside the transaction.

## The table with no foreign key

`analyses` holds the full CV payload — `rawText`, name, email, phone, verbatim
evidence, plus a `github_json` dossier — and has **no FK back to the entry**.
The scrub therefore matches on the normalised candidate label,
`LOWER(TRIM(...))` on both sides (`:1708-1713`), mirroring
`findActiveEntriesByCandidateLabel`, the app's canonical candidate↔entry link.
The comment records what the naive `= candidate_label` cost: a padded or
differently-cased label saved at another intake (`"jan novák "` vs
`"Jan Novák"`) was silently missed, leaving the CV readable in History and via
`/api/analyses/[slug]`.

It is also honest about the residual: within one workspace an exact-label
namesake still collides, and over-scrubbing the same tenant's row is "the
documented safe direction", with a real per-candidate FK named as the durable
fix. That is the asymmetry the technique asks for, written down rather than
discovered.

Cross-tenant over-scrubbing is prevented by scoping the same query to
`workspace_id`, so a same-named candidate in another tenant is never touched.

## Deep redaction, and the corrupt-payload rule

Each matched analysis payload goes through `scrubPiiFromPayload`
(`app/_lib/consent.ts:197-221`), which walks the object generically rather than
binding to a schema and applies three classes:

- `PII_KEYS` (`:145-162`) — exact lowercased match on `name`, `fullname`,
  `rawtext`, `email`, `phone`, `contact`, `address`, `links`, `linkedin`,
  `github`, `githubhandle`, `dateofbirth`, `birthyear`, `photo`, `avatar`.
  Exact matching so `username` survives while `name` does not.
- `PII_ARRAY_KEYS` (`:166`) — `evidence`, emptied wholesale, because free-text
  evidence arrays quote the CV verbatim and leak the name after the structured
  fields are blanked.
- `PII_CONTAINER_KEYS` (`:168-181`) — `evidenceTrace`, whose entire subtree is
  verbatim CV quotes (`{experience, skills, seniority, education, salary}`,
  each a `string[]`). It was "walked straight through before — its quotes
  survived Art. 17 erasure and were re-exported by the provenance dossier".
  `deepRedact` (`:184-195`) now recurses: strings → `""`, arrays → `[]`,
  objects recurse, numbers/booleans/null kept so the structure still parses.

And the corrupt case (`:1722-1726`): a payload that will not parse is replaced
wholesale with `"{}"` — "rather than leave un-scrubbed PII or abort the
erasure". Both tempting alternatives rejected, in a comment, at the site.

What deliberately survives the scrub is the non-identifying recruitment signal
— skills, scores, seniority, role family, salary band, traits — so
talent-rediscovery can still rank the retained record. Erasure as
transformation, not deletion.

## The carve-out

`docs/features/compliance/README.md:48-49` records that the sealed,
hash-chained `decision_records` log is **not** scrubbed by erasure, citing the
Art. 17(3)(b)/(e) legal-claims basis, with the ground stated in the module
header comment at `pipeline.ts:1332-1335`. `README.md:198-200` repeats it in
the schema inventory. The enumeration is narrow — the sealed decision chain and
the consent history — which is what keeps it a carve-out rather than a
retention loophole.

## Deviations against the standard

- **The receipt does not enumerate.** `app/api/data/[token]/route.ts:57`
  returns `{ erased: true }`. The standard requires the receipt to name what
  was destroyed, what was reduced to a shell, and what was retained under the
  carve-out with its ground and end date. The standard stays.
- **Replay 404s instead of re-confirming.** `erasure_token` is nulled in the
  scrub, so a second request finds no entry and returns `404`
  (`route.ts:39-41`). `anonymizeEntry` itself is properly idempotent; the token
  is not. A person re-checking their own erasure sees an error, not a
  confirmation.
- **No end date on the carve-out.** The retained decision chain has a stated
  ground but no expiry, so the enumerated exemption is currently unbounded in
  time.
