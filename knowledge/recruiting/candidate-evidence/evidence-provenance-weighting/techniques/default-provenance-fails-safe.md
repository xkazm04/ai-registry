---
layer: technique
type: technique
subject: evidence-provenance-weighting
technique: default-provenance-fails-safe
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [choosing the value for unknown provenance, auditing a scoring path for silent defaults, reviewing an evidence-weighting incident]
---

# The default fails safe

Every provenance ladder has a value it uses when the origin of a claim was not
established. That value is not an edge case — it is the most frequently applied rung
in most real systems, because documents are messy, parsers lose section boundaries,
and several intake paths never carried an origin field at all. The technique is
choosing it correctly and putting it where it cannot be bypassed.

## The rule

**Unknown provenance takes the floor of the ladder, alongside bare self-assertion.**

This is [absence of evidence is not
evidence](../../../_laws.md#absence-of-evidence-is-not-evidence) applied to the one place
in a hiring pipeline where the violation is most profitable to the wrong candidate. A
discount schedule whose default is generous is not a discount schedule; it is a
mechanism that pays maximum credit for silence. Every claim the extractor could not
place arrives holding the strongest tier, and a well-written skills list — where
nothing is placeable, because a list has no context — collects top-tier credit for
every entry.

The bias is not random, which is what makes it a fairness problem rather than a noise
problem. Provenance is lost most often on unusual document formats, non-native
phrasings, career shapes the parser was not built for, and files converted through
lossy pipelines. So a flattering default awards its bonus disproportionately to the
files the system understands *least*, and the ranking ends up anti-correlated with the
evidence it claims to weigh.

## The asymmetry that decides it

The two errors are not comparable, so the default is not a judgment call:

- Understating a real professional skill costs one probe in an interview. The
  candidate is still in the process; the recruiter asks; the record corrects.
- Overstating an unsupported skill costs a hire, and costs the candidates who were
  ranked below the padded file.

[Uncertainty resolves toward the
candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate) governs the
adverse direction too: because the discount must never remove someone from
consideration, the floored claim still lands in the unproven bucket, never in missing
— see
[unproven-versus-missing-distinction](./unproven-versus-missing-distinction.md). Failing
safe means failing toward the cheap error *and* away from the automated adverse
action, and those are two separate guarantees.

## One default, one population

A default that varies by candidate segment is worse than a generous one, because it is
generous *selectively*. The usual shape: the discount ships for early-career
candidates, where the need is obvious, while experienced candidates keep the old
top-tier default because their history "speaks for itself". The same unevidenced claim
is then penalised for the person least able to evidence it and waived for everyone
else — an inversion nobody would defend if it were written down as policy, arrived at
by shipping the easy half of the fix first.

When a fix lands, it lands for every intake path and every archetype at once, and the
regression test that pins it compares two candidates from *different* segments with
identical evidence.

## Where the default lives

Fixing the number is the easy half; teams get the placement wrong even after the
incident.

- **The default belongs at the definition of the lookup**, so that every caller —
  including the ones that omit the origin argument entirely — gets the floor. A
  default expressed only as an argument value at each call site is not a default; it
  is a convention, and one forgotten call site quietly reinstates the original bug for
  one intake path.
- **There is exactly one lookup.** A second hand-written mapping of origin to weight
  is a second ladder with its own default, and the two will diverge on the first
  tuning pass.
- **The floor sits below the match threshold.** A default that fails safe in name but
  still clears the bar that decides matched-versus-unproven has changed nothing a
  recruiter can see. Check the two numbers together whenever either moves; they are
  one calibration, not two.
- **Absent must be representable, and it must be distinct from floor-by-assertion.**
  "Self-asserted" and "we do not know" score the same and should, but they are
  different facts, and the audit answer to "why is this discounted?" differs. Store
  the distinction even when the weight collapses it.

## Verifying it

A default this consequential is asserted by a test, not by reading. The three that
earn their place:

1. Score a claim with the origin argument omitted entirely; assert it receives the
   floor weight. This is the test that catches the forgotten call site.
2. Score a claim whose origin string is unrecognised — a value from a newer extractor,
   a typo, a foreign-language token; assert the floor, not a crash and not a
   mid-ladder guess.
3. Score two candidates identical except that one's claims carry established
   professional origins and the other's carry none; assert the first ranks higher.
   This is the regression test for the whole subject and it should be named after the
   incident.

## When not to use this

- **Not for positive, non-adverse copy.** A predicate that merely decides whether to
  show an encouraging line may treat unknown as false without consequence. This
  technique governs anything that feeds a ranking, a filter, or a recruiter-visible
  strength label.
- **Not as a substitute for fixing extraction.** A floored default is the correct
  handling of a lost origin, not an acceptable steady state. If a large share of
  claims land on the unknown rung, the intake is broken and the ladder is measuring
  parser coverage.
- **Not silently.** A claim floored for unknown origin must say so when asked. A
  default that fails safe but cannot explain itself trades one honesty problem for
  another.
