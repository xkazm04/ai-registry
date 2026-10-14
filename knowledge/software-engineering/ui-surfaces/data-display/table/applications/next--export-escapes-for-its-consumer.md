---
layer: application
type: application
subject: table
technique: export-escapes-for-its-consumer
stack: next
status: forged
verified_on: 2026-10-14
verified_against: next@16
applied: code
ab_verdict: better
proof: ab-paired
---

# Two public specimens that guard, one of which learned it from drift, and a third host that was fixed

Read in two public trees on 2026-10-14: `ascent` at `e9480079` (Node 24.x per
its `package.json` engines) and `kp` at `b262d8dee`. A third host, a private
contact-manager example app in the same fleet, is described without paths below.

## ascent: one shared encoder, and the comment that records why

`ascent/src/lib/export/csv.ts:3 "the org/repositories copy was MISSING the formula-injection guard"`
is the technique's drift failure in the tree's own words: each export route had
hand-rolled its own cell encoder, the copies diverged, and one shipped without the
guard. The fix is one canonical encoder imported by every route (nine references
in `src/` at this commit, imports included).

The exemption is by shape and the pattern is anchored at both ends:
`ascent/src/lib/export/csv.ts:30 "const isNumeric = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s);"`.
The trigger set includes tab, both line-break characters and the full-width
symbols, and a guarded cell is also quoted. It exempts pure numbers only, so a
spaced phone number written there would be prefixed, which is the case the third
host below measured.

## kp: exemption by type, a narrower trigger set

`kp/app/_lib/export-utils.ts:17 "const FORMULA_TRIGGER = /^[=+\-@\t\r]/;"` and
`kp/app/_lib/export-utils.ts:31 "FORMULA_TRIGGER.test(s)) s ="` guard every string
cell and exempt a cell that is a JavaScript number by its type rather than its text,
which is the cleaner of the two exemptions: no pattern to get wrong. The trigger
set lacks the line feed and the full-width forms the published guidance lists, so a
cell beginning with a line feed or a full-width equals sign passes unguarded.

## The third host: the technique applied, A/B

A private contact-manager example in the fleet exported its contacts with the
parser layer only. Measurable first: **the count of exported cells that reach a
spreadsheet as a formula with a function or reference available**, with a floor:
**the count of ordinary cells whose bytes change**. Three arms over 800 seeded
contacts plus six hostile ones (a hyperlink formula, a `@SUM`, `-2+3`, a plus
followed by a command, a leading tab, a full-width equals):

| arm | hostile cells reaching a formula position (of 6) | seeded cells altered (of 13,617) |
| --- | --- | --- |
| A: parser layer only | 6 | 0 |
| B: guard, exempting pure numbers | 0 | **25** |
| C: guard, exempting pure numbers and the phone shape | 0 | 0 |

The 25 cells arm B altered were all phones written in the spaced form
(`+1 870 555 8230`), the format defect the product exists to clean; B would have
shipped an apostrophe into the column users export to fix. Arm C shipped:
verdict **better**, `ab-paired`, 31 tests passing including the new hostile and
ordinary-row cases. What C leaves: 25 phone-shaped cells still begin with a plus,
which a spreadsheet may read as an arithmetic formula with no function or
reference in it. Whether it then displays an error was not checked, because no
spreadsheet application was run for this proof, so the claim is limited to "no
call-out is possible", not "opens cleanly".

The seam was chosen to falsify: arm B was the obvious port of the public
specimen, and it lost on the host's own data.

## What this realization cannot do

None of the three tells the file's recipient that the file was guarded, and none
marks the guarded cells. Opening and re-saving can still turn a guarded cell back
into a live one, which is the published caveat.
