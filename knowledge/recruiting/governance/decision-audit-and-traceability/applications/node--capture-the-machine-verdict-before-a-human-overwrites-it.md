---
layer: application
type: application
subject: decision-audit-and-traceability
technique: capture-the-machine-verdict-before-a-human-overwrites-it
stack: node
verified_on: 2026-10-31
verified_against: node@24
applied: unapplied
ab_verdict: unapplied
---

# Sealing the AI verdict before the accept nulls it (TypeScript / Next.js server)

`app/_lib/pipeline-entry-action.ts` is the one canonical move/decide action against a
pipeline entry. The per-entry route (`/api/pipeline/[id]`), the batch route
(`/api/pipeline/batch`) and, since this application was first written, the command bar
(`/api/pipeline/command`, `:46-50`) all share it, precisely so the guards that matter
cannot diverge between them — including the seal. Re-read at kp `104a4b1b5` (2026-09-29);
the first reading was 2026-08-20.

## The field that destroys itself

The header comment at `:53-57` is the technique's failure mode stated as an incident:

> The AI verdict the human is ratifying or overriding. It lives only in the entry's
> `approval_detail` JSON, and the accept/reject write NULLs that column — so unless it is
> read off the pre-write snapshot and sealed here, the pair (what the machine proposed,
> what the human decided) is destroyed by the very act of deciding, and the override rate
> can never be computed after the fact.

`aiVerdict(entry)` (`:98-116`) reads `recommendation` and `confidence` off the **pre-write
snapshot** `current`, and its `try/catch` returning nulls is the standard's "the machine
did not run is a distinct state" rule. That half still holds. The order changed: on both
paths the mutating write now runs *before* `aiVerdict` is called — `setApproval` at `:504`
before the seal at `:523` on the human-round path, and `actOnPipelineEntry` at `:485`
before the seal at `:508` on the accept/reject path. The verdict survives only because
`current` was loaded earlier; the seal no longer precedes the write that clears its
antecedent. Seal inputs gained `approvalKind` and the command bar's typed `threshold`,
and `policyVersion` is now `"command-bar"` or `"manual"` (`:511`).

**Re-checked 2026-10-31 at kp@6edf5d7: the accept/reject path now seals first, and
refuses when it cannot.** `runPipelineEntryAction` re-reads the row synchronously,
answers every refusal the write could still give (moved stage, closed-out entry, a reject
on Hired) *before* sealing, seals through the injected `deps.seal` against that live row
(`:563-612`), and on a null seal returns a coded `503 PIPELINE_DECISION_NOT_SEALED` with
nothing written, emailed or sent to the ATS (`:613-617`). The CAS write follows with no
await between (`:625`), pinned to the sealed stage; its residue (a record for a decision
that lost the CAS to another process) is logged (`:626-628`). The rule is an ADR
(`docs/architecture/decisions/0017-a-human-adverse-decision-is-sealed-before-it-commits.md`),
and `sealDecisionSafe`'s docstring now says best-effort is *not* the rule at this door
(`decision-record-store.ts:385-394`). The sealed inputs also gained the machine's
`aiRationale`, `aiReasonCode` and `aiReasonParams`. The human-round path is unchanged:
`setApproval` at `:504`, then a discarded `sealDecisionSafe` at `:523`.

## The actor, server-derived

`sealActor` resolves at `:390` — `simActor ? SIM_SEAL_ACTOR : await humanActor()` — and
`humanActor()` (`app/_lib/auth/operator-approver.ts`) reads the signed session and the
users table, "never from a request body" (`:59-62`), returning `null` rather than a guess.
The fallback chain is the three-state rule in production form: the natural person, then
`HUMAN_ROLE_ACTOR = "human:recruiter"` (`:50`), then `operatorApprover()` (`:7-21`)
recording the single-operator *posture* rather than a name, because the earlier constant
"named NOBODY in the immutable record" (`:9`). The claimed-actor downgrade rule is
`pipeline-entry-action.ts:47-49`: only the known non-human `actor: "sim"` is honoured, so
the claim "can only DOWNGRADE authority".

## Where it differs from the technique

