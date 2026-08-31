---
layer: technique
type: technique
subject: docs-sync
technique: checked-vs-skipped-denominators
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [a drift report prints zero and you cannot tell whether it looked, deciding what a run with nothing checkable should exit, one report carries several signals and only some can fail a build]
---

# Checked, skipped, and the denominator

A drift report says *zero documents drifted*. The statement is true. No
document was found to have drifted. It is also, on the run that produced it,
worthless — the other repository was not on that machine, so nothing was
queried, and the zero is a count of findings from a search that never
happened.

This is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
at the **reporting** layer, and it needs its own technique rather than a
citation because the law's usual remedy does not reach it. The law's ordinary
shape is an instrument that broke: an exception swallowed, an exit code
discarded, a scanner that crashed and printed nothing. Every one of those has
something to catch. Here **nothing broke.** The code took a branch it was
written to take, for a condition its author correctly anticipated — *if the
other repository is not present we cannot query it, so return an empty list* —
and that branch is right. There is no exception, no red, no defect to fix at
the site. The lie is manufactured one level up, where an empty list from a
precondition failure is added to the empty lists from genuine clean results and
printed as one number.

You cannot fix that with better error handling, because there was no error. You
fix it with **arithmetic that carries its denominator.**

## Three states per unit of work, never two

Every unit the report set out to evaluate — a document, a record, a coupling
entry — resolves to exactly one of:

- **checked** — the evaluation ran and produced a verdict;
- **drifted / failed** — a strict subset of *checked*, and the only population a
  finding may come from;
- **skipped** — the evaluation could not run, with a reason.

The design failure is a two-state model where anything not found to be broken
is counted as fine. Once the third state exists, the correct headline writes
itself, and once it does not, no amount of care downstream recovers it: the
information was destroyed at the moment the two populations were summed.

## Skips carry a reason class, not just a count

A single number labelled *skipped* is barely better than no number, because the
things it aggregates require different people to do different work. Name the
classes, count them separately, and print each:

- **precondition absent** — the other repository is not here. An operator fixes
  this, by configuring a location or fetching a checkout.
- **instrument absent** — no history tool, no parser, no credentials. A build
  image fixes this.
- **record incomplete** — the document declares no watch set or no review date.
  An author fixes this, and this class is the coupling map's coverage measured
  from the other side.
- **unresolvable** — the declaration exists but points at nothing that exists
  any more. This one is the most urgent, because it looks like coverage and
  behaves like a hole.

The characteristic bug is a report that increments one counter from several
branches and then prints a single hard-coded explanation for it. It is worse
than an unexplained number: it states a cause, confidently, that may be the
wrong one — a reader told *skipped: no review date declared* goes and checks the
records, finds them all populated, and concludes the report is broken rather
than that the history tool failed.

## The headline is a fraction, and the skipped count prints at zero

Format the summary as a ratio with its bounds, never as a bare count:
*n drifted of m checked, k skipped*
([count-carries-predicate](../../../../_laws.md#count-carries-predicate) applied
to a gate's own output — the number that travels carries what it was measured
over). And print the skipped figure **even when it is zero**. A report that
mentions skips only when there are some teaches its readers that silence means
"the tool did not bring it up", which is exactly the reading that makes the
absent-repository run look clean. Printed always, a zero is information, and
its later appearance as a non-zero is legible.

The same discipline binds the machine-readable output, which is where it is
most often dropped. A structured result carrying an empty findings list and a
separate availability flag has *technically* disclosed the skip, and every
consumer that reads the findings list and not the flag will be wrong. Put the
denominators inside the same object as the findings, so no consumer can reach
the numerator without passing the population it came from.

## The exit code follows the denominator

A run in which nothing could be checked must not be green in the same way as a
run in which everything was checked and everything was clean. Two honest
resolutions, and the choice is a decision somebody makes rather than a default
somebody inherits:

- **Fail on an empty denominator.** Correct wherever the check is load-bearing.
  "I could not look" is a build-stopping condition, and the check's value comes
  from being unable to be skipped quietly.
- **Stay advisory, and put the skips on the headline.** Legitimate for a report
  designed to inform rather than block — but then the advisory status is
  *written down*, with an owner and a reason, because "advisory" and "nobody
  ever wired it up" produce identical behaviour and only one of them is a
  decision.

## Label which signals can actually fail, next to each signal

A report that emits several signals almost never enforces all of them, and from
the outside the enforced and the decorative look the same. The reader sees three
sections of similar weight, assumes the loud numbers matter, and infers a level
of protection that does not exist — which is the belief-without-mechanism
posture this subject's central counter-example manufactured by accident.

So each signal states its own status in its own output: *this one fails the
build below a threshold; these two are informational.* The cost is one clause
per section. The benefit is that nobody ever again reads a large red-looking
number and assumes something is stopping it, and that the gap between what is
measured and what is enforced becomes visible to the person best placed to
close it. The same disclosure is what makes an unenforced signal reviewable at
all: an informational number that has been rising for six months is a finding
about the project, and it can only be noticed by someone who knows nobody is
being stopped.

## The fourth number: what was never enumerated

Checked plus skipped must equal the population the run set out to examine. When
it does not — a budget truncated the walk, a pattern matched fewer records than
the tree holds, a directory was unreadable — there is a fourth population,
**not enumerated**, and it belongs on the headline beside the others. This is
where this technique meets [doc-rot-detection](./doc-rot-detection.md)'s stable
truncation and
[source-as-data-without-the-app](./source-as-data-without-the-app.md)'s partial
scrape: both are legitimate designs, and both produce a real denominator
smaller than the intended one. Disclosed, that is an honest coverage claim.
Undisclosed, it is the same lie as the absent repository, arriving through a
different door.

## The fifth number is not a number: which check set ran

Every population above answers *how many units were examined*. One more
question sits beside them and is answered by no count: **at what strictness.**
A report can enumerate its whole population, skip nothing, disclose nothing
unenumerated, and still mislead — because the checker it ran was the permissive
profile and the reader assumed the strict one.

The mechanism is a declared tier. Where a checker offers profiles — basic and
strict, standard and showcase, advisory and blocking — the profile is usually
an *input the examined artifact itself declares*, because different artifacts
in one corpus legitimately want different bars. That is a good design and it
carries a specific failure: a missing or misspelled profile field does not
error. It falls back to the permissive default, the run is honest, the receipt
is green, and nothing anywhere reports that the bar moved. Observed shape: a
receipt reporting four checks where the strict profile reports nine, with a
verdict field identical in both cases. A reader comparing the two verdicts
cannot tell them apart; a reader comparing the check counts can.

This is [count-carries-predicate](../../../../_laws.md#count-carries-predicate)
applied to the predicate rather than to the population, and it needs its own
clause because the denominators above are all *correct* on such a run. Nothing
was skipped. The examination simply asked less.

Three rules close it:

- **The receipt names its profile and its check count**, and the acceptance
  claim is read from those rather than from the verdict. "Passed" is not a
  tier; "passed 9 of 9 under the strict profile, 0 errors, 0 warnings" is.
- **A tier declared by the artifact is validated as a field before it is used
  as a setting.** An unrecognised value is an error, never a fallback — this is
  [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) at the
  configuration surface, where a typo silently buys the weaker gate.
- **A weaker profile's pass never satisfies a stronger profile's requirement**,
  even when both say "passed". Where a pipeline demands the strict tier, it
  compares the profile name, not the boolean.
