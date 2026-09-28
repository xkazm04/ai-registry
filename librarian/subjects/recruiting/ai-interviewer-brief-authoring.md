---
subject: ai-interviewer-brief-authoring
domain: recruiting
last_touched: 2026-09-26
dry_streak: 0
---

# ai-interviewer-brief-authoring

First touch by `/deepen`: a single-subject run dispatched by the Curator lane on the scan
finding "never swept by the librarian" (3 points, the only reason; two stacks, nothing
expired, 6 consults from one contributor). Registry HEAD at dispatch was 55c6bce2; the
primary checkout's main was 124 behind origin, so the run worked from origin/main in a
detached worktree. The consumer was read at kp's local main, a7340185d. No sibling held kp
on the board.

## 2026-09-26 - position is the engine's, a rank sentence is not a lever, one hint is not a rating

**Depth rung:** L2 primary for the corrections: interview-anxiety meta-analysis and
validity study; survey-interviewing field manuals and the conversational-interviewing
experiments; the structured-interview probing review; dynamic-assessment review; a 2025
confirmation-probe study with an automated interviewer; a named-entity ASR measurement;
LLM position and instruction-count papers; a priority-following benchmark; the
language-confusion benchmark; vendor prompting guides. L3 empirical for one application:
the tree's own praise detectors, run keyless through its module loader.

**Lanes:** counter-evidence on interviewing science (web); counter-evidence on
instruction position (web); training-data-only (blind); consumer-tree re-verification
(read-only).

**Landed** in e1e199ba:
- **Flipped, rule-ordering:** "the rules stated closest to the point of generation are
  applied most reliably" becomes "out of the middle; which end is strongest is the
  engine's, found by measurement; both ends when unknown". Both lanes reached
  model-dependence.
- **New, rule-ordering (both lanes):** proximity is not position. In a conversation the
  brief recedes, so a rule that must hold per turn is re-stated at the turn, and a tool
  result is the strongest carrier.
- **Flipped, rule-ordering (both lanes):** "let the hard constraint declare its own
  precedence" is withdrawn as a lever. Removing a rank sentence from a measured block
  still needs the gate re-run.
- **Conditioned, rule-ordering:**
  - Condensed-paragraph density is a runtime observation; no controlled comparison exists.
  - The example hazard is the other-language demonstration; target-language examples help.
  - Two new change-discipline bullets: a snapshot consumer satisfies sync but strands the
    unshipped rule; anything appended to a finished brief lands after the guarded block.
- **Flipped, narrowing:** "a verbatim re-ask is the single most damaging move" is
  withdrawn. Survey doctrine prescribes the verbatim repeat, and the brief's departure is
  deliberate and priced. Probing cues applicants, so rungs are planned per item and
  applied to every candidate.
- **Conditioned, praise:** the permitted list is safe by distribution, not vocabulary.
  Praise is not a comfort measure.
- **Flipped, coachability:** one hint is one observation, not a scale rating. A missing
  hint leaves the axis unassessed, not average. Mandatory, non-contingent help is
  confirmed.
- **Conditioned, read-back:** acquiescence is confirmed and the counter-framing is
  untested. A blanket yes confirms the list, not each item: fix it in the brief, not the
  scorer.
- **Corrected claims:**
  - Anxiety is modest, with a lower effect in real interviews. The harm is lost validity,
    not "least confident hardest".
  - Silence yields longer answers, not more honest ones.
  - Field evidence: human interviewers pad follow-ups.
- **Applications:** three re-verified to 2026-09-26, two new (python read-back, node
  one-question). Two 08-20 claims were wrong when written and are withdrawn:
  - "compliance is only a composition test": a transcript-level count existed since
    07-07;
  - "skipping the hint is not detected": telemetry detected it since 06-07.

## Counter-evidence, claim by claim

