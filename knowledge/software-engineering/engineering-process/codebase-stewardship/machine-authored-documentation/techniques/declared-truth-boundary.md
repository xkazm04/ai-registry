---
layer: technique
type: technique
subject: machine-authored-documentation
technique: declared-truth-boundary
status: forged
laws: [count-carries-predicate, verdict-survives-boundary, unknown-is-not-a-value]
shared_with: []
use_when: [a derived view over a document will be read as stronger evidence than it is, naming a feature that traverses authored relationships, a generated artifact is about to carry a confidence or impact figure, deciding what a diagram is allowed to be cited for]
---

# Declare what the artifact does not claim

A machine-authored document is trusted in proportion to how finished it looks,
and the finish is the one thing the generator is reliably excellent at. That
mismatch is manageable while the reader is looking at stated content. It stops
being manageable the moment the artifact offers a **derived view** — a
traversal, a filter, a count, a highlight — because a derived view carries an
implicit claim about its own scope that nobody wrote down and every reader
supplies for themselves.

The mechanism is honest in every observed case. The reading is not:

| The artifact computes | The reader concludes |
| --- | --- |
| reachable nodes over authored relationships | the blast radius of a change |
| a directed traversal | the call graph |
| a count of matched links | how much breaks |
| a highlighted subgraph | runtime causality |
| any numeric ornament near a claim | a measured confidence |

Nothing in the artifact lied. The traversal did exactly what it says. But the
model it traversed is **an authored abstraction of a system**, not the system,
and the distance between those two is precisely the space the reader's
inference fell into.

## The negative clause

Close the gap in the artifact's own words, next to the capability rather than
in a document about it. The clause is a list of the claims this view does not
make, and the list is specific enough to be falsifiable:

> This describes only the directed relationships authored into this document.
> It does not claim runtime causality, breakage or change impact, completeness
> of the underlying call graph, a confidence score, or repository-wide
> dependency analysis.

Four properties make such a clause work rather than decorate:

- **It is specific.** "This is an approximation" is not a boundary; it is a
  disclaimer, and readers correctly ignore disclaimers. Each line above names a
  claim someone would otherwise make and denies it by name.
- **It names the evidence a stronger claim would need.** Not "we cannot say
  this" but "this claim requires a separate evidence model." That converts the
  clause from an apology into a roadmap and stops it being renegotiated every
  quarter by someone who assumes it was laziness.
- **It sits with the capability.** A boundary in a design document governs the
  designers. A boundary rendered beside the count governs the reader.
- **It is enforced in the vocabulary, not only in the prose.** Which is the
  next section, and the half that actually holds.

## The naming rule is the enforcement

A negative clause under a feature called *Blast Radius* loses. The name is read
a thousand times, the clause once, and the name is what gets quoted into the
incident review. So the boundary is enforced where the words are chosen:

- **The feature's name states the mechanism, not the inference.** Upstream and
  downstream over authored relationships are named for direction and
  authorship. Impact, breakage, and radius are not available as names, because
  the artifact cannot earn them.
- **The receipt names counts, never consequences.** Nodes matched, links
  matched, maximum hops — quantities the traversal actually produced
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
  Never a severity, never a percentage of the system, never an adjective.
- **A claim the artifact cannot compute is absent, not approximated.** The
  temptation is a confidence-shaped number derived from something else —
  edge count, depth, node degree. Any such number will be read as a
  confidence, and an ornament read as a measurement is
  [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
  rendered in the artifact's most trusted position.

**A stronger name is available only with a stronger evidence model, and the
upgrade is a separate decision.** If independent code analysis later grounds
the traversal in real call edges, the claim can widen — and the clause becomes
the specification of what that work has to deliver.

## Where the boundary is worth the most

The field record this technique is written from holds an instructive case: two
adjacent tools shipped the same traversal, one of them under an impact-shaped
name and with the limitations of static analysis documented honestly in its
README. The response was neither to copy the name nor to skip the capability.
It was to ship the mechanism, refuse the name, and record the refusal as a
product boundary — with the rejected scope enumerated beside it: no parser, no
crawler, no weighted paths, no confidence scoring.

That enumeration is the reusable part. **A boundary that lists what was
deliberately not built is a decision; a boundary that lists only what was built
is a status report**, and the difference shows up a year later when someone
proposes the rejected thing as an obvious gap.

## Decision rules

- **When the document carries verified evidence for some elements and not
  others**, the boundary must say which. Partial grounding read as total
  grounding is the same failure one level down: mark the grounded elements
  explicitly, keep grounding opt-in, and let the ungrounded default be visibly
  ungrounded.
- **When an export or a share surface clones the view**, the boundary travels
  with it. A cropped image of a traversal, posted without its clause, is the
  claim the clause denied — so write the direction, the origin, the counts and
  the scoping word into the exported surface itself.
- **When a reader asks for the stronger claim**, answer with the evidence model
  it needs. That is the productive conversation the clause was written to
  enable.
- **When the artifact is prose rather than a view**, the same rule applies to
  its citations: a generated document that cites sources it did not resolve is
  making the strongest available claim from the weakest available evidence.

## When not to use this

Not as a blanket disclaimer applied to everything a generator emits. A boundary
attached to a claim nobody would over-read is noise, and noise is what teaches
readers to skip the ones that matter. Attach it where a derived view exists and
a stronger reading is available; leave stated content to speak for itself.
