---
layer: technique
type: technique
subject: content-research-grounding
technique: unknowns-as-constraints
status: forged
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
use_when: [research could not settle a question a script may touch, verifying a render respects declared evidence limits, sources disagree on a figure]
---

# Unknowns as constraints

An unknown is not a confession filed at the bottom of the research — it is a
**binding rule about what a render may not say**, written at research time
and enforced against every render mechanically. The reframe is the whole
technique: "we don't know whether the correlation is causal" is a note nobody
reads; "the script says *moves with*, never *because of*" is a constraint a
gate can score a script against, line by line.

## Writing the constraint

Every unknown carries an **impact**: the specific thing the script may not
assert. The recurring translations:

- Sources disagree on a figure → *the script uses a ratio, not a number.*
- The only source is a vendor selling the conclusion → *use the direction,
  not the number — or cut it.*
- Correlation reported as causation → *the script says "moves with", not
  "because of".*
- Two datasets appear to contradict → *present as competing readings; never
  pick one silently.* (And record the contradiction as a sideways edge
  between the facts, not only here — the disagreement may be the story.)

An unknown may also carry a **scope**: which facts it binds. A constraint
about one figure should not hedge the whole script; a constraint with no
scope binds every render globally.

The dual of the may-not-say list is the **must-say** list — obligations the
research imposes (a named party's response or non-reply, a mandatory
qualifier). An unsatisfied obligation fails a render exactly as a violated
impact does; the gate sweeps both.

## Enforcement: the constraint ledger

Each render is scored against every declared unknown, producing one row per
(render, unknown) pair with a state:

- **honoured** — the render complies, with a quoted "how".
- **at-risk** — the render is one clause from violating it; the row quotes
  the offending phrasing. At-risk is a first-class verdict, not rounded up
  to pass.
- **not-applicable** — the render never touches the constrained territory,
  and the row says why.

Decision rules, each purchased by a production incident:

1. **Score mechanically, never by self-attestation.** A pipeline whose
   unknowns were "honesty checks throughout" shipped a render violating one
   of its own four constraints, caught only by accident from a different
   step. If nothing consumes the unknown, the unknown does not exist.
2. **Key ledger rows by stable identifier, never by position.** Rows that
   addressed unknowns by array index broke the day one unknown was resolved:
   every stored index pointed one slot left and the last pointed at nothing,
   crashing the scoring step. Identifiers survive deletion of neighbors;
   positions do not.
3. **Resolved unknowns are kept, marked resolved — not deleted.** Deletion
   destroys the ledger's completeness. Retention also enables a fourth
   effective state: **superseded** — a render honouring a constraint that
   has since been lifted. Not a violation; a render now *more cautious than
   the evidence requires*, which is worth surfacing so a follow-up edit can
   unhedge it.
4. **A row that cannot resolve is reported, never dropped.** A ledger that
   quietly renders four rows as three is the index bug wearing a guard
   clause. Dangling references mean the score is incomplete, and an
   incomplete score says so.
5. **Check impacts against the render text, not against intent.** The
   canonical at-risk row: research measured only correlation and demanded
   "moves with"; the render said "when yields climbed, the asset was sold" —
   which *reads* as causation regardless of what the writer meant. One
   clause from compliant is the ledger's verdict, quoted.

## Procedure

1. During research, for each question the evidence could not settle, write
   the unknown with its impact (and scope, where one fact is at issue).
2. At render time, walk the full unknown list per render; assign a state and
   a quoted "how" for every row — including not-applicable rows, because an
   absent row is indistinguishable from an unchecked one.
3. Surface at-risk and superseded counts with the render; treat any at-risk
   row as a required edit, and superseded rows as optional unhedging.
4. When new evidence resolves an unknown, mark it resolved with what
   resolved it; re-score existing renders to find the newly superseded rows.

## When not to use it

Do not write constraints for unknowns no render could plausibly touch —
every row costs a scoring pass forever, and a ledger padded with dead rows
trains reviewers to skim it. Do not use an unknown to soften a fact the
evidence actually contradicts: that is a correction, not a hedge. And do not
let the ledger substitute for cutting — when a claim's only honest rendering
is so hedged it says nothing, the constraint has told you the claim does not
belong in the script at all.
