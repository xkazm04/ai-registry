---
layer: technique
type: technique
subject: conformance-checking
technique: checker-false-positive-discipline
status: forged
laws: [gate-sees-target, deletion-is-not-repair]
shared_with: []
use_when: [a repository owner disputes a conformance finding, tuning a detector that misfires, auditing a checker for false passes]
---

# Checker false-positive discipline

## The concern

An assessment judges somebody else's work and publishes the verdict. Its
authority rests entirely on being right, and it spends that authority every
time it is wrong. Two symmetric errors matter, and most teams guard only
one:

- **False fail** — a conformant repository marked non-conformant. Costs
  adoption immediately and loudly. One public instance outweighs a hundred
  correct findings.
- **False pass** — a non-conformant repository certified. Costs nothing
  today and everything the day someone relies on the certificate. Invisible
  by construction, which is why it must be hunted deliberately.

Enforcement gates have their own economics of blocking a build — that
belongs to the quality-gates subject. What is owned here is the precision
craft of a checker whose findings must be *defended to their subject*.

## The recurring mechanical causes

Every one of these has produced a retraction somewhere.

**Substring where token was meant.** Asking "does this text mention the
command" matches a longer name that merely contains it — a task whose name
embeds another task's alias passes a check about the second task. Match on
word boundaries, or better, on parsed structure: resolve the declaration
through the project's own indirection instead of grepping. The general
rule: *never pattern-match a language you have a parser for.*

**Existence mistaken for content.** A document generated from a template
exists, has the right name, and says nothing. Detect the template's own
placeholder markers and report the document as unfilled; a check that
counts it as present has issued a false pass under the standard's name.
The same rule generalizes: a configuration file present but empty, a test
directory with no tests, a section heading with no body.

**Environment mistaken for evidence.** Awarding a mark because a
configuration surface exists, without confirming it is populated or
reachable, scores an empty directory. This is the best-documented false-pass
family in published scorecard research: projects with no automation
workflows at all receiving full marks on a workflow-level check, because the
check never verified that the workflows existed.

**Machine-local truth mistaken for project truth**
([gate-sees-target](../../_laws.md#gate-sees-target)). Modification times
(rewritten by every checkout), absolute paths, installed tool versions,
locale, line endings, case-sensitivity of the filesystem. A check reading
any of these renders a verdict about the runner. Derive project facts from
project artifacts — history, manifests, committed content.

**A finding the owner has no way to act on.** The subtlest false fail is
technically true: the checker warns that an optional surface is absent, on
every fresh adoption, for a subsystem the standard's own scaffolding never
creates. It is a guaranteed yellow with no in-kit remedy, and its whole
effect is to teach adopters that some of the report is noise — which is a
precision failure even though every individual finding is accurate. The
rule that removes the class: **check what the contract declares, not what
the standard imagines.** Declare a pointer and it is enforced; leave it out
and the checker is silent about it. Optionality lives in the declaration,
never in a permanent warning.

**Missing tool mistaken for missing practice.** The scanner is not
installed, so the practice it detects is reported absent. This is an
unable-to-check outcome; treating it as a failure is the fastest way to be
correctly accused of judging environments rather than repositories.

## Decision rules

- **Measure before promoting.** A detector runs over the real population in
  advisory mode, and its misfire rate is measured against ground truth,
  before it may produce a failure. Published operational guidance converges
  on the same band from experience: roughly one-in-ten wrong is workable,
  one-in-five is the outer limit, and beyond that the detector is doing net
  harm.
- **When a live check misfires, narrow the detector; do not delete the
  check** ([deletion-is-not-repair](../../_laws.md#deletion-is-not-repair)).
  Deleting converts a visible imprecision into an invisible blind spot at
  the exact clause somebody cared enough to dispute. Demoting to advisory
  while the narrowing is written is legitimate; demoting and forgetting is
  the same as deleting.
- **The only exception**: if measurement shows the detector never matched
  the clause it claimed to check, it was not a check for that clause. Remove
  it and say so — pretending otherwise is the harm.
- **Every finding ships its evidence.** The path, the line, the matched
  token, the command and its exit status. A dispute you can settle by
  pointing at the evidence costs an email; a dispute over an unevidenced
  verdict costs the checker's reputation.
- **Provide an exemption path, and make exemptions expire.** Owners will
  have legitimate exceptions. An exemption declared in the repository, with
  a stated reason, reviewable in one place, and re-surfacing after a bounded
  period, converts arguments into records. Permanent silent suppressions
  recreate the false-pass problem with paperwork.
- **Hunt false passes on a schedule.** Take known-bad repositories and
  confirm the checker catches them; take each check and ask what the
  cheapest way to fake it is. Nothing else surfaces this class, because it
  generates no complaints.

## Procedure

1. For each new check, write down the cheapest false pass and the most
   plausible false fail. If you cannot name both, you do not understand the
   check.
2. Run it over the whole population you intend to judge. Sample the passes,
   not only the failures — passes are where false passes hide.
3. Record the measured misfire rate with the check. It is the argument for
   its severity.
4. On a dispute: reproduce, classify (true finding / narrowable detector /
   wrong clause), fix at that level, and add the disputed repository's shape
   to the fixture set ([fixture-repo-testing](fixture-repo-testing.md)) so
   the regression cannot recur.

## When not to use it

Nothing here is optional for a checker that publishes verdicts about others.
The one adjustment: for a purely internal checker whose only audience is the
team that wrote it, the exemption ceremony can be lighter — but the false-pass
hunt cannot, because an internal checker is trusted more, not less.
