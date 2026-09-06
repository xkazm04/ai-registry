# The memory lane

Read this at Phase 2 when the run is invoked with `--memory`, or whenever a source
claims something about agent memory, recall, consolidation, forgetting, or how any of
those should be measured. It exists because this registry has already run the
experiment most such sources are describing, and a claim that arrives without knowing
that is usually re-deriving a number we have, or contradicting one we earned.

**The rule this lane adds to the six outcomes: a memory claim is triaged against the
measured ladder before it is triaged against the corpus.** A source that reports an
accuracy number for a memory design is making a claim we can price, and pricing it is
cheaper than corroborating it.

---

## What has already been measured

`personas/evals/memory-year/` replays one fabricated year (5 projects, 176 facts, 3,571
events, 194 probes in 10 classes) against any design implementing four calls: ingest,
consolidate, recall, cost. Findings live in that directory's `FINDINGS.md`; the ledger
rows are in `personas/.ai/applied.jsonl` under runs `memory-year-0903`, `-0905`, `-0906`.
Every row below shared one consumer, judge, budget and elaboration regime.

| arm | acc | stale | ctx tokens | write tokens/event |
| --- | --- | --- | --- | --- |
| retrieval over the raw record, 200 chunks | 0.89 | 16 | 3,253 | 0 |
| verbatim + hybrid retrieval, no model at write | 0.87 | 5 | 1,912 | 0 |
| the two-tier pipeline, both tiers governed | 0.86 | 9 | 1,592 | 1,371 |
| per-page compiled truth + append-only timeline | 0.84 | 3 | 1,632 | 3,434 |
| write-time verdict reconciliation | 0.78 | 4 | 918 | 7,341 |
| whole history in context | 0.65 | 6 | 5,870 | 0 |
| no memory | 0.08 | 0 | 0 | 0 |

Four claims a source does not get to make unchallenged, because this table already
answers them:

1. **"Consolidation improves accuracy."** It does not, here. Verbatim storage plus good
   hybrid retrieval beat every distilling arm on raw accuracy. What distillation bought
   was *currency* (3-9 stale answers against 16) and *read cost* (half the context or
   less). The axis is **detail against currency**, not accuracy against cost: a row
   store keeps the incidental material and goes stale; a rewriting store keeps what is
   currently true and forgets why. On changed values the rewriting arm scored 0.98 and
   the verbatim arm 0.85; on recurring failure causes, 0.36 against 0.68.
2. **"Our benchmark number proves the design."** Of three public memory systems read in
   one round, one published numbers from a contaminated held-out split, one declared
   benchmark scripts that did not exist, and the third's numbers were honest but
   self-against-self. **Treat a published memory number as a lead, never as evidence.**
   Re-running the claim as an arm here costs a few hours and settles it.
3. **"Graph / vector / hybrid is the win."** None of the three cohort systems had a
   supersedence mechanism that reliably handles "we moved from X to Y". Store *topology*
   was not what separated the arms; what separated them was whether anything retires a
   superseded belief, and whether the read path can still reach the evidence afterwards.
4. **"The pipeline is slow, so it is the bottleneck."** An operational failure inside
   the pipeline (31 of 102 consolidation cycles dying on a timeout) cost **two points**
   of accuracy. Reading a reliability bug as an accuracy bug aims the next fix at the
   wrong target. Fixing it bought reliability and long-horizon recall, which is what it
   should have been predicted to buy.

## The finding most sources will not have

The largest single gain in the series was not an algorithm. **The procedural tier had
never been governed by supersedence at all**: 261 of 375 facts were retired on schedule
and 0 of 133 behaviour rules ever were, because the retirement code existed with no
caller. It mattered disproportionately because the always-on injection lane puts the top
rules into *every* prompt regardless of the question, so the ungoverned tier was the one
with the most standing - a rule saying "default to two-space indentation" outlived the
fact it came from and answered in its place, months after the user changed it.

Carry the generalisation into any source about a multi-tier memory:

> **Whatever tier the always-on lane draws from must be governed at least as strictly as
> the tier you retrieve from on demand.** A "forgetting is demotion" contract is only
> real where something calls it, and the tier with the least retrieval pressure is the
> one where a dead entry survives longest with the most authority.

Governing it: +4 points, 68 of 131 rules retired, stale answers 13 to 9. It also cost
something, which is why the row is not a clean win: a narrow class regressed when
retirement switched on, because the leg could now be over-eager.

## Instruments this lane owns

Four measurement rules were paid for by this series and are already in the corpus. A
source that violates one is making a methodology error, not a finding, and the run
should say so rather than land the claim:

- **A cap inside an arm outranks the declared budget.** Same code, same 6,000-token
  budget: a 40-chunk internal ceiling scored 0.68, a 200-chunk ceiling 0.89. Under-spend
  against the declared budget is the signature. (`baseline-ladder`)
- **Restraint is two numbers.** Asserted-where-silence-was-right, paired with
  abstained-with-the-fact-present. Either alone is gamed by being louder or quieter.
  (`baseline-ladder`)
- **An assertion over free text carries a format assumption.** A judge written for a
  terse consumer scored a conversational one at 0.36 when it deserved 0.73, because
  "the current value, and here is the old one it replaced" tripped the staleness check.
  Normalize a reply to the claim it *asserts* before asserting on it.
  (`assertion-vs-judgment`)
- **A cap that is not a shortlist is a coverage hole.** Bounding a consolidation prompt
  by truncating the store leaves everything below the cut permanently uncomparable.
  (`consolidation`)

## How to run the lane

1. **Read the table above before the source.** Note which arm the source's design most
   resembles; that is its prior, and the number beside it is what the source has to beat.
2. **Price the claim, do not corroborate it.** If the source claims a mechanism, ask what
   it would change on the four-call contract. If the answer is "nothing measurable", it
   is a lead.
3. **A mechanism worth testing becomes an arm, not a technique.** The harness takes a new
   adapter in a few hundred lines; three of the current arms were built that way in one
   session from three public repositories. Land the technique *after* the arm has a row.
4. **Re-run, never inherit.** Every number here is pinned to one scenario, one seed, one
   consumer and one judge. A source that moves any of those has not contradicted the
   table; it has changed the question.
5. **Report the arm's costs beside its accuracy.** Read tokens per probe and write tokens
   per event, always. An arm that wins on accuracy at four times the write cost has to
   argue for the difference.

## Open questions this lane would like a source to answer

Named so a run can recognise a genuinely new contribution rather than a re-derivation:

- Nothing in the cohort reliably handles a *scope-crossing* supersedence ("we moved from
  X to Y" where the new value is classified into a different category than the old one).
- No arm has been measured on a store that must serve two users with different
  preferences over the same projects.
- The detail-against-currency trade has no measured middle: an arm that keeps a rewritten
  summary AND routes to the evidence behind it on the questions that need it has not been
  built, and the class table says that is where both shapes lose.
