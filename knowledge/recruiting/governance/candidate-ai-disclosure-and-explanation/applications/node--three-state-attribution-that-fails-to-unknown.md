---
layer: application
type: application
subject: candidate-ai-disclosure-and-explanation
technique: three-state-attribution-that-fails-to-unknown
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: code
ab_verdict: better
---

# Two tiers of attribution, and the approval beside the machine

`sealedActorAttribution(actor, kind)` in `app/_lib/status-decisions.ts` is the
technique's two-tier rule, written down. The sealed actor's prefix wins:
`auto:` is automated and `human:` is human. Only a legacy actor with no prefix
falls back to the shared kind map in `app/_lib/decision-attribution.ts`, and an
unmapped kind stays `"unknown"`. The comment carries the reason: "misattributing
accountability is the one failure mode this surface must never have." The
operator badges read the same kind map, so the two views cannot disagree about a
kind.

## The contradiction the three states produced

The screen wave (`app/_lib/screen-wave.ts`) is a batch decline. The machine picks
the lowest-scoring share of a round that is also under a floor. A recruiter
previews that exact set, can spare anyone in it, and approves it. The approval is
bound to the set by a signed token and re-derived at commit. The wave refuses to
seal without a named approver: `if (!dryRun && !isNamedApprover(approvedBy))
throw`. Every committed decline is sealed as `actor: "auto:screen-wave"` with
`approvedBy` in its inputs. The committed rationale explains why: "the record
reads as human-approved automated screening — not a solely automated adverse
decision".

The candidate saw half of that. Their status page rendered the decline as
"Application not progressed at automated screening" with an "Automated" badge.
The same person had read the submission notice, which says "A rejection is always
a person's: no setting can hand that decision to the machine." The record held
both facts, and the surface showed one. The candidate saw a contradiction the
record did not contain.

## The fix: a second fact, not a fourth state

Commit `cf6cb58a` (2026-09-26) adds `personApproved: boolean` to the closed
candidate view. `sealedPersonApproval(record, attribution)` returns true only
when attribution is already `"automated"` and the sealed `approvedBy` passes
`isNamedApprover`. The placeholder posture string an unnamed single-operator
deployment writes, "operator (single-operator deployment)", reads false, and so
does a missing or blank approver. An unknown or human actor is never dressed up
by an approver. The name decides the boolean and is then dropped. The leak test
asserts the approver's address never reaches the wire. The badge now reads
"Automated, approved by a person". Attribution itself is untouched: selection
stays the machine's.

The reconciliation test the technique asks for now exists in the unit suite. It
reads the notice's rejection promise out of `messages/en.json` and asserts three
things against `screen-wave.ts`: the wave refuses an unnamed approver, the seal
is machine-attributed, and the approver rides the inputs the view reads. It also
asserts that the approved state has copy. If any of these moves, the promise and
the surface can no longer be read as one fact, and the suite says so.

## Measured

Three records were sealed the way the wave seals them: fresh score with a named
approver, stale score with a named approver, and a legacy record with the
placeholder approver. Before the change all three reached the candidate as the
same view byte for byte. After it, each renders what its record holds.
Mutating either seam turns two of fourteen tests red.

## What stays owed

**Unknown still renders as nothing.** `StatusClient.tsx` drops the badge when
attribution is `"unknown"` (see the allowlist application).

**Whether the approval is real is not yet measured.** The wave's preview lets
the approver spare individuals, so the approval can change an outcome. The
doctrine asks whether it does. The tree records spares as
`screen_wave_recruiter_spared` events, which makes the share of waves in which
anyone was spared a query away. A wave history with no spares at all has the
shape of the rubber stamp this rendering would then be dignifying.
