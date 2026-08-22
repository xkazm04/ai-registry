---
layer: technique
type: technique
subject: ship-pipeline-gating
technique: size-budget-and-growth-baseline
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, a-budget-shapes-the-output]
shared_with: []
use_when: [holding a distributable against a size budget, detecting slow growth across builds, a first build has no baseline to compare against]
---

# Size budget and growth baseline

## The concern

Distribution size is a shipping constraint with hard external consequences — store
ceilings, download abandonment, install footprint on constrained devices, patch sizes for
every future update. It is also the property that no single change ever violates. Each
addition is defensible; the aggregate is not. Two gates are needed, and neither works
alone.

**An absolute budget** per platform stops the aggregate. **A growth comparison** against
the last known-good build stops the individual regression that the absolute budget still
has headroom for. A build can be well inside the ceiling and have doubled since
yesterday; a build can be flat since yesterday and have been over the ceiling for a
month. Only both catch both.

## Every size number carries its basis

Report size with the unit and the basis, always, because the same artifact has several
legitimate sizes and people compare across them without noticing:

- **What is measured**: the staged directory tree, the compressed distributable, the
  installed footprint, the download payload. These differ by large factors.
- **The platform**, since budgets are per platform and a desktop ceiling has nothing to
  say about a mobile one.
- **The configuration**, since a development-configuration package carries symbols and
  diagnostics a shipping one does not, and comparing across configurations produces a
  fabricated regression.

A comparison between two numbers with different bases is not a weak measurement; it is a
wrong one. Store the basis alongside every recorded size and refuse to compare across
differing bases.

## Procedure

1. **Set a budget per platform**, derived from the actual constraint — the store limit,
   the target device class, the patch-size policy — and record where it came from. A
   budget with no stated origin is renegotiated the first time it fires.
2. **Measure the artifact** with a stated basis, after packaging completes.
3. **Compare to the absolute budget.** Over is a failure. Approaching — a stated fraction
   of the ceiling — is a warning that must be visible while there is still time to act.
4. **Compare to the last known-good build's recorded size for the same basis and
   platform.** Growth beyond a stated allowance is a failure. A single-digit-to-ten-
   percent allowance is the common band: wide enough to absorb ordinary content
   additions, narrow enough that a doubling cannot pass as noise.
5. **Record the new size as the baseline only when the build is green** — green by the
   whole gate set, not by this gate. A baseline taken from a build that failed elsewhere
   launders a bad state into the reference.
6. **Report the breakdown** where the layout allows it: which parts of the package
   account for the growth. A gate that says "grew 14%" without saying where costs an hour
   of manual diffing every time it fires.

## Having no baseline is not having no regression

This is the honest core of the technique and the rule most often broken.

A comparison gate has **three** outcomes: within tolerance, outside tolerance, and *no
baseline exists*. The third must render as **unmeasured** — a distinct label, never a
zero-percent change, never a green tick. A first build, a build after the baseline store
was reset, a build on a new platform: each is the *least*-verified build in the history
of that pipeline, and printing it as a passed comparison inverts the truth exactly.

There is a fourth state, and it is the nastier one because it looks like a real result:
**compared against a baseline that cannot be named.** A store that records sizes without
recording which project, platform and configuration produced each one will return the most
recent number it holds, and the gate compares against a stranger's build. Every verdict
computed that way is fabricated and indistinguishable from a sound one. The rule: a
comparison verdict states *which* build it referenced — its identity, its owner, its
timestamp — and where the reference cannot be attributed, the verdict says so in the same
sentence as the percentage. An unattributed comparison is nearer to unmeasured than to a
pass, and the fix is upstream: record the attributing fields when the baseline is stored,
because a missing field cannot be reconstructed at comparison time.

Policy may still let an unmeasured comparison proceed — usually it must, or no pipeline
could ever bootstrap. What it may not do is *look* like a pass. The report says
"no baseline; growth not evaluated", and any roll-up that counts gates says one gate was
not evaluated rather than counting it among the passes.

## The ratchet, and why the absolute budget is load-bearing

A growth allowance against a moving baseline compounds. Ten percent accepted on each of
seven consecutive builds is a doubling, and no single gate ever objected. The absolute
budget is the only thing that stops it, which is why "we have a growth gate" is not a
substitute for having a ceiling.

The reverse trap: a ceiling set far above where the artifact should be is not a neutral
safety margin. A limit handed to a production process is read as the intended size, and
the space gets spent. Set the budget at the size the artifact *should* be, not at the
size that would be catastrophic.

## Decision rules

- **When no baseline exists, report unmeasured** and let policy decide whether to
  proceed. Never zero, never green.
- **When the bases differ, refuse to compare** and report why. A cross-configuration
  comparison is a fabricated number.
- **When growth exceeds the allowance but the artifact is far under the ceiling, still
  fail.** The growth gate is the early observer; deferring to the ceiling means
  discovering the trend when there is no room left to fix it.
- **When the same regression is accepted deliberately**, move the baseline explicitly and
  record who moved it and why. Do not widen the allowance — that raises the noise floor
  for every future build.

## When not to use this

- When the artifact is streamed or served in fragments and total package size is not the
  user-facing constraint. Gate the constraint that exists — first-download size, resident
  set, patch delta — with the same three-outcome discipline.
- When the pipeline cannot durably store baselines. Then run the absolute budget alone
  and report the growth comparison as permanently unmeasured, rather than comparing
  against whatever happened to be on the machine.