**The seal is best-effort, after the write, on another connection.** Seals go through
`sealDecisionSafe` (`app/_lib/decision-record-store.ts:395-401`), which catches *every*
error, logs a `console.warn` and returns `null`; its docstring says it "must NEVER abort
or fail the decision it records ... (e.g. KP-less env, DB lock)" (`:390-393`). The three
seal returns in this action are discarded (`:252`, `:464`, `:508`), so an unsealed accept
or reject answers 200 with no event and no flag. The first reading excused this as
configuration-only, since the downgrade guard was the one refusal `sealDecisionRecord`
raised. **That mitigation is false.** The store opens with `busy_timeout = 5000`
(`app/_lib/db-path.ts:160`), so a locked database throws `SQLITE_BUSY` after five seconds
— a load condition, the exact case the standard names — and disk-full or a
`JSON.stringify` throw are swallowed the same way. The seal runs in its own transaction on
its own connection, after the pipeline write has committed; both open the same SQLite
file, so a shared transaction is available and unused. The rule stands: an unsealable
record should fail the decision, or land in an outbox row inside the decision's own
transaction.

**Re-checked 2026-10-31 at kp@6edf5d7: this finding is reversed for accept and reject,
and stands for the rest.** Of the three seals in the action, only the offer-terms seal
(`:308`) and the human-round seal (`:523`) still discard their result; the accept/reject
seal is checked and refuses (above). The seal still runs in its own transaction ahead of
the pipeline write rather than in a shared one, so the "outbox inside the decision's own
transaction" half of the rule is not met; the window is now one synchronous statement.

**The screening wave went the other way** (kp `62fbf8339`): it now seals *first*, "no
seal, no rejection" (`app/_lib/screen-wave.ts:532`), keeping the candidate with
`reasonCode: "sealFailed"` (`:564-571`) and counting it. Its residue is a stale CAS after
a successful seal: a sealed `auto_rejected` record for a rejection that never applied,
which gets only a `console.warn` and no compensating record.

**The verdict's engine is dropped at the seal.** `approval_detail` carries
`verdictSource` — which engine produced the verdict — since 2026-09-04
(`app/_lib/automation-run.ts:196-224`, `:595-597`), but `aiVerdict` reads only
`recommendation` and `confidence`. A template-served verdict seals exactly like a model
verdict, and an override rate computed from these seals would count verdicts no model
gave.

**The pair is sealed and never read.** `aiRecommendation` and `aiConfidence` have a
writer and no reader: nothing computes an override rate. The automation rollup counts
event kinds (`decision-attribution.ts:650-673`, `summarizeAutomationImpact`) and `medianHoursToDecision` measures entry
creation to first decision, not verdict-shown to human-decided. This is the golden path's
"a field nobody reads back" in its purest form, and it is why the override-rate row in
`librarian/applied.md` for this pass is unapplied rather than measured: the record-side
evidence the conditioned rule asks for (a reason on agreement, what was shown and opened,
verdict-reached time, a seeded-case marker) has no seam to be measured against.

Re-checked 2026-10-31 at kp@6edf5d7: `aiVerdict` still does not read `verdictSource`.
The pair now has one reader, `autoAdvanceFacts` (`app/_lib/status-decisions.ts:230-240`),
which turns an `auto_advanced` record's `aiRecommendation`/`aiConfidence` into the
candidate-facing verdict facts. That is an explanation reader, not an override rate:
nothing yet computes verdict-versus-human agreement, so the unapplied row stands.

**Role-only actors on newer seal sites.** The interview-prep scorecard route seals
`actor: "human:recruiter"` while it holds the author, which it puts in `inputs`
(`app/api/interview-prep/scorecard/route.ts:245-255`, kp `afb029b67`, 2026-09-23). The
schedule routes hard-code the role and never call `humanActor`. kp's own compliance gap
list names these (`docs/features/compliance/README.md`, G5 residual).

## Attribution the aggregate can trust

`app/_lib/decision-attribution.ts` is the one auto/human map, imported by **both** the
per-row badge and the analytics rollup "so the per-row label and the aggregate can never
drift" (`:1-8`). The advance split is explicit at `:18-22`. `screen_wave_holdout`
(`:75-80`) seals the calibration clean arm's *decision not to act*, excluded from the
candidate-facing projection (`status-decisions.ts:86-88`; the cross-reference at `:79` still
says `:44`). `offer_auto_extended` (`:66-69`) is toned amber because the machine put an
offer in front of a person with no human in the loop. One entry is a borrowed kind: the
human-round path seals `kind: "advanced"` while the stage stays put (`:504`, `:524`), and
`advanced` is candidate-visible. The `human_round_queued` comment (`:145-154`) still cites
`pipeline-entry-action.ts:267` and says the seal credits `human:recruiter`; both are
stale.

Reversals seal to the reverser: `listReconsiderQueue` (`app/_lib/db/pipeline.ts:1391`)
now surfaces an entry only while its *newest* decision is `auto_rejected` — "A human
reject — including one after a reinstate — is a deliberate decision, not a queue item" —
and the reinstate writes its own event under the acting person.
