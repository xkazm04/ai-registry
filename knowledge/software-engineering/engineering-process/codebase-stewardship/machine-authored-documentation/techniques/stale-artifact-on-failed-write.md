---
layer: technique
type: technique
subject: machine-authored-documentation
technique: stale-artifact-on-failed-write
status: forged
laws: [gate-sees-target, failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [a generation step writes atomically and something downstream inspects its output path, a check reported green on a run whose generator failed, ordering an inspection stage after a write stage, a pipeline reuses an output path across runs]
---

# A failed write leaves the last good artifact, and the next stage believes it

The atomic write is correct engineering and it manufactures a trap. The
discipline is unimpeachable: read the specification once, write those exact
bytes to a private snapshot, render the snapshot, run the checks against it,
and replace the target only after everything passes. On failure, remove the
private state and leave the target untouched. A reader who opens the output
path at any moment sees a document that passed.

That last property is a feature for humans and a trap for pipelines. **On
failure the output path still exists and still holds the previous good
artifact.** Anything downstream that was pointed at that path now measures a
document that passed, reports green, and — because nothing in its receipt is
false — attributes the green to the candidate that just failed.

Consider the concrete sequence, which is the ordinary shape of a generation
pipeline:

1. Generate a candidate. It has a defect.
2. Deliver. The checks reject it. Non-zero exit. The previous artifact remains
   at the output path, correctly preserved.
3. Collect visual evidence from the output path.
4. The evidence stage passes, captures four clean screenshots, and writes a
   receipt.
5. The summary reads: delivery failed, visual evidence collected, no defects
   observed.

Every line of that is true and the composite is a lie. The screenshots are of
last week's document.

## Why this one is hard to see

Most stale-data bugs announce themselves by being *wrong*. This one is
invisible because the stale artifact is **valid** — it is a document that
passed every gate, so nothing it is fed into will complain. And the practice
that creates it is the one nobody suspects: teams that write non-atomically
leave a corrupt half-file at the output path, which the next stage chokes on
loudly. The safer implementation is the one that fails silently.

It is
[gate-sees-target](../../../../_laws.md#gate-sees-target) arriving through a
door left open by good practice, which is why it deserves a technique rather
than a citation.

## Three closures, in order of strength

**1. Gate the inspection on the writer's exit code.** The cheapest fix and the
one that must exist regardless: an inspection stage runs only after the write
stage exits zero *for the current candidate*. Not "after the write stage",
which a pipeline with `continue-on-error` satisfies while failing.

**2. Bind the inspector to a digest.** The write stage emits the artifact's
digest; the inspection stage records the digest of what it opened and refuses
to proceed if they differ. This closes the cases the exit code cannot: a
concurrent run, a manual re-render between stages, a cached path, an inspector
launched from a stale invocation. It also produces the receipt binding that
makes evidence traceable afterwards
([evidence-without-verdict](./evidence-without-verdict.md)).

**3. Make the failure path clean up what it invalidated.** Everything a
previous success left beside the artifact — screenshots, contact sheets, JSON
sidecars, receipts — is now evidence for a document that may no longer be the
current one. A failing run deletes them rather than allowing them to present
as current
([creation-names-reaper](../../../../_laws.md#creation-names-reaper) read at
the level of the derived evidence rather than the artifact). The alternative —
leave them and hope a reader checks the timestamps — is a hope, and the
timestamps are usually the same afternoon.

## The general shape, so it is recognisable elsewhere

Stated once, abstractly, because it recurs wherever a preserve-on-failure
policy meets a path-addressed consumer:

> When a failure path preserves a previous success, every consumer addressed by
> location rather than by identity will read the previous success as the
> current result.

The fix is always the same substitution: **address by identity, not by
location.** A digest, a run id, a content-addressed name. Location-addressing
is what makes the two runs indistinguishable, and it is the default in every
pipeline because a fixed output path is convenient.

The same shape appears with a preserved last-known-good in a live preview loop
— invalid, half-written, or superseded input leaves the previous verified
revision on screen, which is exactly right for the human watching and exactly
wrong for any automated check pointed at the same file.

## Decision rules

- **When the pipeline cannot be reordered**, at minimum make the inspection
  stage print which digest it inspected, next to its result. A human comparing
  two lines will catch what an automated composite will not.
- **When the output path is reused across runs**, treat that as the defect and
  write to a per-run path with a stable symlink or copy for humans. The
  convenience of a fixed path is real; pay for it with the digest binding
  rather than with the ambiguity.
- **When a run's artifact is genuinely unchanged**, say so explicitly —
  identical bytes did not rebuild — rather than letting an unchanged file
  masquerade as a fresh success. The two are the same file and different
  claims.
- **When a stage's failure is expected and tolerated** (an advisory check, an
  optional capture), the tolerance is written down with an owner. "Advisory"
  and "nobody wired the exit code" produce identical behaviour and only one is
  a decision.

## When not to use this

Nothing here argues against atomic writes; the preserve-on-failure policy is
correct and should stay. The technique governs what is allowed to *read* the
output path afterwards. A pipeline with exactly one stage, or one whose
consumers all receive the artifact by value rather than by path, does not have
the exposure.
