---
layer: application
type: application
subject: automated-screening-fairness-gates
technique: defense-in-depth-recheck-at-the-apply-boundary
stack: node
status: forged
---

# Re-asserting the fairness invariant at the TypeScript apply boundary

The decision is computed in Python (`pipeline/jobfit/automation.py`, `evaluate_entry`)
and applied in TypeScript (`app/_lib/automation-pass.ts`). Between them is a JSON
contract, and until `app/_lib/automation-fairness.ts` existed the apply side executed a
Python `action: "reject"` verbatim. Its header states the failure that motivated it:
"any Python regression that emitted a reject for an early-career candidate, an unscored
entry, or a score at/above the reject floor would be auto-applied, silently violating the
fairness guarantee."

## The re-derivation

`app/_lib/automation-fairness.ts:46` — `assertAutoRejectFair(entry)` — re-derives the
sole legitimate reject path from the entry snapshot the pass already holds, checking four
things in order and returning `{allowed:false, reason}` for each failure:

1. **missing entry** → refused, with the reason "entry not found for fairness re-check —
   auto-reject refused (fail closed)". A decision for an id that was never sent is not
   permission.
2. **fairness-protected archetype** → refused, and the reason distinguishes the two
   cases, because they are different defects: an early-career archetype that is shielded
   by membership, versus an unknown or renamed archetype shielded by failing closed. It
   reuses `isFairnessProtected` from `app/_lib/archetypes.ts:74`, the same helper the
   screening wave guards its auto-reject with — one predicate, several call sites.
3. **unscored entry** (`score === null || score <= 0`) → refused: "an absent / null / 0
   score means matching has not produced a genuine result ... `evaluate_entry` holds it
   for matching rather than reading it as 0 and rejecting, so we must too."
4. **score at or above the floor** → refused as not an auto-reject at all.

Only after all four does it return `{allowed: true}`. Nothing is read from the request
except the entry id used to look the candidate up; the caller cannot assert its own
clearance.

## The mirrored constant, and how it is kept safe

`automation-fairness.ts:33` declares `BAU_REJECT_SCORE = 40` as a mirror of Python's
`POLICY["bau_reject_score"]`, with the direction of safety written next to it: "This is a
backstop CEILING — a reject at/above it is refused — so it must stay >= the Python floor.
Both are 40 today; if the Python floor ever rises, raise this with it or this backstop
will spuriously downgrade legitimate Python rejects." The inequality is pinned from both
sides — `automation-fairness.test.ts` on the TypeScript side, `test_automation.py` on the
Python side — which is the only reason a cross-runtime mirror is tolerable here.

## Downgrade, never drop, never apply

`app/_lib/automation-pass.ts:19-27` holds "THE single encoding of the fairness-backstop
downgrade", shared by the dry-run preview loop (`:294`) and the commit loop (`:354`). On a
refused verdict it downgrades the decision to `hold`, rewrites the reason, appends a
deduplicated alert, bumps `summary.held`, and returns true. The `preview` flag "selects
only the 'would be refused' vs 'refused' wording ... every other byte is identical across
the two callers" — the preview/commit parity rule, held by construction rather than by
discipline.

The repo then goes past the standard's floor. `automation-pass.ts:296-303` records that
**a fairness-cleared reject is not applied either** — it is queued as a held
`rejection_review` for a human click, "unconditionally", so `summary.rejected` is 0 in
every committed run. The comment names the bug that produced the rule: the preview used
to forecast `rejected += 1`, so "the recruiter was shown N rejections and got 0
rejections + N approval cards".

## The refusal is an event

The downgrade appends `FAIRNESS_GATE_BLOCKED_REJECT`, defined once at
`app/_lib/decision-attribution.ts:165` and re-exported by `automation-pass.ts:17`
"sourced from the shared `AUTOMATION_ALERT_KINDS` set ... so the writer and the
attribution map can never key it differently". The decision outcome is set to
`fairness_blocked`, so the audit surface attributes the resulting hold to the automation's
refusal rather than to whoever triggered the pass. Alerts are deduplicated per
entry + kind + day (`hasEventToday`), and the dry run applies the same gate as a pure
read so it forecasts exactly the number of alerts a commit would write.

## Deviation

The blocked-reject alert is retained as an automation alert on the entry, not as a
long-horizon record designed for a multi-year retention obligation, and the count is
surfaced operationally rather than as an exportable oversight artifact. The standard asks
for a retained, exportable, structured stream; the repo has the event and the single-
sourced kind, and stops short of the retention design.
