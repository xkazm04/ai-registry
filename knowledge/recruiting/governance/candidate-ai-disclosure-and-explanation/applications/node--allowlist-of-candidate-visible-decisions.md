---
layer: application
type: application
subject: candidate-ai-disclosure-and-explanation
technique: allowlist-of-candidate-visible-decisions
stack: node
status: forged
verified_on: 2026-08-20
---

# The redacted decision history behind a public status token

`app/_lib/status-decisions.ts` is the whole boundary, and its header states the
rule in one sentence: the operator dossier at `/api/decisions/records` "exposes
the full sealed record: rationale text (which names the approving operator),
payload snapshots, chain hashes, policy versions. None of that may cross the
public token boundary — a candidate is owed an EXPLANATION of decisions about
them, not the audit chain's internals or anyone else's data."

## The closed shape

`CandidateDecisionView` (`status-decisions.ts:17-30`) is exactly five fields —
`kind`, `createdAt`, `attribution`, `reasonCode`, `facts` — and the comment says
why: "the shape is closed on purpose (leak tests pin it)". `redactDecisionForCandidate`
(`:95-107`) constructs that object field by field. It never spreads the sealed
row and subtracts, which is the construction that fails open on the next schema
addition; the doc comment enumerates what stays behind — "rationale (names the
approver), payloadJson, hashes, actor string, policy version and seq".

## The allowlist and its instructive exclusion

`CANDIDATE_VISIBLE_DECISION_KINDS` (`:44-60`) is a `ReadonlySet` of fourteen
kinds, documented as "An allowlist, not a denylist: a future kind ships
hidden-by-default and is exposed only once it has candidate-appropriate copy."
The excluded kind is named and reasoned in the same comment: `screen_wave_holdout`
— "an internal calibration marker — the candidate was spared at random; not a
decision that produced an effect on them."

The direction of that exclusion is exactly the one the technique calls for.
`app/_lib/decision-attribution.ts` keeps `screen_wave_holdout` in the *operator*
map, with the note that "sparing a candidate is a machine decision about that
candidate, so it belongs in the operator's audit trail with an attribution. (It
stays excluded from the CANDIDATE-facing copy — status-decisions.ts:44 — which
is a separate, deliberate projection decision.)" One event, two projections, one
record.

`redactDecisionForCandidate` returns `null` for anything unlisted, and
`app/api/status/status-decisions.test.ts:157` pins the negative — an
unrecognised kind projects to nothing.

## Consent gates the surface, not the fields

`candidateDecisionHistory` (`:117-130`) opens with
`if (consentWithholdsPii(consent, nowMs)) return [];` — an entry whose consent
has expired or that is already anonymised gets an empty history, not a filtered
one. The header explains the placement: consent gating is applied in this pure
module "so the withholding rule is unit-pinned, not route-local", and the tests
at `:147-151` assert empty for both the anonymized and expired snapshots and
non-empty for the active one. The module is deliberately dependency-free (no DB,
no framework imports) so `node --test` exercises the boundary on literals.

## Two deviations, standard unchanged

**Unknown attribution is computed but not rendered.**
`app/status/[token]/StatusClient.tsx:295` guards the badge with
`d.attribution !== "unknown" ? … : null`, so a record whose actor cannot be
established shows a decision with no actor line at all. The projection is
honest; the surface silently drops the honest state. The standard requires
unknown to render as an explicit "we cannot determine who made this decision" —
suppressing it turns a stated gap into an unstated one.

**A humanised-identifier fallback in the renderer.** The same file
(`StatusClient.tsx:293`) resolves the label as
`decisionKindLabels[d.kind] ?? d.kind.replace(/_/g, " ")`. Today the allowlist
makes it unreachable, but it is a standing hole: a kind admitted to the allowlist
before its copy is written renders its internal identifier to the candidate,
which is precisely the denylist failure the allowlist was chosen to avoid. The
copy should be the admission ticket, enforced by the absence of a fallback.
