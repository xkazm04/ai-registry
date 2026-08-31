---
layer: technique
type: technique
subject: quality-gates
technique: excess-indicts-the-instrument
status: forged
laws: [gate-sees-target, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [a new check reports hundreds of findings on its first run, deciding whether a large legacy population is debt or misconfiguration, recording the founding baseline for a ratchet, a finding population clusters on one directory or package boundary]
---

# Excess indicts the instrument

[gate-liveness](./gate-liveness.md) collects the signals that a checker is
lying, and every one of them points the same way: zero files walked, a rule set
that failed to load, an absent binary, unparseable inputs, a trigger that never
fired, a year without a red. They are all **deficiency** signals — the
instrument did too little, and the tell is a number that is too small. The
discipline is sound and it is half of one. A check can also be broken in the
direction that produces *more* output, and that half has no entry anywhere in
this subject: an instrument pointed at the wrong scope runs perfectly, walks a
large and healthy population, parses everything, exits with the code it should
— and reports a mountain of findings about ground it was never supposed to be
standing on.

The standing rule: **a finding population that is implausibly large is evidence
about the instrument's scope declaration, and it is tested as such before it is
attributed to the codebase.**

## The moment this is expensive is the founding measurement

Excess is cheap to recover from at any time except one. [ratchet-design](./ratchet-design.md)
guards the *drop* — a measured value far below baseline is treated as actionable
divergence, because a matcher that stopped matching produces a smaller number
and looks like progress. It never asks the same question about the value being
frozen in the first place. And [blocking-by-input-determinism](./blocking-by-input-determinism.md)
supplies the assumption that makes the omission comfortable: a check with a
thousand pre-existing findings is *"a statement about the backlog, not about the
check."*

Usually true. When it is false, the two techniques compose into a trap. Declare
a scope that misses a region, measure the findings that misattribution produces,
freeze the count as a baseline, and the ratchet now enforces a floor built out
of a configuration error — permanently, and undetectably, because the ratchet's
whole contract is that the number only goes down. Every subsequent run confirms
it. The one reading that could have revealed the mistake was the first one, and
the technique that consumes it has already been told to treat it as debt.

So the founding population gets the question before it gets the baseline: **is
this a statement about the tree, or about the roots?**

## The discriminator is distribution, not size

Size alone decides nothing — a genuinely neglected codebase produces a genuinely
large number. What separates the two cases is *shape*, and it is mechanical
enough to compute:

- **Debt is distributed the way the code is.** The findings spread across
  packages, directories and authors roughly in proportion to how much code sits
  in each. No boundary explains them.
- **Misconfiguration clusters on a boundary the configuration itself draws.** A
  whole package, a whole directory, everything not reachable from a declared
  root. The population has an edge, and the edge is a line in the config file
  rather than a line in the code.

The implementation is a bucket-and-rank: when the count crosses a plausibility
threshold, attribute the findings to their scope units, sort by contribution,
and report the dominant units by name with their counts.

### Clustering samples; it does not discriminate

That last paragraph is where a first version of this technique overreached, and
a measured run refuted it. Against a tree reporting 230 unreachable files out of
982 walked — 23.4%, frozen as a ratchet baseline — bucketing by directory and
comparing each bucket's rate to the overall rate separated the population
cleanly into two regimes: one large bucket at **0.9x** the base rate (below
average, unmistakably ordinary attrition) and seven buckets at **2.4x–4.3x**,
several of them reporting **100% of their directory** unreachable. The signature
fired exactly as designed. Then every one of those seven clusters was checked,
and **all seven were genuine dead code. Zero were root errors.**

The confound is obvious in hindsight and fatal to the simple version: **dead code
arrives in whole features.** An abandoned feature leaves its entire directory
unreferenced, so total saturation is equally consistent with *"no root declares
this"* and *"this island really is dead"* — the two hypotheses predict the same
distribution, which is precisely what makes distribution unable to choose
between them.

So clustering is a **sampler**, not a discriminator. It is still worth running,
because it turns an undifferentiated pile into a short list of places worth a
minute each. But the decision needs a second stage, and the cheap one is a
referrer check per cluster:

- **No referrers anywhere outside the cluster** → a dead island. Debt, and the
  best-priced kind, because it leaves as one unit rather than as fifty reviews.
- **Referrers exist, but they are themselves in the findings** → the cluster is
  held up only by other dead code; still debt, and the reachability question
  belongs to the referrer.
- **A live, genuinely rooted referrer imports these files and the checker still
  calls them unreachable** → *now* the roots or the resolution are wrong, and
  this is the only branch that indicts the instrument.

Only the third branch supports the accusation. A tool that prints the
self-accusation on clustering alone will cry misconfiguration at every team that
has ever deleted a feature — which is every team — and it will spend its
credibility in the first week.

One incidental finding from the same run is worth carrying: the sole outside
reference into one fully-unreachable component was a **documentation comment in
a live file recommending it** — the surviving code's own guidance pointing
readers at eight files nothing imports. Nobody designed that; it fell out of the
code being deleted around the prose. It is a carrying cost
([carrying-cost-economics](../../../codebase-stewardship/dead-code/techniques/carrying-cost-economics.md))
that a referrer check surfaces for free, and a reminder that a "reference" found
by text search is not a reference.

A second discriminator sharpens it, and it costs nothing because the checker
already knows the answer: **which findings depend on a declared root set?** A
finding derived by walking outward from roots — reachability, coverage,
whatever-is-not-reached — inverts when the roots are wrong, and one missing root
condemns everything behind it at once. A finding derived locally, from the
content of a file the checker was handed, does not. Volume in a root-sensitive
class is diagnostic of configuration; volume in a locally-derived class is
diagnostic of the tree. A checker that emits both should apply the plausibility
test only to the first, or it will accuse its own configuration every time a
codebase is merely untidy.

## Say it above the findings, not among them

The self-accusation is worthless where it will not be read, and the natural
place to print it — after the findings, as a footnote — is the worst one,
because the reader who most needs it is the reader scrolling past four hundred
entries deciding this tool is not worth configuring. Ordering rules that follow:

- **The suspicion outranks every individual finding.** The instrument's doubt
  about itself is printed first, ahead of the population it is doubting, and it
  names the scope unit and the count that provoked it
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) so the
  reader can check the inference rather than take it.
