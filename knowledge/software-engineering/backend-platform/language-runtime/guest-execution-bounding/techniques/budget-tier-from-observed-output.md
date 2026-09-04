---
layer: technique
type: technique
subject: guest-execution-bounding
technique: budget-tier-from-observed-output
status: forged
laws: [limits-are-derived, count-carries-predicate]
shared_with: []
use_when: [one budget must serve guest work that is sometimes essential and sometimes optional, a short ceiling that protects the common case truncates the rare case that needed the whole time, choosing between a configuration switch and an observation to decide a limit, the host cannot know before running the work which kind it is]
---

# Budget tier from observed output

## The concern

A liveness ceiling has to be one number, and sometimes the work it bounds is two
populations with opposite needs. The usual instance: guest sub-units that *enhance*
something the host already has, and guest sub-units that *are* the thing the host is
waiting for. The first population wants a short budget - a non-essential sub-unit that
idles for ten seconds should be abandoned, and the host should return what it already
has. The second wants the full budget - cut it short and the host returns nothing at
all, having spent the time and thrown away the result.

Neither number is safe for both. A short budget applied to the second population is the
worse failure, because it is silent: the host returns a well-formed, empty result and
reports success. A long budget applied to the first surrenders the ceiling.

The host cannot ask the guest which population a sub-unit belongs to - the guest has no
reason to answer honestly and usually does not know. And it cannot be a configuration
switch, because the two populations occur on different inputs to the *same*
deployment, so any single configured value is wrong for half the traffic
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) applies to a limit as
much as to a guard: an operator-tuned tier converges on one default and the default is
wrong for one population).

## Ask the output what kind of work this is

The move is to derive the tier from **an observation of the host's own state at the
moment the budget is chosen** - specifically, from whether the thing the guest work
would produce already exists.

If the host already holds substantial output, whatever the guest is about to run is by
definition adding to it: enhancement, short budget, and abandoning it costs the host the
increment and not the result. If the host holds nothing but a stub, this work *is* the
result: full budget, because cutting it short returns an empty answer, which is the
failure mode the ceiling was never meant to cause.

The check is a cheap structural count over state the host already has - the size of the
output tree, the number of populated fields, the presence of anything beyond a
placeholder - and the threshold separating the two populations is derived from the
shapes actually observed, not chosen round
([limits-are-derived](../../../../_laws.md#limits-are-derived)). The two populations are
usually separated by an order of magnitude rather than by a few units, which is what
makes the threshold robust: a populated output has hundreds of elements, a stub has one
or two, and any threshold in between classifies both correctly. Write the observed
range beside the number, because a threshold whose basis is not recorded is a threshold
the next reader tunes blind
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## The rule that keeps it honest

An observation-derived tier is a heuristic, and heuristics rot when their failure is
invisible. Two rules keep it legible.

**Bias the misclassification toward the survivable side.** Classifying essential work as
enhancement truncates a real result; classifying enhancement as essential wastes time on
a runaway. The second is recoverable by the rung above
([nested-liveness-ceilings](./nested-liveness-ceilings.md)) and the first is not, so the
threshold sits where uncertain cases fall into the *long* budget. This is the same
asymmetry that decides every default in this subject: the ceiling exists to prevent a
hang, not to enforce promptness.

**Keep an explicit override that wins over the observation**, for tests, and let the
override skip any grace the observation path grants. A tier chosen by observation cannot
be exercised deterministically in a test unless the test can pin it, and an
observation-derived limit with no way to pin it is a limit nobody will write a test for.

## Decision rules

- When one budget must serve work that is sometimes optional and sometimes essential,
  derive the tier from an observation of the host's current output rather than from a
  configured value; the populations arrive at the same deployment on different inputs.
- Read the observation immediately before choosing the budget, from state the host
  already holds. A cached classification from earlier in the request is measuring an
  older state than the one the decision is about.
- Derive the threshold from the two observed distributions and record their range beside
  it. Populations an order of magnitude apart make any threshold between them correct;
  populations that overlap mean the observation is the wrong signal, not that the
  threshold needs tuning.
- Place the threshold so that ambiguous cases get the long budget, because the outer
  rung recovers a wasted long budget and nothing recovers a truncated result.
- Provide an explicit override that beats the observation and grants no grace, so the
  tier is testable at all.

## When not to use it

Work whose kind the host genuinely knows before running it should be told, not observed:
an explicit classification the caller supplies is more precise and easier to test, and
the observation is only justified where no honest classification is available. Where the
two populations overlap in the observed signal, this technique classifies them wrongly
with confidence, which is worse than a single conservative budget for both. And where
the whole guest workload is one population, the tier is a branch that always goes the
same way, and the number should simply be that population's number.
