---
layer: application
type: application
subject: index-free-random-access
technique: reversible-encoding-buys-tail-recovery
stack: node
verified_on: 2026-10-14
verified_against: node@22
applied: code
ab_verdict: better
---

# A batch harvester that appended after a torn record

A civic-data tool harvests monthly bulk dumps, keeps the records touching a
known set of company identifiers, and appends them to a line-delimited JSON
file. A separate state file records which months are done. A downstream step
parses the harvest file line by line.

## What A was

The two artifacts record the same fact and can disagree. The append happens
first and the state write second, so a kill between them re-harvests a month
(harmless, the downstream step dedupes). A kill *during* the append is worse:
the file ends in an unterminated fragment, the resumed run appends after it,
and the fragment and the first new record become one line. The downstream
parse throws on a line that belongs to neither run.

## What B was

On start the harvester truncates the file to its last newline, locating it by
reading backwards from the end in blocks, so the cost is the fragment and not
the file. This is the technique's rule 5 (discard an unparseable final
record) with the technique's reverse read; the delimiter variant rather than
the doubled-escape one, because this format escapes a newline inside a string,
so a raw line feed is always a boundary and no escape has to be disambiguated.

## The seam, and what it refuted

Chosen to falsify "the output can replace the state file". It cannot here:
a month with zero matching records appends nothing, so the output carries no
identity for a completed empty month. The technique's precondition (the
appended record contains the identity of the unit of work) fails for units that
may yield no rows, and the state file stays. Only the tail-repair half applies.
A second finding: the append is one call per month with no end marker, so a
tail that parses cleanly is not proof the month finished; the resume keys on
the state file, never on the tail's content.

## Measurement

Target: after a simulated kill mid-append, does the resumed output parse?
A: no (fused line, parse throws). B: yes, only the fragment is lost (tests:
fragment longer than one read block, a file that is only a fragment, multibyte
content, clean/empty/absent file untouched). Floor: all 89 tests in the
affected folder, typecheck, lint, and the repository's pre-push gate green.
Not measured: a real 26 GB harvest kill.
