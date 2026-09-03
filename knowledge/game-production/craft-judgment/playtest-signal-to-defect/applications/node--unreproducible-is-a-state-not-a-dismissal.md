---
layer: application
type: application
subject: playtest-signal-to-defect
technique: unreproducible-is-a-state-not-a-dismissal
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@24
---

# Finding fingerprints and the scoped "mark fixed" sweep

Realized in the Pillars of Fortune (PoF) app — a Next.js 16 / better-sqlite3 tree whose AI Game
Director records agent-played sessions and tracks their findings across builds. Citations are
resolved against commit `9aa31407` on `master`, on Node 24. The relevant modules are
`src/lib/game-director-db.ts` (session and finding storage) and `src/lib/regression-tracker.ts`
(cross-session identity and state).

## The durable finding: fingerprint over ticket id

`regression-tracker.ts:23-36` defines `regression_fingerprints` — a durable row keyed on a
`hash UNIQUE`, carrying `first_seen_session_id`, `status`, `peak_severity`, `occurrence_count`
and `regression_count`. `regression_occurrences` (`:38-50`) records each sighting against that
fingerprint with a composite primary key of `(fingerprint_id, session_id, finding_id)`, which
makes re-analysing a session idempotent.

The hash is derived, not authored: `stemTitle` (`:91-97`) lowercases, strips punctuation and
collapses whitespace, and `hashFingerprint` (`:100-108`) hashes `category::titleStem::module`.
That is exactly the technique's "a second sighting attaches to the existing state rather than
opening a new finding", implemented — and the occurrence count is computed as **distinct
sessions**, not raw rows (`:301-305`), so twenty findings in one session do not read as twenty
sightings.

## The incident that produced the scoping rule

The file carries its own post-mortem at `regression-tracker.ts:369-380`, and it is the strongest
confirmation of the technique in the tree. The sweep that marks a fingerprint `fixed` when it is
absent from the current session **used to be global**:

> "Analyzing a combat-only session therefore declared every exploration, audio and save-load
> fingerprint fixed — and the next session that tested those categories fired a regression alert
> for each one, with a build gap measured against a fix that never happened. Every alert the
> tracker has ever raised is downstream of that."

And the rule it was replaced with (`:379-380`): **"A session can only testify about ground it
covered. Absence of evidence is evidence of a fix ONLY where the session looked."** This is the
technique's *not attempted* versus *not reproduced* split, discovered independently at the level
of a batch sweep rather than a single finding, and it upgraded the golden path: a session must
declare its coverage before it runs, or absence is uninterpretable.

Two clauses of the implementation are worth transplanting verbatim. Coverage must be **total, not
overlapping** (`:422-427`): a fingerprint is vindicated only when the current session's declared
categories cover *every* category that has ever produced it, because an overlap rule lets a
combat-only session clear an exploration fingerprint that once co-occurred with combat. And
**unknown scope counts as not covered** (`:429-432`), justified in the comment by the asymmetry
the technique states: "Under-sweeping leaves a fingerprint 'open' — an honest 'we have not shown
this is fixed'; over-sweeping invents a fix and then a regression against it. Only one of those
two errors lies." `parseTestCategories` (`:160-172`) is written to the same instinct — an
unreadable config yields no categories, "which can only ever under-sweep".

## Deviations: the standard stays

**There is no unreproducible state.** `TriageStatus` (`src/types/game-director.ts:19-24`) is
`active | confirmed | false-positive | ignore | snooze`. A finding somebody attempted and could
not reproduce has nowhere to go: `false-positive` asserts it was never real, `ignore` and
`snooze` assert a decision not to act. The technique's four-state vocabulary is absent, and with
it the attempt count — nothing in either schema records how many times a finding was attempted,
on which build, or which conditions were varied. `snooze` is precisely the parking lot the
technique warns about, and it is the only place an unreproducible finding can currently land.

**Frequency has a numerator and no denominator.** `occurrence_count`
(`regression-tracker.ts:34`) counts distinct sessions in which a fingerprint appeared. Nothing
counts the sessions that *covered its ground and did not see it* — which the scoping machinery at
`:386-416` now computes for the sweep and then discards. The denominator is one join away from
existing and would turn an occurrence count into a real rate; today the number carries no basis.
(`regressionRate` at `:138` is a different and honest quantity: regressed fingerprints over
tracked fingerprints.)

**Two taxonomies, no mapping.** The comment at `:387-393` states the defect plainly: findings
carry a `FindingCategory` (`animation-issue`, `level-pacing`) while sessions declare
`TestCategory` (`combat`, `exploration`) — "two different taxonomies with no stored mapping
between them". The tracker works around it by joining through *which sessions a fingerprint
occurred in*, which is ingenious and is not the same thing: a fingerprint that has only ever been
seen in one session inherits that session's whole declared scope as its own. One partition used by
both classification and coverage would remove the workaround entirely.

## What a consumer should copy

The composite-key idempotency, the derived hash over a normalised stem, the distinct-session
occurrence count, and above all the total-coverage sweep with unknown-scope-is-not-covered. Those
four give a queue that can say "this has been seen four times, and the last three sessions that
looked did not see it" — which is the whole point of the state. Add the attempt count and the
denominator and the same tables would carry the full technique.
