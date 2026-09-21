---
layer: technique
type: technique
subject: answer-engine-visibility
technique: ask-the-models-baseline
status: forged
laws: [not-measured-is-not-zero, statistical-honesty-before-a-verdict, provenance-is-binary-and-labelled]
shared_with: []
use_when: [setting up a measurement of AI visibility for a business, reporting AI visibility to a client, deciding whether a content change moved citations, judging a vendor's "AI share of voice" number]
---

# The ask-the-models baseline

The business's AI visibility is measured by asking the answer engines its top
money questions on a fixed cadence, in fixed wording, and logging who is cited.
Nothing else reports it: the search console does not know about citations, the
analytics tool sees only the referral that followed one, and a ranking is now a
lagging proxy. The result is a small ordinal record - cited or not, which
competitors, on which engine, on which date - and it is reported as that,
never as a percentage or a score.

## Procedure

1. **Fix the question set.** Convention: the top five money questions, phrased
   as a customer would ask them, one per money page. They change only when the
   map changes, and a change is logged, because a baseline whose questions
   drift cannot be compared with itself.
2. **Fix the engines.** At least the dominant search engine's answer feature
   and two conversational engines; more if the market uses them. Engines
   overlap little in whom they cite, so the scoreboard names the engine on
   every row and never reports a single "AI visibility" figure across them.
3. **Fix the conditions.** Same market and language setting, a fresh session
   with no history, the same day of the month. Answer engines are
   non-deterministic; convention is to run each question three times and
   record the citation if it appears in any run, with the count.
4. **Log the row.** Date, engine, question, cited-us (yes/no/count of three),
   competitors cited, source pages cited, notes. The source pages column is
   the input to the mention technique: it is where the engine is looking.
5. **Segment AI referrals in analytics.** The conversational engines' referrer
   domains, kept out of the "organic" bucket. Volumes look small; conversion
   rate is usually the highest on the site; both are reported as measured, and
   a channel the analytics tool cannot attribute is shown as not measured.
6. **Re-run after a material content change**, and on the cadence regardless.
   Convention: monthly. A run shortly after a change reads the change; a
   missed month is a blank row, not a zero.

## Decision rules

- When the run shows the business cited on one engine and not another, report
  both, because the overlap finding means one surface is one surface and a
  client who is told "visible in AI" will discover the other engine themselves.
- When two runs differ by one citation, report the observation and not a
  trend, because three tries on five questions is fifteen observations and the
  ratio of sums from fifteen observations carries no confidence claim; a
  trend is spoken of after the record spans several cycles.
- When a vendor offers an "AI share of voice" number, ask for the question set,
  the engines, the run count and the date, and if any is missing the number is
  a vendor artefact and is labelled as such beside the business's own log.
- When a question's answer cites nobody - the engine answered from its own
  knowledge - log it as no citation, not as a loss, because there was no slot
  to win and the question may belong in a different tier of the map.
- When the log shows the business cited but the analytics tool shows no AI
  referrals, report both as measured, because a citation is not a click and
  the subject's whole point is that the two have separated.

## What is convention here

Five questions, three engines, three runs, monthly: all practitioner
convention, sized so a small business can run it by hand in an hour. The
value of the record is its consistency, not its size; a team that runs ten
questions weekly has a better instrument, not a different one. What is not
convention is that the row carries its engine and its date and that no
percentage is computed over it.

## Why the record is ordinal

Fifteen observations a month is a small sample by any standard, and the
temptation to render "cited on 4 of 15 = 27% AI visibility" is the thin-sample
error the measurement subjects forbid. The honest rendering is the rows: "cited
on the pricing question on two engines; not cited on the emergency question on
any; competitor A cited on three of five." That is legible, comparable month to
month, and immune to the criticism a percentage invites.

## When NOT to use

- As the readout for a content experiment's success. It is a descriptive
  before/after with no control; a citation that appeared after a rewrite is
  suggestive and is reported as such. A causal claim needs a holdout, and this
  instrument does not provide one.
- As a replacement for the search console and the rankings report. It adds a
  column; it does not retire the others.
- When it would be run by a generator that also writes the pages. The model
  that drafted the passage has a stake in finding it cited; a run by a person,
  or by a separate process with the raw answers stored, is the instrument.
