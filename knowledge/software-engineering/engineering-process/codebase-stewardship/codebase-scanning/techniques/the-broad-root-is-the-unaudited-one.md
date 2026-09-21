---
layer: technique
type: technique
subject: codebase-scanning
technique: the-broad-root-is-the-unaudited-one
status: forged
laws: [count-carries-predicate, gate-sees-target, failure-not-empty-success]
shared_with: [dead-code]
applied: code
ab_verdict: better
use_when: [a scan's root set is declared by hand in a configuration file, an inclusion or entry pattern is being audited for rot, a finding count is published without the size of the root set that produced it, autodiscovery and a hand-written declaration both contribute roots, deciding whether to delete a suspicious inclusion pattern, a scanner's own configuration hints report a clean root set]
---

# The broad root is the unaudited one

[suppression-hygiene](../../dead-code/techniques/suppression-hygiene.md) settles
the rot on a scan's **exit** side, and settles it well: an exemption that matches
nothing fails the run, every entry names its reaper, and an entry whose reach grew
is caught by printing what it suppressed. All three axes are properties of an
artifact whose job is to discard a finding that was already produced.

The **entry** side has an artifact too, and nothing in this subject audits it. A
reachability scan, a conformance gate, a census — each is handed a declared root
set: an `entry` array, a `sources` list, an include-glob roster. That declaration
is ordinary configuration, written once, and it rots the same three ways a
suppression does. What it does when it rots is different, and the difference is
the whole technique.

> **A rotten inclusion pattern does not hide a finding. It changes the population
> the scan was ever performed over, so the question was never asked — and unlike a
> suppression, whose damage is a number the instrument already holds, the entry
> side's damage exists only as a counterfactual.**

## The three classes, ordered against their detectability

An inclusion pattern rots in three shapes, and they are not equally consequential
or equally visible. Measured on one repository's committed reachability
configuration — 11 declared root patterns over a tree of 5,235 in-scope source
files, classified by resolving every pattern against the tree and then removing
each rotten one individually and re-running:

| class | what it is | how many | what removing it did |
| --- | --- | --- | --- |
| duplicates another | the pattern is already a root by another declaration | 6 of 11 | nothing. Finding set byte-identical, 2,210 rows both arms |
| matches nothing | the glob resolves to zero files | 0 real, 1 planted | nothing. Byte-identical |
| nearly duplicates another | 550 files matched, **3** of them not matched by a sibling pattern | 1 of 11 | nothing. Byte-identical |
| trivially broad | 225 files matched, 93.8% of every source file under its directory | 1 of 11 | **+187 findings, +151 unused files** |

Eight of eleven declared roots were rotten. Seven of the eight were **inert** —
removing them changed not one reported row. The eighth moved the reported
population by 8.5%, and moved the unused-file count from 317 to 429 in the
repaired form, with no product code touched and no commit between the arms.

**The ordering is the finding.** The two classes a reader would audit first — the
pattern that matches nothing, the pattern that duplicates another — are the cheap
ones, and they are also the ones an instrument can report, because both are
decidable from the configuration and the file list alone. The class that actually
moves the number is decidable only against an intent nobody wrote down, and in the
measured case the scanner's own configuration-hint channel was **structurally
unable to emit it**: the broad-pattern hint is gated on the repository having more
than one workspace package, and this one has one. The run printed thirteen
configuration hints, named every inert pattern, and named the load-bearing one
never — in both arms, identically
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

So an audit of the root set that runs on the instrument's own hints certifies clean
exactly the class that changed the population.

## Two rot classes can cancel

The sharpest single observation from the same repository. The application's only
real root was declared by hand. Mistyping it by one character — so the pattern
matched zero files — produced a zero-match hint **and a byte-identical finding
set**, because the same root was also contributed by autodiscovery. The redundant
declaration is what made the broken declaration harmless.

Read that in both directions. It means a zero-match inclusion pattern cannot be
assumed to have narrowed anything, so the empty class is not a refusal the way
[rule-precision-discipline](./rule-precision-discipline.md)'s zero-match rule is a
refusal: a detection rule that matches nothing is broken or aimed at an extinct
defect, while a **root** that matches nothing may simply have been declared twice.
And it means the audit cannot proceed pattern by pattern — inertness is a property
of the pattern *and* of everything else that contributes to the same set.

It also predicts where the rot concentrates, and the prediction held across the
fleet. Where the root set has **one author**, there is nothing for a pattern to
duplicate: eight separately maintained conformance contracts in eight repositories
declare 43 inclusion patterns between them, and a resolution of all 43 found **zero
empty and zero duplicated** — every pattern contributed at least one file no other
pattern contributed. The rot appeared only in the one configuration where a
hand-written declaration and a plugin's autodiscovery both supplied roots. An
inclusion surface with a single author does not rot this way; an inclusion surface
with two authors rots at 73% of its patterns.

## Both error directions, which is what makes it not a suppression

A suppression can only ever lower a finding count. An inclusion declaration moves
it in either direction, because it defines the population rather than filtering the
output:

- **Widened** — a pattern broad enough to cover its own directory makes every file
  in it a root, so nothing in it can ever be unreachable and no detector
  specialised to it will ever report. The result is a clean bill over a population
  that was never examined, and it is
  [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) one
  stage before the reporting layer:
  [the-tree-is-not-the-population](./the-tree-is-not-the-population.md) asks for a
  detector whose eligible population fell to zero to be reported as uncovered, and
  this is the mirror image — a detector whose *root* population rose to cover
  everything, which reports clean and looks healthy.
