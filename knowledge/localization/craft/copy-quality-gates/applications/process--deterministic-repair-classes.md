---
layer: application
type: application
subject: copy-quality-gates
technique: deterministic-repair-classes
stack: process
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# A control character that stood in for a colon, and a repair that could not be a script

One product's French message catalog, read on 2026-10-14. A regex replacement run
over the file had written the control character U+0001 — a literal backreference
that never expanded — into 32 strings, at the exact position a colon or semicolon
belonged. Every check the catalog had passed it: the placeholder, key-set and
length checks do not look at control characters, and a control character is
invisible in a diff and in a rendered label.

## Why it was not a deterministic repair class

The technique's first instinct fits: stripping control characters is on its list of
shipped classes. It does not fit here, and the case is the cleanest available
boundary for it. Stripping the character is one output for one input, but the output
is wrong. The mark that belonged there is gone, so stripping leaves 33 strings with
a missing colon or an orphaned space (measured on the stripped arm). The correct
output is not derivable from the unit alone; it is derivable from the **source
locale**, which holds the same string with its mark intact.

So the class split in two:

- **Detection** is deterministic and cheap: any C0 control character other than the
  whitespace the format allows is a finding. The catalog check now reports it.
- **Repair** is a restore from the source locale at the character's position, and
  it ran once, by hand, as a reviewed change: 31 colons, and one semicolon with the
  language's narrow no-break space already in place before it. It was not wired into
  the pipeline as an autocorrect, because the reference string is a second input the
  rule cannot assume exists for every unit.

## The paired read

Same catalog, three configurations, problem count from the catalog check:

| arm | gate | catalog | problems |
|---|---|---|---|
| A | before | corrupted | 0 |
| A' | after | corrupted | 32 |
| B | after | repaired | 0 |

Target: corrupted strings reaching the catalog undetected, 32 to 0 going forward.
Floor: every other check's count unchanged and the repaired catalog clean, held.
The gate's own test fixture carries a string with the character and one without.
Tested at n=1 catalog, 32 affected strings; whether the corruption recurs was not
measured. One string had two defects (the character, then a second wrong mark) and
reported once.

## What this adds to the technique

A control character is the shape of a repair class only when what replaces it is
fixed. Where the damaged character stood for content the unit no longer holds, the
class is **detect-always, repair-from-reference**: the gate reports it unconditionally,
and the restore reads the source-language unit, never a guess.
