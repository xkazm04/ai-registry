---
layer: technique
type: technique
subject: machine-paced-delivery
technique: agent-readable-build-outcomes
status: forged
stage: solo
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [an agent is diagnosing build failures, designing a checker's output, a gate reports a wall of text]
---

# Agent-readable build outcomes

A verification run produces a verdict. Design the verdict for a consumer that does not have
the context, cannot usefully scroll, and pays per unit of what it reads — then discover that
this consumer's requirements are the same ones a tired human had all along.

This is an addition in front of the log, never a replacement for it. The log stays; what is
missing in most systems is the layer above it.

## The output contract

Every check emits, before any detail:

1. **A verdict**: passed, failed, or did-not-run. Three values, not two.
2. **A count with its predicate**, per
   [count-carries-predicate](../../../../_laws.md#count-carries-predicate): how many things
   were examined and how many failed. "3 failures" is not a result; "3 failures across 412
   files examined" is, and the second number is what reveals a walk that examined nothing.
3. **The first real failure**, fully located: what failed, where — a file and a position — and
   why, in one place, without needing anything above or below it.
4. **The rest**, bounded.

The order matters as much as the contents. A consumer that must read to the end to learn the
verdict has to read everything; a consumer that learns the verdict first can stop.

## Extractable, which means machine-parseable without heroics

"The first real failure" has to be findable by something that did not write the checker.

- **One line, one failure**, with a stable prefix. A finding split across five lines with
  indentation carrying meaning is a parsing problem for every consumer forever.
- **Location as file and position, in a conventional form.** Whatever the surrounding
  ecosystem already uses; the point is that editors and tools already know how to jump to it.
- **The reason in the same line as the location.** Splitting them means correlating them, and
  correlation across lines is where every log parser breaks.
- **Emit a structured form too, when it is cheap.** A machine-readable summary written beside
  the human-readable output costs a few lines in the checker and removes parsing from every
  consumer. Where a checker cannot produce one, the line format above is the fallback contract.

The word *real* is load-bearing. The first line containing the word "error" is frequently a
summary, a retry notice, or a downstream consequence. If the checker knows which failure is
causal — and it usually does — it says so explicitly rather than leaving the consumer to
guess from ordering.

## Bounded, with the bound stated

Unbounded output has an unbounded cost, and at machine pace that cost is paid on every failed
run.

- **Cap the number of findings reported in full**, then state the count of what was elided:
  "showing 10 of 247". Never silently truncate — an elision that does not announce itself is
  read as completeness, and the consumer concludes the problem is smaller than it is.
- **Cap log tails**, with an explicit truncation marker and a pointer to the full log. The
  triage surface is not the archive.
- **Put the cap where the consumer can see it.** A consumer that knows it received 10 of 247
  can ask for more; one that does not, cannot.

## Did-not-run is not passed

Per [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success), the most
expensive output a checker produces is a clean exit from a run that examined nothing: a glob
that matched no files, a tool that was not installed, a walk over a directory that had moved.
Every one exits zero with no findings, and every one is indistinguishable from success.

The countermeasure is to **assert the instrument before reporting the result**: state what was
examined, and treat zero as a failure of the check rather than a property of the tree, unless
zero was explicitly expected. Reserve a distinct exit status for "the check could not run" so
the distinction survives into whatever consumes the exit code — a convention costing nothing
and preventing the whole class.

## Severity is a property of the finding, not of the reader

A checker that emits everything at one severity forces the consumer to classify, and a
consumer without context classifies badly. Assign severity where the knowledge is: the checker
knows whether a finding blocks or informs. Two levels are usually enough — *this fails the
gate* and *this is reported* — and the second must be visibly not the first, or it will be
treated as the first and then ignored along with it.

## Do not over-structure

The failure at the other end is real: a checker whose output is a nested document requiring a
schema to read, with the human-readable form removed. That trades one unusable output for
another. The test is simple — a person should be able to read the first ten lines and know
what to do, and a program should be able to read the same ten lines and extract the same
thing. If either fails, the format is wrong.

## Decision rules

- Verdict first, then counts with predicates, then the first real failure fully located, then
  the bounded rest.
- One line per finding, stable prefix, location and reason together, conventional position
  format.
- Emit a structured summary beside the human output where it is cheap.
- Name the causal failure explicitly when the checker knows it.
- Cap output and state the elision; never truncate silently.
- Did-not-run is a third verdict with its own exit status; zero examined is a failure unless
  expected.
- The checker assigns severity; two levels, visibly distinct.
- Ten lines must serve a person and a program equally, or the format is wrong.
