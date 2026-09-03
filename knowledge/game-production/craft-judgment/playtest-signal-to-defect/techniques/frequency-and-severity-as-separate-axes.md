---
layer: technique
type: technique
subject: playtest-signal-to-defect
technique: frequency-and-severity-as-separate-axes
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [prioritising a playtest finding queue, a triage board sorts by a single priority score, reporting how bad a build's session results were]
---

# Frequency and severity as separate axes

The concern: **how often it happens and how bad it is are two measurements, and they are
reported as two.** The pressure to combine them is constant, because a queue wants one sortable
column, and every combination destroys information that the two numbers had.

## Why the composite is not a shortcut

Three independent objections, and any one of them is sufficient.

**Ordinal labels do not multiply.** Severity levels are a ranked vocabulary, not a scale with a
zero and a unit; the same is true of frequency bands. Multiplying two rankings produces a number
whose arithmetic means nothing — nothing makes a middling-severity, middling-frequency finding
genuinely equal to a top-severity, rare one except two multiplications landing on the same
integer.

**A composite cannot be inverted.** One number cannot distinguish *rare and catastrophic* from
*constant and mild*, and those receive opposite treatment: the first is an investigation that
can block a release, the second is a polish pass that never will. A reader who has to ask which
one a score means has already lost whatever the score was supposed to save.

**A composite conceals an unmeasured term.** The most damaging case: nobody measured frequency,
somebody assumed it, the product came out as a number, and the number is now indistinguishable
from one where both terms were observed. An unmeasured frequency renders as `unmeasured` — a
label, never a one, never a default band, and never silently absorbed into a product.

## What each axis needs to be honest

**Frequency is a rate and a rate needs a denominator with a stated basis.** Not "often" and not
"3 occurrences". *Three of five sessions, on this build, all first-time players, all on a
handheld input device.* The denominator is the exposure — sessions, encounters, attempts, hours
— and which exposure you chose changes the number by an order of magnitude, so the choice is
stated beside it. Two rules keep it usable: the denominator counts only sessions that could have
met the defect, since a finding about the third area is not diluted by sessions that never
reached it; and with a small sample the honest report is the literal fraction rather than a
percentage, because "60%" from five sessions claims a precision the sample cannot carry.

**Severity is a claim about consequence**, and this subject does not own its ladder. Severity for
a playtest finding is graded on the same consequence ladder the review doctrine defines — what
happens if this is never fixed, to the player or to the project — because a project with two
severity vocabularies has none, and because a finding routed from a session into a subsystem
review must arrive speaking that review's language. What this subject adds is not a second
ladder but the discipline of grading it **absolutely**: the standard is the experience shipped
games actually deliver, not the average of this build's other findings. A test where everything
is medium because the rest of the build is worse has graded on a curve.

## The plane, and what lives in each corner

Triage happens in two dimensions and the corners have different owners:

- **High severity, high frequency.** Blocks. Nothing else in the queue matters until it moves.
- **High severity, low frequency.** Investigates. The rare catastrophe is the most under-served
  corner because a composite always sorts it downward, and it is the corner where the frequency
  is usually wrong rather than low — most rare-catastrophic findings are common findings whose
  trigger nobody has identified yet.
- **Low severity, high frequency.** The corner that decides how a build feels. It rarely blocks
  anything and it is what every player meets, so it is scheduled as a batch rather than as
  tickets.
- **Low severity, low frequency.** Recorded, aged, and closed by policy rather than by argument.

## Roll-up rules

- **Never average severities.** Report the distribution — how many at each level — and the worst.
  One critical among forty low findings averages into comfort.
- **Reach is derived and shows its inputs.** How many players will actually meet a finding is
  frequency times how many reach the content, and it is a useful third number precisely as long
  as it is presented as a derivation with both inputs visible. The moment it is stored as a
  standalone priority it becomes the composite this technique exists to prevent.
- **A build's session summary reports both distributions.** How severe the findings were and how
  often they occurred, side by side, plus the count of findings whose frequency is unmeasured.
  That last count is the health of the testing programme, not of the build.
- **Contradiction between axes is itself reportable.** When a finding is graded critical and has
  been seen once in forty sessions, the disagreement is worth a human look — either the severity
  is inflated or the trigger is unknown, and both are actionable in a way the composite is not.

## When not to use it

- **Not against an imposed taxonomy.** When a platform holder, publisher or certification process
  mandates a severity or priority scheme, adopt theirs and map yours into it. Two competing
  vocabularies on one finding list is worse than either alone.
- **Not as a substitute for sequencing.** The two axes decide what matters; a schedule also
  depends on dependencies, who is free, and what is about to be rewritten anyway. Keep severity
  and frequency as stable properties of the finding and let the plan be the thing that changes.
- **Not on a sample too small to have a rate.** With a handful of sessions, report the fraction
  literally and treat it as an observation rather than a measurement. A rate invented from four
  sessions is a number with no basis, and it will be quoted for a year.