- **The message is the repair, not the diagnosis.** "Declare a root for this
  package" is actionable; "unusually many findings" is a shrug with a number
  attached.
- **Cap each finding class and carry the remainder.** Printing ten of a class
  with an explicit *"and N more of this kind"* keeps the report readable without
  the truncation becoming a second lie. A report that silently prints the first
  ten has replaced an excess problem with a deficiency one.

## Severity: advisory by default, escalatable by one switch

A self-accusation is a heuristic and it will sometimes be wrong about a codebase
that really is that neglected, so it does not block by default — it warns, and
it renders as a warning. But a team that has cleaned up its scope declarations
wants the state defended, and the cheap way to give them that is a single switch
that promotes the whole hint class to a non-zero exit
([severity-by-construction](./severity-by-construction.md) governs the choice;
this is an ordinary advisory-to-blocking promotion, not a special case). Render
the section differently in the two modes, so that whether these findings can
fail the build is visible in the output rather than only in the configuration.

## What this does not do

It does not verify the scope declaration — it raises a suspicion from a count,
which is a weaker act than checking, and it can be defeated by a configuration
that is wrong in a way that produces a *plausible* number. That case is
untouched by everything here and belongs to the ordinary seeded-failure
discipline in [gate-liveness](./gate-liveness.md): a root set is verified by
confirming the check reaches a file you know it must reach, not by finding its
output reasonable. Excess is a smoke alarm, and its whole value is that it fires
during the one reading nobody else examines.
