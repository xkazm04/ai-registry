---
name: survey-response-theme-and-sentiment-analysis
version: 0.1.0
status: seed
domain: product_project
path: product_project/customer-feedback
---

# Survey response theme and sentiment analysis

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Feedback read one batch at a time turns a loud response into a trend and a
quietly recurring one into nothing, and a thin batch read eagerly produces a confident
conclusion the data cannot carry. The failure that passes for analysis is subtler than
either: responses get sorted into buckets named after the nouns they mention, pricing,
support, onboarding, and the result is a tidy chart in which nobody has said anything.

**Input.** New responses since the last read, the questions they answered, who was asked
and who replied, and the rolling baselines for themes, sentiment and score history
across prior periods.

**Core action.** Build themes around a shared meaning rather than a shared word, weigh a
theme by what it would change and not only by how many raised it, and refuse to conclude
when the batch is too thin or too narrow to support one.

**Output.** A read on themes, sentiment and score movement against this account's own
history, with anomalies separated from ordinary variance, each theme carrying its
evidence, and the limits of the sample named rather than implied.

## Activities

1. Collect responses since the last read and normalise them against the questions asked
*(observe)*
2. Judge whether this batch can support a conclusion at all, on who it covers as well as
how many replied *(decide)*
3. Code the responses and build themes around a shared meaning rather than a shared word
*(decide)*
4. Compare against rolling baselines from several prior periods, not only the last one
*(decide)*
5. Flag the anomalies, and route high ambiguity or a schema mismatch to a person *(act)*
6. Hand over the analysis with its evidence, its confidence and what it could not see
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A theme names something people are saying, not a word they used.**

- Each theme is stated as a claim somebody could disagree with, and carries the
  responses it was built from so a reader can check it.
- A theme is weighed by what changing it would fix as well as by how many raised it, so
  a specific complaint from a few is not automatically outranked by a vague one from
  many.
- Reading the same responses again produces the same theme set, because a theme set that
  shifts between passes cannot support a trend.

**A real move in theme, sentiment or score is caught against this account's own history
rather than against a universal bar.**

- Results are compared against several trailing periods, not only the immediately prior
  one.
- A theme rising across periods is distinguishable from one that was loud in a single
  batch.
- The first pass says it is establishing the baseline instead of reporting a change
  against nothing.

**The analysis never ships a conclusion the responses did not carry.**

- Below the volume the adopter set, responses are held rather than producing a thin
  read, and what is held survives to the next pass rather than being recollected from
  scratch.
- A batch that is large but narrow, where the respondents are known to differ from the
  population, is reported as a read of those respondents rather than of everybody.
- High ambiguity or a mismatch between the responses and the questions routes to a
  person before the analysis is handed on, not after.
- A sentiment or score movement on a sample too small to support it is reported as a
  count of responses rather than as a number that moved.

## Guidance

Read for themes, not for scores. A theme is a pattern of shared meaning, not a bucket of
responses that happen to mention the same noun, and grouping by noun is the version of
this work that looks finished and says nothing. Volume is a floor and not a licence:
five hundred replies from the same self selecting fifth is a confident read of that
fifth. Compare against several prior periods, and name a thin or skewed sample as thin
rather than reporting a number from it.

## Where this is worth adopting

- A product team reading a channel of open text feedback that has outgrown anyone's
  ability to read it all, where the risk is not missing a complaint but mistaking the
  loudest week for a trend.
- A company whose satisfaction score moved two points and whose next decision depends on
  whether that is a signal, when the sample was forty replies and the score bucketing
  threw away most of what they said.
- A team running continuous feedback rather than periodic surveys, where responses
  arrive a handful at a time and every individual batch is too thin to conclude anything
  on its own.
- A research function that has been producing theme charts for a year and cannot tell
  whether the themes are stable or the coding drifted, because nothing checked that the
  same responses would be coded the same way twice.
- Any account where the people who answer are a known subset, power users, angry
  churners, a single large customer, and the value of the analysis depends entirely on
  saying so before anybody generalises from it.

## Connector types

`database`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. A fixed daily schedule conflicts with the recipe's own volume rule, since
it wakes to find nothing to do on most days and then runs anyway on the day the buffer
is one response short. Act when enough new responses have accumulated to say something
the last pass could not, which is a judgment about signal and coverage rather than a
count on a clock.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Where the responses live and what the questions were, because a theme only means
  something against the question that was asked, and a question that changed mid period
  breaks the comparison silently.
- Who was asked and who actually answers, because the gap between those two is what
  decides whether any conclusion can be generalised, and no amount of volume closes it.
- Which respondents count for more, since the same complaint from a trial user and a
  paying one deserves different weight.
- What counts as enough to conclude anything here, because the configured minimum is a
  floor and the real answer depends on how varied the population is and whether new
  themes are still appearing.

## Dependencies

None.
