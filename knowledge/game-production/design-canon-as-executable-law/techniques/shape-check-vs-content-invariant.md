---
layer: technique
type: technique
subject: design-canon-as-executable-law
technique: shape-check-vs-content-invariant
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [classifying what a check actually proves, a green dashboard over unvalidated numbers, deciding which authoring steps need the design rules in scope]
---

# Shape check versus content invariant

The named concern: **classifying every check by what it can conclude**, and making that
class a first-class property of the check rather than something a reader infers from its
name. Two checks that both return pass can be evidence of completely different things, and
a system that does not distinguish them will report the cheap one and be believed about
the expensive one.

## The three classes

**Shape.** Required fields are present; types are correct; enumerations hold valid members;
identifiers match their pattern; references resolve; counts meet a minimum. Cheap, total,
binary. Proves the artifact is well-formed and nothing about whether it is right. A
perfectly shaped weapon entry can describe something six times stronger than anything else
in the game.

**Internal consistency.** A value is checked against another value in the *same artifact*:
a stated total reconciles with its stated parts, a measured figure matches the arithmetic
of the fields it derives from, a series descends. No external rule is consulted — the
artifact carries its own standard. Cheap, needs no canon, and catches a startlingly high
fraction of real defects, because contradiction is the characteristic failure of both
generated content and hand-edited tables.

**Content invariant.** A value is checked against a threshold that comes from *outside*
the artifact — the design canon. This is the only class that can conclude "this obeys the
design". It is also the only class that requires the parse layer, and the only class whose
failures are design arguments rather than defects.

The load-bearing test between the second and third: **does a wrong number fail this
check?** If a number could be arbitrarily wrong and the check still passes, it is shape.
If a wrong number fails but only by contradicting another number the artifact states, it
is internal consistency. If a wrong number fails by contradicting a rule, it is a content
invariant.

## Mark the class on the check, and let the system read it

The classification must be machine-readable, attached to the check itself, because two
downstream mechanisms consume it:

- **Reporting.** A pass rate that mixes classes is meaningless. Report them as separate
  lines: shape conformance, self-consistency, design conformance. Only the third may ever
  be described as design compliance.
- **Authoring scope.** A step whose output will be graded by a content invariant is a step
  whose author needs the governing rules in front of them. The classification is what
  selects that. This is a genuine architectural payoff and the reason to make the marking
  explicit rather than a naming convention: one predicate answers both "what may this
  result claim" and "what context does the producing step need".

Marking is a decision made at check-definition time by whoever wrote the check, and it is
worth reviewing as its own line in a code review. The failure mode is generosity — a
shape check marked as a content invariant because it feels important. That inflates the
design-conformance number, which is the number people quote.

## Not measured is the third outcome

Every check returns one of three results, not two. When the field it reads is absent, the
result is **not measured**, carrying a reason that names the missing field and the envelope
that would have applied. This is not bookkeeping:

- A partially authored artifact must not read as compliant. Silence must never propagate
  upward as green.
- The reason string is what makes the outcome actionable — "the damage-over-time path
  needs a rate field within the tier band, or declare a control budget instead" tells an
  author what to do; "not set" does not.
- A conformance report becomes a coverage map. How much of the corpus is enforced at all is
  the most important number the system produces and the one nobody thinks to compute.

At the run level the same asymmetry applies: a check whose input facet is not present in
this run contributes nothing, rather than a pass. Structure the runner so each check
declares the input it consumes, and let absent input mean the check does not fire.

## Procedure

1. **Enumerate the existing checks and classify every one.** Expect the design-conformance
   set to be much smaller than the team believes.
2. **Split any check that does both.** A validator that asserts a field exists *and* that
   its value sits in a band is two checks; keeping them fused means a missing field and an
   out-of-band value produce the same verdict.
3. **Attach the class as data on the check**, not in its name.
4. **Split the report by class**, and put the design-conformance line first.
5. **Compute coverage** — how many canon rules have at least one content invariant
   enforcing them — and publish it beside the pass rate. A corpus with sixty rules and
   eleven enforced is a good system honestly described; the same system reporting only
   "ninety-four percent pass" is a bad one.
6. **Wire the class into authoring scope** once the classification is trustworthy.

## Decision rules

- **When a check can pass an artifact with an arbitrarily wrong number, it is shape.** No
  exceptions, no matter how much domain logic it contains.
- **When a check needs no canon, it is not a content invariant** — even if it is the most
  valuable check you have. Internal consistency earns its own line; it does not need to be
  smuggled into the design-conformance number.
- **When the field is absent, return not-measured with a reason — never fail, never pass.**
  Failing a missing field conflates "authored wrong" with "not authored yet", and the two
  need different work from different people.
- **When a shape check and a content invariant cover the same field, keep both.** The shape
  check localizes the failure; the invariant judges it.
- **When a claim of completeness is made, it names the class it was proven at.** "Passes
  shape" is a legitimate claim. "Passes" is not.

## When not to use this

- **A pipeline with no design rules to check against.** If there is no canon, everything is
  shape and internal consistency, and inventing a content-invariant class to hold nothing
  is ceremony. Build the canon first.
- **Single-consumer validators inside one module.** Where a check is written, run and read
  by the same code path, the classification adds a concept without adding information.
- **Checks over external data you do not own.** Grading a third-party feed against your
  design canon produces findings nobody can act on. Validate its shape, reject what fails,
  and apply content invariants only after it has been adapted into your own artifacts.
- **As a replacement for judged evidence.** Both classes here are deterministic. Neither
  says whether the content is any *good* — a perfectly conformant artifact can still be
  generic placeholder work. Deterministic conformance is a floor beneath judged quality,
  not a substitute for it.
