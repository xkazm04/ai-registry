---
layer: technique
type: technique
subject: hiring-need-as-structured-brief
technique: promote-readiness-gate
status: forged
laws: [absence-of-evidence-is-not-evidence, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [deciding whether a hiring need is defined enough to open, designing the handoff from intake to sourcing, an intake session ends and someone asks what happens next]
---

# The promote-readiness gate

A brief becomes consequential at one moment: when it is promoted from a
working draft into an open role that candidates will be measured against. That
transition deserves a gate, and the gate's design is a narrow problem — too
strict and intake never ships, too loose and it is not a gate.

## Readiness is not completeness

The instinct is a completeness score: how many fields are filled. It is the
wrong instrument, for a reason specific to this artifact. Most fields in a
well-designed brief will legitimately stay empty — the spine is minimal and
the facet space is open precisely so that a simple need produces a short
record. A completeness metric punishes the honest brief and rewards the one
padded with defaults and inference, which is exactly backwards: it turns
[absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)
into a scoring incentive to fill absences with something.

Volume is equally wrong. A brief can carry four paragraphs of context and
still not say one thing a screen could act on.

The gate must ask a different question: **does this record contain anything a
downstream decision can be built from?**

## The floor

A workable floor, and the reasoning for each half:

1. **An identified role** — a title, or whatever names the thing being hired
   for. Without it nothing else is addressable.
2. **At least one hard condition or one concrete near-term outcome** — a
   dealbreaker the candidate must satisfy, or a statement of what the first
   ninety days must produce.

The second clause is a disjunction on purpose, because the two are alternative
routes to the same downstream capability. A hard condition gives a screen
something to check. A near-term outcome gives an interview loop something to
probe and a scorecard an axis. A brief with neither is a title and a mood: a
recruiter can search on it, but nobody can be *assessed* against it, and a
rejection issued under it has no stated basis.

Deliberately *not* in the floor: seniority, budget, location, team size. Each
is often unknown at intake and each is discoverable later without invalidating
work already done. A gate that demands them stalls the role on information the
requestor does not yet have, and the cost of that stall lands on people waiting
to be considered —
[a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).

## The gate reads structure, which is what makes the routing rule load-bearing

The gate looks at the structured lists — requirement rows, success-criteria
entries — and not at prose. This is not a preference; it is forced. Prose
cannot be checked for a condition without the checker becoming a second
extractor, and a gate that runs an inference to decide whether it passes is a
gate that can be argued with.

The consequence is a hard coupling that must be understood as one mechanism:
if the intake writes conditions as facet prose instead of rows, the gate
refuses to open a role the requestor is certain they fully described. This is
the observed failure. It presents to users as a broken gate; it is in fact a
correct gate reporting a broken write path. Two rules resolve it, and both
belong to the same design:

- Conditions route to rows at the moment they are said (the routing rule).
- Non-answers never become values, so the gate cannot be satisfied by silence
  dressed as content.

Diagnosing a stuck gate therefore starts upstream, never at the threshold. The
first response to "the gate is too strict" should be to open the brief and
count the requirement rows against the facet paragraphs.

## Fix the routing, and also read both homes

Fixing the write path is necessary and not sufficient, because it is a
*probabilistic* fix: an extraction contract that says "conditions become rows"
raises compliance, it does not guarantee it, and the sessions that slip through
are indistinguishable to their requestor from the ones that did not. Meanwhile
the cost of a false refusal is high and lands on the wrong person — the
requestor who answered everything, told the role is undefined, reaching for
whatever back door lets them open it anyway. A gate people learn to bypass has
become a formality, and the bypass is never the audited path.

So pair the routing fix with a **deterministic reading half**: the gate looks
for its substance in *both* homes — the structured lists first, and facets
whose key names the same thing (a dealbreaker key, a ninety-day-outcome key).
Two constraints keep this from becoming inference:

- **Match on keys, never on labels or values.** Keys are a controlled
  vocabulary the extractor writes; labels are free localised prose that will
  match by accident the moment the interface is translated, and values are
  arbitrary text.
- **The structured entry still wins and still must exist.** Reading the facet
  home is a safety net for the gate, not a licence for the write path — the
  brief the requestor inspects, the rubric, and the panel all read the rows,
  and none of them get a safety net.

The general rule this instance teaches: when a gate can be satisfied in two
places, fix the writer *and* teach the gate both places. Fixing only the writer
leaves a residue of false refusals; teaching only the gate leaves the brief
itself hollow.

## Decision rules

- **When the floor is not met, name the missing half on the disabled control
  itself, in the requestor's language, ordered as they should fix it.** "Add a
  dealbreaker or a ninety-day outcome" is actionable; a greyed-out button that
  refuses without saying why is the single most reliable way to make people
  route around a gate.
- **When a gate is failing across many sessions, treat it as a routing bug
  before a threshold bug.** Lowering a gate to match a broken write path
  removes the only detector of the bug.
- **When a default satisfies the floor, it does not.** A schema-initialised
  value is not a condition; the gate counts `stated` content, and inferred
  content only where a human has reviewed it.
- **When the requestor insists the role must open despite the floor**, allow
  an explicit, attributed override rather than a silent bypass — someone
  chose to open an underdefined role, and that is a fact worth recording. What
  must never exist is a path that opens the role without anyone owning the
  decision.
- **When promotion succeeds, freeze the brief.** The gate and the freeze are
  the same moment; a record that stays editable after promotion cannot support
  the decisions made under it.

## When not to use this

- **Where intake and sourcing are the same person acting immediately.** A gate
  between two steps one human performs in the same hour is ceremony; the value
  appears when the brief is handed to someone who was not in the room.
- **As a quality bar.** This gate certifies that the record is *actionable*,
  not that the role is well-defined, well-scoped or free of inflated
  requirements. Those are different judgements with different owners — a brief
  can pass this floor and still be a bad brief, and no threshold on structure
  will catch that.
- **On a draft the requestor is still filling in.** The gate belongs at
  promotion, not at every save; enforcing it continuously turns an exploratory
  intake into a form-validation exercise, which is the register this whole
  subject exists to escape.
