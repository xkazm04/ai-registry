---
layer: application
type: application
subject: pre-boarding-and-first-day-handoff
technique: pre-boarding-questionnaire-as-a-hire-record
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: code
ab_verdict: better
---

# A retired questionnaire module still holds its answers — a Next.js/SQLite recruiting studio

The technique's deletion rule ends on a sentence added in the 2026-09-29 pass: removing
a feature does not remove what it collected, and a retired questionnaire module leaves
its answers in every database that predates the removal until a migration drops them.
This studio is the case the sentence came from, so it is also the place to test it.

## What the tree does

The post-hire onboarding module (checklists, the pre-boarding questionnaire, an
internal e-signature stamp) was removed on 2026-08-18 without a drop migration. The
tenancy manifest says so in its own words: the five `onboarding_*` tables are in
`TENANCY_RETIRED_TABLES` (`app/_lib/tenancy.ts:543`), inert to the code and still
present in any database created earlier. The erasure path kept its scrub for them.
`scrubEntryLinkedPii` (`app/_lib/db/pipeline.ts:2438-2453`) blanks the run label, the
questionnaire `answers_json` and the signature `signer`, guarded by `tables.has(...)`,
and a comment says why the block must stay: delete it only together with a migration
that drops the tables.

## Probe

A throwaway unit test against the tree's isolated test database, run with the
repository's own loader flags and deleted afterwards. It creates the five legacy tables
from the module's original DDL, an entry at stage `Hired`, and one row each: a run,
questionnaire answers (a phone number and an immunisation answer), a signature with the
signer's name, and a task state. Then `anonymizeEntry(id, "erasure", workspace)` and a
read-back. Two arms over the same probe:

- **A** = the parent of the commit that added the onboarding scrub (983957295, module
  still live). Run label `Jana Novakova`, answers `{"phone":"+420 777 000 111",
  "immunisation":"yes"}`, signer `Jana Novakova` all survive an erasure the data subject
  is told has happened.
- **B** = current main (b65ce4b8e). Label masked to `Jana N.`, answers `{}`, signer
  `null`. The task-state row (task id, done flag, timestamp) holds nothing that names the
  person and is left, which is the right call.

## What this application says about the technique

- **The sentence holds, and the arm-A row is the reason it is a rule.** Health-adjacent
  answers were readable after an erasure until the scrub landed; "collect on the
  assumption you will be deleting it" needs a deletion path that reaches the table, not
  only a promise at collection time.
- **A condition it gains.** The deletion path has to outlive the module. The scrub is
  keyed to table existence, not to a feature flag, so it costs nothing on a database
  created after the removal and still reaches one created before. A team that deletes a
  collector should delete its writer and keep its scrub until a migration drops the
  rows.
- **Not measured.** Whether any production database still holds such rows; the erasure
  of a hire who never started (this probe erased a `Hired` entry).
