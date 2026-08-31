---
layer: technique
type: technique
subject: codebase-scanning
technique: precision-trades-have-a-direction
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [swapping an analysis backend for a faster one, a speed refactor lands on a scanner, stating what a reported speedup cost, a scanner's recall has never been measured, deciding which precision loss to announce and where]
---

# Precision trades have a direction

The subject's second wall states the asymmetry plainly: **recall failures are
invisible and forgiven; precision failures are experienced personally by every
developer the scanner wastes.** That is true, it is measured, and it is the
right reason to make precision the survival property. It is also, read one step
further, the reason recall needs a deliberate instrument — because "invisible
and forgiven" is a description of a defect class that nothing in the pipeline
will ever surface on its own. A scanner is graded continuously on precision by
its users, for free, whether or not anyone planned it. Nobody has ever filed a
bug about a finding that was not reported.

This technique is about the moment that asymmetry turns from an observation into
a liability: **a scanner is made faster.** Speed in static analysis is almost
never cleverness; it is an information source discarded. And every discarded
source moves the error in a specific direction, which is knowable in advance and
is the thing to write down.

## The two directions, and the test that tells them apart

Ask what the discarded source used to do:

- **It let the analyzer *see* a reference.** Losing it means references go
  unobserved, code that is used looks unused, and the scanner reports **false
  positives**. Cost: a developer chases a phantom, trust drops, and the tool is
  one bad week from being switched off.
- **It let the analyzer *distinguish* references.** Losing it means references
  are over-attributed — anything that looks like a use is counted as one — code
  that is dead looks alive, and the scanner reports **false negatives**. Cost:
  nothing observable. The corpses stay, and they accumulate at exactly the rate
  the scanner is trusted.

The second is the one that arrives quietly, and it arrives specifically when a
resolution layer is replaced by a matching layer. A reference tracer that knows
which declaration a name binds to can tell two same-named things apart; a
matcher that compares names cannot, and every local binding that happens to
reuse an exported name silently certifies that export as used. This is a
different defeat from the one the subject already owns — dead code holding other
dead code alive is a *reachability* failure, and this is an *identity* failure —
and it is worth keeping the names apart, because the mitigations do not overlap.

## The discarded layer reappears as hand-written code, and that is where the misses live

The information does not stop being necessary; it stops being free. What a
resolution layer supplied is rewritten by hand, in the traversal, one construct
at a time — and the hand-written version is a *checklist*, so its failures are
the entries somebody forgot. That checklist is enumerable in advance and doubles
as the test matrix for the refactor:

- block-scoped declarations, and the nested declarations inside them;
- function, method and arrow parameters — which are bound before the body they
  scope, so a naive implementation keyed to the body's range misses them;
- exception bindings;
- loop bindings, likewise bound before the body they scope;
- and destructuring patterns of every shape, recursively — object, array,
  defaulted, rest — each of which introduces names that a flat scan does not see
  as declarations at all.

Every entry omitted from that list is a class of dead code the scanner will
never report again, and none of them will announce themselves. A refactor that
buys speed this way is not finished when the suite is green; it is finished when
the list is closed and each entry has a case.

## The only instrument for recall is a differential

You cannot detect a missing finding from inside the tool that missed it — this
is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) at
per-symbol granularity, and the usual corrective (assert the instrument, then
report) does not reach it, because the instrument is healthy. The measurement
that exists is comparative: **run the slower analyzer and the faster one over the
same tree, and diff the finding sets.** Findings the old backend produced and the
new one does not are the recall loss, exactly and by name.

This is affordable precisely when it matters most — during the swap, while both
implementations still exist — and it is nearly unaffordable afterwards, which is
why it is a step in the refactor rather than a follow-up. What the differential
yields is a number with a predicate attached
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): *N
findings lost, of these classes, against this tree, at this version.* A speedup
published without it is a half-reported measurement — the gain has a figure and
the cost has an adjective.

Where a differential is genuinely impossible, the honest fallback is a seeded
corpus: cases built to be found, kept in the suite, one per construct on the
checklist above. It is weaker, because it only ever finds the misses somebody
already imagined.

## Announce the direction where its cost lands

A precision loss and a recall loss want different channels, and the instinct
routes them backwards.

The false-positive risk is the one users can act on — "you may see findings that
are wrong, please report them" turns the user base into the regression suite, so
it goes out loudly, to users, on the release. The false-negative class is the one
users can do nothing about, so it drifts into the maintainers' own notes, where
it is genuinely useful and completely invisible to the people whose dead code is
now going unreported. Each decision is locally reasonable. Together they mean the
direction that fails silently is also the direction documented quietly, and the
loss compounds untracked.

The corrective is not louder prose — telling users about a recall gap they cannot
act on is noise. It is that **the recall loss must exist as a number somewhere a
consumer can find it**: the differential's result, published with the release
that caused it and dated, alongside the speedup it paid for. A scanner that
reports what it stopped being able to see has told its users the one thing they
need to decide whether the trade was theirs to make.

## The boundary

This technique governs the *detection* side and stops at the candidate list.
What happens to a candidate whose reachability is genuinely uncertain — dynamic
dispatch, string-keyed lookup, quarantine versus delete — is
[dead-code-detection](./dead-code-detection.md) and the elimination subject it
hands off to. The split follows the failure modes: detection fails by missing
corpses, which is this technique's whole subject, and elimination fails by
burying the living, which is not.
