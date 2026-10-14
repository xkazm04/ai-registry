---
layer: application
type: application
subject: data-video-virality
technique: path-over-conclusion
stack: process
status: draft
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Path over conclusion as a rationale gate on the case-idea validator

The same data-video studio (`StatReel`) asks every proposed case for a
`why_lasts` field, the written answer to "why does 60-90 seconds of this
stay interesting all the way through". Two validators carry the rule, one
in the server and a mirror in the board seat's self-check, and both
required only that the field be non-empty. The beats gate added the day
before (see `process--accelerator-events.md`) checks the dated turns; the
rationale that is supposed to walk through them was unchecked, so a case
whose pitch was its final frame could pass on "a fascinating topic that
keeps changing".

## What A and B were

- **A, as found:** any non-blank `why_lasts` passes.
- **B:** the technique's mechanical form. The rationale must be at least
  40 characters, contain two distinct years, and contain two named
  entities (capitalised words after the first word). Failure says what a
  passing rationale looks like ("X leads until 2007, Y passes it in 2011").

Constructed rationales through the real validator, otherwise valid case:

| Rationale | A | B |
|---|---|---|
| "A fascinating topic that keeps changing all the way through" | accepted | rejected: no dates, no entities |
| "Fangio leads until 1957, then Clark and Prost trade the lead" | accepted | rejected: one date |
| "Seventy-five seasons, six handovers, one collapse in 1987 and a comeback in 2001" | accepted | rejected: no named entity |
| "Fangio leads until 1957, Clark passes him in 1968, Prost collapses in 1987" | accepted | accepted |

Target: conclusion-only or filler rationales accepted, A 3 of 3, B 0 of 3;
the well-formed one accepted in both. Floor: the full unit suite (1622
tests), the board skill's own tests and the biome ratchet green, with no
existing test expectation changed.

## What the seam showed beyond the technique

Seven test fixtures across the server, the studio e2e and the board tests
carried placeholder rationales ("w", "probe", "75 seasons, six handovers")
and had to be rewritten, which is itself the before-state: nothing in the
tree had ever exercised a rationale as content. The brief's own example
line, "Why 60-90 s of this stays interesting all the way through", also
failed the new rule and was rewritten as a worked example, since the
generating seats copy the example's shape.

## What is not measured

The rule was written from the technique's text and not fitted to the
studio's approved cases: the real case table is not in a fresh clone, so
the false-rejection rate on rationales the owner accepted is unknown. The
entity test is a capitalisation heuristic and will miss lower-case or
non-Latin names. No live generation run was made to see whether seats
satisfy the rule on the first draft.

Return: count rejections of seat-generated cases in the next board loop
and read the rejected rationales, or replay the approved case table
through `rationaleProblems`.
