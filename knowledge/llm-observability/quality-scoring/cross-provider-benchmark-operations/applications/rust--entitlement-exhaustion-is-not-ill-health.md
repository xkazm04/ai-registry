---
layer: application
type: application
subject: cross-provider-benchmark-operations
technique: entitlement-exhaustion-is-not-ill-health
stack: rust
status: forged
verified_on: 2026-09-07
verified_against: rust@2021
applied: experiment
ab_verdict: better
proof: structural-only
---

# Rust: a benchmark runner that computes the discriminator and then discards it

A self-hosted observability service with an LLM-as-judge benchmark lane runs its
comparison matrix from a Rust workspace, and it is the strongest available test of this
technique because it was built without it and gets most of the way there anyway. Read
against the technique, the tree **refutes the broad claim and confirms the narrow one**,
which is the more useful result: the general worry — that a runner will render every
absence identically — is already answered here, and the specific mechanism this technique
names is missing at one line.

## What the tree already does, better than the technique assumed

The comparison path records per-target coverage in four separate fields rather than one:
the count of cases the target errored on, a `partial` flag, a `budget_halted` flag scoped
to the operator's own ceiling, and a `health_filtered` count for cells never attempted
because that target's breaker was open. The comment above the last two states the
distinction in the technique's own terms — that a missing row because the provider was
down must not read like a missing row because the money ran out — and the report renders
them as separate keys, not as one nullable reason string.

The surrounding discipline is there too, arrived at independently: the breaker feeds on
**generation** failures only, so a bad hour from the judge cannot indict a healthy target;
it fails open when every target is indicted at once, on the stated reasoning that a health
hypothesis condemning all candidates is more likely wrong than the candidates are; and the
leaderboard's winner claim is tested paired, on the cases both targets were scored on, so
a column with fewer completed cases cannot win by having skipped the hard ones. A run that
judged part of its set is gated as unverified, with a test named for the trap — a halted
run whose partial mean happens to clear the baseline.

**So the coverage half of this technique lands as already-covered, and should be recorded
that way rather than claimed.** A team adopting the technique against a runner shaped like
this one is adopting one rule, not six.

## The one rule that is missing, and it is missing structurally

The engine layer defines eleven typed error variants, and one of them is precisely this
technique's discriminator. `OverBudgetWait` is raised when the provider states a wait
longer than what remained of the call's wall-clock budget, carrying the wait that did not
fit, the budget that remained, and the attempts already spent. Its own doc comment insists
it is a terminal state kept distinct from ordinary exhaustion, because the budget was not
spent but found insufficient in advance — the author went out of their way to preserve
exactly the signal that separates a burst limiter from an allowance that has ended.

One layer up, the comparison runner reduces every generation outcome to a boolean before
anything downstream sees it. The failure's text survives into a per-cell message string,
but the value the breaker and the report's absence classes are computed from is one bit.
Eleven distinguishable causes upstream, two absence classes in the artifact, and the
variant that would have made a third possible is discarded at the assignment.

That is the technique's structural precondition observed in the wild, and the direction of
the evidence is what makes it worth writing down: this is **not** an oversight about the
distinction, because the same tree draws the harder version of that distinction two fields
away and comments on it. It is a type collapsing at a layer boundary, one line before the
consumer that needed it. A reviewer reading either file alone sees nothing wrong. The
defect exists only in the seam, which is why the technique states the precondition as
*carry the typed error* rather than as *report the cause*: reporting is downstream of a
choice already made.

## What this application cannot claim

The verdict is `better` on a **structural** proof and no behavioural arm was run, which
bounds it in a specific way worth stating for anyone copying this. Nobody exhausted a real
plan against this runner. The claim proven is that the artifact *cannot express* the
distinction — a property of the code path, checkable by reading it, and the sense in which
arm A fails is that the information is provably absent rather than observed to mislead.
What is not proven is frequency: how often a benchmark of this shape actually meets an
allowance ending mid-run, as against an ordinary burst limit the retry ladder absorbs
silently and correctly. A tree whose targets are all metered credentials would show this
bin never filling, and the technique says so itself.

The change was not shipped, for a reason that is recorded rather than argued: the file
holding the collapse had another session's uncommitted work in it at the time of reading,
and a cross-repo commit into a file with foreign work in flight is the one case the
standing authorization does not cover. The return condition is that work landing.
