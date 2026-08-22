---
layer: technique
type: technique
subject: wizard-flows
technique: frontier-batched-elicitation
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [an elicitation flow feels slow at the tail, deciding how many questions a turn may carry, ordering questions whose answers unlock other questions, reducing the effort of agreeing with a proposal]
---

# Frontier-batched elicitation

[ai-driven-elicitation](./ai-driven-elicitation.md) decides *what* to ask and
how coverage is measured. This technique decides **how many questions a turn may
carry, and which ones** — the turn economics of a dependent flow, which is where
a well-designed elicitation still exhausts the person answering it.

## Both naive policies fail, at opposite ends

**One question per turn** is the safe default and it is safe for a real reason:
every question is asked in a state where all its prerequisites are answered, so
no question is ever asked prematurely or answered against a stale assumption.

Its failure is at the tail. Elicitation is front-loaded by nature — the
consequential, contested decisions surface early, and what remains at the end is
a long run of questions with obvious answers. Serving those one per turn charges
a full round trip for each "yes, that's fine". The flow is not merely slow, it
is slow *precisely where it has stopped extracting value*, which is the shape
that makes people abandon a session with three questions left.

**All questions at once** removes the round trips and reintroduces the problem
the one-per-turn rule existed to prevent: question five depends on the answer to
question two, so it is either unanswerable, or answered against a guess, and
nobody can tell afterwards which.

## The frontier

The questions are not a list, they are a **dependency graph**. Some are askable
immediately; others become askable only once something upstream is settled. The
policy follows directly:

> Ask **every question whose dependencies are satisfied**, in one turn. Then
> recompute the frontier from the answers and ask the next round.

Batch size is not a tuning parameter — it is derived from the graph, and it
varies by round on purpose. An early round may be a single critical question
that unlocks a dozen; a late round may be eleven independent confirmations. That
variation is the technique working, and a flow that batches by a fixed count has
thrown away the property that made batching safe.

Two consequences worth stating:

- **The graph is authored, not inferred per turn.** A dependency is a claim
  that one answer changes another question's meaning or existence, and the
  flow owns it — same division `ai-driven-elicitation` already draws, where
  the generator proposes content and the flow owns structure. A generator
  deciding its own batches per turn is back to guessing.
- **Rounds make progress legible.** "Round two of an unknown number" is honest
  and useful in a way "question 7 of 40" is not, since the true count is not
  known until the graph resolves. Report what is known: how many are open now,
  and that more may open ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Every question carries a recommended answer

The second half, and the one that does most of the work. Each question ships
with the answer the system would choose, stated as a recommendation.

This changes the human's job from **composition** to **adjudication**, and the
two have very different costs. Composing an answer to eleven questions is
eleven acts of authorship. Reviewing eleven proposals is a scan, with attention
spent only where a recommendation is wrong — which is exactly where it is worth
spending. It is also what makes a large batch humane: eleven questions with no
proposed answers is a homework assignment, and eleven with proposals is a
review.

Three rules keep it honest:

- **A recommendation is a position, not a default that applies on silence.** An
  unanswered question is unanswered ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success));
  a flow that silently adopts its own recommendations has stopped eliciting and
  started deciding while displaying questions.
- **Say why, in one line.** A recommendation without a reason cannot be
  disagreed with efficiently — the person has to reconstruct the reasoning
  before they can reject it, which costs more than answering would have.
- **Recommend from what is known, and say when it is a guess.** A
  recommendation derived from earlier answers is worth reading; one invented to
  fill the slot trains the person to stop reading them, and one unread
  recommendation poisons the batch it sits in.

Recommendations also make disagreement cheap to *express*: the answer can be a
list of exceptions rather than a set of compositions, which is what allows a
round of eleven to be answered in a sentence.

## Where the opposite rule holds

Batching is right when the purpose is **gathering someone's knowledge**. It is
wrong when the purpose is **measuring the person answering**.

Under measurement, a turn carrying several questions is answered on whichever
one the respondent chooses, and the others are unasked-in-fact while appearing
asked on the record. The instrument becomes self-selected, differently for each
respondent, and the strongest respondents steer hardest toward their prepared
ground. None of those harms transfer to elicitation, where the person is
volunteering what they know and has no incentive to dodge — which is exactly
why the same interaction pattern is correct in one setting and disqualifying in
the other.

The discriminator is one question: **is the flow trying to find out what this
person knows, or trying to find out how good they are?** Recommended answers
make the distinction sharper still — pre-answering is a courtesy when gathering
and a contamination when measuring.
