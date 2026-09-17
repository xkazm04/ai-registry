---
layer: application
type: application
subject: engine-behaviour-profiles
technique: family-diversity-as-a-control
stack: process
status: forged
verified_on: 2026-09-16
---

# Process: what the second family revealed in a skill benchmark

Measured 2026-09-15/16, one run per cell, eight agent skills against three repositories.
The benchmark ran fifteen GPT configurations first and Claude configurations afterwards,
and judged every run blind with one judge from each family.

## Attribution: three failures the second family reclassified

- **A wording defect, confirmed.** The `ci-gate-check` skill's stage table orders the
  dependency-install step last. On the Python platform, four of four GPT configurations at
  low effort ran type-checking against an unsynced environment, hit six import errors and
  reported "do not push" — while the repository's gates were green. `gpt-6-astra@high` was
  the only cell in the whole grid that installed first and reached the correct verdict, and
  it did *not* reproduce that at low effort. A failure that survives four configurations
  and two tiers is the instruction, and the fix is one sentence in the skill, not a
  procurement decision.
- **A disposition difference, isolated.** On the same skill against the Rust workspace,
  four of five GPT configurations at high effort ran the skill's five-stage table, found it
  green, and said "safe to push" — while the repository's own required secret-scanning job
  was red. `gpt-5.5@high` found the repository's declared gate script, ran all eleven of
  its stages, saw the leak scan fail and said "do not push". Same instruction, same
  repository, same tier: evidence reach separated the cells, so it belongs in a profile
  rather than in a bug report.
- **A model claim withdrawn.** The Rust test gate went red across several runs and the
  first hypothesis was a model defect. The second family was not what disproved it — a
  harness audit was — but the contrast made the audit worth doing: the reds did not follow
  a family, which is the signature of an environment fault. The cause was a shared build
  directory serving stale test binaries between clones.

## Judging integrity: the control that was missing for a while

The default judge pair is deliberately cross-family. When the GPT seat hit a weekly limit
on 2026-09-16 with 40 GPT cells outstanding, the 96 finished Claude runs could not be
judged at all under that rule. Rather than record one-family verdicts as if they were
mixed, the harness withholds the verdict entirely when a judge seat refuses. The fleet then
made the trade-off explicit: it judged the Claude phase with two Anthropic judges
(`claude-opus@high` and `claude-fable@high`), wrote the judge names into each verdict, and
labelled the whole phase **single-family and provisional** until the GPT judge re-scores it
after the seat resets — at which point the two verdict sets are compared rather than merged.

## Continuity: the insurance paid out too

The same seat limit stopped the GPT phase for five days with the grid incomplete. Because a
second family had already been qualified on the identical grid, the benchmark continued
with 96 Claude runs instead of stalling — capacity insurance that only existed because the
second family had been run for epistemic reasons first.
