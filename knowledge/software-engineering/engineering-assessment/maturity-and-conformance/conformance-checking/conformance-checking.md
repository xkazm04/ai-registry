---
layer: golden-path
type: golden-path
subject: conformance-checking
status: forged
use_when: [building a checker for a published repository standard, deciding what a conformance percentage may claim, tuning a checker that false-failed a correct repository, writing proof back into a declared contract]
techniques:
  - declared-then-proven
  - finding-severity-ladder
  - pass-ratio-comparability
  - claim-write-back
  - checker-false-positive-discipline
  - fixture-repo-testing
---

# Conformance checking

A published standard for repositories is a promise that something can be
checked. The checker is where that promise is either kept or quietly
converted into decoration. **Conformance checking is the engineering of an
executable verdict about a repository against a declared contract** — the
program that walks a project, decides what it can prove, decides what it
merely observed, and emits findings that a human or a policy will act on.
Its output is not a build result; it is an *assessment*, published to
somebody who did not ask for it and will dispute it. That single difference
governs the whole subject.

The neighbours are close, so draw them first. **Enforcement** — which rung
of a pipeline a check runs at, how severities are wired to exit codes, how
a metric ratchets, and the trust economics of a gate that blocks work — is
the [quality-gates](../../../engineering-process/standards-and-gates/quality-gates/quality-gates.md) subject, and it is
assumed here in full; a conformance checker is often *deployed* as a gate,
but its craft problem is different, because a gate's audience is the author
who just broke it and an assessment's audience is a repository owner being
graded. The **contract itself** — what a manifest declares, its schema, its
versioning, how a project states its own commands and claims — belongs to
the repository-manifest-standard subject: declared there, proven here. The
**weights and criteria** behind any composite number belong to
[scoring-rubrics](../../../operations/service-operations/scoring-rubrics/scoring-rubrics.md); this subject owns
only what a *checker's* number is allowed to mean, which turns out to be
much less than its readers assume. And general test design belongs to
[test-harness](../../../engineering-process/build-and-release/test-harness/test-harness.md) — the one testing technique
owned here is the fixture repository, because a checker whose subject is a
whole project can only be tested by being pointed at whole projects.

## Declaration is a claim; proof is an execution

The naive checker reads a file and reports what it found there. That is
not conformance checking, it is transcription. A contract that says
`tests: verified` has told you what the author believes, on the day they
typed it, about a command that may no longer exist. **A checker earns its
name only where it closes the loop between the declaration and the world**
([gate-sees-target](../../../_laws.md#gate-sees-target)): the declared command is
executed, the declared path is resolved, the declared document is opened and
inspected for content rather than for existence.

Three proof strengths recur, and every check should know which one it is
offering: *presence* (the thing the contract names exists), *shape* (it
parses, matches the expected structure, is wired where the contract says it
is wired), and *execution* (it was run and it succeeded). Presence is
cheap and weak; execution is expensive, sometimes unsafe, and the only
proof that survives a year of drift. A checker that offers only presence
should say so, because a reader who sees a green mark will assume execution
happened. The discipline for structuring this ladder — and for refusing to
treat a self-declared `verified` flag as evidence of anything — is
[declared-then-proven](./techniques/declared-then-proven.md).

## What a finding is allowed to do

Findings are not uniform, and pretending they are is how assessments become
either ignorable or intolerable. A conformance run produces at least four
kinds of outcome and they must be spelled differently: a **hard failure**
that stops everything, an ordinary **failure** against the contract, a
**warning** that describes a real gap the owner may reasonably defer, and
**unable to check** — the instrument was absent, the command could not run,
the environment forbade it. Merging that last state into either pass or
fail is the single most damaging move in the subject
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)): folded
into pass, the checker manufactures reassurance from its own blindness;
folded into fail, it punishes repositories for the checker's portability
bugs and burns the trust that lets it be adopted at all.

Hard failure is reserved, and the reservation has a principled test: **a
finding is a hard failure when the harm it names is already irreversible by
the time the checker sees it.** A committed credential is the archetype —
rotating it is now mandatory, and no amount of "we will fix it next sprint"
un-publishes it from the history. Almost nothing else qualifies. A missing
document, an unwired command, a stale claim: all real, all recoverable, all
ordinary failures. The ladder, its escalation rules, and the rule that
severity is assigned by the *consequence* rather than by how annoyed the
standard's author feels, are
[finding-severity-ladder](./techniques/finding-severity-ladder.md).

## The percentage is the most dangerous thing you ship

Every conformance checker eventually grows a headline number, because
humans rank things and a number ranks. Understand precisely what that
number is: **a weighted pass ratio over the findings this run happened to
emit.** Both halves of that sentence are load-bearing. The weights are
policy. The denominator is not the standard — it is the subset of checks
that were *applicable and runnable* in this environment, on this project
shape, with these tools installed. A repository that skips a whole family
of checks (no deployment surface, no data layer) is scored over a smaller,
easier denominator than one that runs them all. Two such percentages are
not comparable, and a leaderboard built from them ranks project shape as
much as project quality.