- **Narrowed** — a pattern that was meant to name a root and does not removes that
  root, and everything reachable only from it is reported dead. This is the
  dangerous direction, because it manufactures findings rather than suppressing
  them, and the manufactured findings are indistinguishable from real ones in the
  report.

The second direction is measurable on the repair, and it must be, because the
repair itself narrows. Moving the broad pattern out of the root set surfaced 151
new unused-file findings; keeping the pattern's *test* files as roots — a test is
reached by a runner, not by an import — removed 39 of them as false positives
before anything was looked at. A systematic hand-verification of 11 of the
remaining 112 found 7 with no reference anywhere outside themselves and 4 invoked
by a path string from documentation or a generated index, which no import graph can
see. **64% precision on the sample, and the four misses are a recall class, not a
mistake in the repair.** Publish that figure with the repair; a root-set narrowing
reported without a precision sample is a number that will be read as work.

## The repair is a split, never a deletion

The instinct on finding a broad root pattern is to delete it. Do not: deleting it
removes those files from the population entirely, which reports the same clean
result by a different route. The measured arm makes this concrete — emptying the
whole eleven-pattern root array moved 7 of 2,210 rows and left the unused-file
count at exactly 317, because the files the broad pattern had covered left the
scan's universe along with their roothood.

The pattern has to be **split**: the roots the declaration actually intends stay
roots, and the rest enters the examined population. Those are two different fields
in every configuration that has this shape, and conflating them is the rot. The
test of a correct split is that the population grows while the root set shrinks —
if both shrink, the repair is a second false clean.

## There is no number to print, and that is the asymmetry

[suppression-hygiene](../../dead-code/techniques/suppression-hygiene.md)'s
corrective for an entry whose reach grew is one number: what each entry suppressed
on this run, printed where the run's output is read, and it is cheap because *the
instrument already has the number* — the finding was produced and then discarded.

On the inclusion surface that corrective does not exist. The finding was never
produced, so there is nothing to count and nothing to print. The only instrument is
a **counterfactual**: change the declaration and run again. That makes inclusion
rot strictly more expensive to audit than suppression rot, and it is why the audit
has to be scheduled rather than emitted — a suppression surface can be made to
confess continuously, and a root set cannot.

What *can* be printed is the root set's own size, and it is the minimum owed. One
of the fleet's conformance gates prints `58 files, 15 sources` beside its finding
count on every run; the reachability scan in the same fleet prints `317 unused
files` with no statement of the population, and printed `429 unused files` after
one pattern moved between two fields, with nothing in either line saying the
population had changed. A finding count that does not travel with the size of the
root set that produced it cannot be compared with itself across a configuration
edit ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)),
and a configuration edit is the one input that moves the count with no code change
behind it.

## Nothing else sees it

The negative control is worth stating because it bounds how much of this any other
gate can be relied on to catch. With the application's sole declared root
deliberately broken, the repository's own type-check exited clean and its linter
exited clean over 1,069 pre-existing warnings and zero errors. The root set is not
a compilation input, not a lint input and not a test input. It is an input to
exactly one instrument, and that instrument's self-audit channel is the thing this
technique says not to trust.

## What this is not

It is not
[the-narrowest-view-owns-the-number](./the-narrowest-view-owns-the-number.md). That
technique governs a coverage **figure** when the same evidence is restricted more
than once, and its rule is to compute the figure at the last restriction; every
earlier figure there is *true about a population nobody reasoned over*, and the
repair is arithmetic — admit another multiplicative term. Here there is one
restriction and the figure is arithmetically fine. What has rotted is the
**declaration of the root set**, so the population itself is wrong and no figure
about it is true; the repair is to the configuration, in a field the instrument
cannot tell you to change.

It is not
[the-tree-is-not-the-population](./the-tree-is-not-the-population.md), which owns
the exclusion side: filters the scanner inherited from tools answering a different
question, whose repair is disclosure — publish the excluded count broken down by
the filter that removed each file. An inclusion declaration has no such complement
to publish. There is no "excluded by root pattern" list, because the files were
never candidates; they were roots, and a root's finding is not withheld, it is
undefined.

And it is not
[causes-beside-the-finding-count](./causes-beside-the-finding-count.md), which
qualifies a count by how many independent causes the population contains. That is a
second axis on a population that was correctly gathered. This is the prior
question of whether the population was the intended one, and the two compose: a
count can be right about its emissions, right about its causes, and still be about
a set the declaration got wrong.

## Decision rules

- Treat the root-set declaration as an audited artifact with the same standing as
  the suppression roster; it is configuration, it rots, and nothing else in the
  toolchain reads it.
- Classify every inclusion pattern by resolving it against the tree: matches
  nothing, duplicated by another, nearly duplicated, trivially broad, or
  contributing at least one file nothing else contributes.
- Rank the audit by consequence, not by detectability — the trivially broad pattern
  is the one that moves the number and the one no hint channel reports.
- Never treat a scanner's own configuration hints as an audit of its root set;
  establish the classification from a second implementation, and expect the two to
  disagree in both directions.
- Judge inertness against the whole contributed set, not pattern by pattern: a
  zero-match root may have been declared twice, and a duplicate may be the only
  thing keeping a typo harmless.
- Expect the rot where the root set has more than one author — a hand-written
  declaration plus autodiscovery — and expect a single-author declaration to be
  clean of the empty and duplicate classes.
- Repair a broad pattern by splitting it between the root field and the population
  field, never by deleting it; a repair in which both the root set and the
  population shrink is a new false clean.
- Publish a precision sample with any root-set narrowing, because narrowing
  manufactures findings, and hand-verify before the count is quoted.
- Print the root set's size beside every finding count, so two runs across a
  configuration edit are comparable at all.
