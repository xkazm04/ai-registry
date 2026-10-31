---
layer: technique
type: technique
subject: retrieval
technique: named-period-vote
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [a question names a period such as last March or two weeks ago, the newest statement on a topic keeps outranking the one the question asked about, deciding whether a date parsed from a query filters or ranks, a date parse that is wrong silently empties the result, resolving a relative date in a query on a server or in a replay, a past-state question and a current-state question share one retrieval path]
---

# A named period is a weighted vote, not a filter

Some questions carry a key that no text index can answer: a period. "What did we decide
about the host back in March", "what was the deploy day two weeks ago". The words that
name the period match nothing useful in the corpus, and the topical words match every
statement on the subject, old and new alike. Left to the lexical and vector lanes, the
question is answered by whichever statement on the topic ranks highest, which is usually
the most recent or the most often repeated, and that is exactly the one the question did
not ask about.

The period addresses a column the lanes do not read: when each item was true or was said.
That leaves three things a pipeline can do with it, and the intuitive one is the one to
avoid.

## Ignore it, filter on it, or vote with it

On one replayed store (a simulated year, 3,571 events, a hybrid lexical-and-vector ranking
with a cut of 5, 10 or 40 items), 140 questions each asked what a fact had been in the
month it was first stated, months before it was superseded. Coverage is the share of
questions whose packed context held a statement made in the asked-about month:

| cut | ignore the period | filter to the window | vote, full weight | vote, quarter weight |
| --- | --- | --- | --- | --- |
| 5 | 78 | 103 | 104 | 101 |
| 10 | 94 | 110 | 112 | 103 |
| 40 | 105 | 125 | 127 | 114 |

Ignoring the period is clearly wrong: at a cut of five, 72 of the 140 contexts also held
the superseding statement and 62 held no statement from the asked-about month at all. Once
the window is parsed correctly, filtering and voting are close; the filter loses one or two that
the vote keeps.

The case that decides between them is the window being **wrong**. A period is parsed out
of free text, and a parse is a guess: the person misremembers the month, a word that names
a month is a verb, a number is a quantity. With the window shifted one month early, here
is how many of the questions each arm had answered under "ignore" it then lost:

| cut | filter | vote, full weight | vote, half weight | vote, quarter weight |
| --- | --- | --- | --- | --- |
| 5 | 24 | 24 | 21 | 7 |
| 10 | 36 | 35 | 20 | 8 |
| 40 | 41 | 1 | 1 | 0 |

So the rule is not simply "vote, never filter". **At a cut wider than the crowd the window
admits, any vote is safe and a filter is not. At a tight cut, a vote weighted like a whole
lane fills every seat with in-window items and is a filter in all but name.** Weight the
period's vote below the topical evidence (it is one list among several, never the
majority), and choose the weight against the cut the consumer actually grants. On this
store a quarter weight kept a net gain of 23 questions at a cut of five, where the full
vote netted 26, and cut the wrong-window loss from 24 to 7.

## The vote reorders only what the lanes fetched

The vote is a ranked list built from candidates already fetched, ordered by their topical
rank, and fused with the other lists by rank. It does not fetch by date. That keeps it
cheap and bounded, and it has a price that the candidate depth decides. On the same store,
at a cut of 40, the vote gained 2 questions when it could see the top 50 candidates, 22 at
the top 200, and 30 over the whole store: the asked-about statement was often present, just
ranked far below its newer and more often repeated siblings. Size the depth so the old
statement is inside it, and widen it when a window fired, rather than trusting a default
sized for questions without one.

The same property bounds the technique from the other side. A question that is all period
and no topic ("what happened last Tuesday") gives the lanes nothing to fetch, so the vote
has nothing to reorder. That question needs a fetch by time of its own, which is a lane with
its own floor, not this vote.

## Resolve the period against the asker's clock

"Last week" means the week before the question was asked, at the offset of the person who
asked it. A server's wall clock is the wrong anchor whenever those differ, and they differ
routinely: a replay, a benchmark asking about a year that has passed, a queued question,
a user eight hours from the server. The read path takes the instant and the offset as
inputs, the same discipline the write path owes when a distillation grounds a relative
date (agent-memory's observation clock is the write-side twin of this rule).

The item side has the same trap. The time the vote compares against is when the item was
said or became true, supplied by whoever wrote it, not when it was ingested. An import of a
year of history ingested in one afternoon gives every item the same ingestion day, and a
vote over that column promotes the import batch. Where the event time is unknown, the item
does not vote; **an unknown time is not the ingestion time**
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## Parse for precision, and abstain freely

A missed window costs the question one vote it would have had. A wrong window costs it the
seats the vote hands to the wrong items, and at a tight cut that is the answer. So the
parser gives up whenever a number or a month word could be something else: a four-digit
number followed by a unit is a quantity, a month name without its preposition may be a verb
or a planet, "the last week of the sprint" names a span of the sprint, not of the calendar.
A recognised expression yields a half-open interval, a bare year after the asker's present is
a number, and an explicitly dated period is taken at its word even when it lies after the
newest item, because the store may hold imported history. On the store above, the parser
used for the measurement fired on none of the harness's 194 ordinary questions, so those
contexts were identical under both arms by construction.

## A vote is not supersedence

The vote promotes what was said in a period. It retires nothing, and it should not be
mistaken for the mechanism that keeps current answers current. A current-state question
names no period and gets no vote, so a store that keeps every version beside the next
still serves the old value on "what is the host now"; that is a retirement predicate, an
item column that the fusion stage re-imposes
([hybrid-lane-fusion](./hybrid-lane-fusion.md)), and a consolidation decision upstream of
it. The two are complements. Supersedence answers "what is true now", and the period vote
answers "what was said then". In the replay, the vote did exactly that: on past-state
questions at a cut of five, the superseding statement was in 72 contexts without the vote
and in none with it.

## Say what moved

Each item the vote lifted carries that fact into the slice: "matched lexically, inside the
named window". A slice reordered by a parsed period with nothing recording that the parse
happened will be read as topical relevance, and when the parse was wrong nobody can tell why
the answer moved. The window itself, as parsed, belongs in the trace next to the lane counts
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Decision rules

- The question names a period and the lanes return the topic: fuse an in-window list of the
  fetched candidates as one vote, by rank, never as a filter.
- The cut is tight relative to how many fetched items the window admits: weight the vote
  under the topical lanes (a quarter to a half of one lane on the store measured) or widen
  the cut when a window fired. A full-weight vote at a tight cut is a filter.
- The candidate depth was sized for ordinary questions: widen it when a window fired, or the
  old statement the question asks for sits below it.
- The question is only a period: fetch by time in a lane of its own with its own floor.
- The item has no recorded event time: it does not vote. Never substitute ingestion time.
- Resolve relative periods against the caller's instant and offset, never the wall clock.
- Abstain on any expression with a non-temporal reading. Record the parsed window in the trace.

## When not to use it

When the store is small relative to the cut, every statement on the topic is already in the
context with its date, and the consumer can pick the right one; the vote buys nothing
there. When items carry no trustworthy event time, there is nothing to vote with. And it
is no substitute for supersedence on questions about the present.
