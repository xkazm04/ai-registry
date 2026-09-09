---
name: change-implementation-and-review
version: 0.4.0
status: seed
domain: software_engineering
path: software_engineering/code-review
---

# Code change implementation and review follow-through

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** An accepted item that turns into a change too large to review is approved
without being read, an item whose premise the code has already overtaken is built
anyway, and a review comment that gets coded around rather than answered costs more than
the item was worth.

**Input.** One accepted item, the code it affects as it stands now rather than when the
item was written, the repository's own conventions and checks, and the feedback earlier
changes already received.

**Core action.** Check the item is still the work that is needed before writing
anything, then make a change scoped to it and small enough that a reviewer can actually
hold it, let the repository's own checks be the standard, and answer review feedback the
way a careful engineer would, escalating objections to the approach rather than patching
them away.

**Output.** A reviewable change with the repository's checks passing and a visible end,
or an honest report of why the item should not be built, and a review thread where every
comment was answered or acted on.

## Activities

1. Re-read the accepted item against the code as it stands now, decline with a reason if
the premise has been overtaken, and return the one blocking question where guessing
wrong would be expensive *(observe)*
2. Understand the affected code before changing it *(observe)*
3. Make the change scoped to the accepted item, small enough to be reviewed in one
sitting *(act)*
4. Run the repository's own checks and treat them as the standard *(act)*
5. Read the item, whatever authorised it, and whoever else may have taken it once more
in the moment before offering the change *(observe)*
6. Offer the change for review in the shape this repository expects *(deliver)*
7. Answer each review comment or act on it, saying which comment a change answers
*(act)*
8. Escalate an objection to the approach, and carry the change to merged or withdrawn
rather than leaving it open *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**An accepted item leaves as a change a reviewer can actually read, or as an honest
report of why it should not be built.**

- The item is checked against current code before work starts, and one the code has
  already overtaken comes back declined with what was found rather than built anyway
- The change is scoped to the accepted item and nothing else, and a change that has
  grown past what one sitting can review is split rather than explained
- The repository's own checks pass before the change is offered
- An item whose ambiguity would cost a large rewrite, a production effect or a
  destructive act if it were guessed wrong comes back with the one blocking question
  rather than with a change built on the guess, and the test is the cost of being wrong
  rather than how uncertain the work feels
- An item that cannot be completed comes back with what was learned rather than a
  partial change left behind
- A number of failed attempts at which the work stops and escalates is fixed before the
  first attempt, because each next attempt looks cheap from inside and only the run of
  them is evidence, and a run of them is evidence about the model of the system rather
  than about the change
- The item and whatever authorised it are read again in the moment before the change is
  offered rather than only before the work started, and one that has been withdrawn,
  completed by somebody else, or claimed elsewhere in the meantime stops there with that
  recorded; re-proving the code is a different check and does not cover this one,
  because a diff can be clean against a branch nobody wants any more
- A decline that the person who accepted the item overturns is written back beside the
  reason that produced it, because declining is the one call here nobody sees the cost
  of, and the next re-validation of an item of that shape weighs a premise test that has
  already been overruled once rather than reaching the same decline again

**The change looks like it belongs to this codebase.**

- Existing conventions win over personal preference, and the convention followed is the
  one the surrounding code uses rather than the one the project documents
- Review feedback given on earlier changes is not repeated in later ones

**Review feedback is answered, and an objection to the approach reaches a person instead
of being coded around.**

- Every comment is answered or acted on, and none is left resolved without a reply that
  says which
- A change made in response says which comment it answers
- An objection to the approach is escalated rather than patched over, and the escalation
  names the disagreement rather than restating the change

**Whoever accepted the item can tell whether it is done without asking.**

- The item's own record carries where the change is and what state it is in, not only
  the code repository
- A change still open after enough time for the branch it was cut from to have moved is
  re-proved against current code rather than resting on checks that passed against a
  codebase that no longer exists
- A change that was abandoned is recorded as abandoned, so nothing sits indefinitely in
  a state that reads as in progress
- An approval covers the action it was given for and the diff it was given against, so
  approval to commit is not approval to merge, and a change made afterwards, including
  one made to satisfy a review comment, makes the approval stale and it is sought again
  rather than carried forward

## Guidance

Reviewability is the author's job and it is decided by size, not by the description: a
reviewer holds two to four hundred lines well and rubber stamps a thousand. Split rather
than explain. Re-read the item against the code before writing, and read it and its
authorisation again before offering, because a clean diff proves nothing about an item
nobody wants any more. Declining with a reason is a result. Most comments should be
acted on; an objection to the approach is not yours to settle.

## Where this is worth adopting

- A backlog of accepted items several weeks deep, where a good proportion of them
  describe a problem the codebase has since solved a different way and building them
  faithfully is worse than not building them.
- A team where one person reviews everything, and the practical constraint on throughput
  is how much they can read carefully rather than how fast changes can be written.
- A repository whose written conventions and actual conventions have diverged, where a
  change that follows the documentation gets sent back and the reason is never written
  down anywhere.
- An operator delegating implementation for the first time, who needs the boundary
  between what may be decided and what must be escalated stated explicitly rather than
  discovered after a merge.
- A project where changes sit open for weeks, drift from the main branch, and are
  eventually merged on the strength of checks that passed against a codebase that no
  longer exists.

## Connector types

`source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[github](examples/github.md) for `source_control`, [gitlab](examples/gitlab.md) for
`source_control`.

## Recommended trigger

`event`. A person accepting an item is a real event and work is expected to begin from
it, and review comments arrive from another person at their own pace. Both halves of
this work wake on something arriving rather than choosing their own moment, which is
also why the re-validation step matters: the event may have been raised a long time
before the work starts.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which repository, and its branch and commit conventions, because a change that ignores
  local conventions costs more to review than to have written
- How much autonomy this work has, from proposing a change to merging one, which is the
  single most consequential setting here and must be stated rather than inferred
- Which checks are the real gate in this repository, since every repository has checks
  that block and checks that advise, and treating an advisory check as a gate wastes as
  much time as ignoring a blocking one
- Who reviews here and what each reviewer cares about, because repeating a preference a
  reviewer has already stated exhausts their patience fastest
- Where the accepted item lives and how its state is written back, because a change that
  merged without the item being closed leaves the queue lying about what is still
  outstanding
- How many failed attempts at one item may pass before the work stops and escalates,
  because a person accumulates fatigue after a few and stops of their own accord, while
  this work has no such signal and needs the count named from outside before the first
  attempt

## Dependencies

- git, since the work creates branches and commits in a real checkout
- the repository's own check suite, installed and runnable locally, because the outcomes
  depend on running it rather than trusting it
