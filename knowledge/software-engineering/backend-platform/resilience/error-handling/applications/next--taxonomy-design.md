---
layer: application
type: application
subject: error-handling
technique: taxonomy-design
stack: next
verified_on: 2026-08-31
verified_against: next@15
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Next — a ruleset inlined into every bundle, and no arm to fall back to

How a broadcast-artifact validator stands against
[taxonomy-design](../techniques/taxonomy-design.md), and specifically against
the amendment that absorbability depends on how the triggering input arrives.

## The seam

A template ruleset inlined into the build — a 25 KB document identical for every
instance — validated at module scope, whose own comment states the uncorrelated
argument verbatim: *the one thing this file may never do is keep running a rule
it can no longer state correctly.* It fails at import, loudly, naming the file.
That is correct for the threat it was written against and it is the whole
failure domain of a broadcast artifact: one bad push, every client bundle, at
once.

A second consumer in a different runtime was counted rather than executed, and
its numbers appear below because they size the population the experiment
sampled. There the asymmetry is explicit in six lines: a
configuration file that is **absent** degrades to compiled-in defaults with a
warning; a file that is **present and invalid** terminates the process. The
validation behind the second branch is one syntax path plus twenty-nine
semantic rules, and those rules are overwhelmingly resource-exhaustion caps —
a zero concurrency, a zero max-body-size, a retention window shorter than the
window it must cover. One of them carries a comment saying that guessing the
value silently "is how a total outage or an unbounded body gets shipped", which
is the technique's own never-absorbable argument, correctly made.

The artifact is version-controlled and carries values the file itself documents
as shared across the cluster. So a bad edit is not a rolling failure — it is a
simultaneous fleet-wide refusal to start.

## The arms

The executable arm was run against an equivalent seam in a second managed tree
whose consumer runs without a build step: a template ruleset inlined into the
bundle, validated at module scope, whose own comment states the uncorrelated
argument verbatim — "the one thing this file may never do is keep running a
rule it can no longer state correctly."

Six mutations, each a plausible drift in a pushed artifact: an out-of-union
role, an illegal kind, a non-integer threshold, an empty role, an unknown rule
name, and a truncated write.

- **A** — ship policy: the newest artifact is the only artifact.
- **B** — the amendment: on refusal, continue on the last artifact that passed,
  staleness visible; a passing artifact becomes the new last-good.

## What the arms said

| artifact | A: checks run | B: checks run | B: ruleset |
| --- | --- | --- | --- |
| valid | 32/32 | 32/32 | candidate |
| six mutations | **0/32** each | **32/32** each | last-known-good, flagged stale |

Six of six refusals under A take the entire checker to zero, for every consumer
that imports it, off one deploy. Six of six under B keep all thirty-two
assertions running, still print the refusal reason naming the offending field,
and mark the ruleset stale.

**Verdict: better.** The cost of B is measured rather than hidden: the checker
enforces yesterday's ruleset, so the rule the new artifact meant to introduce is
not in force. That is what the stale flag is for.

## The failure the experiment found in the repair

One of the six behaves differently and it is the most likely one. The truncated
artifact fails in the *decoder*, not the validator, and reports an
end-of-input error naming no file — while the five validator faults name both
field and file. A fallback path that inherits its diagnostics from the
validator will therefore handle five classes informatively and the sixth, the
partial write, with an unattributed syntax error. That is now a clause in the
technique.

## The structural facts

**Last-known-good cannot be expressed here without changing a signature.** The
loader takes no parameters, reads its path from the environment, and reads
once. There is no persisted prior configuration anywhere in the tree. And the
same tree holds two committed, fleet-identical configuration artifacts loaded
by two functions of the same shape, which handle "file missing" identically and
diverge **only** on "file present but invalid" — one terminating, one absorbing
with the loss named. That divergence is not a policy anyone wrote down; it is
which caller happened to propagate the error.

**The last-known-good copy is already being written, in two unrelated trees,
and no non-test code reads it back.** Both take a pre-migration snapshot — one
logging "backup FAILED; migrating anyway", the other rotating three of them —
and grepping both for a restore path returns only test code. Two independent
teams built the data the amendment needs and neither built the path. Sharper
still: one of them already implements the exact mechanism one layer down, for
per-job state, with a rule about refusing a snapshot it cannot trust. It was
never applied to the process's own boot artifact.

## The independent corroboration

Three other managed trees reached the rule without the corpus, on broadcast
artifacts, in their own words — one arguing that blocking every boot on the
absence of a backup "would convert a hypothetical risk into a certain outage",
and refusing only for destructive schema changes, "the one case where the
outage is the cheaper outcome." Across the seven trees the tally is eleven
refuse-on-broadcast sites against about nine degrade-on-broadcast families, and
**no project applies one policy consistently**. Both arms exist in the
population; the choice is being made per call site.

One of those trees also shows which half is actually hard. Its price book falls
back to the last seeded values correctly — and its own performance notes record
rates six months stale "and there is no indication anywhere". The fallback was
built; the visible staleness was not.

## What this realization cannot do

The arms measure whether assertions keep running, not whether they keep running
*correctly*. Arm B's real cost — a decision made under a stale ruleset that the
fresh one would have decided differently — is not observable here, because
neither tree emits a counter joining the stale boot path to the verdicts
reached under it. That counter is the instrument that would settle it.
