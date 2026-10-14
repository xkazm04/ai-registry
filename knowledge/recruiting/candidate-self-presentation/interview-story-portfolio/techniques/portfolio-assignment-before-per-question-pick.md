---
layer: technique
type: technique
subject: interview-story-portfolio
technique: portfolio-assignment-before-per-question-pick
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference]
shared_with: []
use_when: [mapping a set of experiences to a set of predicted interview questions, two questions want the same best experience, deciding when an experience may be told twice in one conversation]
---

# Portfolio assignment before per-question pick

The first failure of interview preparation is not a weak story; it is the same strong story
spent on three questions. It happens because preparation goes question by question, and the
best experience for each of several questions is often one experience. The technique is an
order of operations and a visible record of what it cost. It is not an algorithm, and the
matrix is small enough to solve by hand.

## The procedure

1. **Build the matrix first.** Rows are experiences, columns are predicted questions, and
   each cell is a tier from the fit scale or blank. Fill every viable cell, not only the
   best one per question. The matrix is the point: the collisions are invisible until the
   whole thing is on one page.
2. **Find the collisions.** A collision is a set of questions whose best option is the same
   experience.
3. **Resolve each collision by loss, not by fit.** Give the contested experience to the
   question that would lose the most if it were denied. For each contender, subtract the
   fit of its next-best alternative from the fit it has here; the largest drop gets the
   experience. When drops are equal, the harder question wins, then the question with fewer
   alternatives.
4. **Cascade the loser** to its next-best option and re-check, because that option may
   itself be contested.
5. **Flag every downgrade, in the plan, with its reason and a bridge.** "Question four
   moved from the strongest option to a workable one because question three needed it
   more; foreground the stakeholder angle."
6. **Reuse only when no alternative exists.** State why, and assign a different angle to
   each use (one leads with the decision, the other with the people involved).
7. **Keep a backup for every question.** The assignment predicts; the interviewer will ask
   something nearby.

## Why loss, not highest fit

A common rule hands the experience to the question where it fits best. It is intuitive and
it is wrong exactly when it matters. Suppose experience A is a strong fit for question one
and a workable fit for question two, question one has a strong alternative in experience B,
and question two has nothing else. Giving A to the question where it fits best leaves
question two with no answer at all, while giving A to question two costs question one
nothing, since B covers it. The first plan has a gap and a strong answer; the second has
two good answers. The rule that finds the second is "who loses more if denied", which is
the standard greedy heuristic for assignment problems: settle the most constrained demand
first. Highest-fit-wins is a special case that gives the right answer only when every
question has a similar set of alternatives.

Even loss-based assignment can miss the global best on larger matrices, and the technique
claims no more. A hand-solved matrix of ten questions and a dozen experiences is reviewed
by the candidate, who can see when a cascade went somewhere silly. Where a tool computes
it, the tool says which rule it applied; [a claim carries its sample and its
basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis) applies to a mapping
as much as to a rate.

## Weighting the questions

Predicted questions are not equally predicted. A question the recruiter said will be asked
outweighs one the candidate guessed from a job description. Assign the near-certain
questions first, and let the speculative ones take what is left; a speculative question
that wins an experience from a near-certain one is the allocation inverted. Mark which
questions are stated and which are inferred, because a plan that shows both as equally
certain is a plan that misrepresents its own basis; [inference must look like
inference](../../../_laws.md#inference-must-look-like-inference).

## The visible downgrade is the half that gets skipped

A silent downgrade is a worse answer nobody chose. The point of flagging it is not
transparency for its own sake: the loser needs a rehearsed framing that makes a workable
experience read well, and the framing is only written if someone notices the loss. A plan
with no flagged downgrades on a nontrivial matrix has either a very lucky portfolio or a
skipped step; ask which.

## Portfolio health, as a short report

Three numbers describe a finished assignment, and each is a count over the matrix, stated
with what it counted: how many distinct experiences cover how many questions, how many
collisions were resolved and how, and how many answers rest on a modest-strength
experience. The last one is the useful one: it points at the experiences worth improving
before the interview, because improving a story that appears in the plan is worth more
than improving one that does not.

## When not to use this

With three or four questions and a plentiful portfolio, the matrix is overhead; pick
directly and check for repeats. When the set of questions is unknown (a general first
conversation), assign by competency categories instead of questions. And when a
candidate's inventory is so small that every question collides, allocation is not the
problem; building the inventory is.
