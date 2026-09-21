# Synthesis - the Director's job after the members return

The members produced verdicts. The instrument produced an outcome. Synthesis is the part
in between that a person will actually read, and it has one rule above all others:

> **The synthesis explains the aggregate. It never overrides it.**

A Director who disagrees with the arithmetic says so in prose and leaves the number alone.
Editing a score after seeing the total is how a gate becomes a formality.

## Order of work

1. **Run the instrument.** `node <skill>/scripts/council.mjs aggregate --run-dir <dir>`.
   It writes `result.json` and validates it. Any `problem:` line it prints is a broken
   member verdict, not a rounding detail - fix the verdict file or record the dimension
   `unmeasured` with the reason, and re-run.
2. **Read the outcome before reading the scores.** `fail` and `stalled` change what the
   report is for; a report written as if the subject were ready and then re-titled reads
   like an argument.
3. **Write `report.md`** in the run directory, in the order below.
4. **Never edit `result.json` by hand.** It is the consumer's input; a hand edit is a
   verdict with no member behind it.

## `report.md`, in this order

0. **The envelope, in one sentence, before anything else.** When the result carries
   `scenarios`, the first line of the report states where the verdict holds and where it
   does not - *"Holds for IT and engineering candidates, weak for marketing (0.30, floor
   0.50), never measured for HR."* Name the weak branches and the unmeasured ones
   explicitly; "holds broadly" is not an envelope. Where a must-hold branch rests only on
   `simulated` proof, say that in the same breath: a model playing that user is not that
   user, and a reader who learns it two pages later has already formed the verdict. When
   the result carries no `scenarios`, say that instead, in one line: this subject declared
   no branches, so the verdict is about the feature as a whole and says nothing about how
   it behaves branch by branch. The round table a person sees prints this line above the
   gate, so it is the one sentence that must survive being read alone.
1. **Outcome, in one line.** `ready` / `fail` / `incomplete` / `stalled`, the round number,
   and what happens next. For `ready`, next is "a person decides" - say that plainly and
   do not phrase it as a recommendation to approve.
2. **What was judged.** The receipt: head sha, the spanned paths, the span digest, and the
   drift verdict against the previous round with what carried forward. A reader must be
   able to tell what this verdict is about without opening the code.
3. **The scenario table**, when there is one: slug, score or `unmeasured`, `n`, the proof
   rung, whether it is in scope, and whether it is below its floor - advisory marked as
   such in words. Then the **dimension table.** One row per dimension: score or `unmeasured`, confidence,
   floor and whether it was hit, `advisory` marked as such in words rather than a symbol,
   and the delta against the previous round. `overall` and `coverage` beneath it, with
   coverage read aloud: "this number rests on 70% of the rubric".
4. **The trust banner.** While `trust_state` is not `trusted`, say it here, every time:
   the judged members have not been calibrated, their floors are advisory, and `overall`
   only orders the queue. A number presented without that sentence will be read as
   authoritative by the next person who sees it.
5. **`must_address`.** The work the next round has to do, each item traceable to the
   finding that produced it. This is the only section an implementer acts on.
6. **Disagreement and thinness.** Where two members' findings point at the same code from
   opposite directions, say so rather than averaging the prose. Where a dimension is
   measured with `confidence: "low"`, say what would raise it.
7. **The oracle.** For `ready`, name the comparison object the person at the gate needs in
   order to decide: the thing this is better or worse THAN. A gate with no oracle is a
   yes/no button, and a yes/no button is what this method exists to avoid.

## What the synthesis must never do

- **Never admit.** No `approved`, no "recommend approval", no "ship it". The closed outcome
  set has no admitting value for a reason, and prose is not an exemption.
- **Never rescore.** Not to break a tie, not to reflect a finding a member filed under
  another dimension, not to make an outcome match your reading.
- **Never quote the implementer.** Not in the report, not as mitigation, not as context.
  If the implementer's account contains something the council needed, the evidence pack
  was built wrong and the fix belongs in phase 2, next round.
- **Never present an estimate as a measurement.** Carry the member's label through - and
  carry the scenario's `proof` rung through with it. A `simulated` branch reported without
  that word becomes an `observed` one in the reader's memory.
- **Never state an envelope wider than the scenarios support.** A branch nobody measured is
  `unmeasured` in the sentence, never folded into "holds".
- **Never rewrite a prior run.** A new round writes a NEW run directory with
  `supersedes_run_id` pointing at the old one. The superseded run stays on disk exactly as
  it was, including the parts that turned out to be wrong.

## Between rounds, when the method is also the implementer

When the same session both councils and implements (`council x implementation`), the two
roles are separated in time and in evidence, never blurred:

1. Finish the council. Write the result and the report. **Then** stop being the council.
2. Fix `must_address`, commit, and let the repo's own gates pass.
3. Re-run as the **next round**: a new run directory, a fresh receipt, drift computed
   against the previous receipt, `supersedes_run_id` set, `round_no` incremented.
4. The next round's evidence pack is built from the tree again. It does NOT carry your
   account of what you fixed. You are the implementer now, and the house rule that keeps
   the implementer's report out of the pack applies to you exactly as it applies to
   anyone else - more so, because you are the one who would be believed.
5. Round 4 does not happen. The instrument refuses it with `stalled`, and `stalled` is an
   honest, reportable end: three rounds did not converge, and a person should look.
