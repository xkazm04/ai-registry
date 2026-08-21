---
layer: technique
type: technique
subject: bulk-adverse-action-governance
technique: small-cohort-floor-with-no-silent-exemption
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [expressing a bulk cutoff as a proportion, running an automated wave on a small role, configuring per-role-family thresholds and floors]
---

# Small-cohort floor with no silent exemption

## The concern

A bulk cutoff expressed as a proportion has a discontinuity at the bottom of its range
that nobody designs and everybody ships. Fifteen percent of a hundred is fifteen. Fifteen
percent of five is nought point seven five, which truncates to zero, which means the wave
selects nobody — and the control that the recruiter deliberately switched on does nothing
at all for every small role, forever, while its interface continues to read as active.

That state is worse than having no control. An absent control is a known gap. A control
that displays as enabled and silently exempts a whole class of roles produces a false
belief about what the pipeline is doing, and the belief is discovered at the worst
possible moment — usually when someone asks why one requisition's candidates were treated
differently from another's and the answer turns out to be arithmetic.

The mirror-image failure is just as common: a team notices the discontinuity, "fixes" it
by rounding up, and now a pool of three gets one automated rejection derived from a
ranking over three people, which is not a ranking. Both failures come from treating the
small cohort as an edge case of the arithmetic rather than as a different situation.

## The rule

**Floor the window at one candidate in any non-empty pool, and state the small-cohort
condition on the preview instead of hiding it.** A small role is not silently exempt from
an automated action the recruiter enabled — and it is also not quietly subjected to one
whose basis cannot be examined. The floor makes the control honest; the disclosure makes
the action reviewable.

The disclosure is not decoration. A cohort of six cannot support a selection-rate
comparison, an adverse-impact ratio, or any proportion with a stable interpretation, so
the fairness statistics that would normally back the wave simply do not exist at that
size. That must be stated as an insufficient-sample condition rather than left to be
inferred from a clean-looking disparity report computed over nothing
([a claim carries its sample and its basis](../../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## The procedure

1. **Compute the raw window** from the proportion and the pool size.
2. **Round in a documented direction** — down is the defensible default for an adverse
   window, because it errs toward fewer irreversible actions — and record the direction
   with the wave, not only in the code.
3. **Apply the floor**: if the pool is non-empty and the rounded window is zero, set it
   to one. If the pool is empty, the wave selects nobody and says so.
4. **Apply the effective floor for the role family.** Where per-family overrides exist,
   resolve them to a single effective value at decision time and **seal the resolved
   value**, not the family name. A record that says "the family default applied" cannot
   be interpreted after the default changes; a record that says which number applied can.
5. **Mark the wave insufficient-sample** below the size where your fairness monitoring is
   meaningful, and carry that mark onto the preview and into the sealed record.
6. **Apply the tie discipline after the floor**, never before. Tie-safety may shrink the
   window back below the floor — and when it does, tie-safety wins: sparing an
   indistinguishable pair outranks guaranteeing that the control did something.

## Decision rules

- **When the pool is non-empty and the proportion rounds to zero, select one.** Never
  zero-by-arithmetic.
- **When the pool is empty, do nothing and report the emptiness** as its own outcome, not
  as a successful wave with no members.
- **When the cohort is below the fairness-measurement threshold, still allow the action —
  but require the human review to be per-person rather than per-group.** At that size
  there is no aggregate to review; reading six files is a minute's work and it restores
  the individual consideration that
  [makes the oversight real](../../../../_laws.md#no-adverse-outcome-is-solely-automated).
- **When a role family override would raise the floor above the pool size, the override
  wins and the wave selects nobody** — an explicit configured exemption is legitimate
  precisely because it is visible. What is forbidden is the *unconfigured*, arithmetic
  one.
- **When rounding direction is changed, treat it as a policy change with a record**, not
  a refactor. It moves people across an irreversible boundary.

## Floors that tell the truth on the preview

An override is only defensible if the reviewer can see it operating. Where a per-family
floor differs from the globally displayed one, say so on the affected rows and summarize
how many rows were decided against an override — otherwise a candidate scoring *above*
the threshold the reviewer is looking at appears in the reject list with no visible
cause, and the reviewer's only available conclusion is that the tool is wrong. Suppress
the disclosure where an override equals the global value: claiming an override that
changes nothing is its own small lie.

## Reading the configuration surface

The reason floors and overrides belong in one resolved value rather than scattered
conditionals is auditability: the question asked afterwards is always "what threshold
applied to this person on that day", and it must be answerable from the sealed record
alone. Configuration that is layered — a global default, a family override, a per-wave
adjustment — is fine to author and unacceptable to store; store the resolution.

## When not to use it

- **Not for absolute-count windows.** "Reject the bottom five" has no discontinuity; it
  simply selects nobody when fewer than five exist, and the correct behaviour there is to
  cap at the pool size, not to floor.
- **Not for threshold-based waves.** A score floor applies uniformly regardless of pool
  size and needs no window arithmetic — though it needs the insufficient-sample
  disclosure just as much, because a threshold applied to six people is equally
  unmeasurable.
