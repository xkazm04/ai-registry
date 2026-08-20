---
layer: technique
type: technique
subject: pre-publish-fillability-forecast
technique: staged-suggestion-never-auto-applied
status: forged
laws: [every-decision-names-its-actor, inference-must-look-like-inference, say-only-what-the-record-holds]
shared_with: []
use_when: [designing how a coach hands its recommendations to a recruiter, deciding whether a suggested edit gets an apply button, a coach is asked to auto-optimise a requisition]
---

# Staged suggestion, never auto-applied

A fillability coach produces recommendations. It never enacts them. Each one is
**staged**: rendered as a proposed change to a named field, carrying the
counterfactual that produced it, and requiring a deliberate human act to enter
the requisition. Nothing the coach computes mutates anything on its own
authority
([every consequential decision names its actor](../../_laws.md#every-decision-names-its-actor)).

Stated as a boundary rather than a preference: the coach's output is a
*proposal object*, the requisition is a *document*, and the only writer of the
document is a person.

## Why staging, and not an optimiser

The auto-applying version is easy to build and is a genuinely bad idea for
three separate reasons, any one of which is sufficient.

**The coach cannot see the constraint that matters.** A gate costing sixty
percent of the pool may be a statutory licence. A must-have that looks
expensive may be the one thing the team cannot train. The coach ranks by delta
because delta is what it can compute, and delta is uncorrelated with
negotiability. An optimiser therefore reliably proposes removing exactly the
requirements that cannot be removed.

**Authorship has consequences downstream.** A requisition is the document a
rejection is later justified against, the thing a candidate reads, and in some
jurisdictions the artefact a regulator asks about. A criterion nobody can point
to an author for is a liability in every one of those conversations.

**Drift.** A coach that shaves the most expensive requirement each cycle
converges every role toward the pool it already has. The pool then confirms the
requisition, and the loop closes: the organisation stops hiring for what it
needs and starts hiring for what it already attracted. Staging breaks the loop
by putting a human who knows the job between the measurement and the document.

## The provenance-match rule

A staged suggestion may offer an apply affordance **only when the suggestion's
provenance matches what the target field claims to be**.

Requisition fields are not uniform. Some are grounded — computed from a scored
pool, derived from a band with a stated sample, carrying sources a reader can
check. Others are typed by a human and claim nothing but authorship. A
suggestion that writes an ungrounded value into a grounded field launders
authorship: the number arrives wearing a provenance it did not earn, and the
label that says "grounded, with sources" becomes false without any single
component having lied
([inference must look like inference](../../_laws.md#inference-must-look-like-inference)).

The canonical case is compensation. A market band is grounded; a specific
figure a recruiter would like to offer is not. So the coach shows the
below-market verdict, shows the band and its basis, and deliberately offers no
apply button on the range — the recruiter types the number, and owns it. The
absent affordance is the feature, and it should be commented as such wherever
it is implemented, because it will otherwise be added back by the next person
as an obvious oversight.

Applied generally:

| Suggestion | Target field | Apply affordance |
| --- | --- | --- |
| Demote a must-have to nice-to-have | a requirement's own classification | yes — the change is exactly what was measured |
| Remove an advisory gate | that gate | yes, with the delta shown alongside |
| Relax a non-negotiable gate | that gate | none — diagnose only |
| Raise the range | a grounded compensation field | none — verdict and evidence only |

## Rules

1. **Staged means visible before it is real.** The recruiter sees the current
   value, the proposed value and the reason in one place, and can dismiss
   without a trace.
2. **Every suggestion carries its counterfactual.** "+14 could be considered"
   travels with the suggestion, not in a separate panel. A suggestion whose
   evidence is one click away is applied without the evidence.
3. **Dismissal is a legitimate, recorded outcome.** A hiring manager who
   rejects a suggestion has made a decision worth keeping — it is the answer to
   "why is this requirement still here" three months later.
4. **Applying is one field, one act.** No bulk-accept. Bulk acceptance is
   auto-application with a confirmation dialog in front of it.
5. **Suggestions expire with their basis.** When the pool, the band or the
   rubric moves, a staged suggestion is stale and must be recomputed rather
   than applied from a cached delta
   ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).
6. **Non-negotiable classes never reach the suggestion surface** — they are
   rendered in a diagnostic section, structurally separate, so that no
   interface change can promote them into actions.

## When not to use this

- **On a draft nobody has authored yet.** A generated first draft is a
  different artefact: there is no human decision to preserve, so the coach's
  output can populate it directly — provided the draft is presented as a draft
  and every generated requirement is attributable when it is later reviewed.
- **On changes with no hiring consequence.** Formatting, ordering, spelling and
  layout suggestions need no ceremony; reserving staging for substantive fields
  keeps the ceremony meaningful. What counts as substantive is anything that
  changes who is admitted, who is recommended, or what is promised.