| Claim | Verdict | Lanes |
| --- | --- | --- |
| Anxiety hits the least confident hardest | conditioned: modest; the harm is validity | web + blind |
| Praise teaches the register, leaks the rating | confirmed in direction; mechanism untested; receipt tokens leak when rationed | web + blind |
| Verbatim re-ask is the single most damaging move | refuted as an absolute; survey doctrine prescribes it | web + blind |
| Silence yields the more honest continuation | conditioned: longer, not more honest | web + blind |
| "Correct me where I'm off" invites correction | untested; acquiescence confirmed | web + blind |
| ASR corrupts rare entities worst | confirmed | web + blind |
| One mandatory hint makes coachability observable | mandatory half confirmed; one event is not a rating | web + blind |
| Last position is most reliable | conditioned: model-dependent; middle weakest | web + blind |
| Condensed paragraph beats list | unresolved; runtime observation | web + blind |
| First token decides the language | partly: conditions supported, strong form not | web only |
| Declared precedence strengthens a rule | refuted as a lever | web + blind |
| Examples plant tokens | confirmed, refined to other-language examples | web + blind |

## Impact

- **kp: 2 contexts** (`jd-intake-brief-logic`, `voice-interview-session`), 0 stale verdicts
  against this subject. Map rebuilt and committed in kp at 6be523fce. Unrelated stale
  verdicts in kp's map: 19, under other subjects.
- **Coverage gap, the lead worth most:** the files this subject governs sit in no kp
  context: the brief constants, the simulator lexicon and detectors, the hint telemetry,
  and the director brief. The join reaches the subject only through two neighbours, so
  `/conform` cannot read the seams it would judge. Owed to kp: a context scan covering
  `app/_lib/student-interview.ts`, `app/_lib/interview-sim/`, `app/_lib/interview-telemetry.ts`
  and `app/_lib/voice/director*.ts`.

## Owed to kp (recorded as deviations, not fixed)

- The golden "passing" transcripts carry praise the brief forbids and 3 stacked
  questions. No detector flags them.
- "On the right track", named in `CLOSING`, is outside the praise gate. Five
  hand-kept copies of the clause exist, and no test asserts they agree past the opening
  words.
- The scorer rates a missing coachability observation 3 of 5. Telemetry that knows the
  hint was not offered runs after the rating.
- The candidate-safe voice brief carries no hint instruction. With a job kit, the
  coachability phase is dropped while `NON_NEGOTIABLES` still refers to it. Both were read
  from code, not traced end to end.
- The optimiser appends accepted rules after the language lock.
- The preferred-locale lock dropped its rank clause without a language-gate run.
- The unshipped hostility rule's comment still says "Python-synced".
- The read-back contract makes a blanket assent authoritative for every item.

## Applied

Five rows in `librarian/applied.md` and kp's `.ai/applied.jsonl` (2ee8cc971):
- rule-ordering: simulation, better;
- praise: experiment, better;
- coachability: unmeasurable;
- read-back: simulation, not-better;
- narrowing: unmeasurable.

## Declined

- **The first-token language mechanism as a literature claim.** Web lane only, and it
  found line-level drift that contradicts the strong form. Kept as the runtime's observed
  mechanism, labelled so.
- **Unverified secondary sources:**
  - list-to-bullets helping small models;
  - demonstration copying;
  - the Cannell primaries.
  Each was fetched only through a secondary source or not at all. None was cited as a
  finding.

## Banked leads

- **Heritage et al. 2007, "something else" vs "anything else".** Blind lane only, a
  clinical analogue for read-back framing. Return: when a second lane finds it, or when a
  read-back framing study appears.
- **In voice, a read-back correction passes through the same recogniser.** Raised in
  review, not by any lane. Return: when a lane or a tree shows a corrected term re-corrupted.
- **Candidate self-selection into automated interviews.** In the 2025 field experiment
  (web lane), those who chose the automated interviewer scored lower on language and
  analysis. Return: for the round-design or candidate-experience subjects, not this one.

## Clocks

No application clock is set; the stacks' derived windows apply. The instruction-position
literature moves fast; re-check the position claims by 2027-03-26.