The honest publication rule follows directly: **the failures and warnings
are the headline; the percentage is a display heuristic**, comparable only
between runs of the same shape — the same project, the same standard
version, the same check applicability — where it functions as a trend line
rather than a grade. Any number that travels carries its predicate
([count-carries-predicate](../../../_laws.md#count-carries-predicate)), and for a
conformance score the predicate includes the version of the standard, the
set of checks that ran, and the set that did not. The published methodology
of open scorecard efforts converges on the same caution from the other
direction: an automated score is optimizable, so a public, uniform rubric
reliably produces projects that improve the score without improving the
thing. Design the number expecting to be gamed; the defence is not
secrecy but a breakdown that makes the gaming visible.
[pass-ratio-comparability](./techniques/pass-ratio-comparability.md) carries
the arithmetic, the denominator rules, and what to refuse to render.

## Proving a claim must retire the claim it disproves

An assessment that only reads is half a system. When a checker actually
executes a declared command and the command succeeds, that success is
evidence, and evidence that is not recorded will be re-derived by hand or
asserted from memory. So the mature loop **writes proof back into the
contract**: this claim was proven, at this time, by this run, at this
version of the standard. The write-back is what keeps a `verified: true`
from outliving the command it described — because the same mechanism that
stamps a proof must be able to *clear* one, and a claim whose proof has
gone stale or whose command now fails is demoted rather than left standing.
A stored derived value names how it is recomputed
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation));
here the recomputation is the checker itself, and the stamp names the run
that produced it.

Two consequences that teams discover the hard way. First, **freshness is
measured against history, not against the filesystem** — a fresh checkout
rewrites every modification time, so an mtime-based staleness rule reports
every document as freshly updated locally and every document as suspicious
on a remote runner, depending on which way the clock falls. Last-change
information belongs to the version-control history. Second, **write-back is
a privileged operation**: a checker that shell-executes commands declared by
the repository it is judging is, by construction, running untrusted code,
and must never be handed a credential that lets it push. The privilege
model, the stamp contents, and the demotion rules are
[claim-write-back](./techniques/claim-write-back.md).

## A false pass and a false fail are both fatal, in different ways

Enforcement gates die of false positives; the author who knows they are
right learns to bypass, and the habit spreads. That economics is real and
it is owned next door. An *assessment* faces a second failure mode of equal
weight: the **false pass**, where the checker's own crudeness certifies a
practice that is not there. Both are precision failures and both are the
checker's fault, never the judged repository's.

The recurring mechanical causes are boringly consistent and worth learning
as a list, because each has cost somebody a public retraction:

- **Substring matching where token matching was meant.** A check that asks
  "does any script mention this command" will pass on a script whose *name*
  contains the alias as a substring. Match on word boundaries, on parsed
  structure where structure exists, never on naive containment.
- **Existence mistaken for content.** A document created from a template
  and never filled in exists, has the right name, and is worthless. A
  document still carrying its placeholder markers is *unfilled*, and
  reporting it as present is a false pass with the standard's own name on
  it.
- **A true finding the owner cannot act on.** A permanent warning about an
  optional surface the standard's own scaffolding never creates fires on
  every fresh adoption and can be fixed by nobody. It is accurate and it is
  still a precision failure, because its only effect is to teach adopters
  that part of the report is noise. Check what the contract *declares*, not
  what the standard imagines: declared pointers are enforced, undeclared
  ones are silent.
- **Machine-local truth mistaken for project truth.** Modification times,
  absolute paths, installed tool versions, locale. Every one of these
  differs between the author's laptop and a remote runner, and a check that
  reads them produces a verdict about the runner.

The corresponding discipline — how to tune without deleting
([deletion-is-not-repair](../../../_laws.md#deletion-is-not-repair)), how to
decide whether a misfire narrows a detector or demotes it to advisory, and
what a checker owes an owner who disputes a finding — is
[checker-false-positive-discipline](./techniques/checker-false-positive-discipline.md).

## The only honest test of a checker is a repository

Unit tests over a checker's helpers verify the helpers. They cannot tell
you whether the checker, pointed at a real project tree, emits the right
findings with the right severities and exits with the right code — which is
the entire product. The subject's testing technique is therefore the
**fixture repository**: a small, committed, deliberately-shaped project that
the checker is executed against end to end. Three shapes carry most of the
value — a *conformant* fixture that must come back clean, a *non-conformant*
fixture that must produce exactly the expected finding set, and a
*fresh-install* fixture representing a project that has just adopted the
standard and has not done the work yet, which must produce a legible,
non-punishing report rather than a wall of failures. Assert on the exit
code and on the finding identifiers, not on rendered prose. And one more
test that costs nothing and catches a whole class of embarrassment: verify
that every path the standard's own contract points at is actually shipped —
the standard must pass its own checker.
[fixture-repo-testing](./techniques/fixture-repo-testing.md) carries the
construction rules and the maintenance trap (fixtures rot in the opposite
direction from the code that reads them).

## Where the subject fails in practice

Three failure shapes, in descending order of frequency:

1. **The checker that only reads.** Every finding is presence-level, the
   report is a table of file names, and the standard is satisfied by a
   handful of empty files. Detectable by asking, of each green mark, *what was
   executed to earn this*.
2. **The number that escaped its predicate.** The percentage was designed as
   an internal trend line, someone put it in a report, and now two teams'
   scores are being compared across different project shapes and two
   versions of the standard. Once a number is comparable-looking it will be
   compared; the defence is built at emission time, not at reading time.
3. **The checker nobody trusts.** One high-profile false failure — a
   correct repository publicly marked non-conformant — costs more adoption
   than a year of true findings buys. Precision is the checker's licence to
   operate, and it is spent, not earned back.
