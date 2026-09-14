---
layer: technique
type: technique
subject: copy-quality-gates
technique: severity-as-declared-data
status: forged
laws: [every-finding-cites-an-anchor, the-authority-is-a-hypothesis]
shared_with: []
use_when: [deciding where a check's off, warning or error setting lives, a model-based check is about to be allowed to block a merge, quality scores from two dates are being compared]
stage: team
---

# Severity as declared data

What a gate does when a check fires is a governance decision, and the market has
converged on where that decision lives. Four vendors' documentation and two open
platforms (2026-09) independently ship the same design: every check carries
**Off / Warning / Error as configuration**, not as code, with a separate flag that
makes one specific warning **mandatory** — it cannot be dismissed without being
resolved — and, in one of them, a three-level cascade resolved **language, then
project, then default**. Six implementations that did not copy one another reaching
the same shape is what earns it rule status here.

The consequence is that a disposition is a row beside a rule identifier. Changing
it is a reviewable diff with a reason attached — for this subject, the counted
acceptance rate [layered-mechanical-gate](./layered-mechanical-gate.md) requires
before a block — rather than a code change nobody connects to a precision ledger.
A finding then cites both halves of its anchor per
[every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor):
the rule it breaks and the declared disposition that made it block.

A shipped default disposition is somebody else's calibration. Under
[the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis)
it is counted against this catalog before it is trusted, and a product that
overrides it writes the ruling where the disposition lives.

## The cascade

Language, project, default — most specific wins. The cascade is how two legitimate
decisions coexist without either being a hack: a script that has no letter case
turns the capitalization check off at the language level, and a product that treats
terminology strictly raises forbidden variants to error at the project level, and
neither edit touches the other. Without it, a language exemption becomes a project
flag and is lost the next time the project's preset is copied.

## A statistical verdict never blocks

Every implementation keeps spelling, grammar and model-based checks at warning,
enable or disable only; only deterministic checks may hold the error tier. One
platform ships **no error tier at all** for its model-based checks.

The reason is the shape of a false positive. A deterministic check's false positive
is a bug with an address: a guard is added, and that finding never recurs. A
statistical check's false positive — a model's verdict, a score, a ranked
suggestion — has no address, so the only fix available to an author blocked by one
is suppression, and suppression removes the check's true positives with it. A block
whose false positives cannot be fixed is a block that will be switched off.

The market is stricter than this subject's L2 row: it keeps even rule-based spelling
and grammar at warning. This subject still lets a *rule-based* L2 check earn a block
on counted acceptance, because its misfires can be guarded; a check whose verdict is
a model output or a threshold on a score does not earn one at any measured
precision, because the precision it earned on past strings says nothing addressable
about the next one.

## The rubric is versioned, not mutated

One vendor freezes the severity weights and the pass threshold once a scorecard has
been published against them; another instructs users to **clone** a built-in quality
model rather than edit it. Both protect the same thing: a score from March and a score
from June are comparable only if they were computed under the same rubric. This is
the discipline [reviewer-calibration-and-sampling](./reviewer-calibration-and-sampling.md)
already applies to reviewers — re-calibrate when the rule set changes — applied to the
rules themselves. The typology and its weights belong to the sibling subject's
[error typology over a single score](../../translation-quality-measurement/techniques/error-typology-over-a-single-score.md);
this technique governs how a change to them is recorded.

## Procedure

1. **Store every disposition beside its rule identifier**, with the date and the
   acceptance count that justified it.
2. **Resolve dispositions through the cascade** — language, project, default — and
   print the resolved value on every finding.
3. **Classify each check as deterministic or statistical** at the moment it is added,
   and refuse an error tier to the second class in configuration, not by convention.
4. **Mark the few warnings that must be resolved** as mandatory, sparingly: a
   mandatory flag on every warning is an error tier by another name.
5. **Version the rubric.** A change to a weight, a threshold or a disposition that
   feeds a published score is a new version; scores carry the version they were
   computed under.

## Decision rules

- **When a check's verdict comes from a model or a score, it warns and never blocks**,
  because its false positives have no address and a blocked author can only suppress it.
- **When a disposition changes, write the reason beside it**, because a disposition
  without its count is a preference that the next maintainer will reverse.
- **When a check does not apply to a language, turn it off at the language level**,
  because every product using that language inherits the answer.
- **When a weight or threshold behind a published score must change, clone the rubric
  and version it**, because an edited rubric makes every earlier score incomparable
  without saying so.
- **When a vendor default disagrees with the counted acceptance on this catalog, the
  count wins**, and the override is recorded where the disposition lives.

## When not to use it

- **To make a check's disposition the fix for a bad check.** A pattern rule firing
  wrongly needs a guard or a rewrite; demoting it to warning keeps the noise and hides
  the cause.
- **As a place to hide a structural check.** Skeleton parity is error by law, not by
  configuration; a cascade that can turn it off for a project has a hole in it.
- **Before anyone has counted.** A configurable severity table filled in from intuition
  is the same guess, now looking governed.
