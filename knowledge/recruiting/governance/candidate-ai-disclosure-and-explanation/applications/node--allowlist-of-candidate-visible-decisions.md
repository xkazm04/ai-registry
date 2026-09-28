---
layer: application
type: application
subject: candidate-ai-disclosure-and-explanation
technique: allowlist-of-candidate-visible-decisions
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: simulation
ab_verdict: better
---

# The redacted decision history behind a public status token

`app/_lib/status-decisions.ts` is the whole boundary, and its header states the
rule in one sentence: the operator dossier at `/api/decisions/records` "exposes
the full sealed record: rationale text (which names the approving operator),
payload snapshots, chain hashes, policy versions. None of that may cross the
public token boundary — a candidate is owed an EXPLANATION of decisions about
them, not the audit chain's internals or anyone else's data."

## The closed shape

`CandidateDecisionView` is exactly six fields: `kind`, `createdAt`,
`attribution`, `personApproved`, `reasonCode` and `facts`. The comment says why:
"the shape is closed on purpose (leak tests pin it)".
`redactDecisionForCandidate` constructs that object field by field. It never
spreads the sealed row and subtracts, which is the construction that fails open
on the next schema addition. Its doc comment lists what stays behind: "rationale
(names the approver), payloadJson, hashes, actor string, policy version and seq".
The leak test asserts the exact key set and searches the serialised wire for the
approver's address, `approvedBy`, `policyVersion`, the hash fields and `rationale`.
Since the 2026-09 revision it also carries positive controls, so no negative
assertion can pass vacuously. The sealed payload is shown to hold the withheld
material, and at least one decisive fact is shown to cross.

`personApproved` arrived on 2026-09-26 (`cf6cb58a`). It is a boolean derived
from the sealed approver and then discarded, so the view learns *that* a named
person approved an automated decline and never *who*.

## The allowlist and its instructive exclusion

`CANDIDATE_VISIBLE_DECISION_KINDS` is a `ReadonlySet` of fourteen kinds,
documented as "An allowlist, not a denylist: a future kind ships hidden-by-default
and is exposed only once it has candidate-appropriate copy." The excluded kind is
named and reasoned in the same comment. `screen_wave_holdout` is "an internal
calibration marker — the candidate was spared at random; not a decision that
produced an effect on them."

The direction of that exclusion is exactly the one the technique calls for.
`app/_lib/decision-attribution.ts` keeps `screen_wave_holdout` in the *operator*
map, because sparing a candidate is a machine decision about them and belongs in
the audit trail. It stays out of the candidate projection. One event, two
projections, one record.

`redactDecisionForCandidate` returns `null` for anything unlisted, and
`app/api/status/status-decisions.test.ts` pins the negative: an unrecognised kind
projects to nothing.

## What an admitted kind may say is registered too

The 2026-09 revision extended the allowlist idea from kinds to *reasons*.
`FACT_EXTRACTORS` maps a sealed kind to the one extractor allowed to build its
decisive facts. A kind absent from the map crosses with `facts: null`, visible
but unexplained. `factsCoverage()` counts the map against two denominators: every
visible kind, and the five kinds that are an AI verdict about a person. A test
asserts the ratio, so "one more kind explains itself" is a number that moves. See
the decisive-facts application beside this one.

## Consent gates the surface, not the fields

`candidateDecisionHistory` opens with
`if (consentWithholdsPii(consent, nowMs)) return [];`. An entry whose consent has
expired or that is already anonymised gets an empty history, not a filtered one.
The per-entry operator reads apply the same predicate: interview sessions, the
ATS candidate record and the timeline redact under `consentWithholdsPii`, and the
heartbeat sweep (`anonymizeExpiredConsents`) scrubs the entry afterwards.

One reader does not. The operator decision dossier (`/api/decisions/records`)
serves the sealed records ungated, because "a record OUTLIVES its entry". That is
right for the audit trail. It also means the parity the golden path asks for
fails in one window. Between consent expiry and the next sweep, staff can read
the candidate's decisions, scores and approver beside a live board label, while
the candidate's own history is empty. The fix is not to gate the dossier. It is
to let the candidate's view close when the entry is actually de-identified, not
when the basis lapses, or to run the sweep at the moment of expiry.

## Two deviations, standard unchanged

**Unknown attribution is computed but not rendered.**
`app/status/[token]/StatusClient.tsx` still guards the badge with
`d.attribution !== "unknown" ? … : null`. A record whose actor cannot be
established shows a decision with no actor line at all. The projection is honest;
the surface drops the honest state. The standard requires unknown to render as an
explicit "we cannot determine who made this decision".

**A humanised-identifier fallback in the renderer.** The same file resolves the
label as `decisionKindLabels[d.kind] ?? d.kind.replace(/_/g, " ")`. Today every
allowlisted kind has a label (the two group-evaluation kinds share one), so the
fallback is unreachable. It remains a standing hole. A kind admitted before its
copy is written would render its internal identifier to the candidate.
