---
layer: technique
type: technique
subject: llm-era-work-sample-design
technique: probe-discrimination-audit-before-shipping
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, a-verdict-is-bound-to-what-it-judged, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [before a work sample reaches a first candidate, a whole cohort scored the same, deciding whether to retire or repair an exercise]
---

# Probe discrimination audit before shipping

A work sample is a measuring instrument, and an instrument that returns the same
reading for every input is broken, not lenient. This technique is the gate: every
planted probe is audited against explicit load-bearing criteria before the
exercise reaches a first candidate, and re-audited against cohort behaviour
afterwards.

The audit exists because the failure it catches is invisible from the inside. A
non-discriminating exercise still produces scores, fills a scorecard, and ends
in a decision. Nobody notices the decision was made on noise until a hire fails,
by which point the exercise has consumed candidate hours for a year.

## The pre-ship criteria

Each probe is examined for three properties, and a probe missing any one of them
is not load-bearing:

- **At least two distinct defensible options.** Not two phrasings of one
  approach, and not one answer plus a strawman. Each option needs a case a
  respected practitioner could make and a cost they would accept.
- **A concrete seam.** A specific place in the supplied material where the
  decision has to be taken. A probe with no seam is a theme; candidates pass
  through the exercise without ever meeting it.
- **A stated good-versus-naive criterion.** Written down, in advance, in the
  internal notes: what separates engaging with the trade-off from taking the
  first path. Unwritten, it will be reconstructed differently by each
  interviewer, and comparability across candidates is gone.

A probe passing all three is **load-bearing**; a probe missing any is not, and
its issues are named specifically ("no forced choice", "no seam", "no
good-versus-naive criterion") rather than scored. The case-level verdict rolls
those up and is blunt on purpose:

- **strong** — at least two load-bearing probes, and they are the majority;
- **weak** — some load-bearing, but a minority;
- **none** — nothing in the case can discriminate.

Graded scales invite a three-out-of-five that nobody acts on. Three states force
a decision: ship, repair, or refuse.

## The approval gate

A **none** verdict blocks the exercise from reaching a candidate. This is a
refusal, not a warning: an exercise where nothing is load-bearing cannot
separate candidates, so every decision downstream of it is decided by something
other than the assessment — usually the first impression it was supposed to
check. A **weak** verdict does not block, but it is the case that most deserves
one more design pass before it consumes a cohort's hours, and shipping it is a
choice someone should make knowingly rather than by default.

**The gate lives in one place and every approval path calls it.** The recurring
bug in assessment tooling is a doctrine enforced on the main path and forgotten
on the parallel one — the bulk approval, the manual entry, the import — so a
case that could never have passed the review reaches candidates through a side
door. One shared guard, one shared refusal message, all paths.

Where an override exists — a role that must be filled this week, an exercise
already scheduled — it is **recorded with a name against it**. A case shipped
over a failing audit is a known-blind instrument, and the record has to say who
decided to use it anyway. This is what makes the override survivable: the next
person reading a scorecard from that cohort can see that the instrument was
known weak before it ran, and weight it accordingly. An override with no name
is indistinguishable from an audit that passed.

## After shipping: the cohort read

The pre-ship audit checks design. Only candidates check discrimination.

- **A probe the entire field walks past is usually a miscalibrated case, not
  five weak candidates in a row.** This is the inversion that matters. The
  instinct on seeing a column of failures is to conclude the pool is weak; the
  more likely explanation is that the seam is unreachable, the ambiguity is
  invisible in the brief's phrasing, or the time budget expires before anyone
  arrives there. Investigate the probe before you conclude anything about the
  people.
- **A probe everyone clears identically has zero discriminating power.** It is
  costing candidate time and contributing nothing to the decision. Delete it or
  sharpen the fork.
- **An unreached probe is not measured, not failed.** It renders as its own
  state on the scorecard
  ([absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence));
  coercing it to zero converts a design defect into a series of adverse outcomes
  for people who never saw it.
- **Rates are computed over the evaluated subset, never the roster.** A
  submission nobody has assessed against a probe contributes nothing to that
  probe's miss rate — it is not a miss. Dividing by everyone invited turns
  pending work into evidence of a design defect and quietly understates every
  probe's strength.
- **Every cohort claim carries its sample.** "This probe does not discriminate"
  after three candidates is not a finding
  ([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis));
  it is an impression. State the cohort size beside the rate, and refuse to
  render the rate at all below the size where a proportion is stable. Small
  cohorts justify *investigating* a probe; they do not justify retiring one.
- **Watch the ceiling, not just the floor.** Score compression at the top —
  everyone strong on everything — is the characteristic signature of an
  artifact-graded exercise that has stopped measuring anything.

## Two depths of audit

The criteria above are the **structural** audit: cheap, deterministic, no
judgment call, catching the common failure — a decision space that is empty or
has one real option. Run it on every case; it costs minutes.

The **behavioural** audit is deeper: put a deliberately strong response and a
deliberately naive one through the same scoring path and check the probe
separates them. A probe can satisfy every structural criterion and still score
both identically. Run it for exercises facing a large cohort, and on any probe
the cohort read later disputes. What is never acceptable is asserting probe
quality from the confidence of the case description — a fluent design document
is evidence about the writing, not about the instrument.

## Versioning, and what a verdict binds to

Repairing a probe creates a new instrument. Candidates assessed under the old
version were measured by something else, and their verdicts do not transfer to
the new one — a verdict binds to exactly what it judged
([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
Two rules follow:

- **Version the exercise and stamp the version on every scorecard.** Comparing
  candidates across versions is a comparison the record cannot support; say so
  rather than silently ranking them together.
- **Do not re-score old submissions against a new criterion.** Re-derived
  scores under a revised rubric are marked superseded, not quietly re-meant. If
  a decision genuinely needs re-making, it is re-made by a person who knows the
  instrument changed.

## Decision rules

- **When a probe has one defensible option, delete it or convert it into a
  stated task** with its own explicit weight. Do not leave it in the probe list
  pretending to measure judgment.
- **When the design was produced with automated help, audit it more, not less.**
  Generated cases are fluent and confidently structured, which makes weak probes
  read as strong ones. Fluency of a case description is not evidence about the
  case.
- **When repairing, change one probe at a time.** Changing everything at once
  means the next cohort cannot tell you which repair worked.
- **When an exercise cannot be made to discriminate after two repairs, retire
  it.** Some tasks genuinely have no interesting fork in them. Spending a third
  cycle costs more candidate hours than starting over.

## When not to use it

There is no case for skipping the pre-ship audit — it is a design review, and it
costs under an hour. What varies is the cohort read: below a handful of
candidates there is nothing statistical to say, and the honest posture is to
keep watching rather than to act. The audit is also not a substitute for
validating the instrument against outcomes — whether the exercise predicts
performance on the job at all is the neighbouring subject on assessment
instrument validation, and a probe that discriminates cleanly between candidates
can still discriminate on something irrelevant to the role.
